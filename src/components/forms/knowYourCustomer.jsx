import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthProvider';
import { axiosPrivate } from '../../api/axios';
import { useSellerContext } from '../../context/SellerProvider';
import Layout from '../Layout';
import { toast } from 'react-toastify';

const KnowYourCustomer = () => {
  const { auth } = useContext(AuthContext);
  const { sellers } = useSellerContext();
  const navigate = useNavigate();

  // Auth check and redirect if not logged in
  useEffect(() => {
    if (!auth || !auth.accessToken) {
      toast.error('You need to be logged in to access this page');
      navigate('/login');
    }
  }, [auth, navigate]);

  // Find the current user's seller record with comprehensive matching
  const findCurrentSeller = useCallback(() => {
    if (!auth?.id || !sellers?.length) return null;

    // Try direct match first (most common case)
    let match = sellers.find(s => s.userId === auth.id);

    // If no match found, try numeric comparison (handles string vs number type differences)
    if (!match) {
      match = sellers.find(s => Number(s.userId) === Number(auth.id));
    }

    return match;
  }, [auth, sellers]);

  // Get current seller based on the improved finder function
  const currentSeller = findCurrentSeller();

  // ----------------------
  // State Management
  // ----------------------
  const [formData, setFormData] = useState({
    sellerId: currentSeller?.id || '',
    fullName: '',
    kraPin: '',
    registrationDate: '',
    permitNumber: '',
    address: '',
    idDocumentUrl: '',
    selfieUrl: '',
    status: 'pending'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previews, setPreviews] = useState({
    idDocument: null,
    selfie: null
  });
  const [isWidgetActive, setIsWidgetActive] = useState(false);

  // Update formData when currentSeller changes
  useEffect(() => {
    if (currentSeller?.id) {
      setFormData(prev => ({
        ...prev,
        sellerId: currentSeller.id
      }));
    }
  }, [currentSeller]);

  // ----------------------
  // Cloudinary Integration
  // ----------------------
  const cloudinaryScriptLoaded = useRef(false);
  const widgetRef = useRef(null);

  // Load Cloudinary script once on mount
  useEffect(() => {
    if (!window.cloudinary && !cloudinaryScriptLoaded.current) {
      cloudinaryScriptLoaded.current = true;
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      script.onload = () => {
        cloudinaryScriptLoaded.current = true;
      };
      document.body.appendChild(script);
    }

    // Clean up any resources on unmount
    return () => {
      destroyWidget();
    };
  }, []);

  // Destroy widget helper function
  const destroyWidget = useCallback(() => {
    if (widgetRef.current) {
      try {
        widgetRef.current.destroy();
      } catch (e) {
        console.error('Error destroying widget:', e);
      }
      widgetRef.current = null;
    }

    setIsWidgetActive(false);

    // Ensure any stray DOM elements are removed
    setTimeout(() => {
      const overlays = document.querySelectorAll('.cloudinary-overlay');
      overlays.forEach(overlay => overlay.remove());

      const fadebackgrounds = document.querySelectorAll('.cloudinary-fadeout');
      fadebackgrounds.forEach(element => element.remove());
    }, 100);
  }, []);

  // Handler for opening the Cloudinary upload widget
  const openCloudinaryWidget = useCallback((type) => {
    if (!window.cloudinary) {
      toast.error('Upload widget is not available. Please try again later.');
      return;
    }

    // Destroy any existing widget first
    destroyWidget();

    // Set to active
    setIsWidgetActive(true);

    // Create a new widget
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        sources: ['camera'],
        multiple: false,
        singleUploadAutoClose: false,
        resourceType: 'image',
        acceptedFormats: ['jpg', 'jpeg', 'png'],
        styles: {
          palette: {
            window: '#FFFFFF', sourceBg: '#FFFFFF', windowBorder: '#000000',
            tabIcon: '#000000', inactiveTabIcon: '#999999', menuIcons: '#333333',
            link: '#0078FF', action: '#000000', inProgress: '#0078FF',
            complete: '#33ff00', error: '#EA2727', textDark: '#000000', textLight: '#FFFFFF'
          }
        }
      },
      (error, result) => {
        if (error) {
          toast.error('Upload error: ' + error.message);
          destroyWidget();
          return;
        }

        if (result?.event === 'success') {
          const imageUrl = result.info.secure_url;

          // Update form data and preview based on upload type
          if (type === 'id_document') {
            setFormData(prev => ({ ...prev, idDocumentUrl: imageUrl }));
            setPreviews(prev => ({ ...prev, idDocument: imageUrl }));
          } else {
            setFormData(prev => ({ ...prev, selfieUrl: imageUrl }));
            setPreviews(prev => ({ ...prev, selfie: imageUrl }));
          }

          // Close widget after successful upload
          widget.close();

          // Clean up
          setTimeout(destroyWidget, 200);
        }

        if (result?.event === 'close') {
          // Schedule destruction to happen after the close animation
          setTimeout(destroyWidget, 200);
        }
      }
    );

    // Store widget reference
    widgetRef.current = widget;

    // Set up widget
    widget.update({ tags: [type] });

    // Open widget
    widget.open();
  }, [destroyWidget]);

  // ----------------------
  // Form Handlers
  // ----------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const clearImage = useCallback((type) => {
    if (type === 'id_document') {
      setFormData(prev => ({ ...prev, idDocumentUrl: '' }));
      setPreviews(prev => ({ ...prev, idDocument: null }));
    } else if (type === 'selfie') {
      setFormData(prev => ({ ...prev, selfieUrl: '' }));
      setPreviews(prev => ({ ...prev, selfie: null }));
    }
  }, []);

  const validateForm = useCallback(() => {
    // Widget check
    if (isWidgetActive) {
      toast.error('Please complete or cancel the current upload before submitting');
      return false;
    }

    // Seller check - make sure we have a seller ID
    if (!currentSeller?.id && !formData.sellerId) {
      toast.error('Your seller profile could not be found. Please contact support.');
      return false;
    }

    // In development, allow submission with minimal fields for testing
    if (import.meta.env.DEV) {
      if (!formData.fullName.trim()) {
        toast.error('Please enter your full name');
        return false;
      }
      return true;
    }

    // Production validation - all fields required
    const requiredFields = [
      { field: 'fullName', message: 'Please enter your full name' },
      { field: 'kraPin', message: 'Please enter your KRA PIN' },
      { field: 'registrationDate', message: 'Please enter the registration date' },
      { field: 'permitNumber', message: 'Please enter your permit number' },
      { field: 'address', message: 'Please enter your address' },
      { field: 'idDocumentUrl', message: 'Please upload your ID document' },
      { field: 'selfieUrl', message: 'Please upload your selfie' }
    ];

    for (const { field, message } of requiredFields) {
      if (!formData[field]) {
        toast.error(message);
        return false;
      }
    }

    return true;
  }, [formData, isWidgetActive, currentSeller]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Auth check
    if (!auth?.id) {
      toast.error('Authentication error. Please log in again.');
      navigate('/login');
      return;
    }

    if (!validateForm()) return;

    // Ensure form data includes the seller ID
    const submissionData = {
      ...formData,
      sellerId: currentSeller?.id || formData.sellerId // Use currentSeller.id if available
    };

    // Ensure no active widget before submitting
    destroyWidget();

    setIsSubmitting(true);

    try {
      const response = await axiosPrivate.post('/api/kyc/submit', submissionData);

      if (response.status === 201) {
        toast.success('KYC information submitted successfully');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        toast.error(response.data.message || 'Failed to submit KYC information');
      }
    } catch (err) {
      console.error('Error submitting KYC:', err);
      toast.error(err.response?.data?.message || 'Failed to submit KYC information. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render an upload area (reusable component)
  const renderUploadArea = useCallback((type, title, description, icon) => {
    const isIdDocument = type === 'id_document';
    const previewKey = isIdDocument ? 'idDocument' : 'selfie';

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {title}
        </label>

        {!previews[previewKey] ? (
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors border-gray-300 hover:border-gray-400"
            onClick={() => openCloudinaryWidget(type)}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path>
              </svg>
              <p className="text-sm text-gray-500">
                Click to upload {title.toLowerCase()}
              </p>
              <p className="text-xs text-gray-400">
                Supports: JPG, PNG images only
              </p>
            </div>
          </div>
        ) : (
          <div className="relative border rounded-lg overflow-hidden">
            <img
              title="Preview"
              src={previews[previewKey]}
              alt={`${title} Preview`}
              className="w-full h-48 object-contain"
            />
            <button
              type="button"
              onClick={() => clearImage(type)}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}

        <p className="mt-2 text-xs text-gray-500">{description}</p>
      </div>
    );
  }, [previews, openCloudinaryWidget, clearImage]);

  // ----------------------
  // Component Render
  // ----------------------
  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Seller Verification</h1>
        <p className="mb-6 text-gray-600 text-center">
          Please provide the following information to verify your identity as a seller.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name / Business Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="kraPin" className="block text-sm font-medium text-gray-700 mb-1">
                Personal / Business KRA PIN
              </label>
              <input
                type="text"
                id="kraPin"
                name="kraPin"
                value={formData.kraPin}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth / Business Registration Date
              </label>
              <input
                type="date"
                id="registrationDate"
                name="registrationDate"
                value={formData.registrationDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="permitNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Permit Number
              </label>
              <input
                type="text"
                id="permitNumber"
                name="permitNumber"
                value={formData.permitNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Physical / Business Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          {/* Document Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderUploadArea(
              'id_document',
              'ID Document Upload',
              'Upload a clear photo of your ID card, passport, or driver\'s license',
              'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
            )}

            {renderUploadArea(
              'selfie',
              'Selfie (for face match)',
              'Take a clear photo of your face for identity verification',
              'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-8">
            <button
              type="submit"
              disabled={isSubmitting || isWidgetActive}
              className="px-6 py-3 bg-black text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            Your information will be securely stored and reviewed by our team.
            <br />
            Verification status will be updated on your dashboard.
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default KnowYourCustomer;


