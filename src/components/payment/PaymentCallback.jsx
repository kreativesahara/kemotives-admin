import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../../api/useAxiosPrivate';
import useAuth from '../../hooks/useAuth';
import Layout from '../Layout';
import { clearPendingSubscription } from '../../utils/subscriptionHandler';

const PaymentCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();
    const { auth } = useAuth();
    const [status, setStatus] = useState({
        loading: true,
        success: false,
        message: 'Verifying payment status...'
    });

    useEffect(() => {
        const verifyPayment = async () => {
            // Get query parameters
            const queryParams = new URLSearchParams(location.search);
            const txnId = queryParams.get('transaction_id') || queryParams.get('txn_id');
            const paymentMethod = queryParams.get('payment_method') || 'stripe'; // Default to stripe if not provided
            const success = queryParams.get('success');

            if (!txnId) {
                setStatus({
                    loading: false,
                    success: false,
                    message: 'Invalid payment information. No transaction ID found.'
                });
                return;
            }

            try {
                // Verify payment with backend
                const response = await axiosPrivate.post('/api/payments/verify', {
                    txnId,
                    paymentMethod,
                    success: success === 'true'
                });

                if (response.data.status === 'successful') {
                    // Clear any pending subscription in localStorage
                    clearPendingSubscription();
                    
                    setStatus({
                        loading: false,
                        success: true,
                        message: 'Payment successfully verified! Your subscription is now active.'
                    });
                    
                    // Auto-redirect after 3 seconds
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 3000);
                } else {
                    setStatus({
                        loading: false,
                        success: false,
                        message: response.data.message || 'Payment verification failed. Please try again or contact support.'
                    });
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                setStatus({
                    loading: false,
                    success: false,
                    message: error.response?.data?.message || 'Error processing payment verification. Please contact support.'
                });
            }
        };

        verifyPayment();
    }, [axiosPrivate, location.search, navigate, auth?.id]);

    return (
        <Layout>
            <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-16 px-4">
                <div className="max-w-lg mx-auto bg-white rounded-xl p-8 shadow-lg text-center">
                    {status.loading ? (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mb-4"></div>
                            <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
                            <p className="text-gray-600">{status.message}</p>
                        </div>
                    ) : status.success ? (
                        <div className="flex flex-col items-center">
                            <div className="bg-green-100 text-green-800 p-3 rounded-full mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-4 text-green-700">Payment Successful!</h2>
                            <p className="text-gray-700 mb-6">{status.message}</p>
                            <p className="text-gray-500 mb-6">Redirecting to dashboard in a few seconds...</p>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="bg-red-100 text-red-800 p-3 rounded-full mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-4 text-red-700">Payment Failed</h2>
                            <p className="text-gray-700 mb-6">{status.message}</p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => navigate('/pricing')}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default PaymentCallback; 