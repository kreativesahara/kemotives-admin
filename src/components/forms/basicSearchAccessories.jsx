import React from 'react';

const BasicSearchAccessories = ({ filters, dropdownOptions, onChange, onSearch, onClear }) => {
  const nameOptions = dropdownOptions.name || [];
  const categoryOptions = dropdownOptions.category || [];
  const locationOptions = dropdownOptions.location || [];
  const categoryNameMap = dropdownOptions.categoryNameMap || {};

  const filteredNames = filters.category && categoryNameMap[filters.category]
    ? categoryNameMap[filters.category]
    : [];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-6">

        <div className="relative group">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Category</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3DC2EC] transition-colors">category</span>
            <select
              name="category"
              value={filters.category || ''}
              onChange={onChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-[#3DC2EC]/50 focus:border-[#3DC2EC] transition-all appearance-none cursor-pointer"
            >
              <option value="">Select Category</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        <div className="relative group">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Accessory Name</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3DC2EC] transition-colors">shopping_bag</span>
            <select
              name="name"
              value={filters.name || ''}
              onChange={onChange}
              disabled={!filters.category || filteredNames.length === 0}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-[#3DC2EC]/50 focus:border-[#3DC2EC] transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {!filters.category
                  ? 'Select Category First'
                  : filteredNames.length === 0
                    ? 'No Accessories'
                    : 'Select Accessory'}
              </option>
              {filteredNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        <div className="relative group">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Location</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3DC2EC] transition-colors">location_on</span>
            <select
              name="location"
              value={filters.location || ''}
              onChange={onChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-[#3DC2EC]/50 focus:border-[#3DC2EC] transition-all appearance-none cursor-pointer"
            >
              <option value="">Any Location</option>
              {locationOptions.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        <div className="relative group">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Max Price</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3DC2EC] transition-colors">payments</span>
            <input
              type="text"
              name="priceMax"
              value={formatPrice(filters.priceMax)}
              onChange={handlePriceChange}
              placeholder="e.g. 50,000"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-[#3DC2EC]/50 focus:border-[#3DC2EC] transition-all"
            />
          </div>
        </div>

        <div className="relative group">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Min Price</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3DC2EC] transition-colors">attach_money</span>
            <input
              type="text"
              name="priceMin"
              value={formatPrice(filters.priceMin)}
              onChange={handlePriceChange}
              placeholder="e.g. 1,000"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-[#3DC2EC]/50 focus:border-[#3DC2EC] transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <button
          type="submit"
          className="flex-1 bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-all transform active:scale-[0.99] shadow-lg flex items-center justify-center gap-2"
          disabled={!filters.category}
        >
          <span className="material-symbols-outlined">search</span>
          Search Accessories
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

export default BasicSearchAccessories;