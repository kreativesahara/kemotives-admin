import { useState, useEffect, useRef } from "react";
import { axiosPrivate } from '../../api/axios';
import Select from 'react-select';

const FilterVehicles = ({ filters, setFilters, onFilterSubmit }) => {
    const [isExpanded, setIsExpanded] = useState(false); // Mobile drawer state
    const [isAdvanced, setIsAdvanced] = useState(false); // Desktop advanced toggle
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [priceInputError, setPriceInputError] = useState('');
    const [mileageInputError, setMileageInputError] = useState('');
    const [dropdownOptions, setDropdownOptions] = useState({
        make: [],
        model: [],
        fuelType: [],
        transmission: [],
        condition: [],
        driveSystem: [],
    });
    const [modelsByMake, setModelsByMake] = useState({});

    // Price preset options
    const priceRangePresets = [
        { label: 'Under 500K', min: '0', max: '500000' },
        { label: '500K - 1M', min: '500000', max: '1000000' },
        { label: '1M - 2M', min: '1000000', max: '2000000' },
        { label: '2M - 5M', min: '2000000', max: '5000000' },
        { label: 'Above 5M', min: '5000000', max: '' }
    ];

    // Fetch unique values
    useEffect(() => {
        const fetchUniqueValues = async () => {
            try {
                const response = await axiosPrivate.get('/api/publicProducts');
                const cars = response.data;

                if (Array.isArray(cars)) {
                    const getUniqueValues = (key) => [...new Set(cars.map(car => car[key]).filter(Boolean))];

                    const makeModelMap = {};
                    cars.forEach(car => {
                        if (car.make && car.model) {
                            if (!makeModelMap[car.make]) {
                                makeModelMap[car.make] = new Set();
                            }
                            makeModelMap[car.make].add(car.model);
                        }
                    });

                    const processedMakeModelMap = {};
                    Object.keys(makeModelMap).forEach(make => {
                        processedMakeModelMap[make] = Array.from(makeModelMap[make]);
                    });

                    setModelsByMake(processedMakeModelMap);
                    setDropdownOptions({
                        make: getUniqueValues("make"),
                        model: getUniqueValues("model"),
                        fuelType: getUniqueValues("fuelType"),
                        transmission: getUniqueValues("transmission"),
                        condition: getUniqueValues("condition"),
                        driveSystem: getUniqueValues("driveSystem"),
                    });
                }
            } catch (error) {
                console.error("Error fetching car data:", error);
            }
        };
        fetchUniqueValues();
    }, []);

    const handleFilterChange = (selectedOption, field) => {
        if (selectedOption === null) {
            setFilters((prevFilters) => ({
                ...prevFilters,
                [field]: '',
                ...(field === 'make' ? { model: '' } : {})
            }));
        } else {
            setFilters((prevFilters) => ({
                ...prevFilters,
                [field]: selectedOption.value,
                ...(field === 'make' ? { model: '' } : {})
            }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handlePriceInputChange = (e) => {
        const { name, value } = e.target;
        setPriceInputError('');
        const numericValue = value.replace(/[^0-9]/g, '');

        setFilters(prev => {
            const updated = { ...prev, [name]: numericValue };
            if (name === 'priceMin' && updated.priceMax && Number(numericValue) > Number(updated.priceMax)) {
                setPriceInputError('Min > Max');
            }
            if (name === 'priceMax' && updated.priceMin && Number(numericValue) > 0 && Number(numericValue) < Number(updated.priceMin)) {
                setPriceInputError('Max < Min');
            }
            return updated;
        });
    };

    const handleMileageInputChange = (e) => {
        const { value } = e.target;
        setMileageInputError('');
        const cleanedValue = value.replace(/[^0-9\-]/g, '');

        if (cleanedValue.split('-').length > 2) {
            setMileageInputError('Format: min-max');
        } else {
            setFilters(prev => ({ ...prev, mileageRange: cleanedValue }));
        }
    };

    const handleClearFilters = () => {
        setFilters({
            make: '', model: '', yearFrom: '', yearTo: '', priceMin: '', priceMax: '',
            fuelType: '', transmission: '', mileageRange: '', location: '',
            condition: '', features: [], driveSystem: '', engine_capacity: '',
        });
        setPriceInputError('');
        setMileageInputError('');
    };

    const handleSubmit = () => {
        if (priceInputError || mileageInputError) return;
        onFilterSubmit(filters);
        setIsMobileFiltersOpen(false);
    };

    // Format helpers
    const formatOptions = (options) => options.map(opt => ({ value: opt, label: opt }));

    const getModelOptions = () => {
        if (!filters.make || !modelsByMake[filters.make]) return formatOptions(dropdownOptions.model);
        return formatOptions(modelsByMake[filters.make]);
    };

    const formatPrice = (price) => {
        if (!price) return '';
        return price.toString().replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const customSelectStyles = {
        control: (base) => ({
            ...base,
            minHeight: '42px',
            borderRadius: '0.5rem',
            borderColor: '#e5e7eb',
            boxShadow: 'none',
            '&:hover': { borderColor: '#3DC2EC' }
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#3DC2EC' : state.isFocused ? '#e0f7ff' : 'white',
            color: state.isSelected ? 'white' : '#374151',
        })
    };

    // --- RENDER HELPERS ---

    const FilterSelect = ({ label, name, options, isDisabled = false }) => (
        <div className="w-full">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
            <Select
                styles={customSelectStyles}
                isClearable
                placeholder={`Any ${label}`}
                value={filters[name] ? { value: filters[name], label: filters[name] } : null}
                onChange={(opt) => handleFilterChange(opt, name)}
                options={options}
                isDisabled={isDisabled}
                className="text-sm"
            />
        </div>
    );

    const PriceInputs = () => (
        <div className="w-full">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Price Range (KSH)</label>
            <div className="flex items-center gap-2">
                <input
                    name="priceMin"
                    value={formatPrice(filters.priceMin)}
                    onChange={handlePriceInputChange}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3DC2EC] focus:border-transparent outline-none transition-all"
                />
                <span className="text-gray-400">-</span>
                <input
                    name="priceMax"
                    value={formatPrice(filters.priceMax)}
                    onChange={handlePriceInputChange}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3DC2EC] focus:border-transparent outline-none transition-all"
                />
            </div>
            {priceInputError && <span className="text-xs text-red-500 mt-1">{priceInputError}</span>}
        </div>
    );

    return (
        <div className="relative mb-6">
            {/* --- DESKTOP HORIZONTAL FILTER BAR --- */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md">
                <div className="flex flex-wrap items-start gap-4">
                    {/* Primary Filters Row */}
                    <div className="flex-1 grid grid-cols-5 gap-4">
                        <FilterSelect label="Make" name="make" options={formatOptions(dropdownOptions.make)} />
                        <FilterSelect label="Model" name="model" options={getModelOptions()} isDisabled={!filters.make} />
                        <PriceInputs />
                        <div className="w-full">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Year</label>
                            <div className="flex gap-2">
                                <input type="number" name="yearFrom" placeholder="From" value={filters.yearFrom} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#3DC2EC]" />
                                <input type="number" name="yearTo" placeholder="To" value={filters.yearTo} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#3DC2EC]" />
                            </div>
                        </div>
                        <div className="w-full pt-6"> {/* Align with inputs */}
                            <button
                                onClick={handleSubmit}
                                className="w-full h-[42px] bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[20px]">search</span>
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                {/* Advanced Desktop Toggles */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <button
                        onClick={() => setIsAdvanced(!isAdvanced)}
                        className="text-sm font-medium text-gray-600 hover:text-[#3DC2EC] flex items-center gap-1 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">{isAdvanced ? 'remove' : 'add'}</span>
                        {isAdvanced ? 'Less Filters' : 'More Filters'}
                    </button>

                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {priceRangePresets.map((preset, idx) => (
                            <button
                                key={idx}
                                onClick={() => setFilters(prev => ({ ...prev, priceMin: preset.min, priceMax: preset.max }))}
                                className="whitespace-nowrap px-3 py-1 bg-gray-50 hover:bg-gray-100 text-xs text-gray-600 rounded-full border border-gray-200 transition-colors"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Advanced Filters Section */}
                {isAdvanced && (
                    <div className="mt-4 grid grid-cols-4 gap-4 animate-fade-in-up">
                        <FilterSelect label="Fuel Type" name="fuelType" options={formatOptions(dropdownOptions.fuelType)} />
                        <FilterSelect label="Transmission" name="transmission" options={formatOptions(dropdownOptions.transmission)} />
                        <FilterSelect label="Condition" name="condition" options={formatOptions(dropdownOptions.condition)} />
                        <FilterSelect label="Drive System" name="driveSystem" options={formatOptions(dropdownOptions.driveSystem)} />
                        <div className="col-span-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={filters.location}
                                onChange={handleInputChange}
                                placeholder="e.g. Nairobi"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#3DC2EC]"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mileage (Max)</label>
                            <input
                                type="text"
                                name="mileageRange"
                                value={filters.mileageRange}
                                onChange={handleMileageInputChange}
                                placeholder="e.g. 50000"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#3DC2EC]"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* --- MOBILE FILTER TOGGLE BAR --- */}
            <div className="lg:hidden sticky top-2 z-30">
                <button
                    onClick={() => setIsMobileFiltersOpen(true)}
                    className="w-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-sm text-gray-800 font-semibold py-3 px-4 rounded-xl flex items-center justify-between"
                >
                    <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#3DC2EC]">tune</span>
                        Filter Vehicles
                    </span>
                    <span className="bg-gray-100 text-xs px-2 py-1 rounded-full">
                        {Object.values(filters).filter(v => v !== '' && v.length !== 0).length} Active
                    </span>
                </button>
            </div>

            {/* --- MOBILE DRAWER (Slide-over) --- */}
            {isMobileFiltersOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileFiltersOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div className="absolute inset-y-0 right-0 w-full max-w-[320px] bg-white shadow-2xl flex flex-col animate-slide-in-right">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800">Filters</h2>
                            <button
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            <FilterSelect label="Make" name="make" options={formatOptions(dropdownOptions.make)} />
                            <FilterSelect label="Model" name="model" options={getModelOptions()} isDisabled={!filters.make} />

                            <PriceInputs />

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Year Range</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="number" name="yearFrom" placeholder="From" value={filters.yearFrom} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                    <input type="number" name="yearTo" placeholder="To" value={filters.yearTo} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                </div>
                            </div>

                            <FilterSelect label="Fuel Type" name="fuelType" options={formatOptions(dropdownOptions.fuelType)} />
                            <FilterSelect label="Transmission" name="transmission" options={formatOptions(dropdownOptions.transmission)} />
                            <FilterSelect label="Condition" name="condition" options={formatOptions(dropdownOptions.condition)} />

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Location</label>
                                <input type="text" name="location" value={filters.location} onChange={handleInputChange} placeholder="e.g. Mombasa" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 space-y-3 bg-gray-50">
                            <button
                                onClick={handleSubmit}
                                className="w-full py-3 bg-black text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-all active:scale-[0.98]"
                            >
                                Show Results
                            </button>
                            <button
                                onClick={handleClearFilters}
                                className="w-full py-3 bg-white text-gray-600 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterVehicles;
