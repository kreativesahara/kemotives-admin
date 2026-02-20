import { useState, useEffect } from "react";
import axiosPrivate from "../../api/axios";
import DashboardSection from "../../layout/dataTable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ef4444', '#06b6d4'];

const ListingRenewalMetrics = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [renewalData, setRenewalData] = useState({});
    const [renewalByCategory, setRenewalByCategory] = useState([]);
    const [renewalTrend, setRenewalTrend] = useState([]);
    const [timeframe, setTimeframe] = useState('month');
    const [viewMode, setViewMode] = useState('rate');
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'ascending'
    });
    const [upcomingExpirations, setUpcomingExpirations] = useState([]);

    useEffect(() => {
        const fetchRenewalData = async () => {
            setIsLoading(true);
            try {
                // In a real scenario, we would fetch from the API
                const response = await axiosPrivate.get(`/api/listing-renewals?timeframe=${timeframe}`);
                setRenewalData(response.data.renewalData);
                setRenewalByCategory(response.data.renewalByCategory);
                setRenewalTrend(response.data.renewalTrend);
            } catch (error) {
                console.error('Failed to fetch renewal data:', error);
                // Mock data for development
                const mockData = generateMockData(timeframe);
                setRenewalData(mockData.renewalData);
                setRenewalByCategory(mockData.renewalByCategory);
                setRenewalTrend(mockData.renewalTrend);
                // Generate mock data for upcoming expirations
                generateUpcomingExpirations();
            } finally {
                setIsLoading(false);
            }
        };

        fetchRenewalData();
    }, [timeframe]);

    // Generate mock data for upcoming expirations
    const generateUpcomingExpirations = () => {
        const mockExpirations = Array.from({ length: 5 }).map((_, index) => {
            const daysLeft = Math.floor(Math.random() * 14) + 1;
            const previousRenewals = Math.floor(Math.random() * 4);
            const category = ['SUV', 'Sedan', 'Hatchback', 'Truck', 'Luxury'][Math.floor(Math.random() * 5)];
            const fee = Math.floor(Math.random() * 5000) + 3000;

            return {
                id: 10025 + index,
                title: `Toyota ${['Camry', 'Corolla', 'RAV4', 'Hilux', 'Land Cruiser'][index]} ${2018 + index}`,
                category,
                daysLeft,
                previousRenewals,
                fee
            };
        });

        setUpcomingExpirations(mockExpirations);
    };

    // Generate mock data based on selected timeframe
    const generateMockData = (timeframe) => {
        // Main renewal metrics
        const renewalData = {
            totalExpired: 385,
            totalRenewed: 218,
            renewalRate: 56.6,
            averageRenewals: 1.8,
            maxRenewals: 5,
            potentialRevenue: 654000,
            missedRevenue: 501000
        };

        // Renewal by category data
        const categories = ['SUV', 'Sedan', 'Hatchback', 'Truck', 'Luxury', 'Electric'];
        const renewalByCategory = categories.map(category => {
            const rate = Math.floor(Math.random() * 40) + 30; // 30-70% renewal rate
            return {
                name: category,
                renewalRate: rate,
                avgRenewals: ((Math.random() * 2) + 1).toFixed(1),
                count: Math.floor(Math.random() * 50) + 20
            };
        });

        // Renewal trend data for line chart
        const renewalTrend = [];
        const numberOfPoints = timeframe === 'month' ? 30 : timeframe === 'quarter' ? 12 : 6;

        for (let i = 0; i < numberOfPoints; i++) {
            const date = new Date();
            if (timeframe === 'month') {
                date.setDate(date.getDate() - i);
                renewalTrend.unshift({
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    renewalRate: Math.floor(Math.random() * 30) + 40, // 40-70% renewal rate
                    expirations: Math.floor(Math.random() * 15) + 5, // 5-20 expirations
                    renewals: Math.floor(Math.random() * 10) + 3, // 3-13 renewals
                });
            } else if (timeframe === 'quarter') {
                date.setDate(date.getDate() - (i * 7)); // Weekly data for quarter
                renewalTrend.unshift({
                    date: `Week ${numberOfPoints - i}`,
                    renewalRate: Math.floor(Math.random() * 30) + 40,
                    expirations: Math.floor(Math.random() * 80) + 20,
                    renewals: Math.floor(Math.random() * 50) + 10,
                });
            } else {
                date.setMonth(date.getMonth() - i);
                renewalTrend.unshift({
                    date: date.toLocaleDateString('en-US', { month: 'short' }),
                    renewalRate: Math.floor(Math.random() * 30) + 40,
                    expirations: Math.floor(Math.random() * 150) + 50,
                    renewals: Math.floor(Math.random() * 100) + 25,
                });
            }
        }

        return { renewalData, renewalByCategory, renewalTrend };
    };

    // Sorting function
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Get sorted items
    const getSortedItems = (items) => {
        if (!sortConfig.key) return items;

        return [...items].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    };

    // Helper function to get sort indicator
    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    };

    const handleTimeframeChange = (newTimeframe) => {
        setTimeframe(newTimeframe);
    };

    const handleViewChange = (newView) => {
        setViewMode(newView);
    };

    // Custom tooltip for Renewal Rate chart
    const CustomRateTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
                    <p className="font-medium">{label}</p>
                    <p className="text-blue-600">
                        Renewal Rate: {payload[0].value}%
                    </p>
                    <p className="text-green-600">
                        Expirations: {payload[1].value}
                    </p>
                    <p className="text-purple-600">
                        Renewals: {payload[2].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Custom tooltip for category chart
    const CustomCategoryTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
                    <p className="font-medium">{payload[0].name}</p>
                    <p className="text-blue-600">
                        Renewal Rate: {payload[0].value}%
                    </p>
                    <p className="text-gray-600">
                        Avg. Renewals: {payload[0].payload.avgRenewals}
                    </p>
                    <p className="text-gray-600">
                        Count: {payload[0].payload.count}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Format distribution by frequency of renewal (0, 1, 2, 3, 4, 5+)
    const getRenewalDistribution = () => {
        return [
            { name: "0 (Expired)", value: renewalData.totalExpired - renewalData.totalRenewed },
            { name: "1 time", value: Math.round(renewalData.totalRenewed * 0.45) },
            { name: "2 times", value: Math.round(renewalData.totalRenewed * 0.25) },
            { name: "3 times", value: Math.round(renewalData.totalRenewed * 0.15) },
            { name: "4 times", value: Math.round(renewalData.totalRenewed * 0.10) },
            { name: "5+ times", value: Math.round(renewalData.totalRenewed * 0.05) }
        ];
    };

    return (
        <DashboardSection title="Listing Renewal Metrics (90-Day Cycle)">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
                <div className="font-medium flex flex-wrap gap-3">
                    <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-lg">
                        Renewal Rate: {renewalData.renewalRate}%
                    </div>
                    <div className="bg-green-50 text-green-800 px-3 py-1 rounded-lg">
                        Avg. Renewals: {renewalData.averageRenewals}
                    </div>
                    <div className="bg-purple-50 text-purple-800 px-3 py-1 rounded-lg">
                        Potential Revenue: KSH {renewalData.potentialRevenue?.toLocaleString()}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleViewChange('rate')}
                            className={`px-3 py-1 text-sm rounded-md ${viewMode === 'rate'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Renewal Rate
                        </button>
                        <button
                            onClick={() => handleViewChange('distribution')}
                            className={`px-3 py-1 text-sm rounded-md ${viewMode === 'distribution'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Distribution
                        </button>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleTimeframeChange('month')}
                            className={`px-3 py-1 text-sm rounded-md ${timeframe === 'month'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => handleTimeframeChange('quarter')}
                            className={`px-3 py-1 text-sm rounded-md ${timeframe === 'quarter'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Quarter
                        </button>
                        <button
                            onClick={() => handleTimeframeChange('halfyear')}
                            className={`px-3 py-1 text-sm rounded-md ${timeframe === 'halfyear'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            6 Months
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Loading renewal data...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart (Rate or Distribution) */}
                    <div className="lg:col-span-2 bg-white rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">
                            {viewMode === 'rate' ? 'Renewal Rate Over Time' : 'Renewal Frequency Distribution'}
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            {viewMode === 'rate' ? (
                                <LineChart
                                    data={renewalTrend}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis yAxisId="left" domain={[0, 100]} />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip content={<CustomRateTooltip />} />
                                    <Legend />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="renewalRate"
                                        name="Renewal Rate (%)"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        activeDot={{ r: 8 }}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="expirations"
                                        name="Expirations"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="renewals"
                                        name="Renewals"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            ) : (
                                <BarChart
                                    data={getRenewalDistribution()}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" name="Number of Listings" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                        {getRenewalDistribution().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>

                    {/* Category Chart */}
                    <div className="lg:col-span-1 bg-white rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">Renewal by Category</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={renewalByCategory}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                layout="vertical"
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} />
                                <YAxis dataKey="name" type="category" width={80} />
                                <Tooltip content={<CustomCategoryTooltip />} />
                                <Legend />
                                <Bar
                                    dataKey="renewalRate"
                                    name="Renewal Rate (%)"
                                    fill="#3b82f6"
                                    radius={[0, 4, 4, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>

                        {/* Revenue Stats */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500">Projected 90d Revenue</p>
                                <p className="text-lg font-bold">KSH {(renewalData.potentialRevenue / 1000).toFixed(0)}K</p>
                                <p className="text-xs text-green-500">+8.2% vs last period</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500">Missed Revenue</p>
                                <p className="text-lg font-bold">KSH {(renewalData.missedRevenue / 1000).toFixed(0)}K</p>
                                <p className="text-xs text-red-500">+12.5% vs last period</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500">Current Expiring</p>
                                <p className="text-lg font-bold">{Math.round(renewalData.totalExpired * 0.1)}</p>
                                <p className="text-xs text-gray-500">Next 7 days</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500">Renewal Opportunity</p>
                                <p className="text-lg font-bold">KSH {(renewalData.potentialRevenue * 0.1 / 1000).toFixed(0)}K</p>
                                <p className="text-xs text-blue-500">Next 7 days</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Data table showing listings approaching expiration */}
            <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Upcoming Expirations</h3>
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => requestSort('title')}
                                    >
                                        Listing {getSortIndicator('title')}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => requestSort('category')}
                                    >
                                        Category {getSortIndicator('category')}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => requestSort('daysLeft')}
                                    >
                                        Expires In {getSortIndicator('daysLeft')}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => requestSort('previousRenewals')}
                                    >
                                        Previous Renewals {getSortIndicator('previousRenewals')}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => requestSort('fee')}
                                    >
                                        Renewal Fee {getSortIndicator('fee')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {getSortedItems(upcomingExpirations).map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{item.title}</div>
                                            <div className="text-xs text-gray-500">{`ID: #${item.id}`}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm font-medium ${item.daysLeft <= 3 ? 'text-red-600' : item.daysLeft <= 7 ? 'text-orange-600' : 'text-gray-900'}`}>
                                                {item.daysLeft} days
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.previousRenewals}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            KSH {item.fee.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button className="text-blue-600 hover:text-blue-900 text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded">
                                                Notify Seller
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardSection>
    );
};

export default ListingRenewalMetrics; 