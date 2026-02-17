import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import axios from '../../api/axios';
import ProductListing from './productListing';

// Loader skeleton component
const LatestCarsLoader = () => (
  <div className="container mx-auto py-12 px-4">
    <h2 className="text-3xl font-black mb-6 text-center text-gray-800">Great Deals</h2>
    <div className="flex justify-center">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-slate-200 h-10 w-10"></div>
        <div className="flex-1 space-y-6 py-1">
          <div className="h-2 bg-slate-200 rounded"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-slate-200 rounded col-span-2"></div>
              <div className="h-2 bg-slate-200 rounded col-span-1"></div>
            </div>
            <div className="h-2 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main LatestCars component
const LatestCars = ({ limit = 100, displayCount = 10, margin = 100000 }) => {
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchCars = async () => {
      setIsLoading(true);
      setError(null); // Reset error on new fetch
      try {
        const { data } = await axios.get('/api/publicproducts', {
          params: { 
            limit, 
            sortBy: 'createdAt', 
            order: 'desc' 
          }
        });
        if (!cancelled) setCars(data);
      } catch (err) {
        console.error('Error fetching Great Affordable Rides:', err);
        if (!cancelled) setError('Failed to load cars.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchCars();
    return () => { cancelled = true; };
  }, [limit]);

  // Compute average price using only valid, positive numeric prices
  const averagePrice = useMemo(() => {
    const pricedCars = cars.filter(c => {
      const priceNum = Number(c.price);
      return !isNaN(priceNum) && priceNum > 0;
    });

    if (pricedCars.length === 0) return 0;

    const total = pricedCars.reduce((sum, c) => sum + Number(c.price), 0);
    return total / pricedCars.length;
  }, [cars]);

  // Filter by price range (using valid prices) and limit display
  const filteredCars = useMemo(() => {
    // Don't filter if average couldn't be calculated meaningfully
    if (averagePrice <= 0) return []; 

    return cars
      .filter(c => {
          const priceNum = Number(c.price);
          // Ensure the car has a valid positive price AND it's within the margin
          return !isNaN(priceNum) && priceNum > 0 && Math.abs(priceNum - averagePrice) <= margin;
      })
      .slice(0, displayCount);
  }, [cars, averagePrice, margin, displayCount]);

  if (isLoading) return <LatestCarsLoader />;
  if (error) return (
    <div className="container mx-auto py-12 px-4 text-center text-red-500">{error}</div>
  );

  return (
    <div className="container mx-auto py-12 px-4">
      <h2 className="text-3xl font-black mb-6 text-center text-gray-800">Great Affordable Rides</h2>

      {/* Show message only if filtering was attempted (averagePrice > 0) */}
      {averagePrice > 0 && filteredCars.length === 0 && (
         <p className="text-center text-gray-600 mb-8">
           No vehicles found within ±{margin.toLocaleString()} of the average price KSH {averagePrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
         </p>
      )}

      {/* Show listing if cars are found */}
      {filteredCars.length > 0 && (
        <>
          <p className="text-center text-gray-600 mb-8">
            Showing vehicles priced around the average of KSH {averagePrice.toLocaleString(undefined, { maximumFractionDigits: 0 })} (±{margin.toLocaleString()})
          </p>
          <ProductListing products={filteredCars} />
        </>
      )}

      {/* Show a generic message if loading finished but no cars had valid prices to begin with */}
      {!isLoading && !error && averagePrice <= 0 && cars.length > 0 && (
        <p className="text-center text-gray-600">Could not determine average price from available cars.</p>
      )}
      
      {/* Show message if API returned no cars at all */}
      {!isLoading && !error && cars.length === 0 && (
        <p className="text-center text-gray-600">No recent cars available.</p>
      )}
    </div>
  );
};

LatestCars.propTypes = {
  limit: PropTypes.number,
  displayCount: PropTypes.number,
  margin: PropTypes.number,
};

export default React.memo(LatestCars); 