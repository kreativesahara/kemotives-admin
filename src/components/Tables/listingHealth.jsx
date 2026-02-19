import { useState, useEffect } from "react";
import axiosPrivate from "../../api/axios";
import DashboardSection from "../../App/admin/Tables/dataTable";
import ConditionalViewAll from "../../utils/conditionalViewAll";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#ef4444'];
const RADIAN = Math.PI / 180;

const ListingHealth = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [listingData, setListingData] = useState([]);

    useEffect(() => {
        const fetchListingHealth = async () => {
            setIsLoading(true);
            try {
                // In a real scenario, we would fetch from the API
                const response = await axiosPrivate.get('/api/listing-health');
                setListingData(response.data.listingData);
            } catch (error) {
                console.error('Failed to fetch listing health data:', error);
                // Mock data for development
                setListingData([
                    { name: 'Active', value: 350, color: '#10b981' },
                    { name: 'Pending', value: 125, color: '#f97316' },
                    { name: 'Sold', value: 220, color: '#3b82f6' },
                    { name: 'Expired', value: 45, color: '#ef4444' },
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchListingHealth();
    }, []);

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
                    <p className="font-medium" style={{ color: payload[0].payload.color }}>
                        {payload[0].name}
                    </p>
                    <p className="text-gray-700">
                        Count: {payload[0].value}
                    </p>
                    <p className="text-gray-700">
                        Percentage: {((payload[0].value / getTotalListings()) * 100).toFixed(1)}%
                    </p>
                </div>
            );
        }
        return null;
    };

    // Custom label for the pie sections
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                fontSize={14}
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    // Calculate total listings
    const getTotalListings = () => {
        return listingData.reduce((total, item) => total + item.value, 0);
    };

    return (
        <DashboardSection title="Listing Health">
            {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Loading chart data...</div>
                </div>
            ) : (
                <div className="bg-white rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="font-medium">
                            Total Listings: {getTotalListings()}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/2">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={listingData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        outerRadius={120}
                                        innerRadius={60}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {listingData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="md:w-1/2">
                            <div className="grid grid-cols-2 gap-4 p-4">
                                {listingData.map((item, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                        <div className="mt-2">
                                            <div className="text-xl font-bold">{item.value}</div>
                                            <div className="text-sm text-gray-500">
                                                {((item.value / getTotalListings()) * 100).toFixed(1)}% of total
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ConditionalViewAll to="/products" entityName="listings" />
        </DashboardSection>
    );
};

export default ListingHealth; 