import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearPendingSubscription } from '../../utils/subscriptionHandler';
import useAxiosPrivate from '../../api/useAxiosPrivate';

const PaymentModal = ({ 
    subscription, 
    onClose, 
    onSuccess,
    paymentMethods = ['mpesa', 'stripe', 'paypal']
}) => {
    const [transactionId, setTransactionId] = useState('');
    const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0] || 'mpesa');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();
    
    if (!subscription?.plan) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">Error</h2>
                    <p>No subscription plan selected.</p>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => navigate('/pricing')}
                            className="px-4 py-2 bg-black text-white rounded-lg"
                        >
                            Go to Pricing
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    const handleVerifyPayment = async () => {
        if (!transactionId.trim()) {
            setError('Please enter a transaction ID');
            return;
        }
        
        setIsProcessing(true);
        setError(null);
        
        try {
            const response = await axiosPrivate.post('/api/payments/verify', {
                txnId: transactionId,
                paymentMethod: selectedMethod
            });
            
            if (response.data.status === 'successful') {
                clearPendingSubscription();
                if (onSuccess) {
                    onSuccess();
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError('Payment verification failed. Please check your transaction ID.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify payment. Please try again.');
            console.error('Payment verification error:', err);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleCancel = () => {
        if (onClose) {
            onClose();
        } else {
            navigate('/pricing');
        }
    };
    
    const getPaymentInstructions = () => {
        switch (selectedMethod) {
            case 'mpesa':
                return (
                    <div>
                        <p className="font-medium">MPesa Payment Instructions:</p>
                        <ul className="list-disc pl-6 mt-2">
                            <li>Send payment to Till Number: <span className="font-medium">123456</span></li>
                            <li>Amount: <span className="font-medium">{subscription.plan.price}</span></li>
                            <li>Enter your phone number as the reference</li>
                            <li>Once payment is complete, enter the MPesa transaction ID below</li>
                            <li className="text-sm text-gray-600 mt-2">Note: Your subscription will be valid for 30 days</li>
                        </ul>
                    </div>
                );
                
            case 'stripe':
                return (
                    <div>
                        <p className="font-medium">Card Payment:</p>
                        <p className="mt-2">Click the button below to complete payment with your credit/debit card.</p>
                        <button 
                            onClick={() => window.open('/api/payments/stripe-redirect', '_blank')}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
                        >
                            Pay with Card
                        </button>
                    </div>
                );
                
            case 'paypal':
                return (
                    <div>
                        <p className="font-medium">PayPal Payment:</p>
                        <p className="mt-2">Click the button below to complete payment with PayPal.</p>
                        <button 
                            onClick={() => window.open('/api/payments/paypal-redirect', '_blank')}
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
                        >
                            Pay with PayPal
                        </button>
                    </div>
                );
                
            default:
                return <p>Select a payment method to continue.</p>;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Complete Your Payment</h2>
                
                <div className="mb-6">
                    <p className="text-lg font-medium">{subscription.plan.tier} Plan</p>
                    <p className="text-gray-600">{subscription.plan.price}</p>
                </div>
                
                {paymentMethods.length > 1 && (
                    <div className="mb-6">
                        <p className="font-medium mb-2">Select Payment Method:</p>
                        <div className="flex gap-2">
                            {paymentMethods.includes('mpesa') && (
                                <button
                                    onClick={() => setSelectedMethod('mpesa')}
                                    className={`px-4 py-2 rounded ${
                                        selectedMethod === 'mpesa' 
                                            ? 'bg-green-600 text-white' 
                                            : 'bg-gray-200'
                                    }`}
                                >
                                    MPesa
                                </button>
                            )}
                            {paymentMethods.includes('stripe') && (
                                <button
                                    onClick={() => setSelectedMethod('stripe')}
                                    className={`px-4 py-2 rounded ${
                                        selectedMethod === 'stripe' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-200'
                                    }`}
                                >
                                    Card
                                </button>
                            )}
                            {paymentMethods.includes('paypal') && (
                                <button
                                    onClick={() => setSelectedMethod('paypal')}
                                    className={`px-4 py-2 rounded ${
                                        selectedMethod === 'paypal' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-200'
                                    }`}
                                >
                                    PayPal
                                </button>
                            )}
                        </div>
                    </div>
                )}
                
                <div className="mb-6">
                    {getPaymentInstructions()}
                </div>
                
                {selectedMethod === 'mpesa' && (
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Transaction ID</label>
                        <input 
                            type="text" 
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Enter MPesa Transaction ID"
                        />
                    </div>
                )}
                
                {error && (
                    <div className="mb-4 text-red-500">{error}</div>
                )}
                
                <div className="mt-6 flex justify-between">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                        disabled={isProcessing}
                    >
                        Cancel
                    </button>
                    
                    {selectedMethod === 'mpesa' && (
                        <button
                            onClick={handleVerifyPayment}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Verifying...' : 'Verify Payment'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal; 