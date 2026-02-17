import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';

const AdvancedSearch = ({ filters, dropdownOptions, onChange, onSubmit, onClear }) => {
  // State for react-select values
  const [makeSelectValue, setMakeSelectValue] = useState(null);
  const [modelSelectValue, setModelSelectValue] = useState(null);
  
  // Extract make-model map if available
  const makeModelMap = dropdownOptions.makeModelMap || {};
  
  // Format price with commas
  const formatPrice = (price) => {
    if (!price) return '';
    // Remove any non-digits first (in case there are already commas)
    const numericValue = price.toString().replace(/[^0-9]/g, '');
    // Add commas for thousands
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  // Custom handler for price inputs
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    // Remove commas and any non-digit characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Use the original onChange handler with the cleaned numeric value
    onChange({
      target: {
        name,
        value: numericValue
      }
    });
  };
  
  // Create options for react-select
  const makeOptions = useMemo(() => 
    dropdownOptions.make.map(make => ({ 
      value: make, 
      label: make,
      slug: make.toLowerCase().replace(/\s+/g, '-')
    })),
  [dropdownOptions.make]);
  
  const allModelOptions = useMemo(() => 
    dropdownOptions.model.map(model => ({ 
      value: model, 
      label: model,
      slug: model.toLowerCase().replace(/\s+/g, '-')
    })),
  [dropdownOptions.model]);
  
  // Filter model options based on selected make
  const filteredModelOptions = useMemo(() => {
    if (!makeSelectValue) return allModelOptions;
    
    // If we have relationship data for this make, use it
    if (makeModelMap[makeSelectValue.value]) {
      return makeModelMap[makeSelectValue.value].map(model => ({
        value: model,
        label: model,
        slug: model.toLowerCase().replace(/\s+/g, '-')
      }));
    }
    
    // Otherwise use name matching as fallback
    return allModelOptions.filter(model => 
      model.value.includes(makeSelectValue.value) || 
      makeSelectValue.value.includes(model.value)
    );
  }, [makeSelectValue, allModelOptions, makeModelMap]);
  
  // Set initial values from filters prop
  useEffect(() => {
    if (filters.make) {
      const selectedMake = makeOptions.find(option => option.value === filters.make);
      setMakeSelectValue(selectedMake || null);
    }
    
    if (filters.model) {
      const selectedModel = allModelOptions.find(option => option.value === filters.model);
      setModelSelectValue(selectedModel || null);
    }
  }, [filters.make, filters.model, makeOptions, allModelOptions]);
  
  // Handle make selection
  const handleMakeChange = (selectedOption) => {
    setMakeSelectValue(selectedOption);
    setModelSelectValue(null); // Reset model when make changes
    
    // Update parent component state
    onChange({
      target: {
        name: 'make',
        value: selectedOption ? selectedOption.value : ''
      }
    });
    
    // Clear model in parent component
    onChange({
      target: {
        name: 'model',
        value: ''
      }
    });
  };
  
  // Handle model selection
  const handleModelChange = (selectedOption) => {
    setModelSelectValue(selectedOption);
    
    // Update parent component state
    onChange({
      target: {
        name: 'model',
        value: selectedOption ? selectedOption.value : ''
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Vehicle Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Vehicle Details</h3>
          <div>
            <label className="block text-sm text-neutral-900 mb-1">Make</label>
            <Select
              name="make"
              value={makeSelectValue}
              onChange={handleMakeChange}
              options={makeOptions}
              placeholder="Search or select make"
              isClearable
              className="basic-select"
              classNamePrefix="select"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-900 mb-1">Model</label>
            <Select
              name="model"
              value={modelSelectValue}
              onChange={handleModelChange}
              options={filteredModelOptions}
              placeholder="Search or select model"
              isClearable
              isDisabled={!makeSelectValue}
              className="basic-select"
              classNamePrefix="select"
              noOptionsMessage={() => "Select a make first to see available models"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-900 mb-1">Year From</label>
              <input
                type="number"
                name="yearFrom"
                value={filters.yearFrom || ''}
                onChange={onChange}
                placeholder="From Year"
                className="w-full p-2 border border-neutral-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-900 mb-1">Year To</label>
              <input
                type="number"
                name="yearTo"
                value={filters.yearTo || ''}
                onChange={onChange}
                placeholder="To Year"
                className="w-full p-2 border border-neutral-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Technical Specs</h3>
          {[
            { label: "Fuel Type", name: "fuelType", options: dropdownOptions.fuelType },
            { label: "Transmission", name: "transmission", options: dropdownOptions.transmission },
            { label: "Drive System", name: "driveSystem", options: dropdownOptions.driveSystem },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm text-neutral-900 mb-1">{field.label}</label>
              <select
                name={field.name}
                value={filters[field.name] || ''}
                onChange={onChange}
                className="w-full p-2 border border-neutral-300 rounded-md"
              >
                <option value="">All {field.label}s</option>
                {field.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Additional Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Additional Details</h3>
          <div>
            <label className="block text-sm text-neutral-900 mb-1">Price Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                name="priceMin"
                value={formatPrice(filters.priceMin)}
                onChange={handlePriceChange}
                placeholder="Min Price"
                className="w-full p-2 border border-neutral-300 rounded-md"
              />
              <input
                type="text"
                name="priceMax"
                value={formatPrice(filters.priceMax)}
                onChange={handlePriceChange}
                placeholder="Max Price"
                className="w-full p-2 border border-neutral-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-neutral-900 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={filters.location || ''}
              onChange={onChange}
              placeholder="Enter Location"
              className="w-full p-2 border border-neutral-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-900 mb-1">Condition</label>
            <select
              name="condition"
              value={filters.condition || ''}
              onChange={onChange}
              className="w-full p-2 border border-neutral-300 rounded-md"
            >
              <option value="">All Conditions</option>
              {dropdownOptions.condition.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          type="submit"
          className="flex-1 bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
          disabled={!makeSelectValue}
        >
          Apply Filters
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default AdvancedSearch;