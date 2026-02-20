import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Badge from "../../utils/badges";
import axiosPrivate from "../../api/axios";
import DashboardSection from "../../dataTable";
import ConditionalViewAll from "../../utils/conditionalViewAll";
//import LoadingSpinner from "../utils/loadingspinner";
const RecentProducts = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [recentProducts, setRecentProducts] = useState([]);
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'ascending'
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const response = await axiosPrivate.get('/api/dashboard');
                const { recentProducts } = response.data;
                setRecentProducts(recentProducts);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
                setRecentProducts([
                    { id: 1, title: 'Toyota Camry 2020', price: 2500000, status: 'Active', seller: 'Alice Smith' },
                    { id: 2, title: 'Honda Accord 2019', price: 2200000, status: 'Active', seller: 'Dave Wilson' },
                    { id: 3, title: 'BMW X5 2018', price: 3500000, status: 'Pending', seller: 'John Miller' },
                    { id: 4, title: 'Mercedes-Benz E-Class', price: 4000000, status: 'Active', seller: 'Sarah Thomas' },
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Request sort function
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Sort data function
    const getSortedProducts = () => {
        const sortableProducts = [...recentProducts];
        if (sortConfig.key !== null) {
            sortableProducts.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        // Limit to 15 items for dashboard view
        return sortableProducts.slice(0, 15);
    };

    // Helper function for sort indicator
    const getSortIndicator = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
        }
        return '';
    };

    return (
        <DashboardSection title="Recent Products">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr className="border-b">
                            <th
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => requestSort('title')}
                            >
                                Title{getSortIndicator('title')}
                            </th>
                            <th
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => requestSort('price')}
                            >
                                Price{getSortIndicator('price')}
                            </th>
                            <th
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => requestSort('status')}
                            >
                                Status{getSortIndicator('status')}
                            </th>
                            <th
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => requestSort('seller')}
                            >
                                Seller{getSortIndicator('seller')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {getSortedProducts().map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 border-b">
                                <td className="px-4 py-3">{product.title}</td>
                                <td className="px-4 py-3">KSH {product.price.toLocaleString()}</td>
                                <td className="px-4 py-3">
                                    <Badge
                                        variant={
                                            product.status === 'Active' ? 'success' :
                                                product.status === 'Pending' ? 'warning' :
                                                    'destructive'
                                        }
                                    >
                                        {product.status}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">{product.seller}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ConditionalViewAll to="/products" entityName="products" />
        </DashboardSection>
    );
};

export default RecentProducts;