import { useState, useEffect } from "react";
import axiosPrivate from "../../api/axios";
import DashboardSection from "../../App/admin/Tables/dataTable";

const RecentSellerLogins = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [sellers, setSellers] = useState([]);
    const [period, setPeriod] = useState('week');

    useEffect(() => {
        const fetchSellerLogins = async () => {
            setIsLoading(true);
            try {
                // In a real scenario, we would fetch from the API with the period parameter
                const response = await axiosPrivate.get(`/api/seller-logins?period=${period}`);
                setSellers(response.data.sellers);
            } catch (error) {
                console.error('Failed to fetch seller login data:', error);
                // Mock data for development
                const mockSellers = [
                    { 
                        id: 1, 
                        name: 'John Doe', 
                        email: 'john.doe@example.com',
                        lastLogin: new Date('2023-09-15T10:23:12'), 
                        status: 'online',
                        subscription: 'Premium',
                        totalListings: 15
                    },
                    { 
                        id: 2, 
                        name: 'Sarah Williams', 
                        email: 'sarah.williams@example.com',
                        lastLogin: new Date('2023-09-15T09:15:45'), 
                        status: 'away',
                        subscription: 'Premium',
                        totalListings: 10
                    },
                    { 
                        id: 3, 
                        name: 'Jane Smith', 
                        email: 'jane.smith@example.com',
                        lastLogin: new Date('2023-09-14T18:45:22'), 
                        status: 'offline',
                        subscription: 'Premium',
                        totalListings: 12
                    },
                    { 
                        id: 4, 
                        name: 'Mike Johnson', 
                        email: 'mike.johnson@example.com',
                        lastLogin: new Date('2023-09-14T15:32:10'), 
                        status: 'offline',
                        subscription: 'Business',
                        totalListings: 8
                    },
                    { 
                        id: 5, 
                        name: 'Robert Brown', 
                        email: 'robert.brown@example.com',
                        lastLogin: new Date('2023-09-13T11:05:33'), 
                        status: 'offline',
                        subscription: 'Business',
                        totalListings: 7
                    },
                    { 
                        id: 6, 
                        name: 'Alice Cooper', 
                        email: 'alice.cooper@example.com',
                        lastLogin: new Date('2023-09-12T14:22:18'), 
                        status: 'offline',
                        subscription: 'Standard',
                        totalListings: 5
                    },
                    { 
                        id: 7, 
                        name: 'David Miller', 
                        email: 'david.miller@example.com',
                        lastLogin: new Date('2023-09-10T09:45:52'), 
                        status: 'offline',
                        subscription: 'Premium',
                        totalListings: 9
                    },
                    { 
                        id: 8, 
                        name: 'Emma Wilson', 
                        email: 'emma.wilson@example.com',
                        lastLogin: new Date('2023-09-08T16:30:25'), 
                        status: 'offline',
                        subscription: 'Standard',
                        totalListings: 4
                    },
                    { 
                        id: 9, 
                        name: 'James Taylor', 
                        email: 'james.taylor@example.com',
                        lastLogin: new Date('2023-09-05T10:12:40'), 
                        status: 'offline',
                        subscription: 'Business',
                        totalListings: 6
                    },
                    { 
                        id: 10, 
                        name: 'Olivia Green', 
                        email: 'olivia.green@example.com',
                        lastLogin: new Date('2023-09-01T08:55:15'), 
                        status: 'offline',
                        subscription: 'Standard',
                        totalListings: 3
                    }
                ];
                
                // Sort by most recent login
                mockSellers.sort((a, b) => b.lastLogin - a.lastLogin);
                setSellers(mockSellers);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSellerLogins();
    }, [period]);

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
    };

    const formatLastLogin = (dateObj) => {
        const now = new Date();
        const diff = Math.floor((now - dateObj) / 1000); // difference in seconds
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
        
        return dateObj.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'online':
                return 'bg-green-100 text-green-800';
            case 'away':
                return 'bg-yellow-100 text-yellow-800';
            case 'offline':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getSubscriptionColor = (subscription) => {
        switch (subscription) {
            case 'Premium':
                return 'bg-purple-100 text-purple-800';
            case 'Business':
                return 'bg-blue-100 text-blue-800';
            case 'Standard':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DashboardSection title="Recent Seller Logins">
            <div className="flex justify-between items-center mb-4">
                <div className="font-medium">
                    Sellers by most recent login activity ({sellers.length})
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
                    <div className="animate-pulse text-gray-400">Loading seller data...</div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sellers.map((seller, index) => (
                                <tr key={seller.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{seller.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{seller.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{formatLastLogin(seller.lastLogin)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(seller.status)}`}>
                                            {seller.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSubscriptionColor(seller.subscription)}`}>
                                            {seller.subscription}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {seller.totalListings}
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

export default RecentSellerLogins; 