import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import AccessoriesListing from './accessoriesListing';

/**
 * FeaturedAccessories component
 * Displays accessories sorted by views, alternating between highest-to-lowest 
 * and lowest-to-highest every 36 hours
 */
const FeaturedAccessories = ({ limit = 8 }) => {
  const [accessories, setAccessories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for highest first, 'asc' for lowest first

  // Calculate sort order based on 36-hour intervals
  useEffect(() => {
    const getSortOrder = () => {
      const STORAGE_KEY = 'accessories_sort_timestamp';
      const INTERVAL_HOURS = 36;
      const INTERVAL_MS = INTERVAL_HOURS * 60 * 60 * 1000; // 36 hours in milliseconds

      const now = Date.now();
      const stored = localStorage.getItem(STORAGE_KEY);
      
      if (stored) {
        const lastTimestamp = parseInt(stored, 10);
        const timeSinceLastChange = now - lastTimestamp;
        
        // If 36 hours have passed, alternate the sort order
        if (timeSinceLastChange >= INTERVAL_MS) {
          const lastOrder = localStorage.getItem('accessories_sort_order') || 'desc';
          const newOrder = lastOrder === 'desc' ? 'asc' : 'desc';
          
          localStorage.setItem(STORAGE_KEY, now.toString());
          localStorage.setItem('accessories_sort_order', newOrder);
          return newOrder;
        }
        
        // Return the stored order if interval hasn't passed
        return localStorage.getItem('accessories_sort_order') || 'desc';
      } else {
        // First time - start with descending (highest views first)
        localStorage.setItem(STORAGE_KEY, now.toString());
        localStorage.setItem('accessories_sort_order', 'desc');
        return 'desc';
      }
    };

    setSortOrder(getSortOrder());
  }, []);

  // Fetch accessories and sort by views
  useEffect(() => {
    const fetchAccessories = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/accessories', {
          params: {
            limit: 100, // Fetch more to sort and limit on frontend
          }
        });

        let fetchedAccessories = response.data || [];
        
        // Filter only active accessories with valid data
        fetchedAccessories = fetchedAccessories.filter(
          accessory => 
            accessory.isActive === 'true' && 
            accessory.status === 'active' &&
            accessory.name && // Ensure name exists
            accessory.slug // Ensure slug exists
        );

        // Sort by views based on current sort order
        fetchedAccessories.sort((a, b) => {
          const viewsA = Number(a.views || 0);
          const viewsB = Number(b.views || 0);
          
          if (sortOrder === 'desc') {
            return viewsB - viewsA; // Highest to lowest
          } else {
            return viewsA - viewsB; // Lowest to highest
          }
        });

        // Limit to specified number
        setAccessories(fetchedAccessories.slice(0, limit));
      } catch (error) {
        console.error('Error fetching featured accessories:', error);
        setAccessories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccessories();
  }, [limit, sortOrder]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Featured Accessories
          </h2>
          <p className="text-gray-600 mt-2">
            {sortOrder === 'desc' 
              ? 'Most viewed accessories' 
              : 'Discover hidden gems'}
          </p>
        </div>
        {accessories.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="material-symbols-outlined text-base">
              {sortOrder === 'desc' ? 'trending_up' : 'explore'}
            </span>
            <span>
              {sortOrder === 'desc' 
                ? 'Sorted by popularity' 
                : 'Sorted by least viewed'}
            </span>
          </div>
        )}
      </div>
      
      <AccessoriesListing 
        accessories={accessories} 
        isLoading={isLoading}
        sortBy="views"
      />
      
      {accessories.length > 0 && (
        <div className="mt-8 text-center">
          <Link 
            to="/accessories" 
            className="inline-block bg-[#3DC2EC] hover:bg-[#2BA1C9] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            View All Accessories
          </Link>
        </div>
      )}

      {!isLoading && accessories.length === 0 && (
        <div className="w-full text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-600">No accessories available at the moment</p>
          <p className="text-sm text-gray-500 mt-2">Check back later for new listings</p>
        </div>
      )}
    </div>
  );
};

export default FeaturedAccessories;

