# Diksx Cars SEO Guide

This guide explains how to use the SEO features that have been added to improve Google Search Console indexing and overall SEO performance.

## Sitemap Generation

We've created a comprehensive sitemap generation system that automatically creates:

1. `sitemap.xml` - Main sitemap with static pages
2. `vehicle-sitemap.xml` - Vehicle listings sitemap 
3. `make-model-sitemap.xml` - Make and model pages sitemap
4. `sitemap-index.xml` - Main sitemap index that references all other sitemaps

### How to Use

The sitemap generation is now part of the build process. Every time you run `npm run build`, the sitemaps will be automatically generated.

You can also generate the sitemaps manually with these commands:

```bash
# Generate all sitemaps
npm run generate-sitemaps

# Generate just the sitemap index
npm run generate-sitemap-index
```

## Canonical URLs

### What are Canonical URLs?

Canonical URLs tell search engines which version of a URL is the "official" one when you have multiple URLs that display the same content. This is especially important for:

- URLs that are accessible both with and without a trailing slash
- Different paths that show the same content (e.g., `/` and `/home`)
- URLs with parameters or campaign tracking

### How to Set Canonical URLs in Components

We've added a simple `PageCanonical` component that you can use in any of your page components. Here's how to use it:

```jsx
import { PageCanonical } from '../context/SeoProvider';

function AboutPage() {
  return (
    <div>
      <PageCanonical path="/about-us" />
      <h1>About Diksx Cars</h1>
      {/* rest of your component */}
    </div>
  );
}
```

The `PageCanonical` component automatically:
- Adds the domain (`https://diksxcars.co.ke`)
- Sets both the canonical URL and the Open Graph URL
- Handles special cases like the homepage

### Implementation Guidelines

1. **Homepage**: For the homepage and any equivalent pages (like `/home`), use:
   ```jsx
   <PageCanonical path="/" />
   ```
   This will automatically set the canonical URL to `https://www.diksxcars.co.ke/`.

2. **Dynamic Pages**: For pages like vehicle detail pages, you can pass the dynamic path:
   ```jsx
   <PageCanonical path={`/vehicle/${vehicleSlug}`} />
   ```

3. **Always Use the Most Specific URL**: Choose the URL that best represents the content as the canonical URL.

## SEO Metadata

For more comprehensive SEO updates, you can use the `useSeoContext` hook:

```jsx
import { useSeoContext } from '../context/SeoProvider';

function VehiclePage({ vehicle }) {
  const { updateSeo } = useSeoContext();
  
  useEffect(() => {
    updateSeo({
      title: `${vehicle.make} ${vehicle.model} ${vehicle.year} | Diksx Cars`,
      description: vehicle.description || 'Explore this vehicle on Diksx Cars',
      // The canonical URL is handled by PageCanonical, so you don't need to set it here
      image: vehicle.images?.[0]?.url || undefined,
    });
  }, [vehicle, updateSeo]);
  
  return (
    <div>
      <PageCanonical path={`/vehicle/${vehicle.slug}`} />
      {/* rest of your component */}
    </div>
  );
}
```

## Best Practices for Google Search Console

1. **Submit Your Sitemaps**: After deploying, submit your sitemap-index.xml to Google Search Console.

2. **Monitor Indexing Status**: Regularly check Google Search Console for crawl errors and indexing issues.

3. **Update Content Dates**: Make sure your content has accurate modification dates in the sitemaps.

4. **Fix 404 Errors**: Regularly check for and fix any 404 errors reported in Google Search Console.

5. **Use Structured Data**: Consider adding structured data for vehicles using schema.org/Vehicle.

## Checking Your SEO Implementation

You can use these tools to verify your SEO implementation:

- [Google's Rich Results Test](https://search.google.com/test/rich-results)
- [Google's Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Google Search Console](https://search.google.com/search-console)
- [Structured Data Testing Tool](https://validator.schema.org/) 