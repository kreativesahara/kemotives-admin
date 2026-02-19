import React from 'react';
import { Link } from 'react-router-dom';

/**
 * TableLimiter - Limits displayed items to 15 for dashboard preview tables
 * 
 * @param {Array} data - Original data array
 * @param {string} viewAllLink - Path to the full view page
 * @param {string} entityName - Name of the entity (e.g., "users", "products")
 * @returns {Object} - Limited data array and view all link element
 */
const useLimitedTableData = (data = [], viewAllLink, entityName = 'items') => {
  // Ensure data is an array and limit to 15 items
  const limitedData = Array.isArray(data) ? data.slice(0, 15) : [];
  
  // Create view all link component
  const ViewAllLink = () => (
    <div className="mt-3 text-right">
      <Link to={viewAllLink} className="text-blue-500 hover:underline text-sm">
        View all {entityName} →
      </Link>
    </div>
  );

  return {
    limitedData,
    ViewAllLink
  };
};

export default useLimitedTableData; 