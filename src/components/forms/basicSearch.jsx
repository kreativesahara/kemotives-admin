import React, { useEffect, useState } from 'react';

const BasicSearch = ({ filters, dropdownOptions, onChange, onSearch, onClear }) => {
  const makeOptions = dropdownOptions.make || [];
  const modelOptions = dropdownOptions.model || [];
  const makeModelMap = dropdownOptions.makeModelMap || {};

  // Get models for selected make
  const filteredModels = filters.make && makeModelMap[filters.make]
    ? makeModelMap[filters.make]
    : modelOptions;

  // Format price with commas
  const formatPrice = (price) => {
    if (!price) return '';
    const numericValue = price.toString().replace(/[^0-9]/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, '');
    onChange({ target: { name, value: numericValue } });
  };

  return (
    <form onSubmit={onSearch} className="p-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="relative group">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Vehicle Make</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3DC2EC] transition-colors">directions_car</span>
            <select
              name="make"
              value={filters.make || ''}
              onChange={onChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-[#3DC2EC]/50 focus:border-[#3DC2EC] transition-all appearance-none cursor-pointer"
            >
              <option value="">Select Make</option>
              {makeOptions.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        <div className="relative group">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Vehicle Model</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3DC2EC] transition-colors">airport_shuttle</span>
            <select
              name="model"
              value={filters.model || ''}
              onChange={onChange}
              disabled={!filters.make}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-[#3DC2EC]/50 focus:border-[#3DC2EC] transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{filters.make ? 'Select Model' : 'Select Make First'}</option>
              {filteredModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        <div className="relative group">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Max Price (KSH)</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3DC2EC] transition-colors">payments</span>
            <input
              type="text"
              name="priceMax"
              value={formatPrice(filters.priceMax)}
              onChange={handlePriceChange}
              placeholder="e.g. 2,000,000"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-[#3DC2EC]/50 focus:border-[#3DC2EC] transition-all"
            />
          </div>
        </div>

        <div className="relative group">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Min Price (KSH)</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3DC2EC] transition-colors">attach_money</span>
            <input
              type="text"
              name="priceMin"
              value={formatPrice(filters.priceMin)}
              onChange={handlePriceChange}
              placeholder="e.g. 500,000"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-[#3DC2EC]/50 focus:border-[#3DC2EC] transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <button
          type="submit"
          className="flex-1 bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-all transform active:scale-[0.99] shadow-lg flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">search</span>
          Search Vehicles
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-6 py-3.5 border border-gray-200 bg-white text-gray-600 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          Reset Filters
        </button>
      </div>
    </form>
  );
};

export default BasicSearch;