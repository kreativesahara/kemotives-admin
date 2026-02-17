import React, { useState, useEffect, Suspense } from 'react';
import AccessoriesListing from './components/cards/accessoriesListing';
import { axiosPrivate } from './api/axios';
import FilterAccessories from './components/forms/filterAccessories';
import Layout from './components/Layout';
import { useAccessoriesContext } from './context/AccessoriesProvider';
import { useSeoContext } from './context/SeoProvider';
import { SearchAccessoriesProvider } from './context/SearchAccesoriesProvider';
import SearchAccessories from './components/forms/searchAccessories';
const Accessories = () => {
    const { accessories, setAccessories, isLoading } = useAccessoriesContext();
    const { updateSeo } = useSeoContext();
    const [filters, setFilters] = useState({
        name: '',
        category: '',
        condition: '',
        location: '',
        priceMin: '',
        priceMax: '',
        stock: '',
        search: '',
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    // Update SEO metadata
    useEffect(() => {
        const canonicalUrl = 'https://www.diksxcars.co.ke/accessories';

        const metaTitle = 'Car Accessories & Spares in Kenya | Diksx Cars';
        const metaDescription = 'Browse Car Accessories, Parts and Spares for Sale in Kenya. Find quality car accessories with detailed specs and competitive pricing on Diksx Cars Market Place.';
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
            const response = await axiosPrivate.get('/api/filter/accessories', { params: cleanedFilters });
            setAccessories(response.data);
            setCurrentPage(1); // Reset to first page after filtering
        } catch (error) {
            console.error("Error fetching filtered accessories:", error);
        }
    };

    // Calculate pagination details
    const totalPages = Math.ceil(accessories.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentAccessories = accessories.slice(startIndex, startIndex + itemsPerPage);

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4">
                {/* <SearchAccessoriesProvider>
                    <Suspense fallback={<div className="h-[100px] bg-gray-50 rounded-lg my-2"></div>}>
                        <SearchAccessories />
                    </Suspense> 
                </SearchAccessoriesProvider> - Replaced by FilterAccessories */}
                <Suspense fallback={<div className="h-[100px] bg-gray-50 rounded-lg my-2"></div>}>
                    <FilterAccessories filters={filters} setFilters={setFilters} onFilterSubmit={handleFilterSubmit} />
                </Suspense>
                <div className="mt-8">
                    <Suspense fallback={<div className="h-[100px] bg-gray-50 rounded-lg my-2"></div>}>
                        <h1 className="text-2xl font-bold mb-4">Available Accessories</h1>
                    </Suspense>
                    <Suspense fallback={<div className="h-[100px] bg-gray-50 rounded-lg my-2"></div>}>
                        <AccessoriesListing accessories={currentAccessories} isLoading={isLoading} />
                    </Suspense>
                    {!isLoading && accessories.length > 0 && (
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

export default Accessories;