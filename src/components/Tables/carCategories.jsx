import { useState, useEffect } from "react";
import axiosPrivate from "../../api/axios";
import DashboardSection from "../../layout/dataTable";
import ConditionalViewAll from "../../utils/conditionalViewAll";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#f59e0b'];

const CarCategories = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [categoryData, setCategoryData] = useState([]);
    const [topModelsData, setTopModelsData] = useState([]);
    const [viewType, setViewType] = useState('categories');

    useEffect(() => {
        const fetchCategoryData = async () => {
            setIsLoading(true);
            try {
                // In a real scenario, we would fetch from the API
                const response = await axiosPrivate.get('/api/car-categories');
                setCategoryData(response.data.categoryData);
                setTopModelsData(response.data.topModelsData);
            } catch (error) {
                console.error('Failed to fetch car category data:', error);
                // Mock data for development
                setCategoryData([
                    { name: 'SUV', value: 420, percentage: 32 },
                    { name: 'Sedan', value: 380, percentage: 29 },
                    { name: 'Hatchback', value: 210, percentage: 16 },
                    { name: 'Truck', value: 120, percentage: 9 },
                    { name: 'Luxury', value: 95, percentage: 7 },
                    { name: 'Electric', value: 65, percentage: 5 },
                    { name: 'Other', value: 25, percentage: 2 },
                ]);
                setTopModelsData([
                    { name: 'Toyota Corolla', count: 78, growth: 12 },
                    { name: 'Honda Civic', count: 65, growth: -3 },
                    { name: 'Toyota RAV4', count: 62, growth: 18 },
                    { name: 'Mazda CX-5', count: 58, growth: 8 },
                    { name: 'Nissan X-Trail', count: 52, growth: 5 },
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategoryData();
    }, []);

    const handleViewChange = (newView) => {
        setViewType(newView);
    };

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
                    <p className="font-medium">{payload[0].name}</p>
                    <p className="text-gray-700">
                        Count: {payload[0].value}
                    </p>
                    <p className="text-gray-700">
                        {payload[0].payload.percentage}% of inventory
                    </p>
                </div>
            );
        }
        return null;
    };

    // Custom tooltip for the bar chart
    const BarTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
                    <p className="font-medium">{payload[0].payload.name}</p>
                    <p className="text-blue-600">
                        Count: {payload[0].value}
                    </p>
                    <p className={payload[0].payload.growth >= 0 ? "text-green-600" : "text-red-600"}>
                        Growth: {payload[0].payload.growth}%
                    </p>
                </div>
            );
        }
        return null;
    };

    // Calculate total count
    const getTotalCount = () => {
        return categoryData.reduce((total, item) => total + item.value, 0);
    };

    return (
        <DashboardSection title="Inventory by Category">
            <div className="flex justify-between items-center mb-4">
                <div className="font-medium">
                    Total Inventory: {getTotalCount()}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleViewChange('categories')}
                        className={`px-3 py-1 text-sm rounded-md ${viewType === 'categories'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Categories
                    </button>
                    <button
                        onClick={() => handleViewChange('models')}
                        className={`px-3 py-1 text-sm rounded-md ${viewType === 'models'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Top Models
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Loading chart data...</div>
                </div>
            ) : (
                viewType === 'categories' ? (
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/2">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="md:w-1/2">
                            <div className="grid grid-cols-1 gap-4 p-4">
                                {categoryData.map((item, index) => (
                                    <div key={index} className="flex items-center">
                                        <div
                                            className="w-4 h-4 rounded-full mr-2"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        ></div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium">{item.name}</span>
                                                <span className="text-sm">{item.value} ({item.percentage}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full"
                                                    style={{
                                                        width: `${item.percentage}%`,
                                                        backgroundColor: COLORS[index % COLORS.length]
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg p-4">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={topModelsData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                layout="vertical"
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} />
                                <Tooltip content={<BarTooltip />} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )
            )}
            <ConditionalViewAll to="/products" entityName="categories" />
        </DashboardSection>
    );
};

export default CarCategories;
