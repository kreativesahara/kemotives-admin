/**
 * Sitemap Validation Script for Diksx Cars
 * 
 * Validates all generated sitemap files against Google Sitemap Protocol 0.9
 * and marketplace SEO best practices.
 * 
 * Usage:
 *   node scripts/validate-sitemaps.cjs
 *   VALIDATE_URLS=true node scripts/validate-sitemaps.cjs  # Enable URL status checks
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * Normalize features into a consistent array format
 * Handles: JSON strings, comma-separated strings, arrays, null/undefined
 * @param {any} features - Features in any format
 * @returns {Array<string>} Normalized array of feature strings
 */
function normalizeFeatures(features) {
  // Handle null/undefined
  if (!features) {
    return [];
  }
  
  // If already an array, return it (after cleaning)
  if (Array.isArray(features)) {
    return features
      .map(f => typeof f === 'string' ? f.trim() : String(f).trim())
      .filter(f => f.length > 0);
  }
  
  // If it's a string, try to parse it
  if (typeof features === 'string') {
    const trimmed = features.trim();
    
    // Empty string
    if (!trimmed) {
      return [];
    }
    
    // Try to parse as JSON first (handles JSON array strings)
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map(f => typeof f === 'string' ? f.trim() : String(f).trim())
            .filter(f => f.length > 0);
        }
      } catch (e) {
        // Not valid JSON, continue to other parsing methods
      }
    }
    
    // Try comma-separated
    if (trimmed.includes(',')) {
      return trimmed
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);
    }
    
    // Try semicolon-separated
    if (trimmed.includes(';')) {
      return trimmed
        .split(';')
        .map(f => f.trim())
        .filter(f => f.length > 0);
    }
    
    // Single feature as string
    return [trimmed];
  }
  
  // For other types, convert to string and return as single-item array
  return [String(features).trim()].filter(f => f.length > 0);
}

// Configuration
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const SITEMAP_FILES = [
    'sitemap.xml',
    'vehicle-sitemap.xml',
    'blog-sitemap.xml',
    'accessories-sitemap.xml',
    'sitemap-index.xml'
];

const VALIDATE_URLS = process.env.VALIDATE_URLS === 'true';
const VALID_CHANGEFREQ = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
const URLSET_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const HTTPS_REGEX = /^https:\/\//;
const QUERY_STRING_REGEX = /[?&=]/;

// Validation results
const errors = [];
const warnings = [];
let totalUrls = 0;
const allUrls = new Set(); // For duplicate detection

/**
 * Check if a date is in the future
 */
function isFutureDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    return date > today;
}

/**
 * Validate date format (YYYY-MM-DD only)
 */
function validateDate(dateString) {
    if (!dateString) return { valid: true };

    // Check format
    if (!DATE_REGEX.test(dateString)) {
        return {
            valid: false,
            error: `Invalid date format: "${dateString}". Must be YYYY-MM-DD (no time, no timezone)`
        };
    }

    // Check if date is valid
    const date = new Date(dateString + 'T00:00:00Z');
    if (isNaN(date.getTime())) {
        return {
            valid: false,
            error: `Invalid date value: "${dateString}"`
        };
    }

    // Check if date matches input (catches invalid dates like 2025-13-45)
    const [year, month, day] = dateString.split('-').map(Number);
    if (date.getUTCFullYear() !== year ||
        date.getUTCMonth() + 1 !== month ||
        date.getUTCDate() !== day) {
        return {
            valid: false,
            error: `Invalid date value: "${dateString}"`
        };
    }

    // Check if in future
    if (isFutureDate(dateString)) {
        return {
            valid: false,
            error: `Date is in the future: "${dateString}"`
        };
    }

    return { valid: true };
}

/**
 * Validate priority value
 */
function validatePriority(priority) {
    if (!priority) return { valid: true };

    const num = parseFloat(priority);
    if (isNaN(num)) {
        return {
            valid: false,
            error: `Invalid priority: "${priority}". Must be a number between 0.0 and 1.0`
        };
    }

    if (num < 0.0 || num > 1.0) {
        return {
            valid: false,
            error: `Priority out of range: "${priority}". Must be between 0.0 and 1.0`
        };
    }

    return { valid: true };
}

/**
 * Validate changefreq value
 */
function validateChangefreq(changefreq) {
    if (!changefreq) return { valid: true };

    if (!VALID_CHANGEFREQ.includes(changefreq.toLowerCase())) {
        return {
            valid: false,
            error: `Invalid changefreq: "${changefreq}". Must be one of: ${VALID_CHANGEFREQ.join(', ')}`
        };
    }

    return { valid: true };
}

/**
 * Validate URL location
 */
function validateUrl(loc, context = '') {
    if (!loc) {
        return {
            valid: false,
            error: `Missing <loc> element${context ? ` in ${context}` : ''}`
        };
    }

    const trimmed = loc.trim();
    if (trimmed !== loc) {
        return {
            valid: false,
            error: `URL contains trailing/leading whitespace: "${loc}"`
        };
    }

    if (!HTTPS_REGEX.test(trimmed)) {
        return {
            valid: false,
            error: `URL must start with https://: "${trimmed}"`
        };
    }

    if (QUERY_STRING_REGEX.test(trimmed)) {
        return {
            valid: false,
            error: `URL must not contain query strings: "${trimmed}"`
        };
    }

    return { valid: true };
}

/**
 * Check URL status code (non-blocking, generates warnings)
 */
function checkUrlStatus(url, callback) {
    if (!VALIDATE_URLS) {
        callback(null);
        return;
    }

    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        timeout: 5000,
        headers: {
            'User-Agent': 'Diksx-Sitemap-Validator/1.0'
        }
    };

    const req = client.request(options, (res) => {
        let redirectCount = 0;
        const statusCode = res.statusCode;

        // Handle redirects
        if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
            redirectCount++;
            if (redirectCount > 1) {
                warnings.push(`URL "${url}" has redirect chain exceeding 1 hop`);
                callback(null);
                return;
            }
            // Follow one redirect
            checkUrlStatus(res.headers.location, callback);
            return;
        }

        if (statusCode !== 200) {
            warnings.push(`URL "${url}" returned status code ${statusCode}`);
        }
        callback(null);
    });

    req.on('error', (error) => {
        warnings.push(`Failed to check URL "${url}": ${error.message}`);
        callback(null);
    });

    req.on('timeout', () => {
        req.destroy();
        warnings.push(`Timeout checking URL "${url}"`);
        callback(null);
    });

    req.end();
}

/**
 * Parse XML and extract URL entries from urlset
 */
function parseUrlset(xml, filename) {
    const urls = [];

    // Check root element - handle multi-line and additional namespaces
    // Match <urlset with the required namespace, allowing for whitespace and additional attributes
    const escapedNS = URLSET_NS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const urlsetRegex = new RegExp(`<urlset[^>]*xmlns\\s*=\\s*["']${escapedNS}["'][^>]*>`, 's');
    if (!urlsetRegex.test(xml)) {
        errors.push(`${filename}: Root element must be <urlset xmlns="${URLSET_NS}">`);
        return urls;
    }

    // Check for Google News namespace (should not be present)
    if (xml.includes('xmlns:news') || xml.includes('<news:news>') || xml.includes('news:')) {
        errors.push(`${filename}: Must not contain Google News namespace or tags`);
    }
    
    // Note: Image namespace (xmlns:image) is allowed and encouraged for image sitemaps

    // Extract all <url> blocks
    const urlMatches = xml.matchAll(/<url>([\s\S]*?)<\/url>/g);

    for (const match of urlMatches) {
        const urlBlock = match[1];
        const url = {};

        // Extract <loc>
        const locMatch = urlBlock.match(/<loc>([\s\S]*?)<\/loc>/);
        if (locMatch) {
            url.loc = locMatch[1].trim();
        }

        // Extract <lastmod>
        const lastmodMatch = urlBlock.match(/<lastmod>([\s\S]*?)<\/lastmod>/);
        if (lastmodMatch) {
            url.lastmod = lastmodMatch[1].trim();
        }

        // Extract <changefreq>
        const changefreqMatch = urlBlock.match(/<changefreq>([\s\S]*?)<\/changefreq>/);
        if (changefreqMatch) {
            url.changefreq = changefreqMatch[1].trim();
        }

        // Extract <priority>
        const priorityMatch = urlBlock.match(/<priority>([\s\S]*?)<\/priority>/);
        if (priorityMatch) {
            url.priority = priorityMatch[1].trim();
        }

        urls.push(url);
    }

    return urls;
}

/**
 * Parse XML and extract sitemap entries from sitemapindex
 */
function parseSitemapIndex(xml, filename) {
    const sitemaps = [];

    const sitemapIndexPattern = new RegExp(`<sitemapindex[^>]*xmlns=["']${URLSET_NS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 's');
    if (!sitemapIndexPattern.test(xml)) {
        errors.push(`${filename}: Root element must be <sitemapindex xmlns="${URLSET_NS}">`);
        return sitemaps;
    }


    // Extract all <sitemap> blocks
    const sitemapMatches = xml.matchAll(/<sitemap>([\s\S]*?)<\/sitemap>/g);

    for (const match of sitemapMatches) {
        const sitemapBlock = match[1];
        const sitemap = {};

        // Extract <loc>
        const locMatch = sitemapBlock.match(/<loc>([\s\S]*?)<\/loc>/);
        if (locMatch) {
            sitemap.loc = locMatch[1].trim();
        }

        // Extract <lastmod>
        const lastmodMatch = sitemapBlock.match(/<lastmod>([\s\S]*?)<\/lastmod>/);
        if (lastmodMatch) {
            sitemap.lastmod = lastmodMatch[1].trim();
        }

        sitemaps.push(sitemap);
    }

    return sitemaps;
}

/**
 * Validate a urlset sitemap file
 */
function validateUrlsetSitemap(filepath, filename) {
    if (!fs.existsSync(filepath)) {
        warnings.push(`${filename}: File does not exist (skipped)`);
        return;
    }

    let xml;
    try {
        xml = fs.readFileSync(filepath, 'utf8');
    } catch (error) {
        errors.push(`${filename}: Cannot read file: ${error.message}`);
        return;
    }

    // Basic XML structure check
    if (!xml.includes('<?xml')) {
        errors.push(`${filename}: Not a valid XML file (missing XML declaration)`);
        return;
    }

    // Parse URLs
    const urls = parseUrlset(xml, filename);

    if (urls.length === 0 && !xml.includes('<urlset')) {
        errors.push(`${filename}: No URLs found and invalid structure`);
        return;
    }

    // Validate each URL
    urls.forEach((url, index) => {
        const context = `${filename} (entry ${index + 1})`;

        // Validate <loc>
        const locValidation = validateUrl(url.loc, context);
        if (!locValidation.valid) {
            errors.push(`${context}: ${locValidation.error}`);
            return;
        }

        // Check for duplicates
        if (allUrls.has(url.loc)) {
            errors.push(`${context}: Duplicate URL found: "${url.loc}"`);
        } else {
            allUrls.add(url.loc);
        }

        // Validate <lastmod>
        if (url.lastmod) {
            const dateValidation = validateDate(url.lastmod);
            if (!dateValidation.valid) {
                errors.push(`${context}: ${dateValidation.error}`);
            }
        }

        // Validate <changefreq>
        if (url.changefreq) {
            const changefreqValidation = validateChangefreq(url.changefreq);
            if (!changefreqValidation.valid) {
                errors.push(`${context}: ${changefreqValidation.error}`);
            }
        }

        // Validate <priority>
        if (url.priority) {
            const priorityValidation = validatePriority(url.priority);
            if (!priorityValidation.valid) {
                errors.push(`${context}: ${priorityValidation.error}`);
            }
        }

        // Optionally check URL status
        if (url.loc) {
            checkUrlStatus(url.loc, () => { });
        }

        totalUrls++;
    });

    console.log(`✓ Validated ${filename}: ${urls.length} URLs`);
}

/**
 * Validate sitemap index file
 */
function validateSitemapIndex(filepath, filename) {
    if (!fs.existsSync(filepath)) {
        warnings.push(`${filename}: File does not exist (skipped)`);
        return;
    }

    let xml;
    try {
        xml = fs.readFileSync(filepath, 'utf8');
    } catch (error) {
        errors.push(`${filename}: Cannot read file: ${error.message}`);
        return;
    }

    // Basic XML structure check
    if (!xml.includes('<?xml')) {
        errors.push(`${filename}: Not a valid XML file (missing XML declaration)`);
        return;
    }

    // Parse sitemaps
    const sitemaps = parseSitemapIndex(xml, filename);

    // Validate each sitemap entry
    sitemaps.forEach((sitemap, index) => {
        const context = `${filename} (entry ${index + 1})`;

        // Validate <loc>
        const locValidation = validateUrl(sitemap.loc, context);
        if (!locValidation.valid) {
            errors.push(`${context}: ${locValidation.error}`);
            return;
        }

        // Extract filename from URL
        const urlObj = new URL(sitemap.loc);
        const sitemapFilename = urlObj.pathname.split('/').pop();
        const sitemapPath = path.resolve(PUBLIC_DIR, sitemapFilename);

        // Check if referenced sitemap exists
        if (!fs.existsSync(sitemapPath)) {
            errors.push(`${context}: References non-existent sitemap file: "${sitemapFilename}"`);
        }

        // Validate <lastmod>
        if (sitemap.lastmod) {
            const dateValidation = validateDate(sitemap.lastmod);
            if (!dateValidation.valid) {
                errors.push(`${context}: ${dateValidation.error}`);
            }
        }
    });

    console.log(`✓ Validated ${filename}: ${sitemaps.length} sitemap references`);
}

/**
 * Main validation function
 */
async function main() {
    console.log('🔍 Starting sitemap validation...\n');
    console.log(`Public directory: ${PUBLIC_DIR}`);
    console.log(`URL status checking: ${VALIDATE_URLS ? 'ENABLED' : 'DISABLED (set VALIDATE_URLS = true to enable)'}`);
    console.log('\n');

    // Validate individual sitemap files
    const urlsetFiles = ['sitemap.xml', 'vehicle-sitemap.xml', 'blog-sitemap.xml', 'accessories-sitemap.xml'];

    for (const filename of urlsetFiles) {
        const filepath = path.resolve(PUBLIC_DIR, filename);
        validateUrlsetSitemap(filepath, filename);
    }

    // Validate sitemap index
    const indexPath = path.resolve(PUBLIC_DIR, 'sitemap-index.xml');
    validateSitemapIndex(indexPath, 'sitemap-index.xml');

    // Wait a bit for async URL checks to complete
    if (VALIDATE_URLS) {
        console.log('\n⏳ Checking URL status codes...');
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total URLs validated: ${totalUrls}`);
    console.log(`Errors (blocking): ${errors.length}`);
    console.log(`Warnings (non-blocking): ${warnings.length}`);

    if (errors.length > 0) {
        console.log('\n❌ ERRORS (must be fixed):');
        errors.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error}`);
        });
    }

    if (warnings.length > 0) {
        console.log('\n⚠️  WARNINGS:');
        warnings.forEach((warning, index) => {
            console.log(`  ${index + 1}. ${warning}`);
        });
    }

    if (errors.length === 0 && warnings.length === 0) {
        console.log('\n✅ All sitemaps are valid!');
    } else if (errors.length === 0) {
        console.log('\n✅ All sitemaps are valid (warnings are non-blocking)');
    } else {
        console.log('\n❌ Validation failed. Please fix the errors above.');
    }

    console.log('='.repeat(60));

    // Exit with appropriate code
    process.exit(errors.length > 0 ? 1 : 0);
}

// Run validation
main().catch((error) => {
    console.error('\n❌ Fatal error during validation:', error);
    process.exit(1);
});