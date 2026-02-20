import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import useAuth from "../hooks/useAuth";
import { axiosPrivate } from "../api/axios";
import LoadingSpinner from "../utils/loadingspinner";
import AdminDashboard from "../layout/layout";
import QuickAction from "../components/Tables/quickActions";
import StatsNest from "../components/Tables/statsNest";
import RecentUsers from "../components/Tables/recentUsers";
import RecentProducts from "../components/Tables/recentProducts";
import RecentSubscription from "../components/Tables/recentSubscription";
import PerformanceMonitor from "../components/Tables/PerformanceMonitor";
import SalesTrends from "../components/Tables/salesTrends";
import TopModels from "../components/Tables/topModels";
import ListingHealth from "../components/Tables/listingHealth";
import ActiveUsers from "../components/Tables/activeUsers";
import CarCategories from "../components/Tables/carCategories";
import CarLocation from "../components/Tables/carLocation";
import PaymentMetrics from "../components/Tables/paymentMetrics";
import SubscriptionMetrics from "../components/Tables/subscriptionMetrics";
import FailedPayments from "../components/Tables/failedPayments";
import ListingRenewalMetrics from "../components/Tables/listingRenewalMetrics";

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
