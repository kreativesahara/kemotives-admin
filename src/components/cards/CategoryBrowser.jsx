import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import carCategories from '../../data/carCategories';

// Skeleton loader component
const LoadingSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, idx) => (
      <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
        <div className="p-4 border-b">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-1/3"></div>
        </div>
        <div className="p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 mb-3">
              <div className="w-16 h-12 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
          <div className="h-10 bg-gray-100 rounded w-full mt-4"></div>
        </div>
      </div>
    ))}
  </div>
);

LoadingSkeleton.propTypes = {
  count: PropTypes.number,
};

// Empty state component
const EmptyState = () => (
  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
    <span className="material-symbols-outlined text-gray-400 text-5xl mb-4" aria-hidden="true">directions_car</span>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">No vehicles available</h3>
    <p className="text-gray-600">Check back soon for new inventory</p>
  </div>
);

// Vehicle image component with error handling
const VehicleImage = ({ vehicle, className, size = "normal" }) => {
  const [imageError, setImageError] = React.useState(false);
  const imageUrl = vehicle?.images?.[0]?.image_url || vehicle?.images?.[0];
  const alt = vehicle ? `${vehicle.make} ${vehicle.model}` : 'Vehicle';
  
  const sizes = {
    small: "w-16 h-12",
    normal: "w-full h-full"
  };
  
  if (!imageUrl || imageError) {
    return (
      <div className={`${sizes[size]} flex items-center justify-center bg-gray-100 ${className}`}>
        <span className="material-symbols-outlined text-gray-400" aria-hidden="true">
          {size === "small" ? "directions_car" : "directions_car text-5xl"}
        </span>
      </div>
    );
  }
  
  return (
    <img
      title={`View details of ${alt}`}
      src={imageUrl}
      alt={alt}
      loading="lazy"
      onError={() => setImageError(true)}
      className={`${sizes[size]} object-cover ${className}`}
      width="160"
      height="120"
    />
  );
};

VehicleImage.propTypes = {
  vehicle: PropTypes.object,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'normal'])
};

// Format price helper
const formatPrice = (price) => {
  if (!price) return 'Price on request';
  return `KSH ${Number(price).toLocaleString()}`;
};

// Get properly pluralized category name
const getPluralizedName = (name) => {
  if (!name) return '';
  
  // Special cases for irregular plurals
  if (name === 'SUV') return 'SUVs';
  
  // Handle categories that already end with 's'
  if (name.endsWith('s')) return name;
  
  return `${name}s`;
};

// Category card component
const CategoryCard = ({ name, products }) => {
  const productCount = products.length;
  const title = getPluralizedName(name);
  
  if (productCount === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">No vehicles available</p>
        </div>
        <div className="p-4 text-center text-gray-500">
          No {name.toLowerCase()} vehicles available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {productCount} {productCount === 1 ? 'vehicle' : 'vehicles'} available
        </p>
      </div>

      <div className="p-4">
        {productCount === 1 ? (
          <Link to={`/vehicle/${products[0].slug}`} className="block" aria-label={`View ${products[0].make} ${products[0].model}`}>
            <div className="relative h-48 mb-3 overflow-hidden rounded-lg">
              <VehicleImage 
                vehicle={products[0]} 
                className="hover:scale-105 transition-transform duration-300" 
              />
            </div>
            <h4 className="font-semibold text-gray-900">
              {products[0].make} {products[0].model}
            </h4>
            <p className="text-[#3DC2EC] font-bold">
              {formatPrice(products[0].price)}
            </p>
          </Link>
        ) : (
          <ul className="space-y-3">
            {products.slice(0, 3).map(prod => (
              <li key={prod.id} className="flex items-center space-x-3">
                <div className="w-16 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                  <VehicleImage vehicle={prod} size="small" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/vehicle/${prod.slug}`} 
                    className="hover:text-[#3DC2EC]"
                    aria-label={`View ${prod.make} ${prod.model}`}
                  >
                    <p className="font-medium text-gray-900 truncate">
                      {prod.make} {prod.model}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatPrice(prod.price)}
                    </p>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link
          to={`/vehicles?category=${name}`}
          className="mt-4 inline-block w-full text-center py-2 border border-[#3DC2EC] text-[#3DC2EC] rounded-lg hover:bg-[#3DC2EC] hover:text-white transition-colors duration-200"
          aria-label={`View all ${title}`}
        >
          View All {title}
        </Link>
      </div>
    </div>
  );
};

CategoryCard.propTypes = {
  name: PropTypes.string.isRequired,
  products: PropTypes.array.isRequired,
};

// Dynamic grid columns based on category count
const getGridColumns = (count) => {
  if (count === 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-1 md:grid-cols-2';
  if (count === 3) return 'grid-cols-1 md:grid-cols-3';
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
};

// Main CategoryBrowser component
const CategoryBrowser = ({ categories, isLoading, maxDisplay = 4 }) => {
  // Use a consistent order from carCategories & filter only those with data
  const availableCategories = useMemo(() => {
    const categoriesWithData = Object.entries(categories)
      .filter(([_, products]) => products && products.length > 0)
      .map(([category]) => category);
    
    return carCategories
      .filter(cat => categoriesWithData.includes(cat))
      .slice(0, maxDisplay);
  }, [categories, maxDisplay]);
  
  const gridColumns = useMemo(() => 
    getGridColumns(availableCategories.length), 
    [availableCategories.length]
  );

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Browse by Category</h2>
          <p className="text-gray-600 mt-2">Find the perfect vehicle for your needs</p>
        </div>
        
        {isLoading ? (
          <LoadingSkeleton count={maxDisplay} />
        ) : availableCategories.length === 0 ? (
          <EmptyState />
        ) : (
          <div className={`grid ${gridColumns} gap-6`}>
            {availableCategories.map(cat => (
              <CategoryCard key={cat} name={cat} products={categories[cat] || []} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

CategoryBrowser.propTypes = {
  categories: PropTypes.object.isRequired,
  isLoading: PropTypes.bool,
  maxDisplay: PropTypes.number,
};

// Add display names for React DevTools
CategoryCard.displayName = 'CategoryCard';
LoadingSkeleton.displayName = 'LoadingSkeleton';
EmptyState.displayName = 'EmptyState';
VehicleImage.displayName = 'VehicleImage';

export default React.memo(CategoryBrowser); 