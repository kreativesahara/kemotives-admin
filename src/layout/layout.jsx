import React, { useCallback } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from 'react-router-dom';
import Sidebar from "../components/Tables/Sidebar";

const AdminDashboard = ({ children, activeTab, setActiveTab }) => {
    const { auth, setAuth } = useAuth();

    const navigate = useNavigate();
    const isAdmin = auth?.roles === 5;
    const isModerator = auth?.roles === 4;

    // Use useCallback to memoize the logout function to prevent recreating on rerenders
    const handleLogout = useCallback(() => {
        // Set logout flag to prevent PersistLogin from trying to refresh
        localStorage.setItem("logoutInProgress", "true");
        setAuth(null);
        // Clear localStorage immediately
        localStorage.removeItem("auth");
        localStorage.removeItem("logoutInProgress");
        // navigate('/login', { replace: true });
    }, [setAuth, navigate]);

    return (
        <div className="flex h-screen">
            {/* Use the memoized Sidebar component */}
            <Sidebar
                isAdmin={isAdmin}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleLogout={handleLogout}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
                {children}
            </main>
        </div>
    );
};

export default React.memo(AdminDashboard);