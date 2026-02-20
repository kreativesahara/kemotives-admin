import { useState, useEffect } from "react";
import axiosPrivate from "../../api/axios";
import DashboardSection from "../../layout/dataTable";
import ConditionalViewAll from "../../utils/conditionalViewAll";

const CarLocation = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [locationData, setLocationData] = useState([]);
    const [viewMode, setViewMode] = useState('inventory');
    const [topLocations, setTopLocations] = useState([]);

    useEffect(() => {
        const fetchLocationData = async () => {
            setIsLoading(true);
            try {
                // In a real scenario, we would fetch from the API
                const response = await axiosPrivate.get(`/api/car-locations?mode=${viewMode}`);
                setLocationData(response.data.locationData);
                setTopLocations(response.data.topLocations);
            } catch (error) {
                console.error('Failed to fetch location data:', error);
                // Mock data for development
                const mockData = getMockData(viewMode);
                setLocationData(mockData.locationData);
                setTopLocations(mockData.topLocations);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLocationData();
    }, [viewMode]);

    const getMockData = (mode) => {
        // Kenya counties data with mock values
        const inventoryData = [
            { id: 1, county: 'Nairobi', count: 482, percentage: 32.5 },
            { id: 2, county: 'Mombasa', count: 231, percentage: 15.6 },
            { id: 3, county: 'Kisumu', count: 145, percentage: 9.8 },
            { id: 4, county: 'Nakuru', count: 120, percentage: 8.1 },
            { id: 5, county: 'Eldoret', count: 98, percentage: 6.6 },
            { id: 6, county: 'Nyeri', count: 85, percentage: 5.7 },
            { id: 7, county: 'Machakos', count: 75, percentage: 5.1 },
            { id: 8, county: 'Kiambu', count: 68, percentage: 4.6 },
            { id: 9, county: 'Kajiado', count: 65, percentage: 4.4 },
            { id: 10, county: 'Other', count: 112, percentage: 7.6 },
        ];

        const salesData = [
            { id: 1, county: 'Nairobi', count: 215, percentage: 36.2 },
            { id: 2, county: 'Mombasa', count: 98, percentage: 16.5 },
            { id: 3, county: 'Kisumu', count: 54, percentage: 9.1 },
            { id: 4, county: 'Nakuru', count: 48, percentage: 8.1 },
            { id: 5, county: 'Eldoret', count: 35, percentage: 5.9 },
            { id: 6, county: 'Nyeri', count: 32, percentage: 5.4 },
            { id: 7, county: 'Machakos', count: 28, percentage: 4.7 },
            { id: 8, county: 'Kiambu', count: 26, percentage: 4.4 },
            { id: 9, county: 'Kajiado', count: 25, percentage: 4.2 },
            { id: 10, county: 'Other', count: 33, percentage: 5.5 },
        ];

        return {
            locationData: mode === 'inventory' ? inventoryData : salesData,
            topLocations: (mode === 'inventory' ? inventoryData : salesData).slice(0, 5),
        };
    };

    const handleModeChange = (mode) => {
        setViewMode(mode);
    };

    // Get total count
    const getTotalCount = () => {
        return locationData.reduce((total, location) => total + location.count, 0);
    };

    // Get background color based on percentage (simulate heatmap)
    const getHeatmapColor = (percentage) => {
        if (percentage >= 30) return 'bg-red-500';
        if (percentage >= 20) return 'bg-red-400';
        if (percentage >= 15) return 'bg-orange-500';
        if (percentage >= 10) return 'bg-orange-400';
        if (percentage >= 5) return 'bg-yellow-500';
        return 'bg-yellow-400';
    };

    return (
        <DashboardSection title="Geographic Distribution">
            <div className="flex justify-between items-center mb-4">
                <div className="font-medium">
                    {viewMode === 'inventory' ? 'Inventory' : 'Sales'} by Location: {getTotalCount()} total
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleModeChange('inventory')}
                        className={`px-3 py-1 text-sm rounded-md ${viewMode === 'inventory'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Inventory
                    </button>
                    <button
                        onClick={() => handleModeChange('sales')}
                        className={`px-3 py-1 text-sm rounded-md ${viewMode === 'sales'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Sales
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Loading location data...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Top 5 Locations */}
                    <div className="md:col-span-1 bg-white rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">Top Locations</h3>
                        <div className="space-y-4">
                            {topLocations.map((location) => (
                                <div key={location.id} className="flex items-center">
                                    <div className={`w-2 h-12 ${getHeatmapColor(location.percentage)} rounded-l-md`}></div>
                                    <div className="flex-1 bg-gray-50 p-2 rounded-r-md">
                                        <div className="flex justify-between">
                                            <span className="font-medium">{location.county}</span>
                                            <span className="text-sm text-gray-600">{location.count}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 h-1.5 mt-1 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${getHeatmapColor(location.percentage)}`}
                                                style={{ width: `${Math.min(100, location.percentage * 2)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Map Placeholder */}
                    <div className="md:col-span-2 bg-white rounded-lg p-4 flex flex-col">
                        <h3 className="text-lg font-medium mb-4">Heatmap View</h3>
                        <div className="flex-1 bg-gray-100 rounded-md flex items-center justify-center text-center p-6">
                            <div>
                                <div className="text-gray-500 mb-2">
                                    Map visualization would go here.
                                </div>
                                <div className="text-sm text-gray-400">
                                    In a production environment, this would integrate with a mapping library
                                    like react-leaflet or google-maps-react to display a heatmap of
                                    {viewMode === 'inventory' ? ' inventory' : ' sales'} data.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Full Data Table */}
                    <div className="md:col-span-3">
                        <div className="overflow-hidden shadow-sm rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            County
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Count
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Percentage
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Distribution
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {locationData.map((location) => (
                                        <tr key={location.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {location.county}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {location.count}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {location.percentage}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${getHeatmapColor(location.percentage)}`}
                                                        style={{ width: `${location.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            <ConditionalViewAll to="/reports" entityName="location reports" />
        </DashboardSection>
    );
};

export default CarLocation;
