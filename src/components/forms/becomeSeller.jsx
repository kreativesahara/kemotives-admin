import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import useAxiosPrivate from '../../api/useAxiosPrivate';
import useAuth from '../../hooks/useAuth';
import Layout from "../Layout";
import { getPendingSubscription, processSubscriptionPayment, clearPendingSubscription } from '../../utils/subscriptionHandler';
import PaymentModal from '../payment/PaymentModal';
import { showWarning, showSuccess, showInfo, showError } from "../../utils/sweetAlert";

const BecomeSeller = () => {
    const axiosPrivate = useAxiosPrivate();
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [values, setValues] = useState({
        username: '',
        accountType: '',
        contact: '',
        place: '',
        acceptsTradeIn: '',
        hasFinancing: '',
        userId: auth?.id 
    });
    const [contactError, setContactError] = useState('');

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [pendingSubscription, setPendingSubscription] = useState(null);
    const [isExistingSeller, setIsExistingSeller] = useState(false);
    const [sellerData, setSellerData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Check if user is logged in
    useEffect(() => {
        if (!auth?.id) {
            showWarning('Please login to continue');
            navigate('/login');
        }
    }, [auth, navigate]);

    // Check if user is already a seller
    useEffect(() => {
        const checkSellerStatus = async () => {
            if (!auth?.id) {
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            setApiError(null);
            
            try {
                // Get seller profile
                const response = await axiosPrivate.get(`/api/sellers/${auth.id}`);
                
                if (response.data) {
                    setIsExistingSeller(true);
                    setSellerData(response.data);
                    
                    // Prefill form with existing data
                    const existingContact = response.data.contact || '';
                    // Remove 254 prefix if it exists for display
                    const formattedContact = existingContact.startsWith('254') 
                        ? existingContact.substring(3) 
                        : existingContact;
                    
                    setValues({
                        username: response.data.username || '',
                        accountType: response.data.accountType || '',
                        contact: formattedContact,
                        place: response.data.place || '',
                        acceptsTradeIn: response.data.acceptsTradeIn || '',
                        hasFinancing: response.data.hasFinancing || '',
                        userId: auth.id
                    });
                } else {
                    setIsExistingSeller(false);
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    // No seller found - this is expected for new sellers
                    setIsExistingSeller(false);
                } else {
                console.error("Error checking seller status:", error);
                    setApiError("Error checking seller status. Please try again.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkSellerStatus();
    }, [auth, axiosPrivate]);

    // Check for subscription data on component mount
    useEffect(() => {
        // Get subscription data from localStorage
        const subscription = getPendingSubscription();
        if (subscription) {
            setPendingSubscription(subscription);
            
            // If there's a paid plan and seller already exists, show payment UI immediately
            if (isExistingSeller && subscription.plan?.paymentRequired) {
                setShowPaymentModal(true);
            }
        } else {
            // No subscription data in localStorage - redirect to pricing
            navigate('/become-seller');
        }
        
        // Prefill form data if user info is available and not already a seller
        if (auth && !isExistingSeller) {
            const phoneNumber = auth.phoneNumber || '';
            // Remove 254 prefix if it exists for display
            const formattedContact = phoneNumber.startsWith('254') 
                ? phoneNumber.substring(3) 
                : phoneNumber;
            
            setValues(prev => ({
                ...prev,
                userId: auth.id || '',
                contact: formattedContact,
                username: auth.firstName && auth.lastName ? 
                    `${auth.firstName} ${auth.lastName}` : prev.username
            }));
        }
    }, [auth, isExistingSeller, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle contact number input with validation
    const handleContactChange = (e) => {
        const { value } = e.target;        
        // Only allow digits and limit length
        // Kenyan phone numbers are typically 9 digits after the country code
        const numbersOnly = value.replace(/\D/g, '');        
        if (numbersOnly.length > 9 || numbersOnly.length < 9) {
            setContactError('Phone number should be 9 digits after country code');
        } else {
            setContactError('');
        }        
        setValues(prev => ({
            ...prev,
            contact: numbersOnly
        }));
    };

    // Handle toggle change for boolean fields
    const handleToggleChange = (name) => {
        setValues((prev) => ({
            ...prev,
            [name]: prev[name] === 'yes' ? 'no' : 'yes'
        }));
    };

    // Remove image by clearing the state
    const removeImage = () => {
        setImage(null);
        setPreview('');
    };

    // Handle image change with compression for a single image
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 400,
            useWebWorker: true,
        };
        try {
            const compressedFile = await imageCompression(file, options);
            setImage(compressedFile);
            setPreview(URL.createObjectURL(compressedFile));
        } catch (error) {
            console.error('Error while compressing image:', error);
            // If compression fails, use the original file
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
        // Reset the input value so the same file can be re-selected if needed
        e.target.value = null;
    };

    const cancelPendingSubscription = () => {
        // Clear the pending subscription from localStorage
        clearPendingSubscription();
        // Update the state
        setPendingSubscription(null);
        // Navigate to pricing page or show a confirmation
        showInfo('Your plan selection has been cancelled.');
        navigate('/pricing');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!auth?.id) {
            showWarning('You need to be logged in to become a seller.');
            navigate('/login');
            return;
        }

        if (contactError) {
            setApiError("Please fix the errors in the contact number field.");
            return;
        }

        setIsProcessing(true);
        setApiError(null);
        
        // If the user is already a seller, just process the payment
        if (isExistingSeller && sellerData) {
            await handlePaymentProcess();
            return;
        }
        
        // Create new seller profile
        const form = new FormData();
        
        // Add form values to FormData, prefix contact with 254
        Object.entries(values).forEach(([key, value]) => {
            if (key === 'contact') {
                form.append(key, `254${value}`);
            } else {
                form.append(key, value);
            }
        });
        
        if (image) {
            form.append('image', image); // Append the image file
        } else {
            setApiError("Please upload a profile or business image");
            setIsProcessing(false);
            return;
        }

        try {
            // Create seller profile
            const response = await axiosPrivate.post('/api/sellers', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });

            console.log("Seller profile created:", response.data);
            
            // Now process payment or activate the free subscription
            await handlePaymentProcess();
            
        } catch (error) {
            console.error("Error creating seller profile:", error.response?.data || error.message);
            setApiError(error.response?.data?.message || "Failed to create seller profile. Please try again.");
            setIsProcessing(false);
        }
    };
    
    const handlePaymentProcess = async () => {
        const subscriptionPlan = pendingSubscription?.plan;
        if (!subscriptionPlan) {
            setApiError("No subscription plan selected. Please go back to pricing page.");
            setIsProcessing(false);
            navigate('/pricing');
            return;
        }
        
        // Build user details object
        const userDetails = {
            id: auth.id,
            firstName: auth.firstName || '',
            lastName: auth.lastName || '',
            email: auth.email || '',
            phoneNumber: `254${values.contact}` // Add prefix to phone number
        };
        
        try {
            // Process subscription and payment
            const paymentResponse = await processSubscriptionPayment(
                pendingSubscription, 
                userDetails,
                axiosPrivate
            );
            
            // If this is a free plan, just show success
            if (!subscriptionPlan.paymentRequired) {
                showSuccess('Your seller account has been activated with a free plan!');
                navigate('/dashboard');
                return;
            }
            
            // If payment successful immediately
            if (paymentResponse.success) {
                showSuccess('Your subscription has been activated successfully!');
                navigate('/dashboard');
                return;
            }
            
            // If payment is pending and needs user action
            if (paymentResponse.payment?.status === 'pending') {
                setShowPaymentModal(true);
            if (paymentResponse.redirectUrl) {
                    // For external payment methods that require redirect
                window.location.href = paymentResponse.redirectUrl;
                    return;
                }
                // For methods that stay on-page (like MPesa)
                return;
            }
            
            // Default success case
            showInfo('Your seller account is being processed. You will be notified when it is active.');
            navigate('/dashboard');
            
        } catch (error) {
            console.error('Payment processing error:', error);
            setApiError("Payment processing error: " + (error.message || "Unknown error"));
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handlePaymentSuccess = () => {
        showSuccess('Payment verified successfully! Your seller account is now active.');
            navigate('/dashboard');
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                </div>
            </Layout>
        );
    }

    // Render payment modal when needed
    if (showPaymentModal) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto p-6">
                    <PaymentModal
                        subscription={pendingSubscription}
                        onClose={() => setShowPaymentModal(false)}
                        onSuccess={handlePaymentSuccess}
                    />
                </div>
            </Layout>
        );
    }

    // Normal seller form
    return (
        <Layout>
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">
                    {isExistingSeller ? 'Update Your Seller Profile' : 'Complete Your Seller Profile'}
                    </h1>
                    
                {pendingSubscription?.plan && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <p className="font-semibold">Selected Plan: {pendingSubscription.plan.tier}</p>
                        <p>Price: {pendingSubscription.plan.price}</p>
                        <button 
                            onClick={cancelPendingSubscription}
                            className="text-blue-600 hover:underline mt-2"
                        >
                            Change Plan
                        </button>
                        </div>
                    )}
                    
                {apiError && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                        {apiError}
                        </div>
                    )}
                    
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                    {/* Form fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 mb-2">Business/Seller Name*</label>
                            <input
                                type="text"
                                name="username"
                                value={values.username}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-gray-700 mb-2">Account Type</label>
                            <select
                                name="accountType"
                                value={values.accountType}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="">--Select Type--</option>
                                <option value="Individual">Individual Seller</option>
                                <option value="Dealership">Car Dealership</option>
                                <option value="BrokerAgent">Broker/Agent</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-gray-700 mb-2">Contact Number*</label>
                            <div className="flex">
                                <div className="flex items-center justify-center bg-gray-100 px-3 py-2 border border-r-0 rounded-l-lg">
                                    <span className="text-gray-700 font-medium">254</span>
                                </div>
                                <input
                                    type="text"
                                    name="contact"
                                    value={values.contact}
                                    onChange={handleContactChange}
                                    className={`flex-1 px-3 py-2 border rounded-r-lg ${contactError ? 'border-red-500' : ''}`}
                                    placeholder="711223344"
                                    maxLength={9}
                                    required
                                />
                            </div>
                            {contactError && (
                                <p className="text-red-500 text-sm mt-1">{contactError}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">
                                Enter 9 digits without the country code (e.g., 711223344)
                            </p>
                        </div>
                        
                        <div>
                            <label className="block text-gray-700 mb-2">Location*</label>
                            <input
                                type="text"
                                name="place"
                                value={values.place}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg"
                                required
                            />
                        </div>
                    </div>

                    {/* Services Section - Financing and Trade-In toggles */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Services Offered</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Financing Toggle */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-gray-800">Financing Available</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Indicate if you offer financing options to buyers
                                        </p>
                                    </div>
                                    <div 
                                        onClick={() => handleToggleChange('hasFinancing')}
                                        className={`relative inline-flex h-6 w-12 cursor-pointer rounded-full transition-colors ${values.hasFinancing === 'yes' ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <span 
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${values.hasFinancing === 'yes' ? 'translate-x-6' : 'translate-x-0'}`}
                                        />
                                    </div>
                                </div>
                                {values.hasFinancing === 'yes' && (
                                    <div className="mt-3 text-sm text-green-600">
                                        ✓ Your listings will be marked as financing available
                                    </div>
                                )}
                            </div>

                            {/* Trade-In Toggle */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-gray-800">Accept Trade-Ins</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Indicate if you accept vehicle trade-ins
                                        </p>
                                    </div>
                                    <div 
                                        onClick={() => handleToggleChange('acceptsTradeIn')}
                                        className={`relative inline-flex h-6 w-12 cursor-pointer rounded-full transition-colors ${values.acceptsTradeIn === 'yes' ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <span 
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${values.acceptsTradeIn === 'yes' ? 'translate-x-6' : 'translate-x-0'}`}
                                        />
                                    </div>
                                </div>
                                {values.acceptsTradeIn === 'yes' && (
                                    <div className="mt-3 text-sm text-green-600">
                                        ✓ Your listings will be marked as accepting trade-ins
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Image upload */}
                    <div className="mt-8">
                        <label className="block text-gray-700 mb-2">Profile/Business Image*</label>
                        <div className="flex flex-col md:flex-row items-start gap-4">
                            {preview ? (
                                <div className="relative">
                                        <img
                                            title={`Viewing ${formData.title}`}
                                            src={preview}
                                            alt="Preview"
                                        className="w-40 h-40 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                        >
                                        ✕
                                        </button>
                                    </div>
                            ) : (
                                <div className="w-40 h-40 border-2 border-dashed flex items-center justify-center rounded-lg">
                                    <span className="text-gray-400">No image</span>
                                    </div>
                                )}
                            
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Max file size: 5MB. Supported formats: JPEG, PNG
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Submit button */}
                    <div className="mt-8">
                            <button
                                type="submit"
                                disabled={isProcessing || !!contactError}
                            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
                            >
                            {isProcessing ? 'Processing...' : (isExistingSeller ? 'Update Profile' : 'Complete Registration')}
                            </button>
                    </div>
                        </form>
            </div>
        </Layout>
    );
};

export default BecomeSeller;
