import React, { useState, useEffect } from "react";
import AdminDashboard from "./layout";
import RecentUsers from "../components/Tables/recentUsers";
import ActiveUsers from "../components/Tables/activeUsers";
import FailedPayments from "../components/Tables/failedPayments";
import StatCard from "../components/Tables/statCard";
import axiosPrivate from "../api/axios";

function UsersPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    activeUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      setIsLoading(true);
      try {
        const response = await axiosPrivate.get('/api/user-stats');
        setUserStats(response.data);
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
        // Fallback data
        setUserStats({
          totalUsers: 1250,
          newUsers: 48,
          activeUsers: 876
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  return (
    <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Total Users" 
            value={userStats.totalUsers.toLocaleString()} 
            icon="👥"
            trend="up"
            trendValue="12%"
          />
          <StatCard 
            title="New Users (This Week)" 
            value={userStats.newUsers.toLocaleString()} 
            icon="🆕"
            trend="up"
            trendValue="8%"
          />
          <StatCard 
            title="Active Users" 
            value={userStats.activeUsers.toLocaleString()} 
            icon="✅"
            trend="up"
            trendValue="5%"
          />
        </div>
        <div className="grid grid-cols-1  gap-6">
          <RecentUsers />
        </div>
        <div className="grid grid-cols-1  gap-6">
          <ActiveUsers />         
        </div>
        <div className="grid grid-cols-1 gap-6">
          <FailedPayments />
        </div>
      </div>
    </AdminDashboard>
  );
}

export default UsersPage;