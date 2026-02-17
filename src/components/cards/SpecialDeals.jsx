import React from 'react';
import { Link } from 'react-router-dom';

const SpecialDeals = ({ deals, isLoading }) => {
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Special Deals</h2>
          <p className="text-gray-600 mt-2">Limited time offers you shouldn't miss</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse h-64">
              <div className="h-40 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!deals || deals.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Special Deals</h2>
          <p className="text-gray-600 mt-2">Limited time offers you shouldn't miss</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:shadow-lg hover:-translate-y-1">
              <Link to={`/vehicle/${product.slug}`}>
                <div className="relative h-48">
                  {product?.images?.length > 0 ? (
                    <img
                      title={`View details of ${product?.make} ${product?.model}`}
                      src={product.images[0]?.image_url || product.images[0]}
                      alt={`${product.make} ${product.model}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width="300"
                      height="200"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-400 text-5xl">directions_car</span>
                    </div>
                  )}
                  
                  <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg font-semibold text-sm">
                    Deal
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900">{product.make} {product.model}</h3>
                  <div className="flex items-center mt-1">
                    <p className="text-[#3DC2EC] font-bold">KSH {Number(product.price).toLocaleString()}</p>
                    {product.originalPrice && (
                      <p className="ml-2 text-sm text-gray-500 line-through">
                        KSH {Number(product.originalPrice).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{product.year} • {product.mileage} km</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecialDeals; 