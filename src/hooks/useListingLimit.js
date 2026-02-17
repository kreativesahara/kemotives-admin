import { useState, useEffect } from 'react';
import useAxiosPrivate from '../api/useAxiosPrivate';

export const useListingLimit = (sellerId) => {
    const axiosPrivate = useAxiosPrivate();
    const [listingLimit, setListingLimit] = useState({
        planName: 'starter',
        maxListings: 10,
        currentListingsCount: 0,
        canCreateMore: true,
        isLoading: true,
        error: null
    });

    const fetchListingLimitStatus = async () => {
        try {
            setListingLimit(prev => ({ ...prev, isLoading: true }));
            
            const response = await axiosPrivate.get(`/api/product/listing-limit/${sellerId}`);
            
            setListingLimit({
                ...response.data.limitDetails,
                isLoading: false,
                error: null
            });
        } catch (error) {
            console.error('Error fetching listing limit:', error);
            setListingLimit(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch listing limit'
            }));
        }
    };

    useEffect(() => {
        if (sellerId) {
            fetchListingLimitStatus();
        }
    }, [sellerId]);

    return {
        ...listingLimit,
        refetch: fetchListingLimitStatus
    };
};

// Utility function to get limit details for a specific plan
export const getPlanListingLimit = (planName) => {
    const PLAN_LIMITS = {
        'starter': 10,
        'basic': 25,
        'growth': 50,
        'enterprise': 100,
        'custom': Infinity
    };

    return PLAN_LIMITS[planName.toLowerCase()] || 10;
}; 