import { useState, useEffect } from "react";
import axiosPrivate from "../../../api/axios";
import DashboardSection from "../Tables/dataTable";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SalesTrends = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [salesData, setSalesData] = useState([]);
    const [timeframe, setTimeframe] = useState('monthly');

    useEffect(() => {
        const fetchSalesData = async () => {
            setIsLoading(true);
            try {
                // In a real scenario, we would fetch from the API with the timeframe parameter
                const response = await axiosPrivate.get(`/api/sales?timeframe=${timeframe}`);
                setSalesData(response.data.salesData);
            } catch (error) {
                console.error('Failed to fetch sales data:', error);
                // Mock data for development
                const mockData = generateMockData(timeframe);
                setSalesData(mockData);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSalesData();
    }, [timeframe]);

    // Generate mock data based on the selected timeframe
    const generateMockData = (timeframe) => {
        const now = new Date();
        const data = [];

        if (timeframe === 'daily') {
            // Last 14 days
            for (let i = 13; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                data.push({
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    sales: Math.floor(Math.random() * 10) + 5,
                    revenue: (Math.random() * 10000000 + 5000000).toFixed(0)
                });
            }
        } else if (timeframe === 'weekly') {
            // Last 10 weeks
            for (let i = 9; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - (i * 7));
                data.push({
                    date: `Week ${10-i}`,
                    sales: Math.floor(Math.random() * 30) + 20,
                    revenue: (Math.random() * 30000000 + 15000000).toFixed(0)
                });
            }
        } else {
            // Last 12 months
            for (let i = 11; i >= 0; i--) {
                const date = new Date(now);
                date.setMonth(date.getMonth() - i);
                data.push({
                    date: date.toLocaleDateString('en-US', { month: 'short' }),
                    sales: Math.floor(Math.random() * 100) + 50,
                    revenue: (Math.random() * 100000000 + 50000000).toFixed(0)
                });
            }
        }

        return data;
    };

    const handleTimeframeChange = (newTimeframe) => {
        setTimeframe(newTimeframe);
    };

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
                    <p className="font-medium">{label}</p>
                    <p className="text-blue-600">
                        Sales: {payload[0].value}
                    </p>
                    <p className="text-green-600">
                        Revenue: KSH {parseInt(payload[1].value).toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Format large numbers for the Y-axis
    const formatYAxis = (value) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value;
    };

    return (
        <DashboardSection title="Sales Trends">
            <div className="flex justify-between items-center mb-4">
                <div className="font-medium">
                    {timeframe === 'daily' ? 'Last 14 Days' : 
                     timeframe === 'weekly' ? 'Last 10 Weeks' : 'Last 12 Months'}
                </div>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => handleTimeframeChange('daily')}
                        className={`px-3 py-1 text-sm rounded-md ${
                            timeframe === 'daily' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Daily
                    </button>
                    <button 
                        onClick={() => handleTimeframeChange('weekly')}
                        className={`px-3 py-1 text-sm rounded-md ${
                            timeframe === 'weekly' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Weekly
                    </button>
                    <button 
                        onClick={() => handleTimeframeChange('monthly')}
                        className={`px-3 py-1 text-sm rounded-md ${
                            timeframe === 'monthly' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Loading chart data...</div>
                </div>
            ) : (
                <div className="bg-white rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={salesData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" tickFormatter={formatYAxis} />
                            <YAxis yAxisId="right" orientation="right" tickFormatter={formatYAxis} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="sales"
                                name="Sales Count"
                                stroke="#3b82f6"
                                activeDot={{ r: 8 }}
                                strokeWidth={2}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="revenue"
                                name="Revenue (KSH)"
                                stroke="#10b981"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </DashboardSection>
    );
};

export default SalesTrends; 