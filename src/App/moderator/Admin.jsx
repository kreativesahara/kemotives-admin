import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from "../../hooks/useAuth";
import { axiosPrivate } from "../../api/axios";

// Loading spinner component 
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-40">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Stat card component
const StatCard = ({ title, value, icon, bgColor, iconColor }) => (
  <div className="bg-white rounded-lg shadow-md p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value?.toLocaleString() || 0}</h3>
      </div>
      <span className={`${bgColor} p-2 rounded-lg`}>
        <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
      </span>
    </div>
  </div>
);

// Dashboard section component
const DashboardSection = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-md p-4 mb-4">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

// Badge component
// const Badge = ({ variant, children }) => {
//   let classes = "px-2 py-1 rounded-full text-xs ";
  
//   switch(variant) {
//     case 'success':
//       classes += "bg-green-100 text-green-800";
//       break;
//     case 'warning':
//       classes += "bg-yellow-100 text-yellow-800";
//       break;
//     case 'destructive':
//       classes += "bg-red-100 text-red-800";
//       break;
//     default:
//       classes += "bg-blue-100 text-blue-800";
//   }
  
//   return <span className={classes}>{children}</span>;
// };

// Admin dashboard layout with sidebar
const AdminDashboard = ({ children, activeTab }) => {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const isAdmin = auth?.roles === 5;
  const isModerator = auth?.roles === 4;

  // Handle logout
  const handleLogout = () => {
    // Set logout flag to prevent PersistLogin from trying to refresh
    localStorage.setItem("logoutInProgress", "true");
    setAuth(null);
    // Clear localStorage immediately
    localStorage.removeItem("auth");
    localStorage.removeItem("logoutInProgress");
    navigate('/login', { replace: true });
  };

  // Navigation items for the sidebar
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/admin' },
    { id: 'users', label: 'User Management', icon: 'person', path: '/admin/users' },
    { id: 'products', label: 'Product Management', icon: 'inventory_2', path: '/admin/products' },
    { id: 'sellers', label: 'Seller Management', icon: 'store', path: '/admin/sellers' },
    { id: 'reports', label: 'Reports & Analytics', icon: 'monitoring', path: '/admin/reports' }
  ];

  // Admin-only navigation items
  if (isAdmin) {
    navItems.push(
      { id: 'settings', label: 'System Settings', icon: 'settings', path: '/admin/settings' }
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-800 text-white overflow-y-auto">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Admin Panel</h2>
          <p className="text-gray-400 text-sm">{isAdmin ? 'Administrator' : 'Moderator'}</p>
        </div>
        <nav className="p-2 flex flex-col h-[calc(100%-64px)] justify-between">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center p-3 rounded-md transition duration-200 ${
                      isActive || activeTab === item.id
                        ? 'bg-[#3DC2EC] text-white'
                        : 'hover:bg-gray-700 text-gray-300'
                    }`
                  }
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="material-symbols-outlined mr-3">{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          
          {/* Logout button at the bottom */}
          <div className="mt-auto p-2">
            <button 
              onClick={handleLogout}
              className="flex items-center p-3 rounded-md w-full bg-red-600 text-white hover:bg-red-700 transition duration-200"
            >
              <span className="material-symbols-outlined mr-3">logout</span>
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
        {children}
      </main>
    </div>
  );
};

function Admin() {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    sellers: 0,
    pendingReports: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);

  const isAdmin = auth?.roles === 5;
  const isModerator = auth?.roles === 4;
  
  // Handle logout
  const handleLogout = () => {
    // Set logout flag to prevent PersistLogin from trying to refresh
    localStorage.setItem("logoutInProgress", "true");
    setAuth(null);
    // Clear localStorage immediately
    localStorage.removeItem("auth");
    localStorage.removeItem("logoutInProgress");
    navigate('/login', { replace: true });
  };

  // Navigation items for the sidebar
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/admin' },
    { id: 'users', label: 'User Management', icon: 'person', path: '/admin/users' },
    { id: 'products', label: 'Product Management', icon: 'inventory_2', path: '/admin/products' },
    { id: 'sellers', label: 'Seller Management', icon: 'store', path: '/admin/sellers' },
    { id: 'reports', label: 'Reports & Analytics', icon: 'monitoring', path: '/admin/reports' }
  ];

  // Admin-only navigation items
  if (isAdmin) {
    navItems.push(
      { id: 'settings', label: 'System Settings', icon: 'settings', path: '/admin/settings' }
    );
  }

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Attempt to get data from API
        const response = await axiosPrivate.get('/api/admin/dashboard');
        const { stats, recentUsers, recentProducts } = response.data;
        setStats(stats);
        setRecentUsers(recentUsers);
        setRecentProducts(recentProducts);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Fallback to mock data if API fails
        setStats({
          users: 124,
          products: 350,
          sellers: 45,
          pendingReports: 7
        });
        
        setRecentUsers([
          { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Member', createdAt: '2023-09-15' },
          { id: 2, name: 'Alice Smith', email: 'alice@example.com', role: 'Seller', createdAt: '2023-09-14' },
          { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Visitor', createdAt: '2023-09-13' },
          { id: 4, name: 'Emma Wilson', email: 'emma@example.com', role: 'Member', createdAt: '2023-09-12' },
        ]);
        
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

  // Render dashboard content
  const renderDashboardContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Users" 
            value={stats.users} 
            icon="person" 
            bgColor="bg-blue-100" 
            iconColor="text-blue-600" 
          />
          <StatCard 
            title="Total Products" 
            value={stats.products} 
            icon="inventory_2" 
            bgColor="bg-green-100" 
            iconColor="text-green-600" 
          />
          <StatCard 
            title="Total Sellers" 
            value={stats.sellers} 
            icon="store" 
            bgColor="bg-purple-100" 
            iconColor="text-purple-600" 
          />
          <StatCard 
            title="Pending Reports" 
            value={stats.pendingReports} 
            icon="flag" 
            bgColor="bg-red-100" 
            iconColor="text-red-600" 
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DashboardSection title="Recent Users">
            <div className="overflow-x-auto">
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
                          variant={
                            user.role === 'Seller' ? 'success' : 
                            user.role === 'Member' ? 'default' : 
                            'secondary'
                          }
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
            <div className="mt-3 text-right">
              <Link to="/admin/users" className="text-blue-500 hover:underline text-sm">
                View all users →
              </Link>
            </div>
          </DashboardSection>
          
          <DashboardSection title="Recent Products">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentProducts.map((product) => (
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
            <div className="mt-3 text-right">
              <Link to="/admin/products" className="text-blue-500 hover:underline text-sm">
                View all products →
              </Link>
            </div>
          </DashboardSection>
        </div>
        
        <DashboardSection title="Quick Actions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-blue-50 rounded-lg flex items-center gap-3 hover:bg-blue-100 transition">
              <span className="material-symbols-outlined text-blue-600">add_circle</span>
              <span>Add New User</span>
            </button>
            <button className="p-4 bg-green-50 rounded-lg flex items-center gap-3 hover:bg-green-100 transition">
              <span className="material-symbols-outlined text-green-600">verified</span>
              <span>Approve Pending Listings</span>
            </button>
            <button className="p-4 bg-purple-50 rounded-lg flex items-center gap-3 hover:bg-purple-100 transition">
              <span className="material-symbols-outlined text-purple-600">assessment</span>
              <span>Export Reports</span>
            </button>
          </div>
        </DashboardSection>
      </div>
    );
  };

  return (
    <AdminDashboard activeTab={activeTab}>
      {renderDashboardContent()}
    </AdminDashboard>
  );
}

export default Admin;
