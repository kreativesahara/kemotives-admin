import React, { useMemo, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = React.memo(({ isAdmin, handleLogout }) => {
    const location = useLocation();

    const navItems = useMemo(() => {
        const baseItems = [
            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/' },
            { id: 'users', label: 'User Management', icon: 'person', path: '/users' },
            { id: 'products', label: 'Product Management', icon: 'inventory_2', path: '/products' },
            { id: 'subscriptions', label: 'Subscription Management', icon: 'subscriptions', path: '/subscriptions' },
            { id: 'sellers', label: 'Seller Management', icon: 'store', path: '/sellers' },
            { id: 'kyc', label: 'KYC Verification', icon: 'verified_user', path: '/kyc' },
            { id: 'reports', label: 'Reports & Analytics', icon: 'monitoring', path: '/reports' },
            { id: 'settings', label: 'System Settings', icon: 'settings', path: '/settings' }
        ];      
        return baseItems;
    }, [isAdmin]);

    const renderNavItem = useCallback(
        (item) => (
            <li key={item.id}>
                <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                        `flex items-center p-3 rounded-md transition duration-200 ${isActive || location.pathname.startsWith(item.path)
                            ? 'bg-[#3DC2EC] text-white'
                            : 'hover:bg-gray-700 text-gray-300'
                        }`
                    }
                >
                    <span className="material-symbols-outlined mr-3">{item.icon}</span>
                    <span className={`truncate ${['products', 'sellers'].includes(item.id) ? 'whitespace-nowrap' : ''}`}>
                        {item.label}
                    </span>
                </NavLink>
            </li>
        ),
        [location.pathname]
    );

    return (
        <aside className="w-64 bg-gray-800 text-white overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold">Admin Panel</h2>
                <p className="text-gray-400 text-sm">{isAdmin ? 'Administrator' : 'Moderator'}</p>
            </div>
            <nav className="p-2 flex flex-col h-[calc(100%-64px)] justify-between">
                <ul className="space-y-1">
                    {navItems.map(renderNavItem)}
                </ul>
                <div className="mt-auto p-2">
                    <button
                        onClick={handleLogout}
                        className="flex items-center p-3 mb-10 rounded-md w-full bg-red-600 text-white hover:bg-red-700 transition duration-200"
                    >
                        <span className="material-symbols-outlined mr-3">logout</span>
                        Logout
                    </button>
                </div>
            </nav>
        </aside>
    );
});

export default Sidebar;
