import React, { useState, useEffect, lazy, Suspense } from 'react'
import Layout from '../components/Layout'
import MarketplaceBackground from '../components/backgrounds/MarketplaceBackground'
import axios from '../api/axios'
import { useProductContext } from '../context/ProductProvider'
import { useSeoContext } from '../context/SeoProvider'
import { SearchAccessoriesProvider } from '../context/SearchAccesoriesProvider'
// Prioritize critical components - load immediately
const Header = lazy(() => import('../components/header'))
const Search = lazy(() => import('../components/forms/search'))
const SearchAccessories = lazy(() => import('../components/forms/searchAccessories'))
const ValueProposition = lazy(() => import('../components/cards/ValueProposition'))
const TrustSignals = lazy(() => import('../components/cards/TrustSignals'))
// Load content sections without artificial delays - use intersection observer instead
const FeaturedVehicles = lazy(() => import('../components/cards/FeaturedVehicles'))
const FeaturedAccessories = lazy(() => import('../components/cards/FeaturedAccessories'))
const LatestCars = lazy(() => import('../components/cards/LatestCars'))
const SpecialDeals = lazy(() => import('../components/cards/SpecialDeals'))
const PopularBrands = lazy(() => import('../components/cards/PopularBrands'))
const CategoryBrowser = lazy(() => import('../components/cards/CategoryBrowser'))

// Loading placeholder component with reduced animation
const SectionPlaceholder = ({ title }) => (
  <div className="w-full py-4 px-2">
    <div className="h-6 bg-gray-100 rounded w-1/3 mb-2"></div>
    <div className="grid grid-cols-2 gap-2">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-50 rounded"></div>
      ))}
    </div>
  </div>
);

function home() {
  const { products, getTopCategories, isLoading } = useProductContext();
  const { updateSeo } = useSeoContext();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [popularMakes, setPopularMakes] = useState([]);
  const [specialDeals, setSpecialDeals] = useState([]);
  const [isLoadingDeals, setIsLoadingDeals] = useState(true);
  const [isMobile] = useState(window.innerWidth < 768);

  // Update SEO metadata for homepage
  useEffect(() => {
    const canonicalUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname === '/home' ? '/home' : '/'}`
      : '/';
    // Basic homepage structured data with unique @id
    const websiteStructuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://www.diksxcars.co.ke/#website",
      "name": "Diksx Cars & Spares",
      "url": "https://www.diksxcars.co.ke",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.diksxcars.co.ke/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    };
    // Organization structured data with unique @id
    const organizationStructuredData = {
      "@context": "https://schema.org",
      "@type": "AutoDealer",
      "@id": "https://www.diksxcars.co.ke/#organization",
      "name": "Diksx Cars & Spares",
      "url": "https://diksxcars.co.ke",
      "logo": "https://www.diksxcars.co.ke/images/logo.png",
      "description": "Kenya's premier automotive marketplace for buying and selling vehicles, parts, and accessories.",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "Kenya",
        "addressLocality": "Nairobi"
      },
      "telephone": "+254-757-088-427",
      "email": "support@diksxcars.co.ke",
      "sameAs": [
        "https://www.facebook.com/diksxcars",
        "https://www.instagram.com/diksxcars"
      ],
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "17:00"
      }
    };
    // ItemList structured data with unique @id and only including products if available
    const featuredItemsStructuredData = products && products.length > 0 ? {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": "https://www.diksxcars.co.ke/#featured",
      "itemListElement": products.slice(0, Math.min(6, products.length)).map((vehicle, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "@id": `https://www.diksxcars.co.ke/vehicle/${vehicle.slug || index}#product`,
          "name": `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}`.trim(),
          "description": vehicle.features || '',
          "image": vehicle.images && vehicle.images.length > 0
            ? (vehicle.images[0].image_url || vehicle.images[0])
            : 'https://www.diksxcars.co.ke/images/default-vehicle.jpg',
          "url": `https://www.diksxcars.co.ke/vehicle/${vehicle.slug || ''}`,
          "offers": {
            "@type": "Offer",
            "price": vehicle.price || '',
            "priceCurrency": "KES",
            "availability": "https://schema.org/InStock"
          }
        }
      }))
    } : null;

    // Combined structured data - only include valid objects
    const structuredDataArray = [
      websiteStructuredData,
      organizationStructuredData
    ];

    // Only add featured items if available
    if (featuredItemsStructuredData) {
      structuredDataArray.push(featuredItemsStructuredData);
    }

    updateSeo({
      title: 'Premier Vehicle Marketplace in Kenya',
      description: 'Find the best deals on Vehicles, Spares and Accessories in Kenya. Browse our extensive collection of vehicles with detailed specifications and competitive pricing.',
      canonical: canonicalUrl,
      type: 'website',
      additionalMetaTags: [
        { name: 'robots', content: 'index, follow' }
      ],
      structuredData: structuredDataArray
    });
  }, [updateSeo, products]);

  // Add resize listener for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Get a subset of products for the featured section
    if (products.length > 0) {
      // Only use active products (backend already filters this, but add extra safety)
      const activeProducts = products.filter(product => product.isActive === "true");

      // For featured products - limit to fewer items on mobile
      setFeaturedProducts(activeProducts.slice(0, isMobile ? 6 : 10));

      // Extract popular makes
      const makesCount = {};
      activeProducts.forEach(product => {
        if (product.make) {
          makesCount[product.make] = (makesCount[product.make] || 0) + 1;
        }
      });

      // Sort makes by count and take fewer on mobile
      const sortedMakes = Object.entries(makesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, isMobile ? 4 : 8)
        .map(([make, count]) => ({
          name: make,
          count,
          slug: make.toLowerCase().replace(/\s+/g, '-')
        }));

      setPopularMakes(sortedMakes);
    }
  }, [products, isMobile]);

  // Fetch special deals with optimized query for mobile
  useEffect(() => {
    const fetchSpecialDeals = async () => {
      setIsLoadingDeals(true);

      try {
        // Fetch fewer deals on mobile to improve performance
        // This API now only returns active products
        const response = await axios.get('/api/publicproducts', {
          params: {
            hasDiscount: true,
            limit: isMobile ? 2 : 4
          }
        });

        setSpecialDeals(response.data);
      } catch (error) {
        console.error('Error fetching special deals:', error);
        // Fallback: Show some vehicles with the lowest prices
        if (products.length > 0) {
          // Only use active products
          const activeProducts = products.filter(p => p.isActive === "true");
          const sortedByPrice = [...activeProducts]
            .sort((a, b) => (a.price || Infinity) - (b.price || Infinity))
            .slice(0, isMobile ? 2 : 4);
          setSpecialDeals(sortedByPrice);
        }
      } finally {
        setIsLoadingDeals(false);
      }
    };

    fetchSpecialDeals();
  }, [products, isMobile]);

  // Get top categories - fewer on mobile
  const topCategories = getTopCategories(isMobile ? 2 : 4);

  return (
    <MarketplaceBackground>
      <Layout>
        {/* Critical above-the-fold content - loads immediately */}
        <Suspense fallback={<div className="h-[200px] bg-gray-50"></div>}>
          <Header />
        </Suspense>

        {/* Value Proposition - immediately visible */}
        <Suspense fallback={<div className="h-[150px] bg-white"></div>}>
          <ValueProposition />
        </Suspense>



        <div className="max-w-full px-2 sm:px-4 mx-auto">
          {/* Search - prominent placement after trust signals */}
          <Suspense fallback={<div className="h-[100px] bg-gray-50 rounded-lg my-2"></div>}>
            <Search />
          </Suspense>


          {/* Content sections - load progressively */}
          <div className="space-y-4 sm:space-y-6">
            {isMobile ? (
              // Mobile optimized loading
              <>
                <Suspense fallback={<SectionPlaceholder />}>
                  <FeaturedVehicles products={featuredProducts.slice(0, 4)} />
                </Suspense>

                {/* Accessories Search Form */}
                <SearchAccessoriesProvider>
                  <Suspense fallback={<div className="h-[100px] bg-gray-50 rounded-lg my-2"></div>}>
                    <SearchAccessories />
                  </Suspense>
                </SearchAccessoriesProvider>

                <Suspense fallback={<SectionPlaceholder />}>
                  <FeaturedAccessories limit={4} />
                </Suspense>

                <Suspense fallback={<SectionPlaceholder />}>
                  <LatestCars limit={4} />
                </Suspense>

                {/* Load remaining components on demand */}
                {typeof IntersectionObserver !== 'undefined' && (
                  <>
                    <Suspense fallback={<SectionPlaceholder />}>
                      <SpecialDeals deals={specialDeals.slice(0, 2)} isLoading={isLoadingDeals} />
                    </Suspense>

                    <Suspense fallback={<SectionPlaceholder />}>
                      <PopularBrands brands={popularMakes.slice(0, 4)} />
                    </Suspense>

                    <Suspense fallback={<SectionPlaceholder />}>
                      <CategoryBrowser categories={getTopCategories(4)} isLoading={isLoading} />
                    </Suspense>
                  </>
                )}
              </>
            ) : (
              // Desktop loading - load all components
              <>
                <Suspense fallback={<SectionPlaceholder />}>
                  <FeaturedVehicles products={featuredProducts} />
                </Suspense>

                {/* Accessories Search Form */}
                <SearchAccessoriesProvider>
                  <Suspense fallback={<div className="h-[100px] bg-gray-50 rounded-lg my-2"></div>}>
                    <SearchAccessories />
                  </Suspense>
                </SearchAccessoriesProvider>

                <Suspense fallback={<SectionPlaceholder />}>
                  <FeaturedAccessories limit={8} />
                </Suspense>

                <Suspense fallback={<SectionPlaceholder />}>
                  <LatestCars />
                </Suspense>

                <Suspense fallback={<SectionPlaceholder />}>
                  <SpecialDeals deals={specialDeals} isLoading={isLoadingDeals} />
                </Suspense>

                <Suspense fallback={<SectionPlaceholder />}>
                  <PopularBrands brands={popularMakes} />
                </Suspense>

                <Suspense fallback={<SectionPlaceholder />}>
                  <CategoryBrowser categories={getTopCategories(8)} isLoading={isLoading} />
                </Suspense>
              </>
            )}
          </div>
        </div>

        {/* Trust Signals - Moved to bottom */}
        <Suspense fallback={<div className="h-[120px] bg-gray-50"></div>}>
          <TrustSignals />
        </Suspense>
      </Layout>
    </MarketplaceBackground>
  )
}

export default home