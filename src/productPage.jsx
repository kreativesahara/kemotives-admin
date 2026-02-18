import React, { useState, useEffect, Suspense } from 'react';
import ProductListing from './components/cards/productListing';
import { axiosPrivate } from './api/axios';
import FilterVehicles from './components/forms/filterVehicles';
import Layout from './components/Layout';
import { useProductContext } from './context/ProductProvider';
import { useSeoContext } from './context/SeoProvider';
import Search from './components/forms/search';

const ProductPage = () => { 

   
    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-6">Product Management</h1>

            </div>
        </Layout>
    );
};

export default ProductPage;