import { useState, useEffect } from "react";
import axiosPrivate from "../../../api/axios";
import StatCard from "./statCard";


const StatsNest = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        users: 0,
        products: 0,
        sellers: 0,
        impressions: 0
    });
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const response = await axiosPrivate.get('/api/dashboad');
                const { stats } = response.data;
                setStats(stats);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
                setStats({
                    users: 124,
                    products: 350,
                    sellers: 45,
                    impressions: 709
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
                title="Total Users"
                value={stats.users}
                icon="person"
                bgColor="bg-blue-100"
                iconColor="text-blue-600"
            />
            <StatCard
                title="Total Products"
                value={stats.products}
                icon="inventory_2"
                bgColor="bg-green-100"
                iconColor="text-green-600"
            />
            <StatCard
                title="Total Sellers"
                value={stats.sellers}
                icon="store"
                bgColor="bg-purple-100"
                iconColor="text-purple-600"
            />
            <StatCard
                title="Impressions"
                value={stats.impressions}
                icon="person"
                bgColor="bg-red-100"
                iconColor="text-red-600"
            />
        </div>
    );
};

export default StatsNest;