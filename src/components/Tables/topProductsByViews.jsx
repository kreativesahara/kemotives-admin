import { useState, useEffect } from "react";
import axiosPrivate from "../../api/axios";
import DashboardSection from "../../layout/dataTable";

const TopProductsByViews = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [topProducts, setTopProducts] = useState([]);
    const [period, setPeriod] = useState('month');

    useEffect(() => {
        const fetchTopProducts = async () => {
            setIsLoading(true);
            try {
                // In a real scenario, we would fetch from the API with the period parameter
                const response = await axiosPrivate.get(`/api/top-products-by-views?period=${period}`);
                setTopProducts(response.data.products);
            } catch (error) {
                console.error('Failed to fetch top products data:', error);
                // Mock data for development
                setTopProducts([
                    { id: 1, name: 'Toyota Corolla 2020', views: 4250, clicks: 320, seller: 'John Doe', price: '1,350,000' },
                    { id: 2, name: 'BMW X5 2019', views: 3820, clicks: 287, seller: 'Sarah Williams', price: '3,200,000' },
                    { id: 3, name: 'Honda Civic 2021', views: 3540, clicks: 268, seller: 'Mike Johnson', price: '1,580,000' },
                    { id: 4, name: 'Mercedes C200 2018', views: 3210, clicks: 245, seller: 'Jane Smith', price: '2,150,000' },
                    { id: 5, name: 'Nissan X-Trail 2021', views: 2890, clicks: 210, seller: 'Robert Brown', price: '1,980,000' },
                    { id: 6, name: 'Mazda CX-5 2020', views: 2670, clicks: 198, seller: 'John Doe', price: '1,750,000' },
                    { id: 7, name: 'Subaru Forester 2019', views: 2450, clicks: 180, seller: 'Sarah Williams', price: '1,850,000' },
                    { id: 8, name: 'Audi A4 2018', views: 2320, clicks: 175, seller: 'Jane Smith', price: '2,450,000' },
                    { id: 9, name: 'Ford Ranger 2021', views: 2180, clicks: 165, seller: 'Mike Johnson', price: '2,100,000' },
                    { id: 10, name: 'Volkswagen Golf 2019', views: 2050, clicks: 155, seller: 'Robert Brown', price: '1,450,000' },
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTopProducts();
    }, [period]);

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
    };

    const calculateConversionRate = (views, clicks) => {
        return ((clicks / views) * 100).toFixed(1);
    };

    return (
        <DashboardSection title="Top Products by Views">
            <div className="flex justify-between items-center mb-4">
                <div className="font-medium">
                    Products with highest impressions this {period}
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
                    <button
                        onClick={() => handlePeriodChange('quarter')}
                        className={`px-3 py-1 text-sm rounded-md ${period === 'quarter'
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
                    <div className="animate-pulse text-gray-400">Loading product data...</div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (KES)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {topProducts.map((product, index) => (
                                <tr key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.seller}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{product.views.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-medium">{product.clicks.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <span className={`px-2 py-1 rounded-full text-xs ${parseFloat(calculateConversionRate(product.views, product.clicks)) > 7
                                            ? 'bg-green-100 text-green-800'
                                            : parseFloat(calculateConversionRate(product.views, product.clicks)) > 5
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {calculateConversionRate(product.views, product.clicks)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardSection>
    );
};

export default TopProductsByViews; 