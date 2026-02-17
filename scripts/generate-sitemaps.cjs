/**
 * Enhanced Sitemap Generator for Diksx Cars
 * 
 * This script generates optimized sitemaps for the Diksx Cars website including:
 * - Static pages
 * - Dynamic vehicle pages (with images)
 * - Blog posts (with images)
 * - Accessories listings (with images)
 * 
 * All sitemaps follow the sitemap protocol 0.9 and are optimized for search engines
 * 
 * Features:
 * - Image enrichment: Includes Cloudinary images for vehicles, accessories, and blogs
 * - Feature normalization: Normalizes vehicle features from various formats (JSON, CSV, arrays) into consistent arrays
 * - Auto-pruning of invalid URLs before deployment
 * - Optional HTTP status checking for URLs
 * - Automatic validation after generation
 * - Graceful handling of de-listed items
 * 
 * Image Support:
 * - Vehicles: Extracts images from vehicle.images array
 * - Accessories: Extracts images from accessory.imageUrls array
 * - Blogs: Extracts Cloudinary URLs from content or uses featured image
 * - Fallback: Uses placeholder image if no images are available
 * - Captions: Auto-generates captions from item titles/names
 * 
 * Environment Variables:
 *   PRUNE_INVALID_URLS=false    - Disable URL pruning (default: true)
 *   CHECK_URL_STATUS=true       - Enable HTTP status checks (default: false, slower)
 *   MAX_CONCURRENT_CHECKS=10    - Max concurrent URL checks (default: 10)
 *   URL_CHECK_TIMEOUT=5000      - URL check timeout in ms (default: 5000)
 *   SKIP_VALIDATION=true        - Skip validation after generation
 *   API_URL=<url>               - Override backend API URL
 * 
 * Usage:
 *   node scripts/generate-sitemaps.cjs
 *   node scripts/generate-sitemaps.cjs --no-validate
 *   CHECK_URL_STATUS=true node scripts/generate-sitemaps.cjs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// Load and save cache helpers
const CACHE_FILE = path.resolve(__dirname, '../public/sitemap-cache.json');
function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    }
  } catch (e) {
    console.warn('Sitemap cache load failed', e);
  }
  return {};
}
function saveCache(cache) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (e) {
    console.warn('Sitemap cache save failed', e);
  }
}
function getHash(obj) {
  return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex');
}

/**
 * Atomic file write to prevent partial/corrupted files
 * Writes to a temporary file first, then renames atomically
 * @param {string} filepath - Full path to the target file
 * @param {string} content - Content to write
 * @throws {Error} If write or rename fails
 */
function atomicWriteFileSync(filepath, content) {
  const tmpPath = filepath + '.tmp';

  try {
    // Write to temporary file first
    fs.writeFileSync(tmpPath, content, 'utf8');
    // Atomic rename (replaces existing file if it exists)
    fs.renameSync(tmpPath, filepath);
  } catch (error) {
    // Clean up temp file if it exists
    try {
      if (fs.existsSync(tmpPath)) {
        fs.unlinkSync(tmpPath);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    throw error;
  }
}

/**
 * Write sitemap file to both public/ and dist/ directories
 * This ensures sitemaps are available in both locations for development and production
 * @param {string} filename - Filename (e.g., 'sitemap.xml')
 * @param {string} content - XML content to write
 * @throws {Error} If write fails
 */
function writeSitemapFile(filename, content) {
  // Always write to public directory
  const publicPath = path.resolve(PUBLIC_DIR, filename);
  atomicWriteFileSync(publicPath, content);
  
  // Also write to dist directory if it exists (for production builds)
  if (fs.existsSync(DIST_DIR)) {
    const distPath = path.resolve(DIST_DIR, filename);
    try {
      atomicWriteFileSync(distPath, content);
    } catch (error) {
      // Log warning but don't fail - dist might not exist in dev
      console.warn(`Warning: Could not write ${filename} to dist directory: ${error.message}`);
    }
  }
}

/**
 * Clean up cache entries for items that are no longer active (de-listed)
 * @param {Array} activeItems - Array of currently active items
 * @param {Function} getUrl - Function to extract URL from item
 * @param {Object} cache - Current cache object
 * @param {string} category - Category name ('vehicles', 'accessories', 'blogs')
 * @returns {Object} Updated cache with de-listed items removed
 */
function cleanupDelistedItems(activeItems, getUrl, cache, category) {
  const activeUrls = new Set(activeItems.map(item => getUrl(item)));
  const categoryPrefix = category === 'vehicles' ? '/vehicle/' :
    category === 'accessories' ? '/accessory/' :
      category === 'blogs' ? '/blogs/' : '';

  if (!categoryPrefix) return cache;

  const cleanedCache = { ...cache };
  let removedCount = 0;
  const removedUrls = [];

  // Find all cache entries for this category
  for (const url in cache) {
    if (url.includes(categoryPrefix) && !activeUrls.has(url)) {
      // This URL is in cache but not in active items - it's been de-listed
      delete cleanedCache[url];
      removedCount++;
      removedUrls.push(url);
    }
  }

  // Update statistics
  if (category === 'vehicles') {
    delistingStats.vehicles.total = Object.keys(cache).filter(k => k.includes('/vehicle/')).length;
    delistingStats.vehicles.removed = removedCount;
    delistingStats.vehicles.urls = removedUrls;
  } else if (category === 'accessories') {
    delistingStats.accessories.total = Object.keys(cache).filter(k => k.includes('/accessory/')).length;
    delistingStats.accessories.removed = removedCount;
    delistingStats.accessories.urls = removedUrls;
  } else if (category === 'blogs') {
    delistingStats.blogs.total = Object.keys(cache).filter(k => k.includes('/blogs/')).length;
    delistingStats.blogs.removed = removedCount;
    delistingStats.blogs.urls = removedUrls;
  }

  return cleanedCache;
}

// Configuration
const SITE_URL = 'https://www.diksxcars.co.ke';
// Backend API URL - defaults to production backend
// Can be overridden with API_URL environment variable (must be HTTPS)
const API_URL = process.env.API_URL || 'https://backend.diksxcars.co.ke';
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const DIST_DIR = path.resolve(__dirname, '../dist');
const SRC_DIR = path.resolve(__dirname, '../src');

// Image configuration
const PLACEHOLDER_IMAGE = `${SITE_URL}/images/placeholder.jpg`;
const MAX_IMAGES_PER_URL = 10; // Google's limit for images per URL in sitemap

// URL Pruning Configuration
const PRUNE_INVALID_URLS = process.env.PRUNE_INVALID_URLS !== 'false'; // Default: true
const CHECK_URL_STATUS = process.env.CHECK_URL_STATUS === 'true'; // Default: false (slower)
const MAX_CONCURRENT_CHECKS = parseInt(process.env.MAX_CONCURRENT_CHECKS || '10', 10);
const URL_CHECK_TIMEOUT = parseInt(process.env.URL_CHECK_TIMEOUT || '5000', 10);

// URL validation regex patterns
const HTTPS_REGEX = /^https:\/\//;
const QUERY_STRING_REGEX = /[?&=]/;

// Pruning statistics
const pruningStats = {
  total: 0,
  pruned: 0,
  invalidFormat: 0,
  invalidStatus: 0,
  timeouts: 0,
  errors: 0,
  details: []
};

// De-listing statistics
const delistingStats = {
  vehicles: { total: 0, removed: 0, urls: [] },
  accessories: { total: 0, removed: 0, urls: [] },
  blogs: { total: 0, removed: 0, urls: [] }
};

/**
 * Get current date in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
function getCurrentDate() {
  return new Date().toISOString();
}

/**
 * Format date to ISO 8601 format for sitemaps
 * Handles various date formats and ensures proper ISO format
 */
function formatDate(dateString) {
  // This function creates a YYYY-MM-DD string (SEO best practice)
  if (!dateString) return getCurrentDate().slice(0, 10);
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return getCurrentDate().slice(0, 10);
    return date.toISOString().slice(0, 10); // YYYY-MM-DD
  } catch (error) {
    return getCurrentDate().slice(0, 10);
  }
}

/**
 * Validate URL format (basic validation)
 */
function validateUrlFormat(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, reason: 'URL is missing or invalid type' };
  }

  const trimmed = url.trim();
  if (trimmed !== url) {
    return { valid: false, reason: 'URL contains whitespace' };
  }

  if (!HTTPS_REGEX.test(trimmed)) {
    return { valid: false, reason: 'URL must start with https://' };
  }

  if (QUERY_STRING_REGEX.test(trimmed)) {
    return { valid: false, reason: 'URL contains query strings' };
  }

  try {
    new URL(trimmed);
  } catch (error) {
    return { valid: false, reason: `Invalid URL format: ${error.message}` };
  }

  return { valid: true };
}

/**
 * Check if URL is accessible (HTTP status check)
 * Returns Promise<{valid: boolean, status?: number, reason?: string}>
 */
function checkUrlAccessibility(url) {
  return new Promise((resolve) => {
    if (!CHECK_URL_STATUS) {
      resolve({ valid: true, skipped: true });
      return;
    }

    const urlObj = new URL(url);
    const http = require('http');
    const client = urlObj.protocol === 'https:' ? https : http;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD',
      timeout: URL_CHECK_TIMEOUT,
      headers: {
        'User-Agent': 'Diksx-Sitemap-Generator/1.0'
      }
    };

    const req = client.request(options, (res) => {
      const statusCode = res.statusCode;

      // Follow redirects (up to 1 hop)
      if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
        // Check redirect target
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : `${urlObj.protocol}//${urlObj.host}${res.headers.location}`;

        checkUrlAccessibility(redirectUrl).then(result => {
          if (result.valid && (result.status === 200 || result.redirected)) {
            resolve({ valid: true, status: statusCode, redirected: true });
          } else {
            resolve({ valid: false, status: statusCode, reason: `Redirects to invalid URL (${result.status || 'error'})` });
          }
        });
        return;
      }

      // Accept 200-299 and 300-399 (redirects handled above)
      if (statusCode >= 200 && statusCode < 400) {
        resolve({ valid: true, status: statusCode });
      } else if (statusCode === 404) {
        resolve({ valid: false, status: statusCode, reason: 'URL returns 404 Not Found' });
      } else if (statusCode >= 400) {
        resolve({ valid: false, status: statusCode, reason: `URL returns error status ${statusCode}` });
      } else {
        resolve({ valid: false, status: statusCode, reason: `Unexpected status code ${statusCode}` });
      }
    });

    req.on('error', (error) => {
      resolve({ valid: false, reason: `Request failed: ${error.message}` });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ valid: false, reason: 'Request timeout' });
    });

    req.end();
  });
}

/**
 * Prune invalid URLs from an array of items
 * @param {Array} items - Array of items with URL property
 * @param {Function} getUrl - Function to extract URL from item
 * @param {string} context - Context name for logging
 * @returns {Promise<Array>} Filtered array with valid URLs only
 */
async function pruneInvalidUrls(items, getUrl, context = 'items') {
  if (!PRUNE_INVALID_URLS) {
    return items;
  }

  pruningStats.total += items.length;
  const validItems = [];
  const checkPromises = [];

  // Validate format first (fast, synchronous)
  for (const item of items) {
    const url = getUrl(item);
    const formatCheck = validateUrlFormat(url);

    if (!formatCheck.valid) {
      pruningStats.pruned++;
      pruningStats.invalidFormat++;
      pruningStats.details.push({
        url,
        context,
        reason: formatCheck.reason
      });
      continue;
    }

    // If status checking is enabled, queue it
    if (CHECK_URL_STATUS) {
      checkPromises.push(
        checkUrlAccessibility(url).then(result => ({ url, item, result }))
      );
    } else {
      // Format is valid and we're not checking status, include it
      validItems.push(item);
    }
  }

  // If status checking is enabled, wait for all checks
  if (CHECK_URL_STATUS && checkPromises.length > 0) {
    // Process in batches to avoid overwhelming the system
    const batchSize = MAX_CONCURRENT_CHECKS;
    for (let i = 0; i < checkPromises.length; i += batchSize) {
      const batch = checkPromises.slice(i, i + batchSize);
      const results = await Promise.all(batch);

      for (const { url, item, result } of results) {
        if (result.valid) {
          validItems.push(item);
        } else {
          pruningStats.pruned++;
          if (result.reason?.includes('timeout')) {
            pruningStats.timeouts++;
          } else if (result.status) {
            pruningStats.invalidStatus++;
          } else {
            pruningStats.errors++;
          }
          pruningStats.details.push({
            url,
            context,
            reason: result.reason || `Status: ${result.status || 'unknown'}`
          });
        }
      }
    }
  }

  return validItems;
}
/**
 * Make HTTPS request to fetch data from API
 * Improved error handling for various response types
 * Only supports HTTPS for security
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    // Ensure URL is HTTPS
    if (!url.startsWith('https://')) {
      reject(new Error('Only HTTPS URLs are supported. URL must start with https://'));
      return;
    }

    const req = https.get(url, (res) => {
      let data = '';

      // Log status code for debugging
      const statusCode = res.statusCode;

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        // Handle 204 No Content
        if (statusCode === 204) {
          console.log(`API returned 204 No Content for ${url}`);
          resolve([]);
          return;
        }

        // Handle non-200 status codes
        if (statusCode < 200 || statusCode >= 300) {
          console.error(`API returned status ${statusCode} for ${url}`);
          console.error(`Response body: ${data.substring(0, 200)}...`);
          reject(new Error(`HTTP ${statusCode}: ${data.substring(0, 100)}`));
          return;
        }

        // Check if response is empty
        if (!data || data.trim().length === 0) {
          console.warn(`Empty response from ${url}`);
          resolve([]);
          return;
        }

        // Check if response looks like HTML (error page)
        if (data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html')) {
          console.error(`API returned HTML instead of JSON for ${url}`);
          console.error(`Response preview: ${data.substring(0, 200)}...`);
          reject(new Error('API returned HTML instead of JSON'));
          return;
        }

        // Try to parse JSON
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          console.error(`Failed to parse JSON from ${url}`);
          console.error(`Response type: ${typeof data}`);
          console.error(`Response length: ${data.length}`);
          console.error(`Response preview: ${data.substring(0, 200)}...`);
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`Request error for ${url}:`, error.message);
      reject(error);
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout after 15 seconds'));
    });
  });
}

/**
 * Fetch all vehicles from API
 * Only returns active vehicles (isActive="true")
 */
async function fetchVehicles() {
  try {
    console.log('Fetching vehicles from API...');
    const apiUrl = `${API_URL}/api/publicproducts?limit=1000`;
    console.log(`Attempting to fetch vehicles from: ${apiUrl}`);

    const vehicles = await makeRequest(apiUrl);

    if (process.env.NODE_ENV !== 'production') {
      console.log('Raw vehicles response:', JSON.stringify(vehicles, null, 2));
    }

    if (!Array.isArray(vehicles)) {
      console.warn('API returned non-array data, skipping vehicles sitemap.');
      return [];
    }

    // Filter only active vehicles (API should already filter, but double-check for safety)
    const activeVehicles = vehicles.filter(vehicle =>
      vehicle.isActive === 'true' || vehicle.isActive === true || vehicle.isActive === undefined
    );

    if (activeVehicles.length !== vehicles.length) {
      console.log(`Filtered ${vehicles.length - activeVehicles.length} inactive vehicles`);
    }

    console.log(`Found ${activeVehicles.length} active vehicles`);

    // Additional logging to understand vehicle data structure
    if (activeVehicles.length > 0 && process.env.NODE_ENV !== 'production') {
      console.log('Sample vehicle structure:', JSON.stringify(activeVehicles[0], null, 2));
    }

    return activeVehicles;
  } catch (error) {
    console.error('Error fetching vehicles:', error.message);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Full error details:', JSON.stringify(error, null, 2));
    }
    console.log('Returning empty array for vehicles...');
    return [];
  }
}

/**
 * Fetch all blog posts from API
 */
async function fetchBlogPosts() {
  try {
    console.log('Fetching blog posts from API...');
    const apiUrl = `${API_URL}/api/blogs`;
    console.log(`Attempting to fetch blog posts from: ${apiUrl}`);
    const response = await makeRequest(apiUrl);

    if (!Array.isArray(response)) {
      console.warn('API returned non-array data, skipping accessories sitemap.');
      return [];
    }

    console.log(`Found ${response.length} blog posts`);
    return response;
  } catch (error) {
    console.error('Error fetching blog posts:', error.message);
    console.log('Returning empty array for blog posts...');
    return [];
  }
}

/**
 * Fetch all accessories from API
 */
async function fetchAccessories() {
  try {
    console.log('Fetching accessories from API...');
    const apiUrl = `${API_URL}/api/accessories?limit=1000`;
    console.log(`Attempting to fetch accessories from: ${apiUrl}`);
    const response = await makeRequest(apiUrl);

    if (!Array.isArray(response)) {
      console.warn('API returned non-array data, skipping accessories sitemap.');
      return [];
    }

    // Filter only active accessories with status 'active'
    const activeAccessories = response.filter(accessory =>
      accessory.isActive === 'true' && accessory.status === 'active'
    );

    console.log(`Found ${activeAccessories.length} active accessories (out of ${response.length} total)`);
    return activeAccessories;
  } catch (error) {
    console.error('Error fetching accessories:', error.message);
    console.log('Returning empty array for accessories...');
    return [];
  }
}

/**
 * Dynamically discover static pages
 */
function discoverPages() {
  const pages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/vehicles', priority: 0.9, changefreq: 'daily' },
    { url: '/accessories', priority: 0.9, changefreq: 'daily' },
    { url: '/support', priority: 0.7, changefreq: 'monthly' },
    { url: '/pricing', priority: 0.8, changefreq: 'monthly' },
    { url: '/blogs', priority: 0.8, changefreq: 'weekly' }
  ];
  return pages.map(page => ({
    ...page,
    loc: `${SITE_URL}${page.url}`,
    lastmod: formatDate(getCurrentDate()) // Ensure YYYY-MM-DD format
  }));
}

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

/**
 * Extract and normalize image URLs from vehicle data
 */
function extractVehicleImages(vehicle) {
  const images = [];

  if (vehicle.images && Array.isArray(vehicle.images)) {
    for (const img of vehicle.images) {
      const imageUrl = typeof img === 'string' ? img : (img.imageUrl || img.image_url || '');
      if (imageUrl && imageUrl.trim()) {
        images.push(imageUrl.trim());
      }
    }
  }

  // If no images found, return placeholder
  if (images.length === 0) {
    return [PLACEHOLDER_IMAGE];
  }

  return images.slice(0, MAX_IMAGES_PER_URL);
}

/**
 * Extract and normalize image URLs from accessory data
 */
function extractAccessoryImages(accessory) {
  const images = [];

  if (accessory.imageUrls && Array.isArray(accessory.imageUrls)) {
    for (const img of accessory.imageUrls) {
      const imageUrl = typeof img === 'string' ? img : (img.imageUrl || img.image_url || '');
      if (imageUrl && imageUrl.trim()) {
        images.push(imageUrl.trim());
      }
    }
  }

  // If no images found, return placeholder
  if (images.length === 0) {
    return [PLACEHOLDER_IMAGE];
  }

  return images.slice(0, MAX_IMAGES_PER_URL);
}

/**
 * Extract images from blog content (look for Cloudinary URLs or return placeholder)
 */
function extractBlogImages(blog) {
  const images = [];

  // Check if blog has a featured image or image field
  if (blog.image || blog.featuredImage || blog.imageUrl) {
    const imageUrl = blog.image || blog.featuredImage || blog.imageUrl;
    if (imageUrl && imageUrl.trim()) {
      images.push(imageUrl.trim());
    }
  }

  // Try to extract Cloudinary URLs from content/body
  if (blog.content || blog.body || blog.description) {
    const content = (blog.content || blog.body || blog.description || '').toString();
    // Match Cloudinary URLs (res.cloudinary.com)
    const cloudinaryRegex = /https?:\/\/res\.cloudinary\.com\/[^\s"<>]+/gi;
    const matches = content.match(cloudinaryRegex);
    if (matches) {
      matches.forEach(url => {
        if (!images.includes(url) && images.length < MAX_IMAGES_PER_URL) {
          images.push(url);
        }
      });
    }
  }

  // If no images found, return placeholder
  if (images.length === 0) {
    return [PLACEHOLDER_IMAGE];
  }

  return images.slice(0, MAX_IMAGES_PER_URL);
}

/**
 * Generate image XML elements for sitemap
 */
function generateImageElements(images, caption) {
  if (!images || images.length === 0) {
    return '';
  }

  return images.map(imageUrl => {
    // Ensure URL is absolute
    const absoluteUrl = imageUrl.startsWith('http') ? imageUrl : `${SITE_URL}${imageUrl}`;
    // Escape XML special characters in caption
    const safeCaption = (caption || '').replace(/[<>&"']/g, (char) => {
      const map = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' };
      return map[char] || char;
    });

    return `    <image:image>
      <image:loc>${absoluteUrl}</image:loc>
      ${safeCaption ? `<image:caption>${safeCaption}</image:caption>` : ''}
    </image:image>`;
  }).join('\n');
}

/**
 * Generate vehicle sitemap entries with images
 */
function generateVehicleEntries(vehicles, cache, cacheUpdates) {
  return vehicles.map(vehicle => {
    const vehicleUrl = `${SITE_URL}/vehicle/${vehicle.slug || vehicle.id}`;

    // Normalize features for consistent hashing
    const normalizedFeatures = normalizeFeatures(vehicle.features);

    const dataHash = getHash({
      id: vehicle.id,
      slug: vehicle.slug,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      features: normalizedFeatures, // Include normalized features in hash
      updatedAt: vehicle.updatedAt,
    });
    let lastmod = formatDate(vehicle.updatedAt || vehicle.createdAt);
    const cached = cache[vehicleUrl];
    if (cached && cached.hash === dataHash) {
      lastmod = cached.lastmod;
    } else {
      lastmod = formatDate(new Date());
    }
    cacheUpdates[vehicleUrl] = { hash: dataHash, lastmod };

    // Extract images
    const images = extractVehicleImages(vehicle);
    const caption = `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}`.trim() || 'Vehicle Image';
    const imageElements = generateImageElements(images, caption);

    return `  <url>
    <loc>${vehicleUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
${imageElements}
  </url>`;
  });
}

/**
 * Generate accessory sitemap entries with images
 */
function generateAccessoryEntries(accessories, cache, cacheUpdates) {
  return accessories.map(accessory => {
    const accessoryUrl = `${SITE_URL}/accessory/${accessory.slug || accessory.id}`;
    const dataHash = getHash({
      id: accessory.id,
      slug: accessory.slug,
      title: accessory.title,
      price: accessory.price,
      updatedAt: accessory.updatedAt,
    });
    let lastmod = formatDate(accessory.updatedAt || accessory.createdAt);
    const cached = cache[accessoryUrl];
    if (cached && cached.hash === dataHash) {
      lastmod = cached.lastmod;
    } else {
      lastmod = formatDate(new Date());
    }
    cacheUpdates[accessoryUrl] = { hash: dataHash, lastmod };

    // Extract images
    const images = extractAccessoryImages(accessory);
    const caption = accessory.title || accessory.name || 'Accessory Image';
    const imageElements = generateImageElements(images, caption);

    return `  <url>
    <loc>${accessoryUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
${imageElements}
  </url>`;
  });
}

/**
 * Generate Blog Sitemap
 */
function generateBlogSitemap(blogs, filename, cache, cacheUpdates) {
  // Ensure blogs is an array and has at least one item
  if (!Array.isArray(blogs) || blogs.length === 0) {
    console.warn('No blog posts available. Skipping blog sitemap generation.');
    return;
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"',
    '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">',
    ...blogs.map(blog => {
      // Validate blog object and provide fallbacks
      const safeTitle = blog.title ? blog.title.replace(/[<>&"']/g, '') : 'Untitled Blog Post';
      const safeSlug = blog.slug || `blog-post-${blog.id || Date.now()}`;
      const blogUrl = `${SITE_URL}/blogs/${safeSlug}`;
      const dataHash = getHash({
        id: blog.id,
        slug: blog.slug,
        title: blog.title,
        body: blog.body,
        updatedAt: blog.updatedAt,
      });
      let lastmod = formatDate(blog.updatedAt || blog.publishedAt);
      const cached = cache[blogUrl];
      if (cached && cached.hash === dataHash) {
        lastmod = cached.lastmod;
      } else {
        lastmod = formatDate(new Date());
      }
      cacheUpdates[blogUrl] = { hash: dataHash, lastmod };

      // Extract images
      const images = extractBlogImages(blog);
      const caption = safeTitle;
      const imageElements = generateImageElements(images, caption);

      return `  <url>
    <loc>${blogUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
${imageElements}
  </url>`;
    }),
    '</urlset>'
  ].join('\n');

  try {
    writeSitemapFile(filename, xml);
    console.log(`Generated ${filename} with ${blogs.length} blog posts`);
  } catch (error) {
    console.error(`Error writing ${filename}:`, error.message);
    throw error; // Re-throw to allow caller to handle
  }
}

/**
 * Generate XML Sitemap
 */
function generateSitemap(pages, filename, cache, cacheUpdates) {
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...pages.map(page => {
      const pageUrl = page.loc;
      const dataHash = getHash({
        loc: page.loc,
        priority: page.priority,
        changefreq: page.changefreq,
      });
      let lastmod = formatDate(page.lastmod);
      const cached = cache[pageUrl];
      if (cached && cached.hash === dataHash) {
        lastmod = cached.lastmod;
      } else {
        lastmod = formatDate(new Date());
      }
      cacheUpdates[pageUrl] = { hash: dataHash, lastmod };
      // Ensure priority is formatted as decimal (e.g., 1.0 instead of 1)
      const priority = typeof page.priority === 'number' ? page.priority.toFixed(1) : page.priority;
      return `  <url>\n    <loc>${page.loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    }),
    '</urlset>'
  ].join('\n');

  try {
    writeSitemapFile(filename, xml);
    console.log(`Generated ${filename}`);
  } catch (error) {
    console.error(`Error writing ${filename}:`, error.message);
    throw error;
  }
}

/**
 * Generate Vehicle Sitemap
 */
function generateVehicleSitemap(vehicles, filename, cache, cacheUpdates) {
  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    console.warn('No vehicles available. Skipping vehicle sitemap generation.');
    return;
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    generateVehicleEntries(vehicles, cache, cacheUpdates).join('\n'),
    '</urlset>'
  ].join('\n');

  try {
    writeSitemapFile(filename, xml);
    console.log(`Generated ${filename} with ${vehicles.length} vehicles`);
  } catch (error) {
    console.error(`Error writing ${filename}:`, error.message);
    throw error;
  }
}

/**
 * Generate Accessories Sitemap
 */
function generateAccessoriesSitemap(accessories, filename, cache, cacheUpdates) {
  if (!Array.isArray(accessories) || accessories.length === 0) {
    console.warn('No accessories available. Skipping accessories sitemap generation.');
    return;
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    generateAccessoryEntries(accessories, cache, cacheUpdates).join('\n'),
    '</urlset>'
  ].join('\n');

  try {
    writeSitemapFile(filename, xml);
    console.log(`Generated ${filename} with ${accessories.length} accessories`);
  } catch (error) {
    console.error(`Error writing ${filename}:`, error.message);
    throw error;
  }
}

/**
 * Generate Sitemap Index
 * Only includes sitemaps that actually exist
 */
function generateSitemapIndex(sitemaps) {
  // Filter out sitemaps that don't exist
  const existingSitemaps = sitemaps.filter(sitemap => {
    const filePath = path.resolve(PUBLIC_DIR, sitemap);
    return fs.existsSync(filePath);
  });

  if (existingSitemaps.length === 0) {
    console.warn('No sitemaps to include in index');
    return;
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...existingSitemaps.map(sitemap =>
      `  <sitemap>
    <loc>${SITE_URL}/${sitemap}</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
  </sitemap>`
    ),
    '</sitemapindex>'
  ].join('\n');

  try {
    writeSitemapFile('sitemap-index.xml', xml);
    console.log(`Generated sitemap-index.xml with ${existingSitemaps.length} sitemaps`);
  } catch (error) {
    console.error('Error writing sitemap-index.xml:', error.message);
    throw error;
  }
}

/**
 * Main function to generate sitemaps
 */
async function main() {
  try {
    // Check if validation should be skipped
    const skipValidation = process.argv.includes('--no-validate') || process.env.SKIP_VALIDATION === 'true';

    console.log('Starting sitemap generation...');

    // Load sitemap cache
    const cache = loadCache();
    // Temporary object for new/updated cache
    const cacheUpdates = {};
    console.log(`Site URL: ${SITE_URL}`);
    console.log(`API URL: ${API_URL}`);
    console.log(`Output directory: ${PUBLIC_DIR}`);
    console.log(`\nNote: Set API_URL environment variable to use a different API endpoint`);
    console.log(`Example: API_URL=http://localhost:4000 node scripts/generate-sitemaps.cjs\n`);

    // Ensure public directory exists
    if (!fs.existsSync(PUBLIC_DIR)) {
      fs.mkdirSync(PUBLIC_DIR, { recursive: true });
      console.log('Created public directory');
    }

    // Fetch data from APIs in parallel for better performance
    console.log('\nFetching data from APIs...');
    let [vehicles, blogPosts, accessories] = await Promise.all([
      fetchVehicles(),
      fetchBlogPosts(),
      fetchAccessories()
    ]);

    // Clean up cache for de-listed items (vehicles, accessories, blogs that are no longer active)
    console.log('\n🧹 Cleaning up cache for de-listed items...');
    const cleanedCache = cleanupDelistedItems(
      vehicles,
      (v) => `${SITE_URL}/vehicle/${v.slug || v.id}`,
      cache,
      'vehicles'
    );

    const cleanedCache2 = cleanupDelistedItems(
      accessories,
      (a) => `${SITE_URL}/accessory/${a.slug || a.id}`,
      cleanedCache,
      'accessories'
    );

    const finalCache = cleanupDelistedItems(
      blogPosts,
      (b) => `${SITE_URL}/blogs/${b.slug || `blog-post-${b.id || Date.now()}`}`,
      cleanedCache2,
      'blogs'
    );

    // Report de-listing statistics
    let totalDelisted = 0;
    if (delistingStats.vehicles.removed > 0) {
      console.log(`   Vehicles: Removed ${delistingStats.vehicles.removed} de-listed vehicle(s) from cache`);
      totalDelisted += delistingStats.vehicles.removed;
    }
    if (delistingStats.accessories.removed > 0) {
      console.log(`   Accessories: Removed ${delistingStats.accessories.removed} de-listed accessory(ies) from cache`);
      totalDelisted += delistingStats.accessories.removed;
    }
    if (delistingStats.blogs.removed > 0) {
      console.log(`   Blogs: Removed ${delistingStats.blogs.removed} de-listed blog post(s) from cache`);
      totalDelisted += delistingStats.blogs.removed;
    }
    if (totalDelisted === 0) {
      console.log('   ✅ No de-listed items found in cache');
    } else {
      console.log(`   📊 Total de-listed items cleaned: ${totalDelisted}`);
    }

    // Discover static pages
    let pages = discoverPages();

    // Prune invalid URLs before generating sitemaps
    if (PRUNE_INVALID_URLS) {
      console.log('\n🔍 Pruning invalid URLs...');
      if (CHECK_URL_STATUS) {
        console.log(`   URL status checking: ENABLED (timeout: ${URL_CHECK_TIMEOUT}ms, max concurrent: ${MAX_CONCURRENT_CHECKS})`);
      } else {
        console.log('   URL status checking: DISABLED (format validation only)');
        console.log('   Set CHECK_URL_STATUS=true to enable HTTP status checks');
      }

      // Prune vehicles
      const originalVehicleCount = vehicles.length;
      const validVehicles = await pruneInvalidUrls(
        vehicles,
        (v) => `${SITE_URL}/vehicle/${v.slug || v.id}`,
        'vehicles'
      );
      if (validVehicles.length !== originalVehicleCount) {
        console.log(`   Vehicles: ${originalVehicleCount} → ${validVehicles.length} (pruned ${originalVehicleCount - validVehicles.length})`);
      }

      // Prune blog posts
      const originalBlogCount = blogPosts.length;
      const validBlogPosts = await pruneInvalidUrls(
        blogPosts,
        (b) => `${SITE_URL}/blogs/${b.slug || `blog-post-${b.id || Date.now()}`}`,
        'blogs'
      );
      if (validBlogPosts.length !== originalBlogCount) {
        console.log(`   Blog posts: ${originalBlogCount} → ${validBlogPosts.length} (pruned ${originalBlogCount - validBlogPosts.length})`);
      }

      // Prune accessories
      const originalAccessoryCount = accessories.length;
      const validAccessories = await pruneInvalidUrls(
        accessories,
        (a) => `${SITE_URL}/accessory/${a.slug || a.id}`,
        'accessories'
      );
      if (validAccessories.length !== originalAccessoryCount) {
        console.log(`   Accessories: ${originalAccessoryCount} → ${validAccessories.length} (pruned ${originalAccessoryCount - validAccessories.length})`);
      }

      // Prune static pages
      const originalPageCount = pages.length;
      const validPages = await pruneInvalidUrls(
        pages,
        (p) => p.loc,
        'static pages'
      );
      if (validPages.length !== originalPageCount) {
        console.log(`   Static pages: ${originalPageCount} → ${validPages.length} (pruned ${originalPageCount - validPages.length})`);
      }

      // Update arrays with pruned results (direct reassignment for clarity and correctness)
      vehicles = validVehicles;
      blogPosts = validBlogPosts;
      accessories = validAccessories;
      pages = validPages;

      // Print pruning summary
      if (pruningStats.pruned > 0) {
        console.log(`\n   📊 Pruning Summary:`);
        console.log(`      Total URLs checked: ${pruningStats.total}`);
        console.log(`      URLs pruned: ${pruningStats.pruned}`);
        if (pruningStats.invalidFormat > 0) {
          console.log(`      - Invalid format: ${pruningStats.invalidFormat}`);
        }
        if (pruningStats.invalidStatus > 0) {
          console.log(`      - Invalid status: ${pruningStats.invalidStatus}`);
        }
        if (pruningStats.timeouts > 0) {
          console.log(`      - Timeouts: ${pruningStats.timeouts}`);
        }
        if (pruningStats.errors > 0) {
          console.log(`      - Errors: ${pruningStats.errors}`);
        }

        // Show first 10 pruned URLs as examples
        if (pruningStats.details.length > 0) {
          console.log(`\n   ⚠️  Sample pruned URLs (showing first 10):`);
          pruningStats.details.slice(0, 10).forEach((detail, idx) => {
            console.log(`      ${idx + 1}. [${detail.context}] ${detail.url}`);
            console.log(`         Reason: ${detail.reason}`);
          });
          if (pruningStats.details.length > 10) {
            console.log(`      ... and ${pruningStats.details.length - 10} more`);
          }
        }
      } else {
        console.log(`   ✅ All URLs are valid!`);
      }
    }

    console.log('\nGenerating sitemaps...');

    // Generate main sitemap (static pages only)
    generateSitemap(pages, 'sitemap.xml', finalCache, cacheUpdates);

    // Generate vehicle sitemap (dynamic vehicle pages)
    generateVehicleSitemap(vehicles, 'vehicle-sitemap.xml', finalCache, cacheUpdates);

    // Generate blog sitemap
    generateBlogSitemap(blogPosts, 'blog-sitemap.xml', finalCache, cacheUpdates);

    // Generate accessories sitemap
    generateAccessoriesSitemap(accessories, 'accessories-sitemap.xml', finalCache, cacheUpdates);

    // Generate sitemap index (only include generated sitemaps)
    const sitemapList = [
      'sitemap.xml',
      'vehicle-sitemap.xml',
      'blog-sitemap.xml',
      'accessories-sitemap.xml',
    ];

    generateSitemapIndex(sitemapList);

    // Save cache with updated lastmod info (merge cleaned cache with new updates)
    const updatedCache = { ...finalCache, ...cacheUpdates };
    saveCache(updatedCache);

    // Summary
    console.log('\n✅ All sitemaps generated successfully!');
    console.log('\nSummary:');
    console.log(`   - Static pages: ${pages.length}`);
    console.log(`   - Vehicle pages: ${vehicles.length}`);
    console.log(`   - Blog posts: ${blogPosts.length}`);
    console.log(`   - Accessories: ${accessories.length}`);
    console.log(`   - Total URLs: ${pages.length + vehicles.length + blogPosts.length + accessories.length}`);

    if (PRUNE_INVALID_URLS && pruningStats.pruned > 0) {
      console.log(`\n   🧹 Pruning: ${pruningStats.pruned} invalid URLs removed`);
    }

    if (totalDelisted > 0) {
      console.log(`\n   🗑️  De-listing: ${totalDelisted} de-listed items removed from cache`);
    }

    console.log(`\nSitemap index: ${SITE_URL}/sitemap-index.xml`);

    // Run validation automatically unless skipped
    if (!skipValidation) {
      console.log('\n🔍 Running automatic validation...');
      try {
        // Use execFile for better cross-platform support
        const { execFile } = require('child_process');
        const validationScript = path.resolve(__dirname, 'validate-sitemaps.cjs');

        return new Promise((resolve, reject) => {
          execFile('node', [validationScript], (error, stdout, stderr) => {
            if (error) {
              // If validation script doesn't exist or fails to run, warn but don't fail
              if (error.code === 'ENOENT' || error.code === 'ENOTFOUND') {
                console.warn(`\n⚠️  Could not run validation: ${error.message}`);
                console.warn('   Sitemaps were generated but not validated.');
                console.warn('   Run "npm run validate-sitemaps" manually to validate.');
                resolve();
                return;
              }

              // Validation failed with errors
              console.error('\n❌ Validation failed. Generated sitemaps may have issues.');
              console.error('   Run with --no-validate to skip validation, or fix the errors above.');
              if (stderr) console.error(stderr);
              process.exit(1);
            } else {
              // Validation passed
              if (stdout) process.stdout.write(stdout);
              console.log('\n✅ Sitemap generation and validation completed successfully!');
              resolve();
            }
          });
        });
      } catch (error) {
        console.warn(`\n⚠️  Could not run validation: ${error.message}`);
        console.warn('   Sitemaps were generated but not validated.');
        console.warn('   Run "npm run validate-sitemaps" manually to validate.');
      }
    } else {
      console.log('\n⚠️  Validation skipped (--no-validate flag set)');
      console.log('   Run "npm run validate-sitemaps" manually to validate.');
    }

  } catch (error) {
    console.error('\n❌ Error generating sitemaps:', error);
    process.exit(1);
  }
}

// Run the script
main(); 