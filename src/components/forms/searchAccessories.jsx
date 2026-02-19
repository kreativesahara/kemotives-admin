import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BasicSearchAccessories from './basicSearchAccessories';
import AdvancedSearchAccessories from './advancedSearchAccessories';
import useAxiosPrivate from '../../api/useAxiosPrivate';
import { useSearch } from '../../context/SearchAccesoriesProvider';

const AccessoriesPlaceholder = ({ name }) => (
  <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
    <svg 
      viewBox="0 0 24 24" 
      className="w-16 h-16 text-gray-400 mb-2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
    <span className="text-sm text-gray-500 text-center px-2">
      {name}
    </span>
  </div>
);

const SearchAccessories = () => {
  // Shared state from SearchProvider
  const {
    name, setName,
    category, setCategory,
    condition, setCondition,
    location, setLocation,
    priceMin, setPriceMin,
    priceMax, setPriceMax,
    stock, setStock,
  } = useSearch();

  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState({
    name: [],
    category: [],
    condition: [],
    location: [],
    priceMin: [],
    priceMax: [],
    stock: [],
  });
  const [categoryNameMap, setCategoryNameMap] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  // Fetch dropdown options from API and build category-name relationships
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axiosPrivate.get('/api/accessories');
        const accessories = response.data;
        if (Array.isArray(accessories)) {
          const getUniqueValues = (key) =>
            [...new Set(accessories.map(accessory => accessory[key]).filter(Boolean))];
          
          // Set all dropdown options
          setDropdownOptions({
            name: getUniqueValues("name"),
            category: getUniqueValues("category"),
            condition: getUniqueValues("condition"),
            location: getUniqueValues("location"),
            priceMin: getUniqueValues("priceMin"),
            priceMax: getUniqueValues("priceMax"),
            stock: getUniqueValues("stock"),
          });
          
          // Create category-name relationship map
          const categoryToNames = {};
          accessories.forEach(accessory => {
            if (accessory.category && accessory.name) {
              if (!categoryToNames[accessory.category]) {
                categoryToNames[accessory.category] = [];
              }
              if (!categoryToNames[accessory.category].includes(accessory.name)) {
                categoryToNames[accessory.category].push(accessory.name);
              }
            }
          });
          
          setCategoryNameMap(categoryToNames);
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };
    fetchOptions();
  }, [axiosPrivate]);

  // Update shared state from SearchProvider based on input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "name":
        setName(value);
        break;
      case "category":
        setCategory(value);
        // Reset name when category changes
        setName('');
        break;
      case "condition":
        setCondition(value);
        break;
      case "location":
        setLocation(value);
        break;
      case "priceMin":
        setPriceMin(value);
        break;
      case "priceMax":
        setPriceMax(value);
        break;
      case "stock":
        setStock(value);
        break;
      default:
        break;
    }
  };

  // Use the shared filter state to build the cleanedFilters object
  const handleSearch = async (e) => {
    e.preventDefault();
    setHasSearched(true);
    // Build filter object from context values
    const currentFilters = {
      name, 
      category,
      condition,
      location,
      priceMin: priceMin ? Number(priceMin) : '',
      priceMax: priceMax ? Number(priceMax) : '',
      stock,
    };
    // Remove empty keys
    const cleanedFilters = Object.fromEntries(
      Object.entries(currentFilters).filter(([_, value]) => value !== '' && value !== undefined)
    );
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axiosPrivate.get('/api/filter/accessories', { params: cleanedFilters });
      setSearchResults(data || []);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to fetch search results.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    // Reset the shared search state using context setters
    setName('');
    setCategory('');
    setCondition('');
    setLocation('');
    setPriceMin('');
    setPriceMax('');
    setStock('');
    setError(null);
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="md:mb-4 flex flex-col justify-between items-center">
        {/* <h2 className="text-2xl flex font-bold  text-gray-800">
          {isAdvancedSearch ? 'Advanced Search' : 'Quick Search'}
        </h2> */}
        {/* <button
          onClick={() => setIsAdvancedSearch(prev => !prev)}
          className="text-red-500 hover:underline"
        >
          {isAdvancedSearch ? 'Switch to Basic Search' : 'Switch to Advanced Search'}
        </button> */}
      </div>

      {/* {isAdvancedSearch ? (
        <AdvancedSearchAccessories
          filters={{ name, category, condition, location, priceMin, priceMax, stock }}
          dropdownOptions={{
            ...dropdownOptions
          }}
          onChange={handleChange}
          onSubmit={handleSearch}
          onClear={handleClear}
        /> */}
       {/* : ( */}
        <BasicSearchAccessories
          filters={{ name, category, condition, location, priceMin, priceMax, stock }}
          dropdownOptions={{
            ...dropdownOptions,
            categoryNameMap
          }}
          onChange={handleChange}
          onSearch={handleSearch}
          onClear={handleClear}
        />
       {/* )} */}

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3DC2EC] mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching...</p>
        </div>
      )}
      {error && (
        <p className="text-center text-red-500 my-4">{error}</p>
      )}
      {(!isLoading && searchResults.length > 0) ? (
        <section 
          className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 mx-auto mt-8" 
          aria-labelledby="search-results"
        >
          <h2 id="search-results" className="sr-only">Search Results</h2>
          
          {searchResults.map((result) => (
            <article 
              key={result.id}
              className="bg-white border rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <Link
                to={`/accessory/${result.slug}`}
                className="block h-full"
                title={`View details of ${result.name} ${result.category}`}
                aria-label={`${result.name} ${result.category} - ${result.condition} - Available in ${result.location}`}
              >
                <div className="relative">
                  <figure className="aspect-[4/3] overflow-hidden rounded-t-xl">
                    {result?.imageUrls?.length > 0 ? (
                      <img
                        title="Preview"
                        src={result.imageUrls[0]}
                        alt={result.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <AccessoriesPlaceholder name={result.name} />
                    )}
                  </figure>
                  {result.condition && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                        {result.condition}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {result.name}
                    </h3>
                    <h4 className="text-sm text-gray-600">
                      {result.category}
                    </h4>
                    <p className="text-[#3DC2EC] font-bold mt-1">
                      {result.price ? `KSH ${Number(result.price).toLocaleString()}` : "Price on request"}
                    </p>
                    {result.stock !== undefined && (
                      <p className="text-sm text-gray-500 mt-1">
                        Stock: {result.stock} items
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">
                        category
                      </span>
                      {result.category || 'N/A'}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">
                        location_on
                      </span>
                      {result.location || 'N/A'}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">
                        verified
                      </span>
                      {result.condition || 'N/A'}
                    </div>
                    {result.stock !== undefined && (
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">
                          inventory_2
                        </span>
                        {result.stock} items
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </section>
      ) : (
        !isLoading && hasSearched && (
          <div className="w-full text-center p-8 bg-gray-50 rounded-lg mt-8">
          <p className="text-lg text-gray-600">No accessories found matching your criteria</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your search filters</p>
          </div>
        )
      )}
    </div>
  );
};

export default SearchAccessories;
