import React, { createContext, useContext, useState } from 'react';

// Create the context
const SearchAccessoriesContext = createContext();

export const useSearch = () => {
    const context = useContext(SearchAccessoriesContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchAccessoriesProvider');
    }
    return context;
};

// Create the provider component
export const SearchAccessoriesProvider = ({ children }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [condition, setCondition] = useState('');
    const [location, setLocation] = useState('');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [stock, setStock] = useState('');

    // State object to be shared across components
    const searchState = {
        name,
        setName,
        category,
        setCategory,
        condition,
        setCondition,
        location,
        setLocation,
        priceMin,
        setPriceMin,
        priceMax,
        setPriceMax,
        stock,
        setStock,
    };

    return (
        <SearchAccessoriesContext.Provider value={searchState}>
            {children}
        </SearchAccessoriesContext.Provider>
    );
};

// Custom hook for consuming the context

