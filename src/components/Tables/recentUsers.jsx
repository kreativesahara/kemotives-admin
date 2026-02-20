import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Badge from "../../utils/badges";
import axiosPrivate from "../../api/axios";
import DashboardSection from "../../dataTable";
import ConditionalViewAll from "../../utils/conditionalViewAll";
//import LoadingSpinner from "../utils/loadingspinner";
const RecentUsers = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [recentUsers, setRecentUsers] = useState([]);
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const response = await axiosPrivate.get('/api/dashboard');
                const { recentUsers } = response.data;
                // Limit to 15 users for the dashboard preview
                setRecentUsers(recentUsers.slice(0, 15));
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
                setRecentUsers([
                    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Member', createdAt: '2023-09-15' },
                    { id: 2, name: 'Alice Smith', email: 'alice@example.com', role: 'Seller', createdAt: '2023-09-14' },
                    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Visitor', createdAt: '2023-09-13' },
                    { id: 4, name: 'Emma Wilson', email: 'emma@example.com', role: 'Member', createdAt: '2023-09-12' },
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);
    return (
        <DashboardSection title="Recent Users"><div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr className="border-b">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {recentUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 border-b">
                            <td className="px-4 py-3">{user.name}</td>
                            <td className="px-4 py-3">{user.email}</td>
                            <td className="px-4 py-3">
                                <Badge
                                    variant={user.role === 'Seller' ? 'success' :
                                        user.role === 'Member' ? 'default' :
                                            'secondary'}
                                >
                                    {user.role}
                                </Badge>
                            </td>
                            <td className="px-4 py-3">{user.createdAt}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
            <ConditionalViewAll to="/users" entityName="users" />
        </DashboardSection>
    );
};

export default RecentUsers;