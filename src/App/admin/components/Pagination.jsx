import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  
  // Generate page numbers
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }
  
  // Show at most 5 page numbers
  let visiblePages = pages;
  if (totalPages > 5) {
    if (currentPage <= 3) {
      // Show first 5 pages
      visiblePages = pages.slice(0, 5);
    } else if (currentPage >= totalPages - 2) {
      // Show last 5 pages
      visiblePages = pages.slice(totalPages - 5);
    } else {
      // Show pages around current page
      visiblePages = pages.slice(currentPage - 3, currentPage + 2);
    }
  }

  return (
    <div className="flex justify-center mt-6">
      <div className="flex space-x-1">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded ${
            currentPage === 1
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          &laquo;
        </button>
        
        {/* Display first page if not in visiblePages */}
        {totalPages > 5 && !visiblePages.includes(1) && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              1
            </button>
            <span className="px-3 py-1">...</span>
          </>
        )}
        
        {/* Page numbers */}
        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded ${
              currentPage === page
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            {page}
          </button>
        ))}
        
        {/* Display last page if not in visiblePages */}
        {totalPages > 5 && !visiblePages.includes(totalPages) && (
          <>
            <span className="px-3 py-1">...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              {totalPages}
            </button>
          </>
        )}
        
        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};

export default Pagination; 