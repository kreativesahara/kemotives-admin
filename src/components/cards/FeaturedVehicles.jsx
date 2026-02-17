import React from 'react';
import { Link } from 'react-router-dom';
import ProductListing from './productListing';

const FeaturedVehicles = ({ products }) => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Vehicles</h2>
        <p className="text-gray-600 mt-2">Discover our top picks for you</p>
      </div>
      
      <ProductListing products={products} />
      
      {products.length > 0 && (
        <div className="mt-8 text-center">
          <Link 
            to="/vehicles" 
            className="inline-block bg-[#3DC2EC] hover:bg-[#2BA1C9] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            View All Vehicles
          </Link>
        </div>
      )}
    </div>
  );
};

export default FeaturedVehicles; 