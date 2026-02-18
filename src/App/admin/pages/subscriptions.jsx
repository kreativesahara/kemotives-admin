import React, { useState, useEffect } from "react";
import AdminDashboard from "./layout";
import RecentSubscription from "../components/recentSubscription";
import SubscriptionMetrics from "../components/subscriptionMetrics";
import StatCard from "../components/statCard";
import axiosPrivate from "../../../api/axios";

function SubscriptionsPage() {
    const [activeTab, setActiveTab] = useState("subscriptions");
    const [subscriptionStats, setSubscriptionStats] = useState({
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        revenueMTD: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSubscriptionStats = async () => {
            setIsLoading(true);
            try {
                const response = await axiosPrivate.get('/api/subscription-stats');
                setSubscriptionStats(response.data);
            } catch (error) {
                console.error('Failed to fetch subscription stats:', error);
                // Fallback data
                setSubscriptionStats({
                    totalSubscriptions: 273,
                    activeSubscriptions: 245,
                    revenueMTD: 1450000
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubscriptionStats();
    }, []);

    return (
        <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab}>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Subscription Management</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard 
                        title="Total Subscriptions" 
                        value={subscriptionStats.totalSubscriptions.toLocaleString()} 
                        icon="subscriptions"
                        trend="up"
                        trendValue="3%"
                    />
                    <StatCard 
                        title="Active Subscriptions" 
                        value={subscriptionStats.activeSubscriptions.toLocaleString()} 
                        icon="check_circle"
                        trend="up"
                        trendValue="1%"
                    />
                    <StatCard 
                        title="Revenue (MTD)" 
                        value={`KSH ${(subscriptionStats.revenueMTD / 1000).toLocaleString()}K`} 
                        icon="payments"
                        trend="up"
                        trendValue="5%"
                    />
                </div>
                <RecentSubscription />
                <SubscriptionMetrics />
            </div>
        </AdminDashboard>
    );
}

export default SubscriptionsPage; 