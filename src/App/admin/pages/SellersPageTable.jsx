import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Badge from "../utils/badges";
import axiosPrivate from "../../../api/axios";
import LoadingSpinner from "../utils/loadingspinner";
import AdminDashboard from "./layout";

const SellersPageTable = () => {
    const [activeTab, setActiveTab] = useState("sellers");
    const [isLoading, setIsLoading] = useState(true);
    const [sellers, setSellers] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({
        key: 'name',
        direction: 'ascending'
    });
    const ITEMS_PER_PAGE = 25;

    useEffect(() => {
        const fetchSellers = async () => {
            setIsLoading(true);
            try {
                // In a real application, you would pass page and limit to the API
                // Example: `/api/admin/sellers?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
                const response = await axiosPrivate.get('/api/admin/sellers');
                const { sellers, total } = response.data;
                setSellers(sellers);
                setTotalItems(total);
            } catch (error) {
                console.error('Failed to fetch sellers data:', error);
                // Fallback data for demonstration: generate 100 mock sellers
                const sellerStatuses = ['Active', 'Inactive', 'Pending Approval', 'Premium'];
                const cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Kitale'];
                
                const mockSellers = Array.from({ length: 100 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const createdAt = date.toISOString();
                    const status = sellerStatuses[i % sellerStatuses.length];
                    const listingsCount = Math.floor(Math.random() * 20) + 1;
                    const salesCount = Math.floor(Math.random() * listingsCount);
                    
                    return {
                        id: i + 1,
                        name: `Seller ${i + 1}`,
                        email: `seller${i + 1}@example.com`,
                        phone: `+254 7${Math.floor(Math.random() * 100000000)}`,
                        location: cities[i % cities.length],
                        status: status,
                        listingsCount: listingsCount,
                        salesCount: salesCount,
                        rating: (Math.floor(Math.random() * 50) + 1) / 10,
                        createdAt: createdAt
                    };
                });
                
                setSellers(mockSellers);
                setTotalItems(mockSellers.length);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSellers();
    }, [currentPage]);

    // Request sort function
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Sort data function
    const getSortedSellers = () => {
        const sortableSellers = [...sellers];
        if (sortConfig.key !== null) {
            sortableSellers.sort((a, b) => {
                if (sortConfig.key === 'createdAt') {
                    return sortConfig.direction === 'ascending'
                        ? new Date(a.createdAt) - new Date(b.createdAt)
                        : new Date(b.createdAt) - new Date(a.createdAt);
                }
                
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableSellers;
    };

    // Helper function for sort indicator
    const getSortIndicator = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
        }
        return '';
    };

    // Pagination controls
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    
    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const renderPagination = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 mx-1 rounded ${
                        currentPage === i
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                >
                    {i}
                </button>
            );
        }
        
        return (
            <div className="flex justify-center items-center mt-4 space-x-2">
                <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                        currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                >
                    First
                </button>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                        currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                >
                    Prev
                </button>
                {pages}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                        currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                >
                    Next
                </button>
                <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                        currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                >
                    Last
                </button>
            </div>
        );
    };

    // Get current page items
    const getCurrentPageItems = () => {
        const sorted = getSortedSellers();
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'Active':
                return 'success';
            case 'Inactive':
                return 'destructive';
            case 'Pending Approval':
                return 'warning';
            case 'Premium':
                return 'default';
            default:
                return 'default';
        }
    };

    return (
        <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab}>
            <div className="p-6 bg-white rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Seller Management</h1>
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center">
                        <span className="material-symbols-outlined mr-2">add</span>
                        Add Seller
                    </button>
                </div>

                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr className="border-b">
                                        <th 
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => requestSort('name')}
                                        >
                                            Name{getSortIndicator('name')}
                                        </th>
                                        <th 
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => requestSort('email')}
                                        >
                                            Email{getSortIndicator('email')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phone
                                        </th>
                                        <th 
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => requestSort('location')}
                                        >
                                            Location{getSortIndicator('location')}
                                        </th>
                                        <th 
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => requestSort('status')}
                                        >
                                            Status{getSortIndicator('status')}
                                        </th>
                                        <th 
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => requestSort('listingsCount')}
                                        >
                                            Listings{getSortIndicator('listingsCount')}
                                        </th>
                                        <th 
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => requestSort('salesCount')}
                                        >
                                            Sales{getSortIndicator('salesCount')}
                                        </th>
                                        <th 
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => requestSort('rating')}
                                        >
                                            Rating{getSortIndicator('rating')}
                                        </th>
                                        <th 
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => requestSort('createdAt')}
                                        >
                                            Joined{getSortIndicator('createdAt')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {getCurrentPageItems().map((seller) => (
                                        <tr key={seller.id} className="hover:bg-gray-50 border-b">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {seller.name}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {seller.email}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {seller.phone}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {seller.location}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Badge variant={getStatusVariant(seller.status)}>
                                                    {seller.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                {seller.listingsCount}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                {seller.salesCount}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                {seller.rating}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {new Date(seller.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <button className="p-1 rounded text-blue-500 hover:bg-blue-50">
                                                        <span className="material-symbols-outlined text-sm">visibility</span>
                                                    </button>
                                                    <button className="p-1 rounded text-green-500 hover:bg-green-50">
                                                        <span className="material-symbols-outlined text-sm">edit</span>
                                                    </button>
                                                    <button className="p-1 rounded text-red-500 hover:bg-red-50">
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {renderPagination()}
                        
                        <div className="mt-4 text-sm text-gray-500">
                            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} sellers
                        </div>
                    </>
                )}
            </div>
        </AdminDashboard>
    );
};

export default SellersPageTable; 