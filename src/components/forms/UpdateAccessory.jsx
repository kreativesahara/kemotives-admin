import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useAxiosPrivate from '../../api/useAxiosPrivate';
import imageCompression from 'browser-image-compression';
import useAuth from '../../hooks/useAuth';
import accessoryCategories from '../../data/accessoryCategorie';
import Layout from '../Layout';
import { showWarning, showSuccess, showError } from "../../utils/sweetAlert";
import { useAccessoriesContext } from '../../context/AccessoriesProvider'; // Add this import

function UpdateAccessory() {
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams(); // Get accessory ID from URL
  const { auth } = useAuth();
  const { accessories } = useAccessoriesContext(); // Use accessories context
  const from = location.state?.from?.pathname || "/dashboard";

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessory, setAccessory] = useState(null);

 
  const [values, setValues] = useState({
    name: '',
    description: '',
    category: '',
    condition: '',
    location: '',
    price: '',
    stock: 0,
    userId: auth.id
  });

  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // Fetch existing accessory details on component mount
  useEffect(() => {
    setAccessory(null);
    setError(null);
    setIsLoading(true);

    const foundAccessory = accessories.find((a) => a.id === Number(id));
    
    if (foundAccessory) {
      setAccessory(foundAccessory);
      
      // Populate form with existing data
      setValues({
        name: foundAccessory.name || '',
        description: foundAccessory.description || '',
        category: foundAccessory.category || '',
        condition: foundAccessory.condition || '',
        location: foundAccessory.location || '',
        price: foundAccessory.price ? Number(foundAccessory.price).toString() : '',
        stock: foundAccessory.stock || 0,
        userId: foundAccessory.userId || auth.id
      });

      // Set existing images
      setExistingImages(foundAccessory.imageUrls || []);
      setIsLoading(false);
    } else {
      // If not found in context, fetch from API
      const fetchAccessoryDetails = async () => {
        if (!id) {
          showError("No accessory ID provided");
          return;
        }

        try {
          const response = await axiosPrivate.get(`/api/accessories/${id}`);
          const fetchedAccessory = response.data;

          setAccessory(fetchedAccessory);
          
          // Populate form with existing data
          setValues({
            name: fetchedAccessory.name || '',
            description: fetchedAccessory.description || '',
            category: fetchedAccessory.category || '',
            condition: fetchedAccessory.condition || '',
            location: fetchedAccessory.location || '',
            price: fetchedAccessory.price ? Number(fetchedAccessory.price).toString() : '',
            stock: fetchedAccessory.stock || 0,
            userId: fetchedAccessory.userId || auth.id
          });

          // Set existing images
          setExistingImages(fetchedAccessory.imageUrls || []);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching accessory details:", error);
          setError(new Error('Failed to load accessory details'));
          setIsLoading(false);
        }
      };

      fetchAccessoryDetails();
    }
  }, [id, accessories, auth.id]);

  // Generic input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for price and stock
    if (name === 'price') {
      // Remove non-numeric characters and convert to number
      const numericValue = value.replace(/\D/g, '');
      setValues(prev => ({
        ...prev,
        [name]: numericValue,
      }));
    } else if (name === 'stock') {
      // Ensure stock is a non-negative integer
      const numericValue = Math.max(0, parseInt(value) || 0);
      setValues(prev => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setValues(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle image change with compression; enforce max 8 images
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length + existingImages.length > 8) {
      showWarning("You can upload a maximum of 8 images.");
      return;
    }

    const newPreviewUrls = [];
    const newImages = [];

    for (const file of files) {
      const isMobile = window.innerWidth < 768;
      
      const options = {
        maxSizeMB: isMobile ? 0.5 : 1,
        maxWidthOrHeight: isMobile ? 800 : 1200,
        useWebWorker: true,
        initialQuality: isMobile ? 0.7 : 0.8,
        alwaysKeepResolution: false,
        convertTypes: ['image/webp'],
        convertSize: 0
      };
      
      try {
        const compressedFile = await imageCompression(file, options);
        newImages.push(compressedFile);
        const previewUrl = URL.createObjectURL(compressedFile);
        newPreviewUrls.push(previewUrl);
      } catch (error) {
        console.error('Error while compressing image:', error);
        newImages.push(file);
        const fallbackUrl = URL.createObjectURL(file);
        newPreviewUrls.push(fallbackUrl);
      }
    }

    // Update all states after processing
    setImages(prev => [...prev, ...newImages]);
    setPreview(prev => [...prev, ...newPreviewUrls]);
  };

  // Remove image from selection
  const removeImage = (indexToRemove, isExisting = false) => {
    if (isExisting) {
      // Remove from existing images
      setExistingImages(prev => prev.filter((_, i) => i !== indexToRemove));
    } else {
      // Remove from newly added images
      setImages(prev => prev.filter((_, i) => i !== indexToRemove));
      setPreview(prev => prev.filter((_, i) => i !== indexToRemove));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!values.name || !values.price) {
      showWarning("Name and price are required.");
      return;
    }

    const priceValue = Number(values.price);
    if (priceValue <= 0) {
      showWarning("Price must be greater than zero.");
      return;
    }

    const form = new FormData();
    
    // Append all values to form
    Object.keys(values).forEach(key => {
      // Only append non-null values
      if (values[key] !== null && values[key] !== '') {
        form.append(key, values[key]);
      }
    });

    // Append new images
    images.forEach(image => form.append('images', image));

    // Append existing image URLs to be retained
    existingImages.forEach(imageUrl => form.append('existingImages', imageUrl));

    try {
      const response = await axiosPrivate.put(`/api/accessories/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      showSuccess("Accessory updated successfully");
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Error updating accessory:", error);
      showError(error.response?.data?.message || "Failed to update accessory");
    }
  };

  // Cleanup effect for preview URLs
  useEffect(() => {
    return () => {
      preview.forEach(url => URL.revokeObjectURL(url));
    };
  }, [preview]);

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="container text-center p-20 text-red-500">
          Error: {error.message}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-16 px-4">
        <div className="max-w-[1024px] mx-auto bg-slate-50 rounded-lg shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
          {accessory && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Update Accessory</h2>
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-primary-700 hover:shadow-md transform hover:-translate-y-1 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">save</span>
                  Update Accessory
                </button>
              </div>

              {/* Existing Images Display (Read-only) */}
              {existingImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">Accessory Images</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {existingImages.map((img, index) => (
                      <div key={index} className="relative bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                        <img
                          src={img}
                          alt={`Accessory Image ${index + 1}`}
                          title={`Accessory Image ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Images cannot be updated or removed.</p>
                </div>
              )}

              {/* Left Column */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Accessory Name *</label>
                    <input
                      name="name"
                      type="text"
                      placeholder="e.g. Chrome Rims"
                      value={values.name}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      placeholder="Additional details about the accessory"
                      value={values.description}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      name="category"
                      value={values.category}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none"
                    >
                      <option value="">Select Category</option>
                      {accessoryCategories.map((category, index) => (
                        <option key={index} value={category.toLowerCase()}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                    <select
                      name="condition"
                      value={values.condition}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none"
                    >
                      <option value="">Select Condition</option>
                      <option value="new">New</option>
                      <option value="used">Used</option>
                      <option value="refurbished">Refurbished</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      name="location"
                      type="text"
                      placeholder="City or Region"
                      value={values.location}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                    <input
                      name="price"
                      type="text"
                      placeholder="Enter price"
                      value={values.price ? Number(values.price).toLocaleString() : ""}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input
                      name="stock"
                      type="number"
                      min="0"
                      placeholder="Number of items available"
                      value={values.stock}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="mt-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accessory Images (Max: 8; Max File Size: 1MB per image)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center hover:border-primary-400 transition-all duration-300">
                  <span className="material-symbols-outlined text-5xl text-gray-400 mb-2">
                    add_photo_alternate
                  </span>
                  <p className="text-sm text-gray-500 mb-4">Drag & drop your images here, or click to select files</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={images.length + existingImages.length >= 8}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="bg-black text-white px-4 py-2 rounded-lg font-medium cursor-pointer animate-bounce duration-100"
                  >
                    Select Images
                  </label>
                  <p className="text-xs text-gray-400 mt-2">Images will be automatically compressed to 1MB</p>
                </div>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {existingImages.map((src, index) => (
                      <div key={`existing-${index}`} className="relative bg-white border border-gray-200 rounded-lg p-2 shadow-sm group">
                        <img
                          src={src}
                          title={`Existing Preview ${index + 1}`}
                          alt={`Existing Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, true)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Images Preview */}
                {preview.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {preview.map((src, index) => (
                      <div key={`new-${index}`} className="relative bg-white border border-gray-200 rounded-lg p-2 shadow-sm group">
                        <img
                          src={src}
                          title={`Preview ${index + 1}`}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-red-500 text-gray-700 font-semibold transition-all duration-300 hover:text-white hover:shadow-sm"
                  onClick={() => window.location.href = from}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3DC2EC] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-green-400 hover:shadow-md transform flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">save</span>
                  Update Accessory
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default UpdateAccessory;
