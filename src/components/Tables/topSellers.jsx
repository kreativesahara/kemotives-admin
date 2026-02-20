import { useState, useEffect } from "react";
import axiosPrivate from "../../api/axios";
import DashboardSection from "../../dataTable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const TopSellers = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [topSellersByViews, setTopSellersByViews] = useState([]);
    const [topSellersByValuation, setTopSellersByValuation] = useState([]);
    const [soldItems, setSoldItems] = useState([]);
    const [highSubscriptions, setHighSubscriptions] = useState([]);
    const [activeTab, setActiveTab] = useState("views");
    const [period, setPeriod] = useState('month');

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

    useEffect(() => {
        const fetchTopSellers = async () => {
            setIsLoading(true);
            try {
                // In a real scenario, we would fetch from the API with the period parameter
                // const response = await axiosPrivate.get(`/api/top-sellers?period=${period}`);
                // setTopSellersByViews(response.data.byViews);
                // setTopSellersByValuation(response.data.byValuation);
                // setSoldItems(response.data.soldItems);
                // setHighSubscriptions(response.data.highSubscriptions);

                // Mock data for development
                setTopSellersByViews([
                    { name: 'John Doe', views: 4250, listings: 15 },
                    { name: 'Jane Smith', views: 3820, listings: 12 },
                    { name: 'Mike Johnson', views: 3540, listings: 8 },
                    { name: 'Sarah Williams', views: 3210, listings: 10 },
                    { name: 'Robert Brown', views: 2890, listings: 7 },
                ]);

                setTopSellersByValuation([
                    { name: 'Sarah Williams', valuation: 425000, items: 10 },
                    { name: 'John Doe', valuation: 398000, items: 15 },
                    { name: 'Robert Brown', valuation: 350000, items: 7 },
                    { name: 'Jane Smith', valuation: 320000, items: 12 },
                    { name: 'Mike Johnson', valuation: 280000, items: 8 },
                ]);

                setSoldItems([
                    { name: 'John Doe', sold: 8, revenue: 245000 },
                    { name: 'Jane Smith', sold: 6, revenue: 210000 },
                    { name: 'Robert Brown', sold: 5, revenue: 180000 },
                    { name: 'Mike Johnson', sold: 4, revenue: 160000 },
                    { name: 'Sarah Williams', sold: 4, revenue: 150000 },
                ]);

                setHighSubscriptions([
                    { name: 'John Doe', months: 12, plan: 'Premium' },
                    { name: 'Jane Smith', months: 9, plan: 'Premium' },
                    { name: 'Mike Johnson', months: 8, plan: 'Business' },
                    { name: 'Sarah Williams', months: 6, plan: 'Premium' },
                    { name: 'Robert Brown', months: 6, plan: 'Business' },
                ]);

            } catch (error) {
                console.error('Failed to fetch top sellers data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTopSellers();
    }, [period]);

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
                    <p className="font-medium">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {entry.value.toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const renderActiveChart = () => {
        if (isLoading) {
            return (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Loading chart data...</div>
                </div>
            );
        }

        switch (activeTab) {
            case "views":
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={topSellersByViews}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            layout="vertical"
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="views" name="Total Views" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="listings" name="Listings" fill="#10b981" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case "valuation":
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={topSellersByValuation}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            layout="vertical"
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="valuation" name="Total Valuation" fill="#8884d8" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="items" name="Number of Items" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case "sold":
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={soldItems}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            layout="vertical"
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="sold" name="Items Sold" fill="#ff8042" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="revenue" name="Revenue" fill="#ffbb28" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case "subscriptions":
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={highSubscriptions}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="months"
                                nameKey="name"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {highSubscriptions.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                );
            default:
                return null;
        }
    };

    return (
        <DashboardSection title="Top Sellers">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                <div className="font-medium">
                    Top sellers for this {period}
                </div>
                <div className="flex gap-2 flex-wrap">
                    <div className="flex space-x-2">
                        <button
                            className={`px-3 py-1 text-sm rounded-md ${activeTab === "views" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            onClick={() => handleTabChange("views")}
                        >
                            By Views
                        </button>
                        <button
                            className={`px-3 py-1 text-sm rounded-md ${activeTab === "valuation" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            onClick={() => handleTabChange("valuation")}
                        >
                            By Valuation
                        </button>
                        <button
                            className={`px-3 py-1 text-sm rounded-md ${activeTab === "sold" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            onClick={() => handleTabChange("sold")}
                        >
                            Sold Items
                        </button>
                        <button
                            className={`px-3 py-1 text-sm rounded-md ${activeTab === "subscriptions" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            onClick={() => handleTabChange("subscriptions")}
                        >
                            Subscriptions
                        </button>
                    </div>
                    <div className="flex space-x-2 ml-auto">
                        <button
                            onClick={() => handlePeriodChange('week')}
                            className={`px-3 py-1 text-sm rounded-md ${period === 'week'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => handlePeriodChange('month')}
                            className={`px-3 py-1 text-sm rounded-md ${period === 'month'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => handlePeriodChange('quarter')}
                            className={`px-3 py-1 text-sm rounded-md ${period === 'quarter'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Quarter
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg p-4">
                {renderActiveChart()}
            </div>
        </DashboardSection>
    );
};

export default TopSellers; 