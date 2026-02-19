import { useState, useEffect } from "react";
import axiosPrivate from "../../api/axios";
import DashboardSection from "../../App/admin/Tables/dataTable";
import ConditionalViewAll from "../../utils/conditionalViewAll";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TopModels = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [topModels, setTopModels] = useState([]);
    const [period, setPeriod] = useState('month');

    useEffect(() => {
        const fetchTopModels = async () => {
            setIsLoading(true);
            try {
                // In a real scenario, we would fetch from the API with the period parameter
                const response = await axiosPrivate.get(`/api/top-models?period=${period}`);
                setTopModels(response.data.topModels);
            } catch (error) {
                console.error('Failed to fetch top models data:', error);
                // Mock data for development
                setTopModels([
                    { name: 'Toyota Corolla', sales: 42, growth: 15 },
                    { name: 'Honda Civic', sales: 38, growth: -5 },
                    { name: 'Toyota Rav4', sales: 35, growth: 20 },
                    { name: 'Mazda CX-5', sales: 30, growth: 8 },
                    { name: 'Nissan X-Trail', sales: 28, growth: 12 },
                    { name: 'BMW X3', sales: 22, growth: -2 },
                    { name: 'Mercedes C-Class', sales: 20, growth: 5 },
                    { name: 'Subaru Forester', sales: 18, growth: 3 }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTopModels();
    }, [period]);

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
                        Sales: {payload[0].value}
                    </p>
                    <p className={payload[1].value >= 0 ? "text-green-600" : "text-red-600"}>
                        Growth: {payload[1].value}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <DashboardSection title="Top Selling Models">
            <div className="flex justify-between items-center mb-4">
                <div className="font-medium">
                    Top {topModels.length} selling models this {period}
                </div>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => handlePeriodChange('week')}
                        className={`px-3 py-1 text-sm rounded-md ${
                            period === 'week' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Week
                    </button>
                    <button 
                        onClick={() => handlePeriodChange('month')}
                        className={`px-3 py-1 text-sm rounded-md ${
                            period === 'month' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Month
                    </button>
                    <button 
                        onClick={() => handlePeriodChange('quarter')}
                        className={`px-3 py-1 text-sm rounded-md ${
                            period === 'quarter' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Quarter
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
                        <BarChart
                            data={topModels}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            layout="vertical"
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="sales" name="Sales" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="growth" name="Growth %" fill="#10b981" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
            <ConditionalViewAll to="/reports" entityName="models" />
        </DashboardSection>
    );
};

export default TopModels; 