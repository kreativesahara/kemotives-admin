import { useState, useEffect } from "react";
import axiosPrivate from "../../api/axios";
import DashboardSection from "../../dataTable";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const PaymentMetrics = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [revenueData, setRevenueData] = useState([]);
    const [transactionData, setTransactionData] = useState([]);
    const [period, setPeriod] = useState('week');
    const [viewMode, setViewMode] = useState('revenue');
    const [paymentMethods, setPaymentMethods] = useState([]);

    useEffect(() => {
        const fetchPaymentData = async () => {
            setIsLoading(true);
            try {
                // In a real scenario, we would fetch from the API
                const response = await axiosPrivate.get(`/api/payment-metrics?period=${period}`);
                setRevenueData(response.data.revenueData);
                setTransactionData(response.data.transactionData);
                setPaymentMethods(response.data.paymentMethods);
            } catch (error) {
                console.error('Failed to fetch payment data:', error);
                // Mock data for development
                const mockData = generateMockData(period);
                setRevenueData(mockData.revenueData);
                setTransactionData(mockData.transactionData);
                setPaymentMethods(mockData.paymentMethods);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPaymentData();
    }, [period]);

    // Generate mock data based on selected period
    const generateMockData = (period) => {
        const now = new Date();
        const revenueData = [];
        const transactionData = [];

        if (period === 'week') {
            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short' });

                // Revenue data
                revenueData.push({
                    date: formattedDate,
                    revenue: Math.floor(Math.random() * 500000) + 100000,
                    listings: Math.floor(Math.random() * 20000) + 5000,
                    subscriptions: Math.floor(Math.random() * 30000) + 10000,
                });

                // Transaction data
                transactionData.push({
                    date: formattedDate,
                    transactions: Math.floor(Math.random() * 50) + 20,
                    aov: Math.floor(Math.random() * 15000) + 10000,
                });
            }
        } else if (period === 'month') {
            // Last 30 days, but group by week for clarity
            for (let i = 3; i >= 0; i--) {
                const weekStart = new Date(now);
                weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
                const weekEnd = new Date(now);
                weekEnd.setDate(weekEnd.getDate() - (i * 7));

                const formattedDate = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

                // Revenue data
                revenueData.push({
                    date: `Week ${4 - i}`,
                    revenue: Math.floor(Math.random() * 2000000) + 500000,
                    listings: Math.floor(Math.random() * 80000) + 30000,
                    subscriptions: Math.floor(Math.random() * 120000) + 50000,
                });

                // Transaction data
                transactionData.push({
                    date: `Week ${4 - i}`,
                    transactions: Math.floor(Math.random() * 200) + 100,
                    aov: Math.floor(Math.random() * 15000) + 10000,
                });
            }
        }

        // Payment methods breakdown
        const paymentMethods = [
            { name: 'MPesa', value: 65 },
            { name: 'Bank Transfer', value: 15 },
            { name: 'Credit Card', value: 12 },
            { name: 'PayPal', value: 8 }
        ];

        return { revenueData, transactionData, paymentMethods };
    };

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
    };

    const handleViewChange = (newView) => {
        setViewMode(newView);
    };

    // Calculate totals
    const getTotalRevenue = () => {
        return revenueData.reduce((total, item) => total + item.revenue, 0);
    };

    const getTotalTransactions = () => {
        return transactionData.reduce((total, item) => total + item.transactions, 0);
    };

    // Get average order value
    const getAverageOrderValue = () => {
        if (transactionData.length === 0) return 0;
        return Math.floor(getTotalRevenue() / getTotalTransactions());
    };

    // Custom tooltip for the revenue chart
    const CustomRevenueTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
                    <p className="font-medium">{label}</p>
                    <p className="text-blue-600">
                        Revenue: KSH {payload[0].value.toLocaleString()}
                    </p>
                    <p className="text-green-600">
                        Listings: KSH {payload[1].value.toLocaleString()}
                    </p>
                    <p className="text-purple-600">
                        Subscriptions: KSH {payload[2].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Custom tooltip for the transaction chart
    const CustomTransactionTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
                    <p className="font-medium">{label}</p>
                    <p className="text-blue-600">
                        Transactions: {payload[0].value}
                    </p>
                    <p className="text-green-600">
                        Avg. Order Value: KSH {payload[1].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <DashboardSection title="Financial Metrics">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
                <div className="font-medium flex flex-wrap gap-3">
                    <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-lg">
                        Total Revenue: KSH {getTotalRevenue().toLocaleString()}
                    </div>
                    <div className="bg-green-50 text-green-800 px-3 py-1 rounded-lg">
                        Transactions: {getTotalTransactions()}
                    </div>
                    <div className="bg-purple-50 text-purple-800 px-3 py-1 rounded-lg">
                        AOV: KSH {getAverageOrderValue().toLocaleString()}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleViewChange('revenue')}
                            className={`px-3 py-1 text-sm rounded-md ${viewMode === 'revenue'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Revenue
                        </button>
                        <button
                            onClick={() => handleViewChange('transactions')}
                            className={`px-3 py-1 text-sm rounded-md ${viewMode === 'transactions'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Transactions
                        </button>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handlePeriodChange('week')}
                            className={`px-3 py-1 text-sm rounded-md ${period === 'week'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => handlePeriodChange('month')}
                            className={`px-3 py-1 text-sm rounded-md ${period === 'month'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Month
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Loading chart data...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart (Revenue or Transactions) */}
                    <div className="lg:col-span-2 bg-white rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">
                            {viewMode === 'revenue' ? 'Revenue Breakdown' : 'Transaction Metrics'}
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            {viewMode === 'revenue' ? (
                                <LineChart
                                    data={revenueData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis
                                        tickFormatter={(value) =>
                                            value >= 1000000
                                                ? `${(value / 1000000).toFixed(1)}M`
                                                : value >= 1000
                                                    ? `${(value / 1000).toFixed(0)}K`
                                                    : value
                                        }
                                    />
                                    <Tooltip content={<CustomRevenueTooltip />} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        name="Total Revenue"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        activeDot={{ r: 8 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="listings"
                                        name="Listing Fees"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="subscriptions"
                                        name="Subscription Revenue"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            ) : (
                                <BarChart
                                    data={transactionData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis yAxisId="left" />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        tickFormatter={(value) =>
                                            value >= 1000
                                                ? `${(value / 1000).toFixed(0)}K`
                                                : value
                                        }
                                    />
                                    <Tooltip content={<CustomTransactionTooltip />} />
                                    <Legend />
                                    <Bar
                                        yAxisId="left"
                                        dataKey="transactions"
                                        name="Transactions"
                                        fill="#3b82f6"
                                    />
                                    <Bar
                                        yAxisId="right"
                                        dataKey="aov"
                                        name="Avg. Order Value"
                                        fill="#10b981"
                                    />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>

                    {/* Payment Methods Breakdown */}
                    <div className="lg:col-span-1 bg-white rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
                        <div className="space-y-4">
                            {paymentMethods.map((method, index) => (
                                <div key={index}>
                                    <div className="flex justify-between mb-1">
                                        <span className="font-medium">{method.name}</span>
                                        <span>{method.value}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full"
                                            style={{
                                                width: `${method.value}%`,
                                                backgroundColor:
                                                    method.name === 'MPesa' ? '#3b82f6' :
                                                        method.name === 'Bank Transfer' ? '#10b981' :
                                                            method.name === 'Credit Card' ? '#f97316' : '#8b5cf6'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Additional Stats Cards */}
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500">Gross Margin</p>
                                <p className="text-lg font-bold">62.4%</p>
                                <p className="text-xs text-green-500">+2.3%</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500">Churn Rate</p>
                                <p className="text-lg font-bold">5.7%</p>
                                <p className="text-xs text-red-500">+0.8%</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500">Renewal Rate</p>
                                <p className="text-lg font-bold">84%</p>
                                <p className="text-xs text-green-500">+3.2%</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500">CAC Payback</p>
                                <p className="text-lg font-bold">2.4 mo</p>
                                <p className="text-xs text-green-500">-0.3 mo</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardSection>
    );
};

export default PaymentMetrics;
