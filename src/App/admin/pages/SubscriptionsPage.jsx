import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Badge from "../utils/badges";
import axiosPrivate from "../../../api/axios";
import LoadingSpinner from "../utils/loadingspinner";
import AdminDashboard from "./layout";

const SubscriptionsPage = () => {
    const [activeTab, setActiveTab] = useState("subscriptions");
    const [isLoading, setIsLoading] = useState(true);
    const [subscriptions, setSubscriptions] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({
        key: 'createdAt',
        direction: 'descending'
    });
    const ITEMS_PER_PAGE = 25;

    useEffect(() => {
        const fetchSubscriptions = async () => {
            setIsLoading(true);
            try {
                // In a real application, you would pass page and limit to the API
                // Example: `/api/subscriptions?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
                const response = await axiosPrivate.get('/api/subscriptions');
                const { subscriptions, total } = response.data;
                setSubscriptions(subscriptions);
                setTotalItems(total);
            } catch (error) {
                console.error('Failed to fetch subscriptions data:', error);
                // Fallback data for demonstration: generate 100 mock subscriptions
                const plans = [
                    { tier: 'Free', name: 'Starter', period: '/month', amount: 0 },
                    { tier: 'Limited', name: 'Growth', period: '/month', amount: 5970 },
                    { tier: 'Premium', name: 'Enterprise', period: '/month', amount: 15880 }
                ];
                
                const paymentMethods = ['MPesa', 'PayPal', 'Stripe', 'Card', 'N/A'];
                const statuses = ['successful', 'pending', 'failed'];
                
                const mockSubscriptions = Array.from({ length: 100 }, (_, i) => {
                    const planIndex = i % 3;
                    const selectedPlan = plans[planIndex];
                    const status = statuses[i % 3];
                    
                    return {
                        id: i + 1,
                        user: { 
                            firstname: `FirstName${i + 1}`, 
                            lastname: `LastName${i + 1}`, 
                            email: `user${i + 1}@example.com` 
                        },
                        subscription: selectedPlan,
                        amount: selectedPlan.amount,
                        currency: 'KES',
                        paymentMethod: selectedPlan.amount === 0 ? 'N/A' : paymentMethods[i % paymentMethods.length],
                        txnId: selectedPlan.amount === 0 ? 'FREE_PLAN' : `TXN${i + 1000}`,
                        status: status,
                        createdAt: new Date(Date.now() - i * 86400000).toISOString()
                    };
                });
                
                setSubscriptions(mockSubscriptions);
                setTotalItems(mockSubscriptions.length);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubscriptions();
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
    const getSortedSubscriptions = () => {
        const sortableSubscriptions = [...subscriptions];
        if (sortConfig.key !== null) {
            sortableSubscriptions.sort((a, b) => {
                if (sortConfig.key === 'createdAt') {
                    return sortConfig.direction === 'ascending'
                        ? new Date(a.createdAt) - new Date(b.createdAt)
                        : new Date(b.createdAt) - new Date(a.createdAt);
                }
                
                if (sortConfig.key === 'user') {
                    const nameA = `${a.user.firstname} ${a.user.lastname}`.toLowerCase();
                    const nameB = `${b.user.firstname} ${b.user.lastname}`.toLowerCase();
                    return sortConfig.direction === 'ascending'
                        ? nameA.localeCompare(nameB)
                        : nameB.localeCompare(nameA);
                }
                
                if (sortConfig.key === 'plan') {
                    return sortConfig.direction === 'ascending'
                        ? a.subscription.name.localeCompare(b.subscription.name)
                        : b.subscription.name.localeCompare(a.subscription.name);
                }
                
                if (sortConfig.key === 'amount') {
                    return sortConfig.direction === 'ascending'
                        ? a.amount - b.amount
                        : b.amount - a.amount;
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
        return sortableSubscriptions;
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
        const sorted = getSortedSubscriptions();
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    };

    const STATUS_VARIANTS = {
        successful: 'success',
        pending: 'warning',
        failed: 'destructive',
    };

    return (
        <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab}>
            <div className="p-6 bg-white rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Subscription Management</h1>
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center">
                        <span className="material-symbols-outlined mr-2">add</span>
                        Add Subscription
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
                                            onClick={() => requestSort('user')}
                                        >
                                            Subscriber{getSortIndicator('user')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th 
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => requestSort('plan')}
                                        >
                                            Plan{getSortIndicator('plan')}
                                        </th>
                                        <th 
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => requestSort('amount')}
                                        >
                                            Amount{getSortIndicator('amount')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Method
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Txn ID
                                        </th>
                                        <th 
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => requestSort('status')}
                                        >
                                            Status{getSortIndicator('status')}
                                        </th>
                                        <th 
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => requestSort('createdAt')}
                                        >
                                            Date{getSortIndicator('createdAt')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {getCurrentPageItems().map((subscription) => (
                                        <tr key={subscription.id} className="hover:bg-gray-50 border-b">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {`${subscription.user.firstname} ${subscription.user.lastname}`}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {subscription.user.email}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {`${subscription.subscription.name} (${subscription.subscription.tier})`}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {subscription.amount.toLocaleString()} {subscription.currency}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {subscription.paymentMethod}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {subscription.txnId}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Badge variant={STATUS_VARIANTS[subscription.status] || 'default'}>
                                                    {subscription.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {new Date(subscription.createdAt).toLocaleDateString()}
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
                            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} subscriptions
                        </div>
                    </>
                )}
            </div>
        </AdminDashboard>
    );
};

export default SubscriptionsPage; 