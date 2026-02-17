import { useState, useMemo } from "react";
import { Link } from 'react-router-dom';
import Switch from 'react-switch';
import { axiosPrivate } from "../../api/axios";
import { showSuccess, showError, showConfirm } from "../../utils/sweetAlert";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-40">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

const SellersAccessoriesTable = ({
  accessories, 
  isLoading, 
  error, 
  sortConfig, 
  setSortConfig, 
  currentPage, 
  setCurrentPage,
  openDeleteModal,
  itemsPerPage, //controlled in the app.jsx file
  onProductUpdate
}) => {
  const [togglingIds, setTogglingIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accessoryToDelete, setAccessoryToDelete] = useState(null);

  // Handle accessory deletion
  const handleDelete = async () => {
    try {
      const response = await axiosPrivate.delete(`/api/accessories/${accessoryToDelete}`);
      if (response.status === 200) {
        // Update accessories list by filtering out the deleted accessory
        const updatedAccessories = accessories.filter(accessory => accessory.id !== accessoryToDelete);
        onProductUpdate(updatedAccessories);
        showSuccess("Accessory deleted successfully.");
      }
    } catch (error) {
      console.error("Failed to delete accessory:", error);
      showError(error.response?.data?.message || "Failed to delete accessory. Please try again.");
    } finally {
      closeDeleteModal();
    }
  };

  // Open delete confirmation modal
  const openDeleteModalHandler = (accessoryId) => {
    setAccessoryToDelete(accessoryId);
    setIsModalOpen(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setAccessoryToDelete(null);
  };

  // Function to toggle listing active status
  const toggleActiveStatus = async (id, currentStatus, cycleCount, updatedAt) => {
    // If cycle count is 4 or more, disable toggling
    if (cycleCount >= 4) {
      showError("This listing has reached maximum reactivation cycles and cannot be reactivated.");
      return;
    }

    // If already toggling, prevent multiple requests
    if (togglingIds.includes(id)) return;

    // Calculate days since last update
    const daysSinceUpdate = updatedAt ? Math.floor((new Date() - new Date(updatedAt)) / (1000 * 60 * 60 * 24)) : 0;
    
    // New status value
    const newStatus = currentStatus === "true" ? "false" : "true";
    
    // If activating an inactive listing, show confirmation dialog
    if (newStatus === "true") {
      const cyclesRemaining = 4 - cycleCount;
      
      // Get confirmation before reactivating
      const confirmed = await showConfirm(
        "Reactivate Listing",
        `Are you sure you want to reactivate this listing? You have ${cyclesRemaining} ${cyclesRemaining === 1 ? 'cycle' : 'cycles'} remaining.
        
        After reactivation, this listing will automatically deactivate after 7 days.`,
        "Yes, Reactivate",
        "Cancel"
      );
      
      if (!confirmed) return;
    }

    try {
      setTogglingIds(prev => [...prev, id]);
      
      const response = await axiosPrivate.patch(`/api/accessories/toggle/${id}`, {
        isActive: newStatus
      });
      
      if (response.status === 200) {
        showSuccess(`Accessory ${newStatus === "true" ? "activated" : "deactivated"} successfully.`);
        
        // Find the accessory and update its status
        const updatedAccessory = accessories.find(accessory => accessory.id === id);
        
        if (updatedAccessory && onProductUpdate) {
          const newAccessory = {
            ...updatedAccessory,
            isActive: newStatus,
            status: newStatus === "true" ? "active" : "inactive",
            updatedAt: new Date().toISOString()
          };
          
          // Call the provided update function
          onProductUpdate(newAccessory);
        }
      }
    } catch (error) {
      console.error("Error toggling accessory status:", error);
      
      // Provide more specific error messages based on the error
      if (error.response) {
        // The request was made and the server responded with a status code
        if (error.response.status === 404) {
          showError("The listing could not be found. It may have been deleted or the server endpoint is misconfigured.");
        } else if (error.response.status === 403) {
          showError("You don't have permission to modify this listing.");
        } else if (error.response.status === 400) {
          if (error.response.data?.message?.includes("cycle")) {
            showError("This listing has reached its maximum cycle count and cannot be reactivated.");
          } else {
            showError(error.response.data?.message || "Invalid request. Please check your data and try again.");
          }
        } else {
          showError(error.response.data?.message || "Failed to update listing status. Please try again.");
        }
      } else if (error.request) {
        // The request was made but no response was received
        showError("No response from server. Please check your internet connection and try again.");
      } else {
        // Something happened in setting up the request that triggered an Error
        showError("Failed to update listing status. Please try again later.");
      }
    } finally {
      setTogglingIds(prev => prev.filter(item => item !== id));
    }
  };

  // Format updatedAt to a readable date with days ago
  const formatUpdatedAt = (updatedAt) => {
    if (!updatedAt) return "Unknown";
    
    const date = new Date(updatedAt);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  // Enhanced sort and paginate function using useMemo
  const sortAndPaginateAccessories = useMemo(() => {
    // Ensure accessories is always an array
    const safeAccessories = Array.isArray(accessories) ? accessories : [];

    if (!safeAccessories.length) return { paginatedAccessories: [], totalPages: 0 };

    const sortedAccessories = [...safeAccessories].sort((a, b) => {
      switch (sortConfig.key) {
        case 'createdAt':
          return sortConfig.direction === 'desc'
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt);
        case 'price':
          return sortConfig.direction === 'desc'
            ? b.price - a.price
            : a.price - b.price;
        case 'year':
          return sortConfig.direction === 'desc'
            ? b.year - a.year
            : a.year - b.year;
        case 'stock':
          return sortConfig.direction === 'desc'
            ? b.stock - a.stock
            : a.stock - b.stock;
        case 'views':
          return sortConfig.direction === 'desc'
            ? (b.views || 0) - (a.views || 0)
            : (a.views || 0) - (b.views || 0);
        default:
          return 0;
      }
    });

    const totalPages = Math.ceil(sortedAccessories.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAccessories = sortedAccessories.slice(startIndex, startIndex + itemsPerPage);

    return { paginatedAccessories, totalPages };
  }, [accessories, sortConfig, currentPage, itemsPerPage]);

  // Get paginated and sorted products
  const { paginatedAccessories, totalPages } = sortAndPaginateAccessories;

  // Removed debug logging to prevent re-render issues

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={`${sortConfig.key}-${sortConfig.direction}`}
              onChange={(e) => {
                const [key, direction] = e.target.value.split('-');
                setSortConfig({ key, direction });
                setCurrentPage(1);
              }}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1 px-2"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="year-desc">Year: Newest</option>
              <option value="year-asc">Year: Oldest</option>
              <option value="stock-desc">Stock: High to Low</option>
              <option value="stock-asc">Stock: Low to High</option>
              <option value="views-desc">Views: High to Low</option>
              <option value="views-asc">Views: Low to High</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {sortConfig.direction === 'desc' ? '↓' : '↑'}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg shadow-md bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="bg-[#3DC2EC] text-white">
                <th className="px-4 py-3 text-left font-medium">#</th>
                <th className="px-4 py-3 text-left font-medium">Accessories</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Stock</th>
                <th className="px-4 py-3 text-left font-medium">Price</th>
                <th className="px-4 py-3 text-left font-medium">Views</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Active</th>
                <th className="px-4 py-3 text-left font-medium">Cycles</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : !paginatedAccessories?.length ? (
                <tr>
                  <td colSpan="10" className="text-center py-8">
                    <p className="text-gray-600 mb-4">No Accessories listed yet</p>
                  </td>
                </tr>
              ) : (
                paginatedAccessories.map((accessory, index) => (
                  <tr key={accessory.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          title="Preview"
                          src={accessory.imageUrls[0]}
                          alt={`${accessory.name}`}
                          className="h-12 w-16 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{accessory.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{accessory.category}</td>
                    <td className="px-4 py-4">
                      {accessory?.stock ? Number(accessory.stock).toLocaleString() : "-"} 
                    </td>
                    <td className="px-4 py-4">
                      KSH {accessory?.price ? Number(accessory.price).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-gray-400 text-sm">visibility</span>
                        <span>{accessory?.views ? Number(accessory.views).toLocaleString() : "0"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-medium ${accessory.status === "active" ? "text-green-600" : "text-red-600"}`}>
                        {accessory.status || "Active"}
                      </span>
                      {accessory.status === "inactive" && (
                        <p className="text-xs text-gray-500 mt-1">
                          Updated {formatUpdatedAt(accessory.updatedAt)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Switch
                          checked={accessory.isActive === "true"}
                          onChange={() => toggleActiveStatus(accessory.id, accessory.isActive, accessory.cycleCount, accessory.updatedAt)}
                          disabled={togglingIds.includes(accessory.id) || accessory.cycleCount >= 4}
                          onColor="#10B981"
                          offColor="#EF4444"
                          className="react-switch"
                          width={42}
                          height={20}
                          uncheckedIcon={false}
                          checkedIcon={false}
                        />
                        {togglingIds.includes(accessory.id) && (
                          <span className="text-xs text-gray-500 mt-1">
                            Updating...
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        accessory.cycleCount >= 4 
                          ? 'bg-red-100 text-red-800' 
                          : accessory.cycleCount >= 2
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {accessory.cycleCount || 0}/4
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/accessory/${accessory.slug}`}
                          className="p-1.5 rounded-sm bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">visibility</span>
                        </Link>
                        <Link
                          to={`/accessory/update/${accessory.id}`}
                          className="p-1.5 rounded-sm bg-green-500 text-white hover:bg-green-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </Link>
                        <button
                          onClick={() => openDeleteModalHandler(accessory.id)}
                          className="p-1.5 rounded-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls - Always show for debugging */}
      {(totalPages > 1 || true) && (
        <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, paginatedAccessories?.length || 0)} of {accessories?.length || 0} accessories
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this accessory? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SellersAccessoriesTable; 