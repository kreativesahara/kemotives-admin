import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import useAuth from "../hooks/useAuth";
import { axiosPrivate } from "../api/axios";
import LoadingSpinner from "./admin/utils/loadingspinner";
import AdminDashboard from "./admin/pages/layout";
import QuickAction from "./admin/components/quickActions";
import StatsNest from "./admin/components/statsNest";
import RecentUsers from "./admin/components/recentUsers";
import RecentProducts from "./admin/components/recentProducts";
import RecentSubscription from "./admin/components/recentSubscription";
import PerformanceMonitor from "./admin/components/PerformanceMonitor";
import SalesTrends from "./admin/components/salesTrends";
import TopModels from "./admin/components/topModels";
import ListingHealth from "./admin/components/listingHealth";
import ActiveUsers from "./admin/components/activeUsers";
import CarCategories from "./admin/components/carCategories";
import CarLocation from "./admin/components/carLocation";
import PaymentMetrics from "./admin/components/paymentMetrics";
import SubscriptionMetrics from "./admin/components/subscriptionMetrics";
import FailedPayments from "./admin/components/failedPayments";
import ListingRenewalMetrics from "./admin/components/listingRenewalMetrics";

/**
 * Admin Dashboard Component
 * 
 * Dashboard displays show up to 15 items per table for quick overview.
 * Each table links to a full view page with pagination (25 items per page).
 */
function Admin() {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = auth?.roles === 5;
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await axiosPrivate.get('/api/admin/dashboard');
        const { recentProducts } = response.data;
        setRecentProducts(recentProducts);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setRecentProducts([
          { id: 1, title: 'Toyota Camry 2020', price: 2500000, status: 'Active', seller: 'Alice Smith' },
          { id: 2, title: 'Honda Accord 2019', price: 2200000, status: 'Active', seller: 'Dave Wilson' },
          { id: 3, title: 'BMW X5 2018', price: 3500000, status: 'Pending', seller: 'John Miller' },
          { id: 4, title: 'Mercedes-Benz E-Class', price: 4000000, status: 'Active', seller: 'Sarah Thomas' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const renderDashboardContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <StatsNest />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentUsers />
          <RecentProducts />
          <RecentSubscription />
          <TopModels />
        </div>       
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ActiveUsers />
          <ListingHealth />
        </div>
        <div className="grid grid-cols-1  gap-4">
          <CarCategories />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <CarLocation />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <PerformanceMonitor />
        </div>
        <QuickAction title="Quick Actions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-blue-50 rounded-lg flex items-center gap-3 hover:bg-blue-100 transition">
              <span className="material-symbols-outlined text-blue-600">add_circle</span>
              <span>Add Moderator</span>
            </button>
            <button className="p-4 bg-green-50 rounded-lg flex items-center gap-3 hover:bg-green-100 transition">
              <span className="material-symbols-outlined text-green-600">verified</span>
              <span>Approve Pending Listings</span>
            </button>
            <button className="p-4 bg-purple-50 rounded-lg flex items-center gap-3 hover:bg-purple-100 transition">
              <span className="material-symbols-outlined text-purple-600">assessment</span>
              <span>Export Reports</span>
            </button>
          </div>
        </QuickAction>
      </div>
    );
  };

  return (
    <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderDashboardContent()}
    </AdminDashboard>
  );
}

export default Admin;
