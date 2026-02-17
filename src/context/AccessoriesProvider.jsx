import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { axiosPrivate } from "../api/axios";

const AccessoriesContext = createContext();

export const useAccessoriesContext = () => {
    return useContext(AccessoriesContext);
};

export const AccessoriesProvider = ({ children }) => {
    const [accessories, setAccessories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        name: '',
        category: '',
        condition: '',
        location: '',
        priceMin: '',
        priceMax: '',
        stock: '',
        search: '',
    });

    // Fetch accessories when component mounts
    useEffect(() => {
        const getAccessories = async () => {
            setIsLoading(true);
            try {
                const response = await axiosPrivate.get('/api/accessories', {
                    params: filters
                });
                const fetchedAccessories = response.data;
                setAccessories(fetchedAccessories);
            } catch (err) {
                console.error('Error fetching accessories:', err);
            } finally {
                setIsLoading(false);
            }
        };
        getAccessories();
    }, [axiosPrivate, filters]);

    // Fetch accessories for a specific seller (for dashboard, includes inactive)
    const fetchSellerAccessories = useCallback(async (sellerId) => {
        try {
            const response = await axiosPrivate.get(`/api/accessories/seller/${sellerId}`);
            const accessoriesData = response.data || [];
            // Don't update global state here - let the component handle it
            return accessoriesData;
        } catch (error) {
            console.error('Error fetching seller accessories:', error);
            return [];
        }
    }, [axiosPrivate]);

    // Group products by category
    // const categorizedProducts = useMemo(() => {
    //     console.log('This is the products:', products);
    //     // Ensure products is an array
    //     const safeProducts = Array.isArray(products) ? products : [];
        
    //     // Initialize object with all categories
    //     const categorized = {};
        
    //     // Populate categories by category field
    //     safeProducts.forEach(product => {
    //         if (!product.category) return;
            
    //         const category = product.category;
    //         if (!categorized[category]) {
    //             categorized[category] = [];
    //         }
    //         categorized[category].push(product);
    //     });
        
    //     return categorized;
    // }, [products]);
    
    // Get top categories with most products, limited to a certain count
    // const getTopCategories = useMemo(() => (count = 4) => {
    //     const categoriesWithCount = Object.entries(categorizedProducts)
    //         .map(([category, products]) => ({
    //             category,
    //             count: products.length
    //         }))
    //         .sort((a, b) => b.count - a.count)
    //         .slice(0, count);
            
    //     const result = {};
    //     categoriesWithCount.forEach(({ category }) => {
    //         result[category] = categorizedProducts[category];
    //     });
        
    //     return result;
    // }, [categorizedProducts]);

    return (
        <AccessoriesContext.Provider value={{ 
            accessories, 
            setAccessories, 
            filters, 
            setFilters,
            // categorizedProducts,
            // getTopCategories,
            isLoading,
            fetchSellerAccessories
        }}>
            {children}
        </AccessoriesContext.Provider>
    );
};
