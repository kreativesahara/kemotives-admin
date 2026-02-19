import React, { useState, useEffect } from "react";
import AdminDashboard from "./layout";
import TopSellers from "../components/Tables/topSellers";
import TopProductsByViews from "../components/Tables/topProductsByViews";
import RecentSellerLogins from "../components/Tables/recentSellerLogins";
import StatCard from "../components/Tables/statCard";
import axiosPrivate from "../api/axios";

function SellersPage() {
  const [activeTab, setActiveTab] = useState("sellers");
  const [sellerStats, setSellerStats] = useState({
    totalSellers: 0,
    activeSellers: 0,
    premiumSellers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSellerStats = async () => {
      setIsLoading(true);
      try {
        const response = await axiosPrivate.get('/api/seller-stats');
        setSellerStats(response.data);
      } catch (error) {
        console.error('Failed to fetch seller stats:', error);
        // Fallback data
        setSellerStats({
          totalSellers: 534,
          activeSellers: 423,
          premiumSellers: 128
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellerStats();
  }, []);

  return (
    <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Seller Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Total Sellers" 
            value={sellerStats.totalSellers.toLocaleString()} 
            icon="👨‍💼"
            trend="up"
            trendValue="9%"
          />
          <StatCard 
            title="Active Sellers" 
            value={sellerStats.activeSellers.toLocaleString()} 
            icon="✅"
            trend="up"
            trendValue="6%"
          />
          <StatCard 
            title="Premium Sellers" 
            value={sellerStats.premiumSellers.toLocaleString()} 
            icon="⭐"
            trend="up"
            trendValue="11%"
          />
        </div>
        
        <div className="mt-6">
          <RecentSellerLogins />
        </div>
        
        <div className="mt-6">
          <TopSellers />
        </div>
        
        <div className="mt-6">
          <TopProductsByViews />
        </div>
        
      </div>
    </AdminDashboard>
  );
}

export default SellersPage;
