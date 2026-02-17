import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const RequireAdmin = ({ children }) => {
    const { auth } = useAuth();
    const location = useLocation();

    // Check if user is authenticated and has admin role (role 5)
    const isAdmin = auth?.roles === 5;
    
    if (!auth?.accessToken) {
        // Not authenticated, redirect to login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    if (!isAdmin) {
        // Authenticated but not admin, redirect to unauthorized page or dashboard
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
    
    // User is admin, render the protected content
    return children;
};

export default RequireAdmin;
