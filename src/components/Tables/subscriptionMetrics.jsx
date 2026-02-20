import { useState, useEffect } from "react";
import axiosPrivate from "../../api/axios";
import DashboardSection from "../../layout/dataTable";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f97316'];
const PLAN_COLORS = {
    'Basic': '#6b7280',
    'Standard': '#3b82f6',
    'Premium': '#8b5cf6'
};

const SubscriptionMetrics = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [subscriptionData, setSubscriptionData] = useState([]);
    const [subscriptionDistribution, setSubscriptionDistribution] = useState([]);
    const [mrrData, setMrrData] = useState({});
    const [period, setPeriod] = useState('quarter');

    useEffect(() => {
        const fetchSubscriptionData = async () => {
            setIsLoading(true);
            try {
                // In a real scenario, we would fetch from the API
                const response = await axiosPrivate.get(`/api/subscription-metrics?period=${period}`);
                setSubscriptionData(response.data.subscriptionData);
                setSubscriptionDistribution(response.data.subscriptionDistribution);
                setMrrData(response.data.mrrData);
            } catch (error) {
                console.error('Failed to fetch subscription data:', error);
                // Mock data for development
                const mockData = generateMockData(period);
                setSubscriptionData(mockData.subscriptionData);
                setSubscriptionDistribution(mockData.subscriptionDistribution);
                setMrrData(mockData.mrrData);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubscriptionData();
    }, [period]);

    // Generate mock data based on selected period
    const generateMockData = (period) => {
        const now = new Date();
        const data = [];

        // Determine how many data points based on period
        const dataPoints = period === 'quarter' ? 3 : period === 'halfyear' ? 6 : 12;

        for (let i = dataPoints - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setMonth(date.getMonth() - i);

            const newSubs = Math.floor(Math.random() * 20) + 15;
            const churnedSubs = Math.floor(Math.random() * 10) + 5;

            // Calculate the cumulative total (assuming we started with 50)
            // This is simplified - in real data you'd have actual cumulative values
            const total = 50 + (i === dataPoints - 1 ? 0 : data[0].newSubs - data[0].churnedSubs);

            data.unshift({
                date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                newSubs: newSubs,
                churnedSubs: churnedSubs,
                netGrowth: newSubs - churnedSubs,
                totalSubs: total + newSubs - churnedSubs
            });
        }

        // Subscription distribution by plan
        const subscriptionDistribution = [
            { name: 'Basic', value: 45, count: 124 },
            { name: 'Standard', value: 35, count: 95 },
            { name: 'Premium', value: 20, count: 54 }
        ];

        // MRR data
        const mrrData = {
            current: 1250000,
            growth: 12.5,
            arpu: 15000,
            arr: 15000000
        };

        return {
            subscriptionData: data,
            subscriptionDistribution,
            mrrData
        };
    };

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
    };

    // Calculate totals
    const getTotalSubscribers = () => {
        return subscriptionData.length > 0 ? subscriptionData[subscriptionData.length - 1].totalSubs : 0;
    };

    const getNetGrowth = () => {
        if (subscriptionData.length === 0) return 0;
        return subscriptionData[subscriptionData.length - 1].netGrowth;
    };

    // Custom tooltip for the area chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
                    <p className="font-medium">{label}</p>
                    <p className="text-blue-600">
                        New: +{payload[0].value}
                    </p>
                    <p className="text-red-600">
                        Churned: -{payload[1].value}
                    </p>
                    <p className="text-green-600">
                        Net Growth: {payload[2].value}
                    </p>
                    <p className="text-purple-600">
                        Total: {payload[3].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Custom tooltip for the pie chart
    const PieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
                    <p className="font-medium">{payload[0].name} Plan</p>
                    <p className="text-gray-600">
                        Subscribers: {payload[0].payload.count}
                    </p>
                    <p className="text-gray-600">
                        Percentage: {payload[0].value}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <DashboardSection title="Subscription Analytics">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
                <div className="font-medium flex flex-wrap gap-3">
                    <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-lg">
                        Total Subscribers: {getTotalSubscribers()}
                    </div>
                    <div className={`${getNetGrowth() >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'} px-3 py-1 rounded-lg`}>
                        Net Growth: {getNetGrowth() >= 0 ? '+' : ''}{getNetGrowth()}
                    </div>
                    <div className="bg-purple-50 text-purple-800 px-3 py-1 rounded-lg">
                        MRR: KSH {mrrData.current?.toLocaleString() || 0}
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handlePeriodChange('quarter')}
                        className={`px-3 py-1 text-sm rounded-md ${period === 'quarter'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        3 Months
                    </button>
                    <button
                        onClick={() => handlePeriodChange('halfyear')}
                        className={`px-3 py-1 text-sm rounded-md ${period === 'halfyear'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        6 Months
                    </button>
                    <button
                        onClick={() => handlePeriodChange('year')}
                        className={`px-3 py-1 text-sm rounded-md ${period === 'year'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        12 Months
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Loading chart data...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Subscription Chart */}
                    <div className="lg:col-span-2 bg-white rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">Subscription Growth</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart
                                data={subscriptionData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="newSubs"
                                    name="New Subscribers"
                                    stackId="1"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="churnedSubs"
                                    name="Churned Subscribers"
                                    stackId="2"
                                    stroke="#ef4444"
                                    fill="#ef4444"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="netGrowth"
                                    name="Net Growth"
                                    stackId="3"
                                    stroke="#10b981"
                                    fill="#10b981"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="totalSubs"
                                    name="Total Subscribers"
                                    stackId="4"
                                    stroke="#8b5cf6"
                                    fill="#8b5cf6"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Subscription Distribution */}
                    <div className="lg:col-span-1 bg-white rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">Plan Distribution</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={subscriptionDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {subscriptionDistribution.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={PLAN_COLORS[entry.name] || COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<PieTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* MRR Stats Cards */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500">MRR Growth</p>
                                <p className="text-lg font-bold">+{mrrData.growth}%</p>
                                <p className="text-xs text-gray-500">month-over-month</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500">ARPU</p>
                                <p className="text-lg font-bold">KSH {mrrData.arpu?.toLocaleString() || 0}</p>
                                <p className="text-xs text-green-500">+2.5%</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500">ARR</p>
                                <p className="text-lg font-bold">KSH {(mrrData.arr / 1000000).toFixed(1)}M</p>
                                <p className="text-xs text-green-500">+{mrrData.growth}%</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500">Churn Rate</p>
                                <p className="text-lg font-bold">5.7%</p>
                                <p className="text-xs text-red-500">+0.8%</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardSection>
    );
};

export default SubscriptionMetrics;
