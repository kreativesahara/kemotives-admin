import { useState, useEffect } from "react";
import axiosPrivate from "../../api/axios";
import DashboardSection from "../../dataTable";
import ConditionalViewAll from "../../utils/conditionalViewAll";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ActiveUsers = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [activeUserData, setActiveUserData] = useState([]);
    const [daumauRatio, setDaumauRatio] = useState(0);
    const [period, setPeriod] = useState('week');

    useEffect(() => {
        const fetchActiveUserData = async () => {
            setIsLoading(true);
            try {
                // In a real scenario, this would fetch from the API
                const response = await axiosPrivate.get(`/api/active-users?period=${period}`);
                setActiveUserData(response.data.activeUserData);
                setDaumauRatio(response.data.daumauRatio);
            } catch (error) {
                console.error('Failed to fetch active user data:', error);
                // Mock data for development
                const mockData = generateMockData(period);
                setActiveUserData(mockData);
                // Calculate DAU/MAU ratio from mock data
                if (period === 'month') {
                    const dau = mockData[mockData.length - 1].daily;
                    const mau = mockData[mockData.length - 1].monthly;
                    setDaumauRatio(((dau / mau) * 100).toFixed(1));
                } else {
                    setDaumauRatio("23.5");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchActiveUserData();
    }, [period]);

    // Generate mock data based on selected period
    const generateMockData = (period) => {
        const now = new Date();
        const data = [];

        if (period === 'week') {
            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                data.push({
                    date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    daily: Math.floor(Math.random() * 100) + 150,
                    returning: Math.floor(Math.random() * 50) + 75,
                });
            }
        } else if (period === 'month') {
            // Last 30 days
            for (let i = 29; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const daily = Math.floor(Math.random() * 100) + 150;
                const returning = Math.floor(Math.random() * 50) + 75;
                data.push({
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    daily: daily,
                    returning: returning,
                    monthly: 650 + Math.floor(Math.random() * 50), // Simulate MAU
                });
            }
        }

        return data;
    };

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
    };

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
                    <p className="font-medium">{label}</p>
                    <p className="text-blue-600">
                        Daily Active: {payload[0].value}
                    </p>
                    {payload[1] && (
                        <p className="text-green-600">
                            Returning: {payload[1].value}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <DashboardSection title="User Engagement">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <div className="font-medium mr-3">
                        {period === 'week' ? 'Last 7 Days' : 'Last 30 Days'}
                    </div>
                    {period === 'month' && (
                        <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-lg text-sm">
                            DAU/MAU: {daumauRatio}%
                        </div>
                    )}
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

            {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Loading chart data...</div>
                </div>
            ) : (
                <div>
                    <div className="bg-white rounded-lg p-4">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart
                                data={activeUserData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="daily"
                                    name="Daily Active Users"
                                    stackId="1"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.6}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="returning"
                                    name="Returning Users"
                                    stackId="2"
                                    stroke="#10b981"
                                    fill="#10b981"
                                    fillOpacity={0.6}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-gray-500 text-sm">Avg. Session Duration</p>
                            <h3 className="text-xl font-bold">12m 24s</h3>
                            <p className="text-green-500 text-sm">+5.3% vs last period</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-gray-500 text-sm">Bounce Rate</p>
                            <h3 className="text-xl font-bold">24.8%</h3>
                            <p className="text-red-500 text-sm">+2.1% vs last period</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-gray-500 text-sm">Retention Rate (30d)</p>
                            <h3 className="text-xl font-bold">68%</h3>
                            <p className="text-green-500 text-sm">+3.5% vs last period</p>
                        </div>
                    </div>
                </div>
            )}
            <ConditionalViewAll to="/users" entityName="active users" />
        </DashboardSection>
    );
};

export default ActiveUsers;
