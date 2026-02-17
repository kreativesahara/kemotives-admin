import { useState, useEffect } from "react";
import Badge from "../utils/badges";
import axiosPrivate from "../../../api/axios";
import LoadingSpinner from "../utils/loadingspinner";
import Pagination from "../components/Pagination";

const UsersPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({
        key: 'name',
        direction: 'ascending'
    });
    const ITEMS_PER_PAGE = 25;

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                // In a real application, you would pass page and limit to the API
                // Example: `/api/admin/users?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
                const response = await axiosPrivate.get('/api/admin/users');
                const { users, total } = response.data;
                setUsers(users);
                setTotalItems(total);
            } catch (error) {
                console.error('Failed to fetch users data:', error);
                // Fallback data for demonstration: generate 100 mock users
                const mockUsers = Array.from({ length: 100 }, (_, i) => ({
                    id: i + 1,
                    name: `User ${i + 1}`,
                    email: `user${i + 1}@example.com`,
                    role: ['Member', 'Seller', 'Visitor'][i % 3],
                    createdAt: new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
                }));
                setUsers(mockUsers);
                setTotalItems(mockUsers.length);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
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
    const getSortedUsers = () => {
        const sortableUsers = [...users];
        if (sortConfig.key !== null) {
            sortableUsers.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableUsers;
    };

    // Helper function for sort indicator
    const getSortIndicator = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
        }
        return '';
    };

    // Pagination calculations
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    
    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo(0, 0); // Scroll to top on page change
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center">
                    <span className="material-symbols-outlined mr-2">add</span>
                    Add User
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
                            <thead>
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
                                    <th 
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => requestSort('role')}
                                    >
                                        Role{getSortIndicator('role')}
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
                                {getSortedUsers().map((user) => (
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
                                        <td className="px-4 py-3">
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
                    
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={handlePageChange} 
                    />
                </>
            )}
        </div>
    );
};

export default UsersPage; 