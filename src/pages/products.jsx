import React, { useState, useEffect } from "react";
import AdminDashboard from "./layout";
import RecentProducts from "../components/Tables/recentProducts";
import ListingHealth from "../components/Tables/listingHealth";
import TopModels from "../components/Tables/topModels";
import CarCategories from "../components/Tables/carCategories";
import CarLocation from "../components/Tables/carLocation";
import StatCard from "../components/Tables/statCard";
import ListingRenewalMetrics from "../components/Tables/listingRenewalMetrics";
import axiosPrivate from "../api/axios";

function ProductsPage() {
    const [activeTab, setActiveTab] = useState("products");
    const [productStats, setProductStats] = useState({
        totalProducts: 0,
        activeListings: 0,
        pendingApproval: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProductStats = async () => {
            setIsLoading(true);
            try {
                const response = await axiosPrivate.get('/api/product-stats');
                setProductStats(response.data);
            } catch (error) {
                console.error('Failed to fetch product stats:', error);
                // Fallback data
                setProductStats({
                    totalProducts: 875,
                    activeListings: 720,
                    pendingApproval: 32
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductStats();
    }, []);

    return (
        <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab}>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Product Management</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard 
                        title="Total Listings" 
                        value={productStats.totalProducts.toLocaleString()} 
                        icon="🚗"
                        trend="up"
                        trendValue="7%"
                    />
                    <StatCard 
                        title="Active Listings" 
                        value={productStats.activeListings.toLocaleString()} 
                        icon="✅"
                        trend="up"
                        trendValue="5%"
                    />
                    <StatCard 
                        title="Pending Approval" 
                        value={productStats.pendingApproval.toLocaleString()} 
                        icon="⏳"
                        trend="down"
                        trendValue="3%"
                    />
                </div>                
                <div className="grid grid-cols-1  gap-6">
                    <RecentProducts />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TopModels />
                    <CarCategories />
                    <ListingHealth />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                    <ListingRenewalMetrics />
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <CarLocation />
                </div>
            </div>
        </AdminDashboard>
    );
}

export default ProductsPage;
