import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
//this component needs refactor by implementing OG for seo.
//https://chatgpt.com/c/698ba259-9214-8332-9168-3f6548a8d80b use this link for the refactor guide 
// Create context
const SeoContext = createContext();

// Default base URL
const DEFAULT_BASE_URL = 'https://diksxcars.co.ke';
const DEFAULT_IMAGE = 'https://res.cloudinary.com/dyp6hud28/image/upload/c_fill,w_1200,h_630,g_auto/v1745505573/diksx_ke8jzi.png';

/**
 * Helper function to ensure a URL is absolute
 * @param {string} url - The URL to validate/convert
 * @returns {string} Absolute URL
 */
const ensureAbsoluteUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return `${DEFAULT_BASE_URL}/`;
  }

  // If already absolute, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If relative, make it absolute
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${DEFAULT_BASE_URL}${cleanUrl}`;
};

/**
 * Helper function to check if a value is empty (null, undefined, or empty string)
 * @param {any} value - The value to check
 * @returns {boolean} True if value is empty
 */
const isEmpty = (value) => {
  return value === null || value === undefined || value === '';
};

/**
 * Normalize meta values to safe strings for react-helmet.
 * React components/functions/symbols are discarded to avoid
 * "Cannot convert a Symbol value to a string" errors.
 */
const normalizeMetaValue = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'function' || typeof value === 'symbol') return null;
  // Avoid passing React elements or objects as meta values
  if (React.isValidElement(value) || (typeof value === 'object' && !Array.isArray(value))) return null;
  return String(value);
};

/**
 * Helper function to remove duplicate meta tags based on name/property and content
 * while also sanitizing invalid values that Helmet cannot render.
 * @param {Array} tags - Array of meta tag objects
 * @returns {Array} Array with duplicates removed and sanitized
 */
const removeDuplicateMetaTags = (tags) => {
  if (!Array.isArray(tags)) return [];

  const seen = new Set();
  return tags
    .map(tag => {
      const content = normalizeMetaValue(tag?.content);
      const name = normalizeMetaValue(tag?.name);
      const property = normalizeMetaValue(tag?.property);
      if (isEmpty(content)) return null;
      if (!name && !property) return null;
      return { name, property, content };
    })
    .filter(tag => {
      if (!tag) return false;
      const key = tag.property
        ? `property:${tag.property}:${tag.content}`
        : `name:${tag.name}:${tag.content}`;

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

/**
 * SEO Provider Component to manage all SEO metadata across the application
 * This is the single source of truth for SEO metadata - all canonical URLs should be set via updateSeo()
 */
export const SeoProvider = ({ children }) => {
  // Default SEO values - homepage defaults
  const [seo, setSeo] = useState({
    title: 'Diksx Cars & Spares | Vehicle Marketplace | Find Your Next Ride',
    description: 'Browse through a wide range of vehicles. Find your next ride with detailed specs, competitive pricing, and a user-friendly experience.',
    canonical: null, // Default to homepage
    image: DEFAULT_IMAGE,
    type: 'website',
    twitterHandle: '@diksxcars',
    locale: 'en_KE',
    structuredData: null,
    additionalMetaTags: [],
    robots: 'index, follow',
    noindex: false,
  });

  // Function to update SEO values - memoized with useCallback for performance
  const updateSeo = useCallback((newSeoData) => {
    setSeo(prevSeo => {
      // Ensure canonical URL is absolute if provided
      if (newSeoData.canonical !== undefined) {
        newSeoData.canonical = newSeoData.canonical
          ? ensureAbsoluteUrl(newSeoData.canonical)
          : null;
      }

      // Remove duplicate meta tags from additionalMetaTags if provided
      if (newSeoData.additionalMetaTags && Array.isArray(newSeoData.additionalMetaTags)) {
        newSeoData.additionalMetaTags = removeDuplicateMetaTags(newSeoData.additionalMetaTags);
      }

      // Deep comparison for structured data and arrays
      const hasChanges = Object.keys(newSeoData).some(key => {
        const prevValue = prevSeo[key];
        const newValue = newSeoData[key];

        // Special handling for arrays and objects
        if (Array.isArray(prevValue) && Array.isArray(newValue)) {
          return JSON.stringify(prevValue) !== JSON.stringify(newValue);
        }
        if (typeof prevValue === 'object' && typeof newValue === 'object' && prevValue !== null && newValue !== null) {
          return JSON.stringify(prevValue) !== JSON.stringify(newValue);
        }

        return prevValue !== newValue;
      });

      if (hasChanges) {
        return { ...prevSeo, ...newSeoData };
      }
      return prevSeo;
    });
  }, []);

  // Ensure canonical URL is absolute with fallback
  const canonicalUrl = useMemo(() => {
    return ensureAbsoluteUrl(seo.canonical || '/');
  }, [seo.canonical]);

  // Ensure image is an absolute URL with fallback
  const validImageUrl = useMemo(() => {
    if (!seo.image || typeof seo.image !== 'string' || !seo.image.startsWith('http')) {
      return DEFAULT_IMAGE;
    }
    return seo.image;
  }, [seo.image]);

  // Ensure og:url is absolute with fallback (defaults to canonical)
  const ogUrl = useMemo(() => {
    return canonicalUrl;
  }, [canonicalUrl]);

  // Remove duplicate and empty meta tags from additionalMetaTags
  const cleanAdditionalMetaTags = useMemo(() => {
    if (!Array.isArray(seo.additionalMetaTags)) return [];
    return removeDuplicateMetaTags(seo.additionalMetaTags);
  }, [seo.additionalMetaTags]);

  // Safely stringify structured data and guard against React elements/functions
  const renderStructuredData = useCallback(() => {
    if (!seo.structuredData) return null;

    const toArray = Array.isArray(seo.structuredData) ? seo.structuredData : [seo.structuredData];

    const scripts = toArray.map((data, index) => {
      // Ignore React elements, functions, symbols or undefined values
      if (
        data === null ||
        data === undefined ||
        typeof data === 'function' ||
        typeof data === 'symbol' ||
        React.isValidElement(data)
      ) {
        return null;
      }

      try {
        const json = JSON.stringify(data);
        if (!json) return null;
        return (
          <script key={`ld-${index}`} type="application/ld+json">
            {json}
          </script>
        );
      } catch (err) {
        // If serialization fails, skip this entry to avoid Helmet errors
        console.warn('Skipping invalid structured data entry', err);
        return null;
      }
    });

    return scripts.filter(Boolean);
  }, [seo.structuredData]);

  // Sync document.head using useEffect
  useEffect(() => {
    // Helmet handles most of the syncing, but we ensure canonical link exists
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.setAttribute('href', canonicalUrl);
    }

    // Ensure og:url meta tag exists and is correct
    let ogUrlTag = document.querySelector('meta[property="og:url"]');
    if (ogUrlTag) {
      ogUrlTag.setAttribute('content', ogUrl);
    }

    // Ensure og:image meta tag exists and is correct
    let ogImageTag = document.querySelector('meta[property="og:image"]');
    if (ogImageTag) {
      ogImageTag.setAttribute('content', validImageUrl);
    }
  }, [canonicalUrl, ogUrl, validImageUrl]);

  return (
    <SeoContext.Provider value={{ seo, updateSeo }}>
      <Helmet defer={false}>
        {/* Basic Meta Tags - only render if not empty */}
        {!isEmpty(seo.title) && <title>{seo.title}</title>}
        {!isEmpty(seo.description) && <meta name="description" content={seo.description} />}

        {/* Canonical URL - always render (single source of truth, guaranteed absolute) */}
        <link rel="canonical" href={canonicalUrl} />

        {/* Robots meta tag */}
        {seo.noindex ? (
          <meta name="robots" content="noindex, nofollow" />
        ) : (
          !isEmpty(seo.robots) && <meta name="robots" content={seo.robots} />
        )}

        {/* Open Graph Meta Tags - with fallbacks */}
        {!isEmpty(seo.title) && <meta property="og:title" content={seo.title} />}
        {!isEmpty(seo.description) && <meta property="og:description" content={seo.description} />}
        {/* og:url always has fallback to canonical */}
        <meta property="og:url" content={ogUrl} />
        {/* og:image always has fallback */}
        <meta property="og:image" content={validImageUrl} />
        <meta property="og:image:secure_url" content={validImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        {!isEmpty(seo.title) && <meta property="og:image:alt" content={seo.title} />}
        {!isEmpty(seo.type) && <meta property="og:type" content={seo.type} />}
        <meta property="og:site_name" content="Diksx Cars & Spares" />
        {!isEmpty(seo.locale) && <meta property="og:locale" content={seo.locale} />}
        <meta property="fb:app_id" content="1190344458805630" />

        {/* Twitter Card Meta Tags - only render if not empty */}
        <meta name="twitter:card" content="summary_large_image" />
        {!isEmpty(seo.twitterHandle) && <meta name="twitter:site" content={seo.twitterHandle} />}
        {!isEmpty(seo.twitterHandle) && <meta name="twitter:creator" content={seo.twitterHandle} />}
        {!isEmpty(seo.title) && <meta name="twitter:title" content={seo.title} />}
        {!isEmpty(seo.description) && <meta name="twitter:description" content={seo.description} />}
        {/* twitter:image always has fallback */}
        <meta name="twitter:image" content={validImageUrl} />
        {!isEmpty(seo.title) && <meta name="twitter:image:alt" content={seo.title} />}

        {/* Mobile Meta Tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#3DC2EC" />

        {/* Structured Data if available - handle arrays safely */}
        {renderStructuredData()}

        {/* Additional meta tags - only render non-empty, non-duplicate tags */}
        {cleanAdditionalMetaTags.map((tag, index) => {
          // Skip if content is empty
          if (isEmpty(tag.content)) return null;

          // Handle both name and property meta tags
          if (tag.property) {
            return <meta key={`prop-${tag.property}-${index}`} property={tag.property} content={tag.content} />;
          }
          if (tag.name) {
            return <meta key={`name-${tag.name}-${index}`} name={tag.name} content={tag.content} />;
          }
          return null;
        })}
      </Helmet>
      {children}
    </SeoContext.Provider>
  );
};

/**
 * Custom hook to access and update SEO metadata
 * @returns {Object} SEO context including current values and update function
 */
export const useSeoContext = () => {
  const context = useContext(SeoContext);
  if (!context) {
    throw new Error('useSeoContext must be used within a SeoProvider');
  }
  return context;
};


/**
 * Helper function to generate breadcrumb structured data
 * @param {Array} items - Array of {name: string, url: string} objects
 * @returns {Object} BreadcrumbList structured data
 * 
 * @example
 * generateBreadcrumb([
 *   { name: 'Home', url: 'https://diksxcars.co.ke' },
 *   { name: 'Vehicles', url: 'https://www.diksxcars.co.ke/vehicles' },
 *   { name: 'Toyota Corolla', url: 'https://www.diksxcars.co.ke/vehicle/toyota-corolla-2020' }
 * ])
 */
export const generateBreadcrumb = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

/**
 * Helper component to add breadcrumb structured data to a page
 * Usage: <BreadcrumbSchema items={breadcrumbItems} />
 */
export const BreadcrumbSchema = ({ items }) => {
  const breadcrumbData = generateBreadcrumb(items);

  if (!breadcrumbData) {
    return null;
  }

  return (
    <Helmet defer={false}>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbData)}
      </script>
    </Helmet>
  );
};

export default SeoProvider; 