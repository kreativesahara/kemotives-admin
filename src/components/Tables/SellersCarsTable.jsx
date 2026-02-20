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

const SellersCarsTable = ({
  products,
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
  const [productToDelete, setProductToDelete] = useState(null);

  // Handle product deletion
  const handleDelete = async () => {
    try {
      const response = await axiosPrivate.delete(`/api/product/${productToDelete}`);
      if (response.status === 200) {
        // Update products list by filtering out the deleted product
        const updatedProducts = products.filter(product => product.id !== productToDelete);
        onProductUpdate(updatedProducts);
        showSuccess("Product deleted successfully.");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      showError("Failed to delete product. Please try again.");
    } finally {
      closeDeleteModal();
    }
  };

  // Open delete confirmation modal
  const openDeleteModalHandler = (productId) => {
    setProductToDelete(productId);
    setIsModalOpen(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setProductToDelete(null);
  };

  // Handle product update
  const handleProductUpdate = (updatedProduct) => {
    if (onProductUpdate) {
      onProductUpdate(updatedProduct);
    }
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

      const response = await axiosPrivate.patch(`/api/product/toggle/${id}`, {
        isActive: newStatus
      });

      if (response.status === 200) {
        showSuccess(`Listing ${newStatus === "true" ? "activated" : "deactivated"} successfully.`);

        // Find the product and update its status
        const updatedProduct = products.find(product => product.id === id);

        if (updatedProduct && onProductUpdate) {
          const newProduct = {
            ...updatedProduct,
            isActive: newStatus,
            status: newStatus === "true" ? "active" : "inactive",
            updatedAt: new Date().toISOString()
          };

          // Call the provided update function
          onProductUpdate(newProduct);
        }
      }
    } catch (error) {
      console.error("Error toggling product status:", error);

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
  const sortAndPaginateProducts = useMemo(() => {
    // Ensure products is always an array
    const safeProducts = Array.isArray(products) ? products : [];

    if (!safeProducts.length) return { paginatedProducts: [], totalPages: 0 };

    const sortedProducts = [...safeProducts].sort((a, b) => {
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
        case 'views':
          return sortConfig.direction === 'desc'
            ? (b.views || 0) - (a.views || 0)
            : (a.views || 0) - (b.views || 0);
        default:
          return 0;
      }
    });

    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

    return { paginatedProducts, totalPages };
  }, [products, sortConfig, currentPage, itemsPerPage]);

  // Get paginated and sorted products
  const { paginatedProducts, totalPages } = sortAndPaginateProducts;

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
                <th className="px-4 py-3 text-left font-medium">Vehicle</th>
                <th className="px-4 py-3 text-left font-medium">Year</th>
                <th className="px-4 py-3 text-left font-medium">Mileage</th>
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
              ) : !paginatedProducts?.length ? (
                <tr>
                  <td colSpan="10" className="text-center py-8">
                    <p className="text-gray-600 mb-4">No Vehicles listed yet</p>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((vehicle, index) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-4 py-4">
                      <img
                        title="Preview"
                        src={vehicle.images[0]}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="h-12 w-16 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{vehicle.make}</p>
                        <p className="text-sm text-gray-600">{vehicle.model}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">{vehicle.year}</td>
                    <td className="px-4 py-4">
                      {vehicle?.mileage ? Number(vehicle.mileage).toLocaleString() : "-"} KM
                    </td>
                    <td className="px-4 py-4">
                      KSH {vehicle?.price ? Number(vehicle.price).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-gray-400 text-sm">visibility</span>
                        <span>{vehicle?.views ? Number(vehicle.views).toLocaleString() : "0"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-medium ${vehicle.status === "active" ? "text-green-600" : "text-red-600"}`}>
                        {vehicle.status || "Active"}
                      </span>
                      {vehicle.status === "inactive" && (
                        <p className="text-xs text-gray-500 mt-1">
                          Updated {formatUpdatedAt(vehicle.updatedAt)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Switch
                          checked={vehicle.isActive === "true"}
                          onChange={() => toggleActiveStatus(vehicle.id, vehicle.isActive, vehicle.cycleCount, vehicle.updatedAt)}
                          disabled={togglingIds.includes(vehicle.id) || vehicle.cycleCount >= 4}
                          onColor="#10B981"
                          offColor="#EF4444"
                          className="react-switch"
                          width={42}
                          height={20}
                          uncheckedIcon={false}
                          checkedIcon={false}
                        />
                        {togglingIds.includes(vehicle.id) && (
                          <span className="text-xs text-gray-500 mt-1">
                            Updating...
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${vehicle.cycleCount >= 4
                          ? 'bg-red-100 text-red-800'
                          : vehicle.cycleCount >= 2
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                        {vehicle.cycleCount || 0}/4
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/vehicle/${vehicle.slug}`}
                          className="p-1.5 rounded-sm bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">visibility</span>
                        </Link>
                        <Link
                          to={`/app/${vehicle.id}`}
                          className="p-1.5 rounded-sm bg-green-500 text-white hover:bg-green-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </Link>
                        <button
                          onClick={() => openDeleteModalHandler(vehicle.id)}
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
        <div className="mt-4 flex justify-between items-center px-4">
          <div className="text-sm text-gray-700">
            Showing{' '}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, paginatedProducts?.length || 0)}
            </span>{' '}
            of{' '}
            <span className="font-medium">{products?.length || 0}</span> results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md ${currentPage === i + 1
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200"
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
            <p className="mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
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

export default SellersCarsTable; 