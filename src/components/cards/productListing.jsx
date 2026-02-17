import { Link } from "react-router-dom";
import { memo } from "react";

const LoadingSpinner = () => (
    <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#3DC2EC]"></div>
    </div>
);

const SkeletonCard = () => (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden max-w-xs mx-auto w-full animate-pulse">
        <div className="aspect-[16/9] bg-gray-200"></div>
        <div className="p-3">
            <div className="mb-2">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
            </div>
        </div>
    </div>
);

const CarPlaceholder = ({ make, model }) => (
    <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
        <svg 
            viewBox="0 0 24 24" 
            className="w-16 h-16 text-gray-400 mb-2"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M21.739 10.921A18.281 18.281 0 0118.187 10c0 0-2.379-2.359-2.832-2.816-.452-.457-2.586-.992-2.586-.992s-4.088-.445-6.292-.099c-.405.077-1.815.932-2.26 1.42-.445.488-.853.938-1.145 1.244-.291.306-.517.558-.742.809-.225.251-.38.421-.38.421s-.133.145-.322.345C1.439 10.533 1 11.321 1 11.321s.025.077.045.132c.02.055.089.relatively.089.relatively s.019.048.05.144c.032.096.135.297.135.297s.089.199.089.199c.114.251.373.523.961.523.588 0 1.095-.342 1.095-.342s.581.207 1.339.207c.758 0 1.164-.207 1.164-.207s.861.228 1.87.228 1.865-.228 1.865-.228.603.238 1.688.238c1.085 0 1.674-.238 1.674-.238s.861.238 1.87.238 1.865-.228 1.865-.228.603.238 1.688.238c1.085 0 1.674-.238 1.674-.238s.861.238 1.87.238 1.865-.228 1.865-.228"/>
        </svg>
        <span className="text-sm text-gray-500 text-center px-2">
            {make} 
            {model}
        </span>
    </div>
);

const ProductListing = memo(({ products, isLoading, sortBy = 'createdAt' }) => {
    if (isLoading) {
        return (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 px-2 sm:px-4 mx-auto max-w-7xl">
                {[...Array(8)].map((_, index) => (
                    <SkeletonCard key={index} />
                ))}
            </section>
        );
    }

    // Filter out any inactive products that might have slipped through
    let activeProducts = products?.filter(product => product.isActive === "true") || [];
    
    // Sort products based on the specified criteria
    if (sortBy === 'createdAt') {
        activeProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'id') {
        activeProducts.sort((a, b) => b.id - a.id);
    }
    
    if (!activeProducts?.length) {
        return (
            <div className="w-full text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-lg text-gray-600">No vehicles available at the moment</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or check back later</p>
            </div>
        );
    }
    
    const formatPrice = (price) => {
        if (!price) return "Price on request";
        return `KSH ${Number(price).toLocaleString()}`;
    };
    
    return (
        <section 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 px-2 sm:px-4 mx-auto max-w-7xl" 
            aria-labelledby="product-listing"
        >
            <h2 id="product-listing" className="sr-only">Available Vehicles</h2>

            {activeProducts.map((product) => (
                <article 
                    key={product.id} 
                    className="bg-white border rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden max-w-xs mx-auto w-full"
                >
                    <Link
                        to={`/vehicle/${product.slug}`}
                        className="block h-full"
                        title={`View details of ${product.make} ${product.model}`}
                        aria-label={`${product.year} ${product.make} ${product.model} - ${product.condition} - Available in ${product.location}`}
                    >
                        <div className="relative">
                            <figure className="aspect-[16/9] overflow-hidden">
                                {product?.images?.length > 0 ? (
                                    <img
                                        title={`View details of ${product.make} ${product.model}`}
                                        src={product.images[0]?.image_url || product.images[0]}
                                        srcSet={`${product.images[0]?.image_url || product.images[0]} 300w,
                                                ${product.images[0]?.image_url || product.images[0]} 600w,
                                                ${product.images[0]?.image_url || product.images[0]} 900w`}
                                        sizes="(max-width: 768px) 100vw,
                                               (max-width: 1200px) 50vw,
                                               33vw"
                                        alt={`${product.make} ${product.model}`}
                                        loading="lazy"
                                        width="300"
                                        height="200"
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                        decoding="async"
                                    />
                                ) : (
                                    <CarPlaceholder make={product.make} model={product.model} />
                                )}
                            </figure>
                            <div className="absolute top-3 right-3">
                                <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                                    {product.year}
                                </span>
                            </div>
                        </div>

                        <div className="p-3">
                            <div className="mb-2">
                                <h3 className="font-semibold text-gray-900 truncate">
                                    {product.make} {product.model}
                                </h3>
                                <p className="text-[#3DC2EC] font-bold mt-1 truncate">
                                    {formatPrice(product.price)}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                   Mileage: {product.mileage} km
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-600">
                                <div className="flex items-center gap-1 truncate">
                                    <span className="material-symbols-outlined text-sm flex-shrink-0">
                                        verified
                                    </span>
                                    <span className="truncate">{product.condition}</span>
                                </div>
                                <div className="flex items-center gap-1 truncate">
                                    <span className="material-symbols-outlined text-sm flex-shrink-0">
                                        location_on
                                    </span>
                                    <span className="truncate">{product.location}</span>
                                </div>
                                <div className="flex items-center gap-1 truncate">
                                    <span className="material-symbols-outlined text-sm flex-shrink-0">
                                        settings
                                    </span>
                                    <span className="truncate">{product.transmission || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-1 truncate">
                                    <span className="material-symbols-outlined text-sm flex-shrink-0">
                                        local_gas_station
                                    </span>
                                    <span className="truncate">{product.fuelType || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </article>
            ))}
        </section>
    );
});

ProductListing.displayName = 'ProductListing';

export default ProductListing;
