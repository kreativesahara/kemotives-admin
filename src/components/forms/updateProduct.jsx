import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import Select from 'react-select';
import { useProductContext } from '../../context/ProductProvider';
import { useSellerContext } from '../../context/SellerProvider';
import useAxiosPrivate from '../../api/useAxiosPrivate';
import carCategories from '../../data/carCategories';
import counties from '../../data/counties';
import featureList from '../../data/featureList';
import vehicleOptions from '../../data/vehicleOptions';
import { showWarning, showSuccess, showError } from "../../utils/sweetAlert";

const UpdateProduct = () => {
    const { productId } = useParams();
    const location = useLocation();
    const { products } = useProductContext();
    const { sellers } = useSellerContext();
    const [product, setProduct] = useState(null);
    const [seller, setSeller] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const axiosPrivate = useAxiosPrivate();
    const from = location.state?.from?.pathname || "/dashboard";

    // State for form values and dropdowns
    const [values, setValues] = useState({
        vehicleId: productId,
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
        category: '',
    });

    const [makeOptions, setMakeOptions] = useState([]);
    const [modelOptions, setModelOptions] = useState([]);
    const [makeSelectValue, setMakeSelectValue] = useState(null);
    const [modelSelectValue, setModelSelectValue] = useState(null);
    const [countySelectValue, setCountySelectValue] = useState(null);
    const [featuresSelectValue, setFeaturesSelectValue] = useState([]);
    const [productImages, setProductImages] = useState([]);

    // Fetch vehicle data on mount
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

    // Set initial product data
    useEffect(() => {
        setProduct(null);
        setSeller(null);
        setError(null);
        setIsLoading(true);

        const foundProduct = products.find((p) => p.id === Number(productId));
        if (foundProduct) {
            setProduct(foundProduct);
            setValues({
                ...foundProduct,
                vehicleId: productId
            });
            // Set select values
            setMakeSelectValue(foundProduct.make ? { value: foundProduct.make, label: foundProduct.make } : null);
            setModelSelectValue(foundProduct.model ? { value: foundProduct.model, label: foundProduct.model } : null);
            setCountySelectValue(foundProduct.location ? { value: foundProduct.location, label: foundProduct.location } : null);

            // Set features as array for multi-select
            if (foundProduct.features) {
                const featuresArray = foundProduct.features.split(',').map(feature => feature.trim());
                const selectedFeatures = featuresArray.map(feature => {
                    const matchedFeature = featureList.find(f => f.name === feature);
                    return matchedFeature
                        ? { value: matchedFeature.name, label: matchedFeature.name, description: matchedFeature.description }
                        : { value: feature, label: feature };
                });
                setFeaturesSelectValue(selectedFeatures);
            }

            // Set product images
            if (foundProduct.images && foundProduct.images.length > 0) {
                setProductImages(foundProduct.images);
            }
        } else {
            setError(new Error('Product not found'));
            setIsLoading(false);
        }
    }, [productId, products]);

    // Find seller
    useEffect(() => {
        if (product) {
            const foundSeller = sellers.find((s) => s.userId === Number(product.sellerId));
            if (foundSeller) {
                setSeller(foundSeller);
            } else {
                setError(new Error('Seller not found'));
            }
            setIsLoading(false);
        }
    }, [product, sellers]);

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

    const modelSelectOptions = modelOptions.map(model => ({ value: model, label: model }));
    const countySelectOptions = counties.map(county => ({ value: county.name, label: county.name }));
    const featureSelectOptions = featureList.map(feature => ({
        value: feature.name,
        label: feature.name,
        description: feature.description
    }));

    // Input handlers
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

    // Form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation checks
        const priceValue = Number(values.price.replace(/,/g, ''));
        if (priceValue < 450000) {
            showWarning("Price must be at least KSH 450,000.");
            return;
        }

        const mileageValue = Number(values.mileage.replace(/,/g, ''));
        if (mileageValue > 1000000) {
            showWarning("Mileage cannot exceed 1,000,000 km.");
            return;
        }

        const engineCapacityValue = Number(values.engineCapacity);
        if (engineCapacityValue > 4000) {
            showWarning("Engine capacity cannot exceed 4000cc.");
            return;
        }

        try {
            const response = await axiosPrivate.put(`/api/product/${productId}`, values, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            });
            console.log("Product updated successfully:", response.data);
            showSuccess("Product updated successfully");
            window.location.href = from;
        } catch (error) {
            console.error("Error updating product:", error.response?.data || error.message);
            showError("Failed to update product. Please try again.");
        }
    };

    if (isLoading) return (
        <Layout>
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        </Layout>
    );

    if (error) return (
        <Layout>
            <div className="container text-center p-20 text-red-500">
                Error: {error.message}
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-16 px-4">
                <div className="max-w-[1024px] mx-auto bg-slate-50 rounded-lg shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
                    {product && seller && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-bold text-gray-800">Update Vehicle</h2>
                                <button
                                    type="submit"
                                    className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-primary-700 hover:shadow-md transform hover:-translate-y-1 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined">save</span>
                                    Save Changes
                                </button>
                            </div>

                            {/* Product Images Display (Read-only) */}
                            {productImages.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-3">Product Images</h3>
                                    <div className="grid grid-cols-4 gap-4">
                                        {productImages.map((img, index) => (
                                            <div key={index} className="relative bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                                                <img
                                                    src={img.image_url || img}
                                                    alt={`${product.make} ${product.model} - Image ${index + 1}`}
                                                    title={`Image ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">Images cannot be updated or removed.</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    {/* Vehicle Make & Model */}
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

                                    {/* Basic Details Grid */}
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
                                                <option value="Diesel">Diesel</option>
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
                                </div>

                                {/* Right Column */}
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
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
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
                                    <span className="material-symbols-outlined">update</span>
                                    Update Vehicle
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default UpdateProduct;
