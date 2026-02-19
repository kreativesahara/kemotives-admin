import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * ConditionalViewAll - Only renders View All links when used in the Admin.jsx page
 * 
 * @param {string} to - URL to link to
 * @param {string} label - Link text (default: "View all")
 * @returns React component that conditionally renders
 */
const ConditionalViewAll = ({ to, entityName = "items" }) => {
  const location = useLocation();
  
  // Only show the View All link on the main admin dashboard page
  const isAdminDashboard = location.pathname === '/admin' || location.pathname === '/Admin';
  
  if (!isAdminDashboard) {
    return null;
  }
  
  return (
    <div className="mt-3 text-right">
      <Link to={to} className="text-blue-500 hover:underline text-sm">
        View all {entityName} →
      </Link>
    </div>
  );
};

export default ConditionalViewAll; 