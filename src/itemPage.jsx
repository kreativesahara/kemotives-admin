import React, { useEffect, useState, useRef } from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import useAuth from "./hooks/useAuth";
import Layout from './components/Layout';
import defaultProfile from './assets/admin.jpg'
import defaultVehicle from './assets/default-vehicle.png'
import { useParams, Link } from 'react-router-dom';
import { useProductContext } from './context/ProductProvider';
import { useSellerContext } from './context/SellerProvider';
import { useSeoContext, BreadcrumbSchema } from './context/SeoProvider';
import { Carousel } from 'react-responsive-carousel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import RelatedCars from './components/cards/relatedCars';
import axios from './api/axios';
import { axiosPrivate } from './api/axios';
import { WhatsappShareButton, FacebookShareButton, WhatsappIcon, FacebookIcon } from 'react-share';

const ItemPage = () => {
    const { productId } = useParams();
    const { auth } = useAuth();
    const { products } = useProductContext();
    const { sellers, isLoading: sellersLoading } = useSellerContext();
    const { updateSeo } = useSeoContext();
    const [product, setProduct] = useState(null);
    const [seller, setSeller] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewCount, setViewCount] = useState(0);
    const [showCopiedMessage, setShowCopiedMessage] = useState(false);
    const [kycStatus, setKycStatus] = useState(null);
    const viewTracked = useRef(false);
    const buildMetaTitle = (p) => {
        if (!p) return 'Vehicle listing | Diksx Cars';
        const rawMetaTitle =
            `${p.year || ''} ${p.make || ''} ${p.model || ''} Mileage - ${p.mileage || ''} KMs ${p.condition || ''}in ${p.location || 'Kenya'} | Diksx Cars`.replace(/\s+/g, ' ').trim();
        return rawMetaTitle.length > 65
            ? `${rawMetaTitle.slice(0, 62)}...`
            : rawMetaTitle || 'Vehicle listing | Diksx Cars';
    };
    const clampText = (text, min = 20, max = 70) => {
        if (!text) return 'Vehicle listing | Diksx Cars';
        const trimmed = text.trim();
        if (trimmed.length < min) {
            const padded = `${trimmed} | Diksx Cars`.trim();
            return padded.length > max ? `${padded.slice(0, max - 3)}...` : padded;
        }
        if (trimmed.length > max) return `${trimmed.slice(0, max - 3)}...`;
        return trimmed;
    };

    const buildHeadingText = (p) => {
        if (!p) return 'Vehicle listing | Diksx Cars';
        const base = `${p.year || ''} ${p.make || ''} ${p.model || ''} - ${p.location || 'Kenya'}`.replace(/\s+/g, ' ').trim();
        const withFallback = base || 'Vehicle listing | Diksx Cars';
        return clampText(withFallback);
    };

    // SEO Update Effect
    useEffect(() => {
        if (product) {
            const metaTitle = buildMetaTitle(product);
            // Create a detailed description with key selling points
            const metaDescription =
                `${product.make} ${product.model} ${product.year} for sale in ${product.location || 'Kenya'}. 
                 ${product.mileage ? `${Number(product.mileage).toLocaleString()} KM, ` : ''}
                 ${product.transmission || ''}, ${product.fuelType} engine.`
            // Get the main image URL for sharing
            const mainImage = getImageForSlug(product);
            // Generate structured data
            const vehicleStructuredData = getStructuredData();
            // Generate canonical URL that matches the actual page URL
            const canonicalUrl = `https://www.diksxcars.co.ke/vehicle/${product.slug}`;
            // Define additional meta tags for better indexing and sharing
            const additionalTags = [
                { name: 'product:availability', content: 'in_stock' },
                { name: 'product:price:amount', content: product.price },
                { name: 'product:price:currency', content: 'KES' },
                { name: 'product:brand', content: product.make },
                { name: 'product:condition', content: product.condition },
                { name: 'robots', content: 'index, follow' },
            ];
            // Update SEO metadata with vehicle-specific information
            updateSeo({
                title: metaTitle,
                description: metaDescription,
                canonical: canonicalUrl, // ADD THIS LINE
                // Use the first vehicle image as the OpenGraph image
                image: mainImage,
                // Change content type to product for vehicle pages
                type: 'product',
                structuredData: vehicleStructuredData,
                additionalMetaTags: additionalTags
            });
        }
    }, [product, updateSeo]);
    // Fetch KYC status for the seller
    const fetchSellerKycStatus = async (userId) => {
        if (!userId) return;
        try {
            const response = await axiosPrivate.get(`/api/kyc/user/${userId}`);
            if (response.data && response.data.status) {
                setKycStatus(response.data.status);
            }
        } catch (err) {
            // 404 is expected if no KYC has been submitted yet
            console.log('KYC status not found or not verified');
            setKycStatus(null);
        }
    };

    // New function to generate WhatsApp Status optimized message
    const getWhatsAppStatusMessage = () => {
        if (!product) return '';
        // Function to truncate features intelligently
        const truncateFeatures = (features, maxLength = 80) => {
            if (!features) return '';
            // Split features by comma or semicolon
            const featureList = features.split(/[,;]/).map(f => f.trim()).filter(Boolean);
            let truncatedFeatures = '';
            for (const feature of featureList) {
                if ((truncatedFeatures + feature).length <= maxLength) {
                    truncatedFeatures += truncatedFeatures ? `, ${feature}` : feature;
                } else {
                    truncatedFeatures += '...';
                    break;
                }
            }
            return truncatedFeatures;
        };
        // Truncate features
        const featuresText = truncateFeatures(product.features);
        // Base message templates
        const fullTemplate = `🚗 *${product.year} ${product.make} ${product.model}*  
        *${product.condition}* in *${product.location}*

        💰 *KSH ${Number(product.price).toLocaleString()}*  
        🔧 *Features:* ${featuresText}

        👉 *More details online.*
        Only on *Diksx Cars* — *Kenya's smart car marketplace*!`;

        const shortTemplate = `🚘 *${product.year} ${product.make} ${product.model}*  
        *${product.condition}* in *${product.location}*

        💰 *KSH ${Number(product.price).toLocaleString()}*  
        🔧 ${featuresText}

        👉 *More details online.*
        Diksx Cars — Buy or sell smart!`;

        // Choose template based on length, prioritizing information
        const message = fullTemplate.length <= 500 ? fullTemplate : shortTemplate;

        // Final length check and truncation
        return message.length > 500
            ? message.substring(0, 497) + '...'
            : message;
    };

    // Existing getShareMessage function remains unchanged
    const getShareMessage = () => {
        if (!product) return '';
        return `Here is a ${product.year} ${product.make} ${product.model} — a ${product.condition} ${product.category} Available in ${product.location}.
        \n💰 *Price:* KSH ${Number(product.price).toLocaleString()}\n🔧  *Features:* ${product.features}\n\n👉 Tap to explore more or list your car today — fast and easy!`;
    };

    // New function to get the full share URL
    const getShareUrl = () => {
        if (!product) return '';
        return `https://www.diksxcars.co.ke/vehicle/${product.slug}`;
    };

    // Modified function to generate structured data with share actions
    const getStructuredData = () => {
        if (!product) return null;
        const baseData = {
            "@context": "https://schema.org",
            "@type": "Vehicle",
            "name": `${product.make} ${product.model} ${product.year}`,
            "description": `${product.year} ${product.make} ${product.model} in ${product.location}. ${product.condition} condition.`,
            "modelDate": product.year,
            "manufacturer": {
                "@type": "Organization",
                "name": product.make
            },
            "brand": {
                "@type": "Brand",
                "name": product.make
            },
            "model": product.model,
            "vehicleEngine": {
                "@type": "EngineSpecification",
                "fuelType": product.fuelType,
                "engineDisplacement": {
                    "@type": "QuantitativeValue",
                    "value": product.engineCapacity,
                    "unitCode": "CMQ"
                }
            },
            "mileageFromOdometer": {
                "@type": "QuantitativeValue",
                "value": product.mileage,
                "unitCode": "KMT"
            },
            "vehicleConfiguration": product.category,
            "vehicleTransmission": product.transmission,
            "driveWheelConfiguration": product.driveSystem,
            "offers": {
                "@type": "Offer",
                "price": product.price,
                "priceCurrency": "KES",
                "availability": "https://schema.org/InStock",
                "seller": {
                    "@type": seller?.accountType === 'dealer' ? 'Organization' : 'Person',
                    "name": seller?.username || "Diksx Cars Seller"
                }
            },
            "image": getImageForSlug(product),
            "url": getShareUrl()
        };
        return baseData;
    };

    // Function to get the most relevant image based on product slug
    const getImageForSlug = (product) => {
        if (!product || !product.images || product.images.length === 0) {
            return defaultVehicle || 'https://www.diksxcars.co.ke/images/default-vehicle.jpg';
        }
        // Clean the slug for comparison
        const cleanSlug = product.slug?.toLowerCase().trim();
        // First try: Find an image that includes the slug in its filename or path
        const slugMatchedImage = product.images.find(img => {
            const imgUrl = typeof img === 'string' ? img : (img.image_url || '');
            return imgUrl.toLowerCase().includes(cleanSlug);
        });
        if (slugMatchedImage) {
            return typeof slugMatchedImage === 'string'
                ? slugMatchedImage
                : (slugMatchedImage.image_url || slugMatchedImage);
        }
        // Second try: Find an image with make/model in the filename (from slug)
        if (cleanSlug) {
            const slugParts = cleanSlug.split('-');
            const makeModelPattern = slugParts.slice(0, 2).join('|'); // Use first 2 parts (likely make and model)
            const makeModelMatchedImage = product.images.find(img => {
                const imgUrl = typeof img === 'string' ? img : (img.image_url || '');
                return slugParts.some(part => imgUrl.toLowerCase().includes(part));
            });
            if (makeModelMatchedImage) {
                return typeof makeModelMatchedImage === 'string'
                    ? makeModelMatchedImage
                    : (makeModelMatchedImage.image_url || makeModelMatchedImage);
            }
        }
        // Fallback: Use main image (first one)
        return typeof product.images[0] === 'string'
            ? product.images[0]
            : (product.images[0].image_url || product.images[0]);
    };
    const LoadingSpinner = () => (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#3DC2EC]"></div>
        </div>
    );
    useEffect(() => {
        // Scroll to top when navigating to a new vehicle page
        window.scrollTo({ top: 0, behavior: 'instant' });
        setProduct(null);
        setSeller(null);
        setError(null);
        setIsLoading(true);
        setKycStatus(null);
        const foundProduct = products.find((p) => p.slug === String(productId));
        if (foundProduct) {
            setProduct(foundProduct);
        } else {
            // Add loading delay before showing error
            const timer = setTimeout(() => {
                setError(new Error('Product not found'));
                setIsLoading(false);
            }, 5000);
            // Cleanup function to prevent memory leaks
            return () => clearTimeout(timer);
        }
    }, [productId, products]);

    useEffect(() => {
        if (product) {
            // Only attempt to find seller if not still loading sellers data
            if (!sellersLoading) {
                const foundSeller = sellers.find((s) => s.userId === Number(product.sellerId));
                if (foundSeller) {
                    setSeller(foundSeller);
                    // Fetch seller's KYC status once we have the seller
                    fetchSellerKycStatus(foundSeller.userId);
                } else {
                    console.warn(`Seller not found for product ID: ${product.sellerId}, sellers array length: ${sellers.length}`);
                    // Don't set error immediately, just log a warning
                    // This allows the page to display with available product info
                }
            }
            setIsLoading(false);
            // Track view after product is loaded - separate from seller loading state
            const trackProductView = async () => {
                try {
                    const response = await axios.post(`/api/publicproducts/${product.slug}/track-view`);
                    console.log(`View tracked for ${product.slug}`);
                    // Set the view count if it's returned by the API
                    if (response?.data?.views) {
                        setViewCount(response.data.views);
                    } else if (product.views) {
                        setViewCount(product.views);
                    }
                } catch (error) {
                    console.error("Failed to track product view:", error);
                    // Fallback to product views if API call fails
                    if (product.views) {
                        setViewCount(product.views);
                    } else {
                        // If no views data available, default to 1 (current view)
                        setViewCount(1);
                    }
                }
            };
            // Always track view when product is loaded, regardless of seller loading state
            if (product.slug && !viewTracked.current) {
                trackProductView();
                viewTracked.current = true;
            }
        }
    }, [product, sellers, sellersLoading]);
    // Add function to use native mobile share if available
    const handleNativeShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `${product.year} ${product.location} ${product.condition} ${product.make} ${product.category} ${product.model} - Diksx Cars`,
                text: getShareMessage(),
                url: getShareUrl(),
            })
                .then(() => console.log('Successful share'))
                .catch((error) => console.log('Error sharing:', error));
        }
    };
    // Check if native sharing is available
    const [canUseNativeShare, setCanUseNativeShare] = useState(false);
    useEffect(() => {
        // Check if the Web Share API is available
        setCanUseNativeShare(!!navigator.share);
    }, []);
    // Function to copy the link to clipboard
    const copyLinkToClipboard = () => {
        const url = getShareUrl();
        navigator.clipboard.writeText(url)
            .then(() => {
                setShowCopiedMessage(true);
                setTimeout(() => setShowCopiedMessage(false), 2000);
            })
            .catch(err => console.error('Error copying link: ', err));
    };
    const headingText = buildHeadingText(product);
    if (isLoading) return (
        <Layout>
            <LoadingSpinner />
        </Layout>
    );
    if (error) return (
        <Layout>
            <div className="container mx-auto px-4 py-20">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <div className="flex items-center">
                        <span className="material-symbols-outlined text-red-500 mr-2">error</span>
                        <p className="text-red-700">{error.message}</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
    return (
        <Layout>
            {/* Breadcrumb structured data */}
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://diksxcars.co.ke' },
                { name: 'Vehicles', url: 'https://www.diksxcars.co.ke/vehicles' },
                { name: `${product.make} ${product.model}`, url: `https://www.diksxcars.co.ke/vehicle/${product.slug}` }
            ]} />
            {/* The Helmet component is now redundant as we're handling structured data through SeoProvider */}
            <div className="mx-auto px-2 sm:px-4 py-4 sm:py-6">
                <nav className="mb-4 sm:mb-6">
                    <Link
                        to="/vehicles"
                        className="inline-flex items-center text-[#3DC2EC] hover:text-[#2BA1C9] font-medium transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Vehicles
                    </Link>
                </nav>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
                    <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4">
                            <div className="space-y-3 sm:space-y-4">
                                <div className="relative">
                                    <Carousel
                                        showStatus={false}
                                        showThumbs={false}
                                        infiniteLoop={true}
                                        useKeyboardArrows={true}
                                        autoPlay={true}
                                        interval={3500}
                                        renderArrowPrev={(onClickHandler, hasPrev, labelPrev) =>
                                            hasPrev && (
                                                <button
                                                    type="button"
                                                    onClick={onClickHandler}
                                                    title={labelPrev}
                                                    className="absolute z-10 left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-3 text-white transition-all duration-200"
                                                >
                                                    <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                                                </button>
                                            )
                                        }
                                        renderArrowNext={(onClickHandler, hasNext, labelNext) =>
                                            hasNext && (
                                                <button
                                                    type="button"
                                                    onClick={onClickHandler}
                                                    title={labelNext}
                                                    className="absolute z-10 right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-3 text-white transition-all duration-200"
                                                >
                                                    <FontAwesomeIcon icon={faArrowRight} size="lg" />
                                                </button>
                                            )
                                        }
                                    >
                                        {product.images.map((img, index) => (
                                            <div key={index} className="pb-[75%] relative">
                                                <img
                                                    title={`View details of ${product?.name || 'Product'}`}
                                                    src={img.image_url || img}
                                                    alt={`${product.year} ${product.make} ${product.model} - ${index === 0 ? 'Main Image' : `View ${index + 1}`}`}
                                                    width="800"
                                                    height="600"
                                                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                                    loading="eager"
                                                />
                                            </div>
                                        ))}
                                    </Carousel>
                                    {/* View counter as fixed overlay */}
                                    <div className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/70 text-white px-3 py-1.5 rounded-full text-sm flex items-center z-20 shadow-md transition-all duration-200">
                                        <span className="material-symbols-outlined mr-1.5 text-sm">visibility</span>
                                        <span>{viewCount} views</span>
                                    </div>
                                </div>
                                <div className="flex justify-start sm:justify-center items-center gap-2 overflow-x-auto py-2 px-2 sm:px-4 no-scrollbar">
                                    {product.images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                document.querySelector('.carousel').children[0].children[index].click();
                                            }}
                                            className="flex-shrink-0 w-16 sm:w-20 h-16 sm:h-20 rounded-lg overflow-hidden border-2 hover:border-[#3DC2EC] transition-all duration-200 focus:outline-none"
                                        >
                                            <img
                                                title={`View details of ${product?.name || 'Product'}`}
                                                src={img.image_url || img}
                                                alt={`${product.year} ${product.make} ${product.model} - Thumbnail ${index + 1}`}
                                                width="160"
                                                height="120"
                                                className="w-[160px] h-[120px] object-cover"
                                                loading="eager"
                                            />
                                        </button>
                                    ))}
                                </div>

                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                        {headingText}
                                    </h1>
                                    <p className="text-base sm:text-sm text-gray-600">Year {product.year}</p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="text-xl sm:text-2xl font-bold text-[#3f3f3f]">
                                        KSH {product?.price ? Number(product.price).toLocaleString() : ""}
                                    </p>
                                    <p className="text-sm text-gray-500">Listed in {product.location}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
                                <SpecItem icon="speed" label="Mileage" value={`${product?.mileage ? Number(product.mileage).toLocaleString() : ""} KM`} />
                                <SpecItem icon="settings" label="Transmission" value={product.transmission} />
                                <SpecItem icon="local_gas_station" label="Fuel Type" value={product.fuelType} />
                                <SpecItem icon="engineering" label="Engine Capacity" value={`${product?.engineCapacity ? Number(product.engineCapacity).toLocaleString() : ""} cc`} />
                                <SpecItem icon="drive_eta" label="Drive" value={product.driveSystem} />
                                <SpecItem icon="verified" label="Condition" value={product.condition} />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Features & Specifications</h2>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                                {product.features}
                            </p>
                        </div>
                    </div>
                    <div className="lg:col-span-5 space-y-4 sm:space-y-6">
                        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-semibold mb-4">Seller Information</h3>
                            {sellersLoading ? (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3DC2EC]"></div>
                                </div>
                            ) : seller ? (
                                <>
                                    <Link
                                        to={`/seller/${seller.username}-${seller.userId}`}
                                        className="group"
                                    >
                                        <div className="flex items-center space-x-4 cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:bg-opacity-30 p-3 rounded-lg">
                                            <img
                                                src={seller?.imageUrl}
                                                alt={seller?.username || 'Seller'}
                                                className="w-16 h-16 rounded-full object-cover border-2 border-[#3DC2EC] group-hover:border-blue-600"
                                                loading="eager"
                                                width="160"
                                                height="120"
                                                title={`View details of ${seller?.username || 'Seller'}`}
                                            />
                                            <div>
                                                <div className="flex items-center">
                                                    <p className="font-semibold text-lg group-hover:text-blue-600">{seller?.username}</p>
                                                    {kycStatus === 'verified' && (
                                                        <span className="material-symbols-outlined text-[#3DC2EC] ml-2" title="KYC Verified Seller">
                                                            verified
                                                        </span>
                                                    )}
                                                    <span className="material-symbols-outlined text-blue-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">navigate_next</span>
                                                </div>
                                                <p className="text-gray-600">
                                                    <span className="inline-flex items-center">
                                                        <span className="material-symbols-outlined mr-1 text-sm">store</span>
                                                        {seller?.accountType}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-blue-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    View all listings
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="mt-6 space-y-3">
                                        {(seller?.hasFinancing?.toLowerCase() === 'yes' || seller?.hasFinancing === true) && (
                                            <SellerFeature icon="payments" text="Financing Available" />
                                        )}
                                        {(seller?.acceptsTradeIn?.toLowerCase() === 'yes' || seller?.acceptsTradeIn === true) && (
                                            <SellerFeature icon="swap_horiz" text="Accepts Trade-in" />
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-gray-600">Seller information is currently unavailable. Please check back later or contact support for assistance.</p>
                                </div>
                            )}
                            {/* Update social sharing section with improved mobile optimization */}
                            <div className="mt-6 mb-4">
                                <p className="text-gray-600 mb-3 text-sm sm:text-base">Share this vehicle:</p>
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* 1. WhatsApp sharing - always visible */}
                                    <WhatsappShareButton
                                        url={getShareUrl()}
                                        title={getWhatsAppStatusMessage()}
                                        className="hover:opacity-80 transition-opacity"
                                    >
                                        <WhatsappIcon size={36} round />
                                    </WhatsappShareButton>
                                    {/* 2. Facebook sharing using react-share component */}
                                    <FacebookShareButton
                                        url={getShareUrl()}
                                        quote={getShareMessage()}
                                        hashtag="#DiksxCars"
                                        className="hover:opacity-80 transition-opacity"
                                    >
                                        <FacebookIcon size={36} round />
                                    </FacebookShareButton>
                                    {/* 3. Native share with friend - conditional */}
                                    {canUseNativeShare && (
                                        <button
                                            onClick={handleNativeShare}
                                            className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 transition-colors"
                                            aria-label="Share using device options"
                                        >
                                            <span className="material-symbols-outlined mr-2">share</span>
                                            <span className="text-sm">Share with friend</span>
                                        </button>
                                    )}
                                    {/* 4. Copy link button - always visible */}
                                    <div className="relative">
                                        <button
                                            onClick={copyLinkToClipboard}
                                            className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full w-10 h-10 sm:w-12 sm:h-12 transition-colors"
                                            aria-label="Copy link to clipboard"
                                        >
                                            <span className="material-symbols-outlined">link</span>
                                        </button>
                                        {/* Success message when link is copied */}
                                        {showCopiedMessage && (
                                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                                                Link copied!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <a
                                href={seller?.contact ? `tel:${seller?.contact}` : 'tel:254757088427'}
                                className="mt-3 w-full bg-[#3DC2EC] text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center hover:bg-[#2BA1C9] transition-colors duration-200"
                            >
                                <span className="material-symbols-outlined mr-2">phone</span>
                                Contact {seller ? 'Seller' : 'Support'}
                            </a>
                        </div>
                        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-semibold mb-4">Simillar Vehicles</h3>
                            <RelatedCars currentCar={product} allCars={products} />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
const SpecItem = ({ icon, label, value }) => (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <span className="material-symbols-outlined text-[#3DC2EC]">{icon}</span>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    </div>
);
const SellerFeature = ({ icon, text }) => (
    <div className="flex items-center space-x-2 text-gray-700">
        <span className="material-symbols-outlined text-[#3DC2EC]">{icon}</span>
        <span>{text}</span>
    </div>
);
export default ItemPage;


