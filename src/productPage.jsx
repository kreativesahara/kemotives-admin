import React, { useState, useEffect, Suspense } from 'react';
import ProductListing from './components/cards/productListing';
import { axiosPrivate } from './api/axios';
import FilterVehicles from './components/forms/filterVehicles';
import Layout from './components/Layout';
import { useProductContext } from './context/ProductProvider';
import { useSeoContext } from './context/SeoProvider';
import Search from './components/forms/search';

const ProductPage = () => {
    const { products, setProducts, isLoading } = useProductContext();
    const { updateSeo } = useSeoContext();

    const [filters, setFilters] = useState({
        make: '', model: '', yearFrom: '', yearTo: '', priceMin: '', priceMax: '',
        fuelType: '', transmission: '', mileageRange: '', images: [], location: '',
        condition: '', driveSystem: '', engine_capacity: '', features: [],
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    // Update SEO metadata
    useEffect(() => {
        const canonicalUrl = 'https://www.diksxcars.co.ke/vehicles';

        const metaTitle = 'Motor Vehicles for Sale in Kenya | Diksx Cars';
        const metaDescription = 'Browse Cars for Sale in Kenya, Nairobi Online. Find your next ride with detailed specs, competitive pricing, and a user-friendly experience.';
        const additionalMetaTags = [
            { name: 'robots', content: 'index, follow' }
        ];

        updateSeo({
            title: metaTitle,
            description: metaDescription,
            canonical: canonicalUrl,
            type: 'website',
            additionalMetaTags: additionalMetaTags,
        });
    }, [updateSeo]);

    const handleFilterSubmit = async (cleanedFilters) => {
        try {
            const response = await axiosPrivate.get('/api/filter/vehicles', { params: cleanedFilters });
            setProducts(response.data);
            setCurrentPage(1); // Reset to first page after filtering
        } catch (error) {
            console.error("Error fetching filtered vehicles:", error);
        }
    };

    // Calculate pagination details
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);

    return (
        <Layout>
            {/* Remove PageCanonical since we're setting it in updateSeo */}
            <div className="max-w-7xl mx-auto px-4">
                <Suspense fallback={<div className="h-[100px] bg-gray-50 rounded-lg my-2"></div>}>
                    {/* <Search /> - Replaced by consolidated FilterVehicles below */}
                    <FilterVehicles filters={filters} setFilters={setFilters} onFilterSubmit={handleFilterSubmit} />
                </Suspense>
                <div className="mt-8">
                    <Suspense fallback={<div className="h-[100px] bg-gray-50 rounded-lg my-2"></div>}>
                        <h1 className="text-2xl font-bold mb-4">Motor Vehicles for Sale in Kenya</h1>
                    </Suspense>
                    <Suspense fallback={<div className="h-[100px] bg-gray-50 rounded-lg my-2"></div>}>
                        <ProductListing products={currentProducts} isLoading={isLoading} />
                    </Suspense>
                    {!isLoading && products.length > 0 && (
                        <div className="flex justify-center mt-4 space-x-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">Page {currentPage} of {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ProductPage;