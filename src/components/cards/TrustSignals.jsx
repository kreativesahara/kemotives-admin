import React from 'react';

/**
 * TrustSignals component displays credibility indicators to reduce bounce rate
 * Shows statistics, guarantees, and trust badges above the fold
 */
const TrustSignals = () => {
  const stats = [
    // { number: '10,000+', label: 'Active Listings', icon: 'inventory_2' },
    // { number: '50,000+', label: 'Happy Customers', icon: 'people' },
    { number: '98%', label: 'Satisfaction Rate', icon: 'verified' },
    { number: '24/7', label: 'Support Available', icon: 'support_agent' }
  ];

  return (
    <section className="bg-gradient-to-r from-gray-50 to-white py-8 m-4 my-6 md:py-12 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-2 justify-center">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <span className="material-symbols-outlined text-3xl text-[#3DC2EC] mb-2 block">
                {stat.icon}
              </span>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {stat.number}
              </div>
              <div className="text-sm md:text-base text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        
        {/* Trust badges */}
        <div className="mt-6 flex flex-wrap justify-center items-center gap-4 md:gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600">verified</span>
            <span>Verified Sellers Only</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">security</span>
            <span>Secure Transactions</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-600">local_shipping</span>
            <span>Free Inspection</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSignals;


