import { createContext, useState, useContext, useMemo, useCallback } from "react";
import { axiosPrivate } from "../api/axios";
import carCategories from "../data/carCategories";
import { dummyCarData } from "../data/dummyCarData";

const ProductContext = createContext();

export const useProductContext = () => {
    return useContext(ProductContext);
};

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        make: ''|'toyota',
        model: '',
        yearFrom: '',
        yearTo: '',
        priceMin: '',
        priceMax: '',
        fuelType: '',
        transmission: '',
        mileageRange: '',
        images: [],
        location: '',
        condition: '',
        features: [],
        category: ''
    });

    // Fetch products when filters change - this will now only return active products
    useMemo(() => {
        const getProducts = async () => {
            setIsLoading(true);
            try {
                const response = await axiosPrivate.get('/api/publicproducts', {
                    params: filters 
                });
                // Use API data if available, otherwise use dummy data
                const fetchedProducts = response.data.length > 0 ? response.data : dummyCarData;
                setProducts(fetchedProducts);
            } catch (error) {    
                console.error('Error fetching products:', error);
                // Use dummy data in case of API error
                setProducts(dummyCarData);
                console.log('Loaded dummy car data');              
            } finally {
                setIsLoading(false);
            }
        };
        getProducts();
        const controller = new AbortController();
        return () => controller.abort();
    }, [axiosPrivate, filters]); 

    // Fetch products for a specific seller (for dashboard, includes inactive)
    const fetchSellerProducts = useCallback(async (sellerId) => {
        try {
            const response = await axiosPrivate.get(`/api/product/seller/${sellerId}`);
            return response.data.length > 0 ? response.data : dummyCarData;
        } catch (error) {
            console.error('Error fetching seller products:', error);
            return dummyCarData;
        }
    }, [axiosPrivate]);

    // Group products by category
    const categorizedProducts = useMemo(() => {
        // Ensure products is an array
        const safeProducts = Array.isArray(products) ? products : [];
        
        // Initialize object with all categories
        const categorized = {};
        
        // Populate categories by category field
        safeProducts.forEach(product => {
            if (!product.category) return;
            
            const category = product.category;
            if (!categorized[category]) {
                categorized[category] = [];
            }
            categorized[category].push(product);
        });
        
        return categorized;
    }, [products]);
    
    // Get top categories with most products, limited to a certain count
    const getTopCategories = useMemo(() => (count = 4) => {
        const categoriesWithCount = Object.entries(categorizedProducts)
            .map(([category, products]) => ({
                category,
                count: products.length
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, count);
            
        const result = {};
        categoriesWithCount.forEach(({ category }) => {
            result[category] = categorizedProducts[category];
        });
        
        return result;
    }, [categorizedProducts]);

    return (
        <ProductContext.Provider value={{ 
            products, 
            setProducts, 
            filters, 
            setFilters,
            categorizedProducts,
            getTopCategories,
            isLoading,
            fetchSellerProducts
        }}>
            {children}
        </ProductContext.Provider>
    );
};
