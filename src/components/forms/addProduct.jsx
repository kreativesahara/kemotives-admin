import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import useAxiosPrivate from '../../api/useAxiosPrivate';
import imageCompression from 'browser-image-compression';
import useAuth from '../../hooks/useAuth';
import Layout from '../../components/Layout';
import carCategories from '../../data/carCategories';
import counties from '../../data/counties';
import featureList from '../../data/featureList';
import vehicleOptions from '../../data/vehicleOptions';
import { showWarning, showSuccess, showError } from "../../utils/sweetAlert";
import { useListingLimit } from '../../hooks/useListingLimit';

function AddProduct() {
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const from = location.state?.from?.pathname || "/dashboard";

  // Use the new listing limit hook
  const { 
    planName, 
    maxListings, 
    currentListingsCount, 
    canCreateMore, 
    isLoading: isLoadingListingLimit,
    error: listingLimitError 
  } = useListingLimit(auth.id);

  const [values, setValues] = useState({
    make: '',
    model: '',
    year: '',
    engineCapacity: '',
    fuelType: '',
    transmission: '',
    driveSystem: '',
    mileage: '',
    features: '',
    condition: '',
    location: '',
    price: '',
    sellerId: auth.id,
    category: '',
  });

  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // State for react-select components
  const [makeSelectValue, setMakeSelectValue] = useState(null);
  const [modelSelectValue, setModelSelectValue] = useState(null);
  const [countySelectValue, setCountySelectValue] = useState(null);
  const [featuresSelectValue, setFeaturesSelectValue] = useState([]);
  const [makeOptions, setMakeOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);

  // Fetch makes and models on mount
  useEffect(() => {
    async function fetchVehicleData() {
      try {
        const mergedMakes = vehicleOptions.vehicles.map(vehicle => vehicle.make);
        const mergedModels = vehicleOptions.vehicles.flatMap(vehicle => vehicle.models);

        setMakeOptions(mergedMakes);
        setModelOptions(mergedModels);
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
      }
    }
    fetchVehicleData();
  }, []);

  // Prepare react-select options
  const makeSelectOptions = makeOptions.map(make => ({ value: make, label: make }));
  
  // Dynamically filter model options based on selected make
  const filteredModelOptions = makeSelectValue
    ? vehicleOptions.vehicles
        .find(vehicle => vehicle.make === makeSelectValue.value)?.models.map(model => ({
          value: model,
          label: model
        })) || []
    : [];

  const countySelectOptions = counties.map(county => ({ value: county.name, label: county.name }));
  const featureSelectOptions = featureList.map(feature => ({ 
    value: feature.name, 
    label: feature.name,
    description: feature.description
  }));

  // Handlers for react-select
  const handleMakeSelectChange = (selectedOption) => {
    setMakeSelectValue(selectedOption);
    setValues(prev => ({
      ...prev,
      make: selectedOption ? selectedOption.value : ''
    }));
    
    // Reset model selection when make changes
    setModelSelectValue(null);
    setValues(prev => ({
      ...prev,
      model: ''
    }));
  };

  const handleModelSelectChange = (selectedOption) => {
    setModelSelectValue(selectedOption);
    setValues(prev => ({
      ...prev,
      model: selectedOption ? selectedOption.value : ''
    }));
  };

  const handleCountySelectChange = (selectedOption) => {
    setCountySelectValue(selectedOption);
    setValues(prev => ({
      ...prev,
      location: selectedOption ? selectedOption.value : ''
    }));
  };

  const handleFeaturesSelectChange = (selectedOptions) => {
    setFeaturesSelectValue(selectedOptions);
    const featuresString = selectedOptions 
      ? selectedOptions.map(option => option.value).join(', ')
      : '';
    setValues(prev => ({
      ...prev,
      features: featuresString
    }));
  };

  // Generic input handler (also formats mileage/price)
  const handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    if (name === "mileage" || name === "price") {
      const rawValue = value.replace(/\D/g, "");
      setValues(prev => ({
        ...prev,
        [name]: rawValue,
      }));
    } else {
      setValues(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Remove image from selection
  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, i) => i !== indexToRemove));
    setPreview(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  // Handle image change with compression; enforce max 8 images
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    console.log('Selected files:', files);
    
    if (images.length + files.length > 8) {
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
        console.log('Compressed file:', compressedFile);
        newImages.push(compressedFile);
        const previewUrl = URL.createObjectURL(compressedFile);
        console.log('Preview URL:', previewUrl);
        newPreviewUrls.push(previewUrl);
      } catch (error) {
        console.error('Error while compressing image:', error);
        newImages.push(file);
        const fallbackUrl = URL.createObjectURL(file);
        console.log('Fallback URL:', fallbackUrl);
        newPreviewUrls.push(fallbackUrl);
      }
    }

    // Update all states after processing
    setImages(prev => [...prev, ...newImages]);
    setPreview(prev => [...prev, ...newPreviewUrls]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    console.log('Updated preview state:', newPreviewUrls);
  };

  // Cleanup effect for preview URLs
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Handle form submission via axiosPrivate
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check listing limit before submission
    if (!canCreateMore) {
      showWarning(`Listing limit reached for ${planName} plan. ` +
                  `Maximum ${maxListings} listings allowed. ` +
                  `Current listings: ${currentListingsCount}`);
      return;
    }

    if (images.length < 5) {
      showWarning("You must upload at least 5 images.");
      return;
    }
    if (!images.length) {
      showWarning('Please select images to upload.');
      return;
    }
    
    // Check if price is less than minimum
    const priceValue = Number(values.price.replace(/,/g, ''));
    if (priceValue < 450000) {
      showWarning("Price must be at least KSH 450,000.");
      return;
    }
    
    // Check if mileage is above maximum
    const mileageValue = Number(values.mileage.replace(/,/g, ''));
    if (mileageValue > 1000000) {
      showWarning("Mileage cannot exceed 1,000,000 km.");
      return;
    }
    
    // Check if engine capacity is above maximum
    const engineCapacityValue = Number(values.engineCapacity);
    if (engineCapacityValue > 7000) {
      showWarning("Engine capacity cannot exceed 7000cc.");
      return;
    }
    
    const form = new FormData();
    console.log("Form data before appending images:", values);
    Object.keys(values).forEach(key => form.append(key, values[key]));
    images.forEach(image => form.append('images', image));
    try {
      const response = await axiosPrivate.post('/api/product', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      console.log("Response from product controller:", response.data);
      showSuccess("Car details uploaded successfully");
      
      // Optionally redirect or reset form
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Error uploading product:", error);
      
      // Handle specific listing limit error
      if (error.response?.status === 403) {
        showWarning(
          error.response.data.message || 
          `Listing limit reached for ${planName} plan. ` +
          `Maximum ${maxListings} listings allowed. ` +
          `Current listings: ${currentListingsCount}`
        );
      } else {
        showError("Failed to upload car details");
      }
    }
  };

  // Render a loading state or limit warning if needed
  if (isLoadingListingLimit) {
    return <div>Checking listing limits...</div>;
  }

  if (listingLimitError) {
    return <div>Error: {listingLimitError}</div>;
  }

  // Optional: Add a warning banner if close to limit
  const isNearLimit = currentListingsCount >= (maxListings * 0.8);

  return (
    <Layout>
      {isNearLimit && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Listing Limit Warning</p>
          <p>
            You have {currentListingsCount} out of {maxListings} listings for your {planName} plan. 
            Consider upgrading to list more vehicles.
          </p>
        </div>
      )}
      
      <div id="webcrumbs" className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-16 px-4">
        <div className="max-w-[1024px] mx-auto bg-slate-50 rounded-lg shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Add New Vehicle</h2>
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-primary-700 hover:shadow-md transform hover:-translate-y-1 flex items-center gap-2"
              >
                <span className="material-symbols-outlined">add_circle</span>
                Submit Listing
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Vehicle Details */}
              <div className="space-y-4">
                <div>
                  <input
                    name="sellerId"
                    type="number"
                    value={auth.id}
                    hidden
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Make</label>
                  <Select
                    name="make"
                    value={makeSelectValue}
                    onChange={handleMakeSelectChange}
                    options={makeSelectOptions}
                    placeholder="Select or search vehicle make"
                    isClearable
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model</label>
                  <Select
                    name="model"
                    value={modelSelectValue}
                    onChange={handleModelSelectChange}
                    options={filteredModelOptions}
                    placeholder={makeSelectValue 
                      ? "Select or search vehicle model" 
                      : "Select vehicle make first"}
                    isClearable
                    isDisabled={!makeSelectValue}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <select
                      name="year"
                      onChange={handleChange}
                      value={values.year}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none"
                      required
                    >
                      <option value="">Select Year</option>
                      {Array.from({ length: 19 }, (_, i) => 2026 - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Engine (cc)</label>
                    <input
                      name="engineCapacity"
                      type="number"
                      placeholder="e.g. 2000"
                      onChange={handleChange}
                      value={values.engineCapacity}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none"
                      required
                      max="4000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum: 4000cc</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                    <select
                      name="fuelType"
                      onChange={handleChange}
                      value={values.fuelType}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none"
                      required
                    >
                      <option value="">Select Fuel Type</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Petrol Hybrid">Petrol Hybrid</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Diesel Hybrid">Diesel Hybrid</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                      
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                    <select
                      name="transmission"
                      onChange={handleChange}
                      value={values.transmission}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none"
                      required
                    >
                      <option value="">Select Transmission</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                      <option value="CVT">CVT</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Drive System</label>
                    <select
                      name="driveSystem"
                      onChange={handleChange}
                      value={values.driveSystem}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none"
                      required
                    >
                      <option value="">Select Drive System</option>
                      <option value="2WD">2WD</option>
                      <option value="4WD">4WD</option>
                      <option value="AWD">AWD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mileage (km)</label>
                    <input
                      name="mileage"
                      type="text"
                      placeholder="e.g. 50000"
                      onChange={handleChange}
                      value={values.mileage ? Number(values.mileage).toLocaleString() : ""}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum: 1,000,000 km</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Additional Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    name="condition"
                    onChange={handleChange}
                    value={values.condition}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none"
                    required
                  >
                    <option value="">Select Condition</option>
                    <option value="New">Brand New</option>
                    <option value="Foreign Used Unregistered">Foreign Used (Unregistered)</option>
                    <option value="Foreign Used Registered">Foreign Used (Registered)</option>
                    <option value="Local Used">Local Used</option>
                    <option value="Reconditioned">Reconditioned</option>
                    <option value="Certified Pre-Owned">Certified Pre-Owned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    onChange={handleChange}
                    value={values.category}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none"
                    required
                  >
                    <option value="">Select Category</option>
                    {carCategories.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                  <Select
                    name="features"
                    value={featuresSelectValue}
                    onChange={handleFeaturesSelectChange}
                    options={featureSelectOptions}
                    placeholder="Select multiple vehicle features"
                    isMulti
                    className="react-select-container"
                    classNamePrefix="react-select"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <Select
                    name="location"
                    value={countySelectValue}
                    onChange={handleCountySelectChange}
                    options={countySelectOptions}
                    placeholder="Select county"
                    isClearable
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (KSHs)</label>
                  <input
                    name="price"
                    type="text"
                    placeholder="e.g. 450000"
                    onChange={handleChange}
                    value={values.price ? Number(values.price).toLocaleString() : ""}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum price: KSH 450,000</p>
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Images (Min: 5, Max: 8; Max File Size: 1MB per image)
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
                  disabled={images.length >= 8}
                  className="hidden"
                  id="image-upload"
                  required={images.length < 5}
                />
                <label
                  htmlFor="image-upload"
                  className="bg-black text-white px-4 py-2 rounded-lg font-medium cursor-pointer animate-bounce duration-100"
                >
                  Select Images
                </label>
                <p className="text-xs text-gray-400 mt-2">Images will be automatically compressed to 1MB</p>
              </div>

              {preview.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {preview.map((src, index) => (
                    <div key={index} className="relative bg-white border border-gray-200 rounded-lg p-2 shadow-sm group">
                      <img
                        title={`Preview ${index + 1}`}
                        src={src}
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

              {/* Optionally, add a preview progress indicator */}
              {preview.length > 0 && (
                <div className="mt-4 mb-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Upload Progress ({preview.length}/8 images)
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {((preview.length / 8) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                      style={{ width: `${(preview.length / 8) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 rounded-lg  hover:bg-red-500 text-gray-700 font-semibold transition-all duration-300 hover:text-white hover:shadow-sm"
                onClick={() => window.location.href = from}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#3DC2EC] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-green-400 hover:shadow-md transform  flex items-center gap-2"
              >
                <span className="material-symbols-outlined">save</span>
                Save Vehicle
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default AddProduct;
