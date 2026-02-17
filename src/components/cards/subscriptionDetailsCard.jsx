import { useState, useEffect } from 'react';
import { axiosPrivate } from '../../api/axios';
import useAuth from '../../hooks/useAuth';

export default function SubscriptionDetailsCard() {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { auth } = useAuth();

    useEffect(() => {
        const fetchSubscription = async () => {
            if (!auth?.id) {
                setLoading(false);
                return;
            }

            try {
                const { data } = await axiosPrivate.get(`/api/subscriptions/${auth.id}`);
                console.log('Subscription data:', data);
                setSubscription(data.subscriptions && data.subscriptions.length > 0 ? data.subscriptions[0] : null);
            } catch (err) {
                // If 404, no subscription exists
                if (err.response && err.response.status === 404) {
                    setSubscription(null);
                } else {
                    setError('Failed to load subscription details');
                    console.error('Subscription fetch error:', err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, [auth?.id]);

    // Format the date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Determine status and display details
    const getSubscriptionStatus = () => {
        if (!auth) return { status: 'Not logged in', tier: 'None', isSeller: false, isPaid: false };
        
        // Check if user is a seller (role 3)
        const isSeller = auth.roles === 3;
        
        // If no subscription or loading/error, determine based on role
        if (loading) return { status: 'Loading...', tier: '...', isSeller, isPaid: false };
        if (error) return { status: 'Error loading details', tier: 'Unknown', isSeller, isPaid: false };
        if (!subscription) {
            return {
                status: isSeller ? 'Free Seller Account' : 'Free User Account',
                tier: 'Free',
                isSeller,
                isPaid: false
            };
        }

        // If we have subscription data
        return {
            status: subscription.status || 'Active',
            tier: subscription.planName || 'Standard',
            isSeller,
            isPaid: true,
            expiryDate: subscription.endDate ? formatDate(subscription.endDate) : 'N/A'
        };
    };

    const { status, tier, isSeller, isPaid, expiryDate } = getSubscriptionStatus();

    return (
        <div className='p-4 bg-neutral-50 rounded-md flex flex-col gap-2'>
            <h2 className='text-lg font-medium text-neutral-950'>Subscription Details</h2>
            
            {loading ? (
                <p className='text-sm text-neutral-600'>Loading subscription details...</p>
            ) : (
                <>
                    <div className="flex items-center gap-2">
                        <p className='text-sm text-neutral-600'>Status:</p>
                        <span className={`text-sm px-2 py-0.5 rounded ${
                            isPaid ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                            {status}
                        </span>
                    </div>
                    <p className='text-sm text-neutral-600'>
                        Plan: <span className="font-medium">{tier} {isSeller ? 'Seller' : 'User'}</span>
                    </p>
                    {isPaid && expiryDate && (
                        <p className='text-sm text-neutral-600'>
                            <span className="font-medium">Expires:</span> {expiryDate}
                        </p>
                    )}
                    {!isPaid && isSeller && (
                        <p className='text-sm text-amber-600'>
                            Upgrade to a paid plan to unlock more features!
                        </p>
                    )}
                </>
            )}
        </div>
    );
}