import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';

const AdvancedSearch = ({ filters, dropdownOptions, onChange, onSubmit, onClear }) => {
  const [makeSelectValue, setMakeSelectValue] = useState(null);
  const [modelSelectValue, setModelSelectValue] = useState(null);

  const makeModelMap = dropdownOptions.makeModelMap || {};

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

  const makeOptions = useMemo(() =>
    dropdownOptions.make.map(make => ({
      value: make, label: make
    })),
    [dropdownOptions.make]);

  const allModelOptions = useMemo(() =>
    dropdownOptions.model.map(model => ({
      value: model, label: model
    })),
    [dropdownOptions.model]);

  const filteredModelOptions = useMemo(() => {
    if (!makeSelectValue) return allModelOptions;
    if (makeModelMap[makeSelectValue.value]) {
      return makeModelMap[makeSelectValue.value].map(model => ({ value: model, label: model }));
    }
    return allModelOptions.filter(model => model.value.includes(makeSelectValue.value));
  }, [makeSelectValue, allModelOptions, makeModelMap]);

  useEffect(() => {
    if (filters.make) {
      setMakeSelectValue(makeOptions.find(opt => opt.value === filters.make) || null);
    } else {
      setMakeSelectValue(null);
    }
    if (filters.model) {
      setModelSelectValue(allModelOptions.find(opt => opt.value === filters.model) || null);
    } else {
      setModelSelectValue(null);
    }
  }, [filters.make, filters.model, makeOptions, allModelOptions]);

  const handleMakeChange = (selectedOption) => {
    setMakeSelectValue(selectedOption);
    setModelSelectValue(null);
    onChange({ target: { name: 'make', value: selectedOption ? selectedOption.value : '' } });
    onChange({ target: { name: 'model', value: '' } });
  };

  const handleModelChange = (selectedOption) => {
    setModelSelectValue(selectedOption);
    onChange({ target: { name: 'model', value: selectedOption ? selectedOption.value : '' } });
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      padding: '2px',
      borderRadius: '0.75rem',
      borderColor: state.isFocused ? '#3DC2EC' : '#E5E7EB',
      boxShadow: state.isFocused ? '0 0 0 1px #3DC2EC' : null,
      backgroundColor: '#F9FAFB',
      '&:hover': { borderColor: '#3DC2EC' }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#3DC2EC' : state.isFocused ? '#E0F7FF' : 'white',
      color: state.isSelected ? 'white' : '#374151',
    })
  };

  const InputField = ({ label, name, type = "text", placeholder, value, onChange, icon }) => (
    <div className="relative group">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{label}</label>
      <div className="relative">
        {icon && <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3DC2EC] transition-colors">{icon}</span>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-[#3DC2EC]/50 focus:border-[#3DC2EC] transition-all`}
        />
      </div>
    </div>
  );

  const SelectField = ({ label, name, options }) => (
    <div className="relative group">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{label}</label>
      <div className="relative">
        <select
          name={name}
          value={filters[name] || ''}
          onChange={onChange}
          className="w-full pl-4 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-[#3DC2EC]/50 focus:border-[#3DC2EC] transition-all appearance-none cursor-pointer"
        >
          <option value="">Any {label}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
      </div>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Column 1: Vehicle & Year */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <span className="material-symbols-outlined text-[#3DC2EC]">directions_car</span>
            <h3 className="font-bold text-gray-800">Vehicle Information</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Make</label>
            <Select
              value={makeSelectValue}
              onChange={handleMakeChange}
              options={makeOptions}
              placeholder="Select Make"
              isClearable
              styles={selectStyles}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Model</label>
            <Select
              value={modelSelectValue}
              onChange={handleModelChange}
              options={filteredModelOptions}
              placeholder="Select Model"
              isClearable
              isDisabled={!makeSelectValue}
              styles={selectStyles}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Year From" name="yearFrom" type="number" placeholder="ex. 2015" value={filters.yearFrom || ''} onChange={onChange} />
            <InputField label="Year To" name="yearTo" type="number" placeholder="ex. 2024" value={filters.yearTo || ''} onChange={onChange} />
          </div>
        </div>

        {/* Column 2: Specs */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <span className="material-symbols-outlined text-[#3DC2EC]">tune</span>
            <h3 className="font-bold text-gray-800">Specifications</h3>
          </div>

          <SelectField label="Fuel Type" name="fuelType" options={dropdownOptions.fuelType} />
          <SelectField label="Transmission" name="transmission" options={dropdownOptions.transmission} />
          <SelectField label="Drive System" name="driveSystem" options={dropdownOptions.driveSystem} />
          <SelectField label="Condition" name="condition" options={dropdownOptions.condition} />
        </div>

        {/* Column 3: Location & Price */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <span className="material-symbols-outlined text-[#3DC2EC]">location_on</span>
            <h3 className="font-bold text-gray-800">Location & Price</h3>
          </div>

          <InputField label="Location" name="location" placeholder="e.g. Nairobi, Mombasa" value={filters.location || ''} onChange={onChange} icon="search" />

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Price Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="text"
                  name="priceMin"
                  value={formatPrice(filters.priceMin)}
                  onChange={handlePriceChange}
                  placeholder="Min"
                  className="w-full pl-3 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-[#3DC2EC]/50 focus:border-[#3DC2EC] text-sm"
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="priceMax"
                  value={formatPrice(filters.priceMax)}
                  onChange={handlePriceChange}
                  placeholder="Max"
                  className="w-full pl-3 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-[#3DC2EC]/50 focus:border-[#3DC2EC] text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
        <button
          type="submit"
          className="flex-1 bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center gap-2 text-lg"
        >
          <span className="material-symbols-outlined">search</span>
          Find My Car
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-8 py-4 border border-gray-200 bg-white text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all"
        >
          Clear All
        </button>
      </div>
    </form>
  );
};

export default AdvancedSearch;