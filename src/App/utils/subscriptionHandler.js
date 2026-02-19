/**
 * Handles subscription selection and processing
 * - For free plans: directly redirects to become-seller form
 * - For paid plans: stores subscription in localStorage and processes payment
 */
import { showWarning } from './sweetAlert';

export const handleSubscriptionSelection = (selectedPlan, navigate, auth) => {
    if (!selectedPlan) return;
    
    // Check if user is logged in
    if (!auth?.id) {
        showWarning('Please log in to subscribe');
        navigate('/login');
        return;
    }
    
    // Save plan selection to LocalStorage for both free and paid plans
    const subscriptionData = {
        plan: selectedPlan,
        timestamp: new Date().toISOString(),
        userId: auth?.id
    };
    
    localStorage.setItem('pendingSubscription', JSON.stringify(subscriptionData));
    
    // Both free and paid plans go to the same form
    // The form will handle different paths based on plan type
    navigate('/become-seller');
};

/**
 * Processes payment for a subscription
 */
export const processSubscriptionPayment = async (subscriptionDetails, userDetails, axiosPrivate) => {
    try {
        if (!subscriptionDetails?.plan) {
            throw new Error('Missing subscription plan details');
        }
        
        // Create subscription first
        const subscriptionResponse = await axiosPrivate.post('/api/subscriptions', {
            userId: userDetails.id,
            planName: subscriptionDetails.plan.tier,
            amount: subscriptionDetails.plan.value,
            currency: subscriptionDetails.plan.currency || 'KES',
            managedBy: subscriptionDetails.plan.subscriptionDetails?.managedBy || 'seller',
            autoRenewal: subscriptionDetails.plan.subscriptionDetails?.autoRenewal || true
        });
        
        // For free plans, we're done after creating the subscription
        if (!subscriptionDetails.plan.paymentRequired) {
            // Clear pending subscription from localStorage
            localStorage.removeItem('pendingSubscription');
            return { success: true };
        }
        
        // For paid plans, initiate payment
        const subscriptionId = subscriptionResponse.data?.subscription?.id;
        if (!subscriptionId) {
            throw new Error('Failed to create subscription');
        }
        
        // Prepare payment request with user details
        const paymentData = {
            userId: userDetails.id,
            subscriptionId,
            amount: subscriptionDetails.plan.value,
            currency: subscriptionDetails.plan.currency || 'KES',
            paymentMethod: 'mpesa', // Default to MPesa, can be made configurable
            customerName: `${userDetails.firstName} ${userDetails.lastName}`.trim(),
            customerPhone: userDetails.phoneNumber,
            customerEmail: userDetails.email
        };
        
        // Send payment request to backend
        const response = await axiosPrivate.post('/api/payments/initiate', paymentData);
        
        return response.data;
    } catch (error) {
        console.error('Payment processing error:', error);
        throw error;
    }
};

/**
 * Retrieves pending subscription from localStorage
 */
export const getPendingSubscription = () => {
    const pendingSubscription = localStorage.getItem('pendingSubscription');
    if (!pendingSubscription) return null;
    
    try {
        return JSON.parse(pendingSubscription);
    } catch (e) {
        console.error('Error parsing pending subscription:', e);
        localStorage.removeItem('pendingSubscription');
        return null;
    }
};

/**
 * Clears pending subscription from localStorage
 */
export const clearPendingSubscription = () => {
    localStorage.removeItem('pendingSubscription');
}; 