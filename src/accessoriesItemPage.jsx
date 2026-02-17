import React, { useEffect, useState, useRef, useMemo } from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Layout from './components/Layout';
import defaultProfile from './assets/admin.jpg';
import defaultAccessory from './assets/diksx.png';
import { useParams, Link } from 'react-router-dom';
import { useAccessoriesContext } from './context/AccessoriesProvider';
import { useSellerContext } from './context/SellerProvider';
import { useSeoContext, BreadcrumbSchema } from './context/SeoProvider';
import { Carousel } from 'react-responsive-carousel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import RelatedAccessories from './components/cards/RelatedAccessories';
import axios from './api/axios';
import { WhatsappShareButton, FacebookShareButton, WhatsappIcon, FacebookIcon } from 'react-share';

const AccessoriesItemPage = () => {
    const { accessoryId } = useParams();
    const { accessories } = useAccessoriesContext();
    const { sellers, isLoading: sellersLoading } = useSellerContext();
    const { updateSeo, defaultImage } = useSeoContext();
    const [accessory, setAccessory] = useState(null);
    const [seller, setSeller] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewCount, setViewCount] = useState(0);
    const [showCopiedMessage, setShowCopiedMessage] = useState(false);
    const viewTracked = useRef(false);
    const truncate = (text = '', max = 155) => {
        if (!text) return '';
        return text.length > max ? `${text.substring(0, max - 3)}...` : text;
    };
    const ensureAbsoluteUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://diksxcars.co.ke${url.startsWith('/') ? url : `/${url}`}`;
    };
    const sanitizeDescription = (description) => {
        if (!description || typeof description !== 'string') {
            return 'Quality car accessory available on Diksx Cars marketplace.';
        }
        let cleaned = description
            .replace(/[\x00-\x1F\x7F]/g, '')
            .replace(/\r\n/g, ' ')
            .replace(/\n/g, ' ')
            .replace(/\r/g, ' ')
            .replace(/\t/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        if (cleaned.length > 5000) {
            cleaned = `${cleaned.substring(0, 4997)}...`;
        }
        return cleaned || 'Quality car accessory available on Diksx Cars marketplace.';
    };
    const mapConditionToSchema = (condition) => {
        if (!condition || typeof condition !== 'string') return 'https://schema.org/UsedCondition';
        const normalized = condition.toLowerCase().trim();
        const conditionMap = {
            'new': 'https://schema.org/NewCondition',
            'used': 'https://schema.org/UsedCondition',
            'refurbished': 'https://schema.org/RefurbishedCondition',
            'pre-owned': 'https://schema.org/UsedCondition',
            'preowned': 'https://schema.org/UsedCondition'
        };
        return conditionMap[normalized] || 'https://schema.org/UsedCondition';
    };
    const formatPriceForSchema = (price) => {
        if (price === null || price === undefined) return 0;
        const cleaned = String(price).replace(/[^0-9.]/g, '');
        const numPrice = parseFloat(cleaned);
        return Number.isNaN(numPrice) ? 0 : numPrice;
    };
    const buildAccessoryImages = (accessoryItem) => {
        if (!accessoryItem || !accessoryItem.imageUrls || accessoryItem.imageUrls.length === 0) {
            const fallback = ensureAbsoluteUrl(defaultAccessory) || 'https://www.diksxcars.co.ke/images/default-accessory.jpg';
            return [fallback];
        }
        const images = accessoryItem.imageUrls
            .map((img) => {
                const raw = typeof img === 'string' ? img : (img.image_url || img.image_urls || '');
                return ensureAbsoluteUrl(raw);
            })
            .filter(Boolean);
        if (images.length === 0) {
            const fallback = ensureAbsoluteUrl(defaultAccessory) || 'https://www.diksxcars.co.ke/images/default-accessory.jpg';
            return [fallback];
        }
        return images;
    };
    const getImageForSlug = (accessoryItem) => {
        const images = buildAccessoryImages(accessoryItem);
        if (!accessoryItem || !accessoryItem.slug) {
            return images[0];
        }
        const cleanSlug = accessoryItem.slug?.toLowerCase().trim();
        const slugMatched = images.find((url) => url.toLowerCase().includes(cleanSlug));
        if (slugMatched) return slugMatched;
        if (cleanSlug) {
            const slugParts = cleanSlug.split('-');
            const nameMatched = images.find((url) => slugParts.some((part) => url.toLowerCase().includes(part)));
            if (nameMatched) return nameMatched;
        }
        return images[0];
    };
    const buildHeadingText = (item) => {
        if (!item) return 'Accessory | Diksx Cars';
        const base = `${item.name || 'Accessory'} ${item.category || ''} in ${item.location || 'Kenya'}`.replace(/\s+/g, ' ').trim();
        if (base.length > 70) return `${base.slice(0, 67)}...`;
        if (base.length < 20) {
            const extended = `${base} | Diksx Cars`;
            return extended.length > 70 ? `${extended.slice(0, 67)}...` : extended;
        }
        return base;
    };
    const seoData = useMemo(() => {
        if (!accessory) return null;
        const name = accessory.name || 'Accessory';
        const brand = accessory.name || 'Diksx Cars';
        const category = accessory.category || '';
        const location = accessory.location || 'Kenya';
        const condition = accessory.condition || '';
        const mainImage = getImageForSlug(accessory) || ensureAbsoluteUrl(defaultImage) || ensureAbsoluteUrl(defaultAccessory);
        const images = buildAccessoryImages(accessory);
        const canonical = `https://www.diksxcars.co.ke/accessory/${accessory.slug}`;
        const metaTitle = truncate(` ${name} ${condition} ${category} in ${location} | Diksx Cars`, 65) || 'Accessory listing | Diksx Cars';
        const metaDescription = truncate(
            `${name} ${category} in ${location}. ${truncate(accessory.description, 140)} Buy or sell on Diksx Cars.`,
            160
        ) || 'Discover car accessories on Diksx Cars.';
        const sellerName = seller?.username || 'Diksx Cars Seller';
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": `${name}${category ? ` ${category}` : ''}`.trim(),
            "description": sanitizeDescription(accessory.description),
            "image": images.length === 1 ? images[0] : images,
            "url": canonical,
            "condition": mapConditionToSchema(condition),
            "brand": {
                "@type": "Brand",
                "name": brand || 'Diksx Cars'
            },
            "offers": {
                "@type": "Offer",
                "price": formatPriceForSchema(accessory.price),
                "priceCurrency": "KES",
                "availability": (Number(accessory.stock) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'),
                "seller": {
                    "@type": seller?.accountType === 'dealer' ? 'Organization' : 'Person',
                    "name": sellerName
                }
            }
        };
        const rawAdditional = [
            { name: 'product:availability', content: Number(accessory.stock) > 0 ? 'in_stock' : 'out_of_stock' },
            { name: 'product:price:amount', content: accessory.price },
            { name: 'product:price:currency', content: 'KES' },
            { name: 'product:brand', content: brand },
            { name: 'product:condition', content: condition },
            { property: 'og:title', content: metaTitle },
            { property: 'og:description', content: metaDescription },
            { property: 'og:image', content: mainImage },
            { property: 'og:url', content: canonical },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: metaTitle },
            { name: 'twitter:description', content: metaDescription },
            { name: 'twitter:image', content: mainImage }
        ];
        const additionalMetaTags = [
            { name: 'robots', content: 'index, follow' },
        ];
        const seenKeys = new Set();
        rawAdditional.forEach((tag) => {
            const key = tag.name || tag.property;
            if (!key || seenKeys.has(key)) return;
            seenKeys.add(key);
            additionalMetaTags.push(tag);
        });
        return {
            metaTitle,
            metaDescription,
            canonical,
            mainImage,
            structuredData,
            additionalMetaTags,
            noindex: Number(accessory.stock) === 0
        };
    }, [accessory, seller, defaultImage]);
    useEffect(() => {
        if (!seoData) return;
        updateSeo({
            title: seoData.metaTitle,
            description: seoData.metaDescription,
            canonical: seoData.canonical,
            image: seoData.mainImage,
            type: 'product',
            noindex: seoData.noindex,
            structuredData: seoData.structuredData,
            additionalMetaTags: seoData.additionalMetaTags
        });
    }, [seoData, updateSeo]);
    // New function to generate WhatsApp Status optimized message
    const getWhatsAppStatusMessage = () => {
        if (!accessory) return '';
        // Function to truncate description intelligently
        const truncateDescription = (description, maxLength = 80) => {
            if (!description) return '';
            if (description.length <= maxLength) {
                return description;
            }
            return description.substring(0, maxLength - 3) + '...';
        };
        // Truncate description
        const descriptionText = truncateDescription(accessory.description);
        // Base message templates
        const fullTemplate = `🔧 *${accessory.name}*  
        *${accessory.condition}* ${accessory.category} in *${accessory.location}*

        💰 *Price:* KSH *${Number(accessory.price).toLocaleString()}*  
        📦 *Stock:* ${accessory.stock} available
        📝 *Description:* ${descriptionText}

        👉 *More details online.*
        Only on *Diksx Cars* — *Kenya's smart car marketplace*!`;

        const shortTemplate = `🔧 *${accessory.name}*  
        *${accessory.condition}* ${accessory.category} in *${accessory.location}*

        💰 KSH *${Number(accessory.price).toLocaleString()}*  
        📦 *${accessory.stock}* available

        👉 *More details online.*
        *Diksx Cars* — *Buy or sell smart!*`;
        // Choose template based on length, prioritizing information
        const message = fullTemplate.length <= 500 ? fullTemplate : shortTemplate;
        // Final length check and truncation
        return message.length > 500
            ? message.substring(0, 497) + '...'
            : message;
    };
    // Existing getShareMessage function remains unchanged
    const getShareMessage = () => {
        if (!accessory) return '';
        return `Looking for car accessories? Check out this ${accessory.name} — a ${accessory.condition} ${accessory.category} currently available in ${accessory.location}.
        \n💰 Price: KSH ${Number(accessory.price).toLocaleString()}\n📦 Stock: ${accessory.stock} available\n📝 Description: ${accessory.description ? accessory.description.substring(0, 100) + '...' : 'Quality accessory'}\n\n👉 Tap to explore more or list your own accessories today — fast, easy, and free!`;
    };
    // New function to get the full share URL
    const getShareUrl = () => {
        if (!accessory) return 'https://www.diksxcars.co.ke/accessories';
        if (!accessory.slug) return 'https://www.diksxcars.co.ke/accessories';
        return `https://www.diksxcars.co.ke/accessory/${accessory.slug}`;
    };
    const displayImages = useMemo(() => buildAccessoryImages(accessory), [accessory]);
    const LoadingSpinner = () => (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#3DC2EC]"></div>
        </div>
    );
    useEffect(() => {
        // Scroll to top when navigating to a new accessory page
        window.scrollTo({ top: 0, behavior: 'instant' });
        setAccessory(null);
        setSeller(null);
        setError(null);
        setIsLoading(true);
        // setKycStatus(null);

        const foundProduct = accessories.find((a) => a.slug === String(accessoryId));

        if (foundProduct) {
            setAccessory(foundProduct);
        } else {
            // Add loading delay before showing error
            const timer = setTimeout(() => {
                setError(new Error('Accessory not found'));
                setIsLoading(false);
            }, 5000);
            // Cleanup function to prevent memory leaks
            return () => clearTimeout(timer);
        }
    }, [accessoryId, accessories]);
    useEffect(() => {
        if (accessory) {
            // Only attempt to find seller if not still loading sellers data
            if (!sellersLoading) {
                const foundSeller = sellers.find((s) => s.userId === Number(accessory.userId));
                if (foundSeller) {
                    setSeller(foundSeller);
                    // Remove KYC status fetching
                } else {
                    console.warn(`Seller not found for product ID: ${accessory.userId}, sellers array length: ${sellers.length}`);
                    // Don't set error immediately, just log a warning
                    // This allows the page to display with available product info
                }
            }
            setIsLoading(false);
            // Track view after product is loaded - separate from seller loading state
            const trackProductView = async () => {
                try {
                    const response = await axios.post(`/api/accessories/${accessory.slug}/track-view`);
                    // Set the view count if it's returned by the API
                    if (response?.data?.views) {
                        setViewCount(response.data.views);
                    } else if (accessory.views) {
                        setViewCount(accessory.views);
                    }
                } catch (error) {
                    console.error("Failed to track product view:", error);
                    // Fallback to product views if API call fails
                    if (accessory.views) {
                        setViewCount(accessory.views);
                    } else {
                        // If no views data available, default to 1 (current view)
                        setViewCount(1);
                    }
                }
            };
            // Always track view when product is loaded, regardless of seller loading state
            if (accessory.slug && !viewTracked.current) {
                trackProductView();
                viewTracked.current = true;
            }
        }
    }, [accessory, sellers, sellersLoading]);
    // Add function to use native mobile share if available
    const handleNativeShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `${accessory.name} ${accessory.category} - Diksx Cars`,
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
            {/* Breadcrumb structured data - Google BreadcrumbList Rich Results compliant */}
            {accessory && accessory.slug && (
                <BreadcrumbSchema items={[
                    { name: 'Home', url: 'https://www.diksxcars.co.ke/' },
                    { name: 'Accessories', url: 'https://www.diksxcars.co.ke/accessories' },
                    { name: accessory.name, url: `https://www.diksxcars.co.ke/accessory/${accessory.slug}` }
                ]} />
            )}
            <div className="mx-auto px-2 sm:px-4 py-4 sm:py-6">
                <nav className="mb-4 sm:mb-6">
                    <Link
                        to="/accessories"
                        className="inline-flex items-center text-[#3DC2EC] hover:text-[#2BA1C9] font-medium transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Accessories
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
                                                    title={`Previous slide: ${labelPrev}`}
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
                                                    title={`Next slide: ${labelNext}`}
                                                    className="absolute z-10 right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-3 text-white transition-all duration-200"
                                                >
                                                    <FontAwesomeIcon icon={faArrowRight} size="lg" />
                                                </button>
                                            )
                                        }
                                    >
                                        {displayImages.map((imgUrl, index) => (
                                            <div key={index} className="pb-[75%] relative">
                                                <img
                                                    title={`View details of ${accessory?.name || 'Accessory'}`}
                                                    src={imgUrl}
                                                    alt={`${accessory?.condition || ''} ${accessory?.name || 'Accessory'} - ${accessory?.category || ''} - Diksx Cars`.trim()}
                                                    width="800"
                                                    height="600"
                                                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                                    loading={index === 0 ? 'eager' : 'lazy'}
                                                />
                                            </div>
                                        ))}
                                    </Carousel>
                                    <div className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/70 text-white px-3 py-1.5 rounded-full text-sm flex items-center z-20 shadow-md transition-all duration-200">
                                        <span className="material-symbols-outlined mr-1.5 text-sm">visibility</span>
                                        <span>{viewCount} views</span>
                                    </div>
                                </div>
                                <div className="flex justify-start sm:justify-center items-center gap-2 overflow-x-auto py-2 px-2 sm:px-4 no-scrollbar">
                                    {displayImages.map((imgUrl, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                document.querySelector('.carousel').children[0].children[index].click();
                                            }}
                                            className="flex-shrink-0 w-16 sm:w-20 h-16 sm:h-20 rounded-lg overflow-hidden border-2 hover:border-[#3DC2EC] transition-all duration-200 focus:outline-none"
                                        >
                                            <img
                                                title={`View details of ${accessory?.name || 'Accessory'}`}
                                                src={imgUrl}
                                                alt={`${accessory?.condition || ''} ${accessory?.name || 'Accessory'} - ${accessory?.category || ''} - Diksx Cars`.trim()}
                                                width="160"
                                                height="120"
                                                className="w-full h-full object-cover"
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
                                        {buildHeadingText(accessory)}
                                    </h1>
                                    <p className="text-base sm:text-sm text-gray-600">Stock: {accessory.stock}</p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="text-xl sm:text-2xl font-bold text-[#3f3f3f]">
                                        KSH {accessory?.price ? Number(accessory.price).toLocaleString() : ""}
                                    </p>
                                    <p className="text-sm text-gray-500">Listed in {accessory.location}</p>
                                </div>
                            </div>
                            <div className="flex flex-row  justify-between mt-4 sm:mt-6">
                                <SpecItem icon="verified" label="Condition" value={accessory.condition} />
                                <SpecItem icon="category" label="Category" value={accessory.category} />
                            </div>
                        </div>
                        {accessory.description && (
                            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Description</h2>
                                <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                                    {accessory.description}
                                </p>
                            </div>
                        )}
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
                                                title={`View details of ${seller?.username || 'Seller'}`}
                                                src={seller?.imageUrl}
                                                alt={seller?.username || 'Seller'}
                                                className="w-16 h-16 rounded-full object-cover border-2 border-[#3DC2EC] group-hover:border-blue-600"
                                                loading="eager"
                                                width="160"
                                                height="120"
                                            />
                                            <div>
                                                <div className="flex items-center">
                                                    <p className="font-semibold text-lg group-hover:text-blue-600">{seller?.username}</p>
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
                                <p className="text-gray-600 mb-3 text-sm sm:text-base">Share this accessory:</p>
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
                            <h3 className="text-lg sm:text-xl font-semibold mb-4">Similar Accessories</h3>
                            <RelatedAccessories
                                currentAccessory={accessory}
                                allAccessories={accessories}
                            />
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

export default AccessoriesItemPage;


