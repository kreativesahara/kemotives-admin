import React from 'react';
import { Link } from 'react-router-dom';

/**
 * ValueProposition component - Clear value statement above the fold
 * Reduces bounce by immediately communicating benefits
 */
const ValueProposition = () => {
  const benefits = [
    { icon: 'search', text: 'Find Your Perfect Match' },
    { icon: 'support_agent', text: 'Expert Support' },
    { icon: 'verified_user', text: 'Verified Listings' },
    { icon: 'payments', text: 'Best Prices Guaranteed' }
  ];

  return (
    <section>
      <div className="max-w-7xl mx-auto  text-center">
        <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
          Buy and sell vehicles with confidence. Thousands of verified listings,
          competitive prices, and trusted sellers all in one place.
        </p>

        <div className="hidden md:flex flex-wrap justify-center gap-4 mb-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full"
            >
              <span className="material-symbols-outlined text-[#3DC2EC]">
                {benefit.icon}
              </span>
              <span className="text-sm md:text-base text-gray-700">{benefit.text}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/vehicles"
            className="bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Browse Vehicles
          </Link>
          <Link
            to="/accessories"
            className="bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Browse Accessories
          </Link>
          <Link
            to="/pricing"
            className="bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Start Selling
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;

