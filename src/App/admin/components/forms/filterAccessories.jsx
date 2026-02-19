import { useState, useEffect } from "react";
import { axiosPrivate } from '../../api/axios';
import Select from 'react-select';

const FilterAccessories = ({ filters, setFilters, onFilterSubmit }) => {
    const [isAdvanced, setIsAdvanced] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [priceInputError, setPriceInputError] = useState('');
    const [dropdownOptions, setDropdownOptions] = useState({
        name: [],
        category: [],
        condition: [],
        location: [],
        stock: [],
    });

    const priceRangePresets = [
        { label: 'Under 5K', min: '0', max: '5000' },
        { label: '5K - 10K', min: '5000', max: '10000' },
        { label: '10K - 25K', min: '10000', max: '25000' },
        { label: '25K - 50K', min: '25000', max: '50000' },
        { label: 'Above 50K', min: '50000', max: '' }
    ];

    const stockPresets = [
        { label: 'In Stock', value: 'in_stock' },
        { label: 'Low Stock', value: 'low_stock' },
        { label: 'Out of Stock', value: 'out_of_stock' }
    ];

    useEffect(() => {
        const fetchUniqueValues = async () => {
            try {
                const response = await axiosPrivate.get('/api/accessories');
                const accessories = response.data;
                if (Array.isArray(accessories)) {
                    const getUniqueValues = (key) => [...new Set(accessories.map(item => item[key]).filter(Boolean))];
                    setDropdownOptions({
                        name: getUniqueValues("name"),
                        category: getUniqueValues("category"),
                        condition: getUniqueValues("condition"),
                        location: getUniqueValues("location"),
                        stock: getUniqueValues("stock"),
                    });
                }
            } catch (error) {
                console.error("Error fetching accessories data:", error);
            }
        };
        fetchUniqueValues();
    }, []);

    const handleFilterChange = (selectedOption, field) => {
        setFilters(prev => ({
            ...prev,
            [field]: selectedOption ? selectedOption.value : ''
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
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

    const handleClearFilters = () => {
        setFilters({ name: '', category: '', condition: '', location: '', priceMin: '', priceMax: '', stock: '', search: '' });
        setPriceInputError('');
    };

    const handleSubmit = () => {
        if (priceInputError) return;
        onFilterSubmit(filters);
        setIsMobileFiltersOpen(false);
    };

    // Formatters
    const formatOptions = (options) => options.map(opt => ({ value: opt, label: opt }));
    const formatPrice = (price) => price ? price.toString().replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

    const customSelectStyles = {
        control: (base) => ({
            ...base,
            minHeight: '42px',
            borderRadius: '0.5rem',
            borderColor: '#e5e7eb',
            '&:hover': { borderColor: '#3DC2EC' }
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#3DC2EC' : state.isFocused ? '#e0f7ff' : 'white',
            color: state.isSelected ? 'white' : '#374151',
        })
    };

    const FilterSelect = ({ label, name, options }) => (
        <div className="w-full">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
            <Select
                styles={customSelectStyles}
                isClearable
                placeholder={`Any ${label}`}
                value={filters[name] ? { value: filters[name], label: filters[name] } : null}
                onChange={(opt) => handleFilterChange(opt, name)}
                options={options}
                className="text-sm"
            />
        </div>
    );

    const PriceInputs = () => (
        <div className="w-full">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Price (KSH)</label>
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
            {/* --- DESKTOP HORIZONTAL BAR --- */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md">
                <div className="flex flax-wrap items-start gap-4">
                    <div className="flex-1 grid grid-cols-5 gap-4">
                        <FilterSelect label="Name" name="name" options={formatOptions(dropdownOptions.name)} />
                        <FilterSelect label="Category" name="category" options={formatOptions(dropdownOptions.category)} />
                        <PriceInputs />
                        <div className="w-full">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Search</label>
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleInputChange}
                                placeholder="Keywords..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#3DC2EC] h-[42px]"
                            />
                        </div>
                        <div className="w-full pt-6">
                            <button onClick={handleSubmit} className="w-full h-[42px] bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">search</span> Apply
                            </button>
                        </div>
                    </div>
                </div>

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

                {isAdvanced && (
                    <div className="mt-4 grid grid-cols-4 gap-4 animate-fade-in-up">
                        <FilterSelect label="Condition" name="condition" options={formatOptions(dropdownOptions.condition)} />
                        <FilterSelect label="Location" name="location" options={formatOptions(dropdownOptions.location)} />
                        <FilterSelect label="Stock Status" name="stock" options={formatOptions(dropdownOptions.stock)} />
                    </div>
                )}
            </div>

            {/* --- MOBILE TOGGLE --- */}
            <div className="lg:hidden sticky top-2 z-30">
                <button
                    onClick={() => setIsMobileFiltersOpen(true)}
                    className="w-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-sm text-gray-800 font-semibold py-3 px-4 rounded-xl flex items-center justify-between"
                >
                    <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#3DC2EC]">tune</span>
                        Filter Accessories
                    </span>
                    <span className="bg-gray-100 text-xs px-2 py-1 rounded-full">
                        {Object.values(filters).filter(v => v !== '' && v.length !== 0).length} Active
                    </span>
                </button>
            </div>

            {/* --- MOBILE DRAWER --- */}
            {isMobileFiltersOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileFiltersOpen(false)} />
                    <div className="absolute inset-y-0 right-0 w-full max-w-[320px] bg-white shadow-2xl flex flex-col animate-slide-in-right">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800">Filters</h2>
                            <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            <FilterSelect label="Name" name="name" options={formatOptions(dropdownOptions.name)} />
                            <FilterSelect label="Category" name="category" options={formatOptions(dropdownOptions.category)} />
                            <div className="bg-gray-50 p-3 rounded-lg"><PriceInputs /></div>
                            <FilterSelect label="Condition" name="condition" options={formatOptions(dropdownOptions.condition)} />
                            <FilterSelect label="Location" name="location" options={formatOptions(dropdownOptions.location)} />
                            <FilterSelect label="Stock" name="stock" options={formatOptions(dropdownOptions.stock)} />
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Search</label>
                                <input type="text" name="search" value={filters.search} onChange={handleInputChange} placeholder="Search..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 space-y-3 bg-gray-50">
                            <button onClick={handleSubmit} className="w-full py-3 bg-black text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-all">Show Results</button>
                            <button onClick={handleClearFilters} className="w-full py-3 bg-white text-gray-600 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">Clear All</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterAccessories;
