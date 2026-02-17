import React from 'react';
import { Link } from 'react-router-dom';

const PopularBrands = ({ brands }) => {
  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-12 border-t border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Popular Brands</h2>
          <p className="text-gray-600 mt-2">Browse vehicles from top manufacturers</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
          {brands.map(make => (
            <Link 
              key={make.name}
              to={`/vehicles?make=${make.slug}`} 
              className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl font-bold text-gray-500">{make.name.charAt(0)}</span>
              </div>
              <span className="font-medium text-gray-800 text-center">{make.name}</span>
              <span className="text-xs text-gray-500">{make.count} {make.count === 1 ? 'vehicle' : 'vehicles'}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularBrands; 