import React, { useState, useEffect } from "react";
import AdminDashboard from "./layout";
import SubscriptionMetrics from "../components/subscriptionMetrics";
import PaymentMetrics from "../components/paymentMetrics";
import ListingRenewalMetrics from "../components/listingRenewalMetrics";
import FailedPayments from "../components/failedPayments";
import SalesTrends from "../components/salesTrends";
import StatCard from "../components/statCard";
import axiosPrivate from "../../../api/axios";

function ReportsPage() {
  const [activeTab, setActiveTab] = useState("reports");
  const [reportStats, setReportStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalSubscriptions: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReportStats = async () => {
      setIsLoading(true);
      try {
        const response = await axiosPrivate.get('/api/report-stats');
        setReportStats(response.data);
      } catch (error) {
        console.error('Failed to fetch report stats:', error);
        // Fallback data
        setReportStats({
          totalRevenue: 2750000,
          monthlyRevenue: 350000,
          totalSubscriptions: 215
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportStats();
  }, []);

  return (
    <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Total Revenue" 
            value={`KSH ${reportStats.totalRevenue.toLocaleString()}`} 
            icon="💰"
            trend="up"
            trendValue="15%"
          />
          <StatCard 
            title="Monthly Revenue" 
            value={`KSH ${reportStats.monthlyRevenue.toLocaleString()}`} 
            icon="📅"
            trend="up"
            trendValue="8%"
          />
          <StatCard 
            title="Total Subscriptions" 
            value={reportStats.totalSubscriptions.toLocaleString()} 
            icon="🔔"
            trend="up"
            trendValue="12%"
          />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <SalesTrends />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <PaymentMetrics />
          <SubscriptionMetrics />
        </div>
        
       
        
        <div className="grid grid-cols-1 gap-6">
          <ListingRenewalMetrics />
        </div>
      </div>
    </AdminDashboard>
  );
}

export default ReportsPage;
