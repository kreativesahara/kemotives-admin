import React, { createContext, useContext, useState } from 'react';

// Create the context
const SearchContext = createContext();

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};

// Create the provider component
export const SearchProvider = ({ children }) => {
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [location, setLocation] = useState('');
    const [condition, setCondition] = useState('');
    const [fuelType, setFuelType] = useState('');
    const [transmission, setTransmission] = useState('');
    const [driveSystem, setDriveSystem] = useState('');

    // State object to be shared across components
    const searchState = {
        make,
        setMake,
        model,
        setModel,
        year,
        setYear,
        priceMin,
        setPriceMin,
        priceMax,
        setPriceMax,
        location,
        setLocation,
        condition,
        setCondition,
    };

    return (
        <SearchContext.Provider value={searchState}>
            {children}
        </SearchContext.Provider>
    );
};

// Custom hook for consuming the context

