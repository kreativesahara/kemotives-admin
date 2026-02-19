import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BasicSearch from './basicSearch';
import AdvancedSearch from './advancedSearch';
import useAxiosPrivate from '../../api/useAxiosPrivate';
import { useSearch } from '../../context/SearchProvider';
import { useProductContext } from '../../context/ProductProvider';

const Search = () => {
  // Shared state from SearchProvider
  const {
    make, setMake,
    model, setModel,
    year, setYear,
    priceMin, setPriceMin,
    priceMax, setPriceMax,
    location, setLocation,
    condition, setCondition,
    fuelType, setFuelType,
    transmission, setTransmission,
    driveSystem, setDriveSystem,
  } = useSearch();

  const { products } = useProductContext();
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState({
    make: [],
    model: [],
    fuelType: [],
    transmission: [],
    condition: [],
    driveSystem: [],
  });
  const [makeModelMap, setMakeModelMap] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  // Fetch dropdown options from API and build make-model relationships
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axiosPrivate.get('/api/publicProducts');
        const cars = response.data;
        if (Array.isArray(cars)) {
          const getUniqueValues = (key) =>
            [...new Set(cars.map(car => car[key]).filter(Boolean))];

          // Set all dropdown options
          setDropdownOptions({
            make: getUniqueValues("make"),
            model: getUniqueValues("model"),
            fuelType: getUniqueValues("fuelType"),
            transmission: getUniqueValues("transmission"),
            condition: getUniqueValues("condition"),
            driveSystem: getUniqueValues("driveSystem"),
          });

          // Create make-model relationship map
          const makeToModels = {};
          cars.forEach(car => {
            if (car.make && car.model) {
              if (!makeToModels[car.make]) {
                makeToModels[car.make] = [];
              }
              if (!makeToModels[car.make].includes(car.model)) {
                makeToModels[car.make].push(car.model);
              }
            }
          });

          setMakeModelMap(makeToModels);
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };
    fetchOptions();
  }, [axiosPrivate]);

  // Compute unique filter options from products context (optional)
  const uniqueMakes = useMemo(() => [...new Set(products.map(car => car.make))], [products]);
  const uniqueModels = useMemo(() => [...new Set(products.map(car => car.model))], [products]);
  const uniqueYears = useMemo(() => [...new Set(products.map(car => car.year))], [products]);
  const uniqueLocations = useMemo(() => [...new Set(products.map(car => car.location))], [products]);
  const uniqueConditions = useMemo(() => [...new Set(products.map(car => car.condition))], [products]);

  // Update shared state from SearchProvider based on input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "make":
        setMake(value);
        // Reset model when make changes
        setModel('');
        break;
      case "model":
        setModel(value);
        break;
      case "year":
        setYear(value);
        break;
      case "priceMin":
        setPriceMin(value);
        break;
      case "priceMax":
        setPriceMax(value);
        break;
      case "location":
        setLocation(value);
        break;
      case "condition":
        setCondition(value);
        break;
      case "fuelType":
        setFuelType(value);
        break;
      case "transmission":
        setTransmission(value);
        break;
      case "driveSystem":
        setDriveSystem(value);
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
      make,
      model,
      year,
      minPrice: priceMin ? Number(priceMin) : '',
      maxPrice: priceMax ? Number(priceMax) : '',
      location,
      condition,
      fuelType,
      transmission,
      driveSystem,
    };
    // Remove empty keys
    const cleanedFilters = Object.fromEntries(
      Object.entries(currentFilters).filter(([_, value]) => value !== '' && value !== undefined)
    );
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axiosPrivate.get('/api/search', { params: cleanedFilters });
      // If no backend filtering, filter results client-side
      let filteredResults = data;

      // Client-side price filtering if needed
      if (priceMin || priceMax) {
        filteredResults = data.filter(car => {
          const carPrice = Number(car.price);
          const minCheck = priceMin ? carPrice >= Number(priceMin) : true;
          const maxCheck = priceMax ? carPrice <= Number(priceMax) : true;
          const yearCheck = year ? car.year == year : true;
          const fuelCheck = fuelType ? car.fuelType === fuelType : true;
          const transmissionCheck = transmission ? car.transmission === transmission : true;
          const driveCheck = driveSystem ? car.driveSystem === driveSystem : true;

          return minCheck && maxCheck && yearCheck && fuelCheck && transmissionCheck && driveCheck;
        });
      }

      setSearchResults(filteredResults);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to fetch search results.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    // Reset the shared search state using context setters
    setMake('');
    setModel('');
    setYear('');
    setPriceMin('');
    setPriceMax('');
    setLocation('');
    setCondition('');
    setFuelType('');
    setTransmission('');
    setDriveSystem('');
    setError(null);
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="md:mb-4 flex flex-col justify-between items-center">
        <h2 className="text-2xl flex font-bold  text-gray-800">
          {isAdvancedSearch ? 'Advanced Search' : 'Quick Search'}
        </h2>
        <button
          onClick={() => setIsAdvancedSearch(prev => !prev)}
          className="text-red-500 hover:underline"
        >
          {isAdvancedSearch ? 'Switch to Basic Search' : 'Switch to Advanced Search'}
        </button>
      </div>

      {isAdvancedSearch ? (
        <AdvancedSearch
          filters={{ make, model, year, priceMin, priceMax, location, condition, fuelType, transmission, driveSystem }}
          dropdownOptions={{
            ...dropdownOptions,
            makeModelMap
          }}
          onChange={handleChange}
          onSubmit={handleSearch}
          onClear={handleClear}
        />
      ) : (
        <BasicSearch
          filters={{ make, model, priceMin, priceMax }}
          dropdownOptions={{
            ...dropdownOptions,
            makeModelMap
          }}
          onChange={handleChange}
          onSearch={handleSearch}
          onClear={handleClear}
        />
      )}

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
                to={`/vehicle/${result.slug}`}
                className="block h-full"
                title={`View details of ${result.make} ${result.model}`}
                aria-label={`${result.year} ${result.make} ${result.model} - ${result.condition} - Available in ${result.location}`}
              >
                <div className="relative">
                  <figure className="aspect-[4/3] overflow-hidden rounded-t-xl">
                    {result?.images?.length > 0 ? (
                      <img
                        title="Preview"
                        src={result.images[0]?.image_url || result.images[0]}
                        alt={`${result.make} ${result.model}`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <CarPlaceholder make={result.make} model={result.model} />
                    )}
                  </figure>
                  <div className="absolute top-3 right-3">
                    <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                      {result.year}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {result.make} {result.model}
                    </h3>
                    <h4>

                    </h4>
                    <p className="text-[#3DC2EC] font-bold mt-1">
                      {result.price ? `KSH ${Number(result.price).toLocaleString()}` : "Price on request"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Mileage: {result.mileage} km
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">
                        verified
                      </span>
                      {result.condition}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">
                        location_on
                      </span>
                      {result.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">
                        settings
                      </span>
                      {result.transmission || 'N/A'}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">
                        local_gas_station
                      </span>
                      {result.fuelType || 'N/A'}
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </section>
      ) : (
        !isLoading && hasSearched && (
          <div className="w-full text-center p-8 bg-gray-50 rounded-lg mt-8">
            <p className="text-lg text-gray-600">No vehicles found matching your criteria</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your search filters</p>
          </div>
        )
      )}
    </div>
  );
};

export default Search;
