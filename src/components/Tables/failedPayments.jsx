import { useState, useEffect } from "react";
import axiosPrivate from "../../api/axios";
import DashboardSection from "../../dataTable";

const FailedPayments = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [failedPayments, setFailedPayments] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        const fetchFailedPayments = async () => {
            setIsLoading(true);
            try {
                // In a real scenario, we would fetch from the API
                const response = await axiosPrivate.get('/api/failed-payments');
                setFailedPayments(response.data.failedPayments);
            } catch (error) {
                console.error('Failed to fetch payment data:', error);
                // Mock data for development
                setFailedPayments(generateMockData());
            } finally {
                setIsLoading(false);
            }
        };

        fetchFailedPayments();
    }, []);

    // Generate mock data
    const generateMockData = () => {
        const paymentTypes = ['subscription_renewal', 'listing_payment', 'premium_feature', 'subscription_initial'];
        const statuses = ['pending', 'contacted', 'resolved', 'escalated'];
        const reasons = [
            'Insufficient funds',
            'Card expired',
            'Transaction declined by bank',
            'MPesa timeout',
            'Invalid payment details',
            'Gateway error'
        ];

        const mockData = [];

        // Generate 15 failed payment records
        for (let i = 1; i <= 15; i++) {
            const daysAgo = Math.floor(Math.random() * 7); // 0-6 days ago
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            mockData.push({
                id: i,
                customer: {
                    id: 100 + i,
                    name: `Customer ${i}`,
                    email: `customer${i}@example.com`,
                    phone: `+254${Math.floor(Math.random() * 900000000) + 100000000}`,
                },
                amount: Math.floor(Math.random() * 15000) + 5000,
                failureDate: date,
                paymentType: paymentTypes[Math.floor(Math.random() * paymentTypes.length)],
                reason: reasons[Math.floor(Math.random() * reasons.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                followUpDate: daysAgo > 2 ? new Date(date.getTime() + (24 * 60 * 60 * 1000)) : null,
                notes: daysAgo > 3 && Math.random() > 0.5 ? "Customer will try again next week" : "",
            });
        }

        return mockData;
    };

    // Handle status filter change
    const handleStatusFilterChange = (status) => {
        setFilterStatus(status);
    };

    // Handle payment type filter change
    const handleTypeFilterChange = (type) => {
        setFilterType(type);
    };

    // Handle sort change
    const handleSortChange = (field) => {
        if (sortBy === field) {
            // Toggle order if same field
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // New field, default to desc
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    // Get filtered and sorted data
    const getFilteredData = () => {
        return failedPayments
            .filter(payment => filterStatus === 'all' || payment.status === filterStatus)
            .filter(payment => filterType === 'all' || payment.paymentType === filterType)
            .sort((a, b) => {
                let compareA, compareB;

                // Determine what to compare based on sortBy
                if (sortBy === 'date') {
                    compareA = new Date(a.failureDate).getTime();
                    compareB = new Date(b.failureDate).getTime();
                } else if (sortBy === 'amount') {
                    compareA = a.amount;
                    compareB = b.amount;
                } else if (sortBy === 'customer') {
                    compareA = a.customer.name;
                    compareB = b.customer.name;
                } else {
                    compareA = a[sortBy];
                    compareB = b[sortBy];
                }

                // Sort based on order
                if (sortOrder === 'asc') {
                    return compareA > compareB ? 1 : -1;
                } else {
                    return compareA < compareB ? 1 : -1;
                }
            });
    };

    // Format payment type for display
    const formatPaymentType = (type) => {
        switch (type) {
            case 'subscription_renewal':
                return 'Subscription Renewal';
            case 'listing_payment':
                return 'Listing Payment';
            case 'premium_feature':
                return 'Premium Feature';
            case 'subscription_initial':
                return 'Initial Subscription';
            default:
                return type;
        }
    };

    // Format date for display
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Handle follow-up action
    const handleFollowUpAction = (id, action) => {
        // In a real app, this would make an API call
        setFailedPayments(prevPayments =>
            prevPayments.map(payment =>
                payment.id === id
                    ? {
                        ...payment,
                        status: action === 'resolve' ? 'resolved' : action === 'escalate' ? 'escalated' : 'contacted',
                        notes: action === 'resolve' ? 'Issue resolved' : payment.notes,
                        followUpDate: action === 'contact' ? new Date() : payment.followUpDate,
                    }
                    : payment
            )
        );
    };

    // Get status badge color
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'contacted':
                return 'bg-blue-100 text-blue-800';
            case 'resolved':
                return 'bg-green-100 text-green-800';
            case 'escalated':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DashboardSection title="Failed Payments & Follow-ups">
            <div className="mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Status:</span>
                        <div className="flex space-x-2">
                            {['all', 'pending', 'contacted', 'escalated', 'resolved'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusFilterChange(status)}
                                    className={`px-3 py-1 text-xs rounded-md capitalize ${filterStatus === status
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {status === 'all' ? 'All' : status}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Payment Type:</span>
                        <div className="flex space-x-2">
                            {['all', 'subscription_renewal', 'listing_payment', 'subscription_initial'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleTypeFilterChange(type)}
                                    className={`px-3 py-1 text-xs rounded-md ${filterType === type
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {type === 'all' ? 'All Types' : formatPaymentType(type)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Loading failed payments data...</div>
                </div>
            ) : (

                <div className="overflow-x-auto">
                    <div className="mt-4 bg-blue-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-800 mb-2">Failed Payment Recovery Stats</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                                <p className="text-xs text-gray-500">Recovery Rate</p>
                                <p className="text-lg font-bold">68.4%</p>
                                <p className="text-xs text-green-500">+2.3% vs prev period</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                                <p className="text-xs text-gray-500">Avg. Time to Resolve</p>
                                <p className="text-lg font-bold">2.3 days</p>
                                <p className="text-xs text-green-500">-0.5 days</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                                <p className="text-xs text-gray-500">Top Failure Reason</p>
                                <p className="text-lg font-bold">Insufficient funds</p>
                                <p className="text-xs text-gray-500">42% of failures</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                                <p className="text-xs text-gray-500">Est. Lost Revenue</p>
                                <p className="text-lg font-bold">KSH 145,500</p>
                                <p className="text-xs text-red-500">+12.4% vs prev month</p>
                            </div>
                        </div>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSortChange('customer')}
                                >
                                    <div className="flex items-center">
                                        Customer
                                        {sortBy === 'customer' && (
                                            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSortChange('amount')}
                                >
                                    <div className="flex items-center">
                                        Amount
                                        {sortBy === 'amount' && (
                                            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSortChange('date')}
                                >
                                    <div className="flex items-center">
                                        Failure Date
                                        {sortBy === 'date' && (
                                            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reason
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {getFilteredData().map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{payment.customer.name}</div>
                                        <div className="text-xs text-gray-500">{payment.customer.email}</div>
                                        <div className="text-xs text-gray-500">{payment.customer.phone}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">KSH {payment.amount.toLocaleString()}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{formatDate(payment.failureDate)}</div>
                                        {payment.followUpDate && (
                                            <div className="text-xs text-gray-500">
                                                Followed up: {formatDate(payment.followUpDate)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{formatPaymentType(payment.paymentType)}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm text-gray-900">{payment.reason}</div>
                                        {payment.notes && (
                                            <div className="text-xs text-gray-500 max-w-xs truncate">
                                                Note: {payment.notes}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(payment.status)}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                        <div className="flex flex-col space-y-1">
                                            {payment.status !== 'resolved' && (
                                                <>
                                                    {payment.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleFollowUpAction(payment.id, 'contact')}
                                                            className="text-blue-600 hover:text-blue-900 text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded"
                                                        >
                                                            Contact Customer
                                                        </button>
                                                    )}
                                                    {payment.status === 'contacted' && (
                                                        <button
                                                            onClick={() => handleFollowUpAction(payment.id, 'escalate')}
                                                            className="text-orange-600 hover:text-orange-900 text-xs bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded"
                                                        >
                                                            Escalate Issue
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleFollowUpAction(payment.id, 'resolve')}
                                                        className="text-green-600 hover:text-green-900 text-xs bg-green-50 hover:bg-green-100 px-2 py-1 rounded"
                                                    >
                                                        Mark Resolved
                                                    </button>
                                                </>
                                            )}
                                            {payment.status === 'resolved' && (
                                                <span className="text-xs text-gray-500">No action needed</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {getFilteredData().length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No failed payments match your filters
                        </div>
                    )}
                </div>
            )}


        </DashboardSection>
    );
};

export default FailedPayments; 