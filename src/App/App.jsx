import { useState, useEffect, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import Layout from "../components/Layout";
import useAuth from "../hooks/useAuth";
import UploadProduct from "../components/button/uploadProduct";
import UploadAccessory from "../components/button/UploadAccessory"; 
import UploadBlog from "../components/button/uploadBlog" 
import { useProductContext } from "../context/ProductProvider";
import { useAccessoriesContext } from "../context/AccessoriesProvider";
import BlogTable from "../components/tables/BlogTable"; 
import BtnBeSeller from "../components/button/btnBeSeller";
import BtnBeMember from "../components/button/btnBeMember";
import { axiosPrivate } from "../api/axios";
import SubscriptionDetailsCard from "../components/cards/subscriptionDetailsCard";
import SellerDetailsCard from "../components/cards/SellerDetailsCard";
import PersonalDetailsCard from "../components/cards/PersonalDetailsCard"; 
import SellersCarsTable from "../components/tables/SellersCarsTable"; 
import SellersAccessoriesTable from "../components/tables/SellersAccessoriesTable"; 
import { showSuccess, showError } from "../utils/sweetAlert"; 
import useAxiosPrivate from "../api/useAxiosPrivate";

// Delete confirmation modal component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm mx-4 shadow-xl">
        <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
        <p className="mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-40">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

// Stats overview component for seller dashboard
const StatsOverviewAccessories = ({ accessories }) => {
  // Ensure accessories is an array before using reduce
  const accessoriesArray = Array.isArray(accessories) ? accessories : [];

  const totalPosts = accessoriesArray.length;
  const totalValue = accessoriesArray.reduce((sum, accessory) => sum + (Number(accessory?.price) || 0), 0);
  const totalViews = accessoriesArray.reduce((sum, accessory) => sum + (Number(accessory?.views) || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Posts</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalPosts}</h3>
          </div>
          <span className="bg-blue-100 p-2 rounded-lg">
            <span className="material-symbols-outlined text-blue-600">feed</span>
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Value</p>
            <h3 className="text-2xl font-bold text-gray-800">
              KSH {totalValue.toLocaleString()}
            </h3>
          </div>
          <span className="bg-green-100 p-2 rounded-lg">
            <span className="material-symbols-outlined text-green-600">payments</span>
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Views</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalViews}</h3>
          </div>
          <span className="bg-purple-100 p-2 rounded-lg">
            <span className="material-symbols-outlined text-purple-600">visibility</span>
          </span>
        </div>
      </div>
    </div>
  );
};

const StatsOverviewProducts = ({ products }) => {
  // Ensure products is an array before using reduce
  const productsArray = Array.isArray(products) ? products : [];

  const totalPosts = productsArray.length;
  const totalValue = productsArray.reduce((sum, vehicle) => sum + (Number(vehicle?.price) || 0), 0);
  const totalViews = productsArray.reduce((sum, vehicle) => sum + (Number(vehicle?.views) || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Posts</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalPosts}</h3>
          </div>
          <span className="bg-blue-100 p-2 rounded-lg">
            <span className="material-symbols-outlined text-blue-600">feed</span>
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Value</p>
            <h3 className="text-2xl font-bold text-gray-800">
              KSH {totalValue.toLocaleString()}
            </h3>
          </div>
          <span className="bg-green-100 p-2 rounded-lg">
            <span className="material-symbols-outlined text-green-600">payments</span>
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Views</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalViews}</h3>
          </div>
          <span className="bg-purple-100 p-2 rounded-lg">
            <span className="material-symbols-outlined text-purple-600">visibility</span>
          </span>
        </div>
      </div>
    </div>
  );
};

// Navigation tab component
const TabNavItem = ({ id, title, activeTab, icon, onClick }) => {
  return (
    <button
      onClick={() => onClick(id)}
      className={`
        flex items-center justify-center gap-2 px-3 md:px-6 py-3 font-medium text-sm rounded-t-lg transition-all
        flex-1 md:flex-initial
        ${activeTab === id
          ? "bg-white text-blue-600 border-t-2 border-blue-600 shadow-sm z-10"
          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
        }
      `}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="hidden md:inline">{title}</span>
    </button>
  );
};

// Account upgrade component
const AccountUpgrades = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6 mt-4">
      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
        <div className="flex items-start mb-4">
          <span className="material-symbols-outlined text-blue-600 text-2xl mr-3">storefront</span>
          <div>
            <h3 className="font-semibold text-lg mb-1">Become a Seller</h3>
            <p className="text-gray-600 mb-4">List your vehicles and grow your business on our platform</p>
          </div>
        </div>
        <BtnBeSeller />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
        <div className="flex items-start mb-4">
          <span className="material-symbols-outlined text-purple-600 text-2xl mr-3">workspace_premium</span>
          <div>
            <h3 className="font-semibold text-lg mb-1">Pro Membership</h3>
            <p className="text-gray-600 mb-4">Unlock premium features and enhanced visibility</p>
          </div>
        </div>
        <BtnBeMember />
      </div>
    </div>
  );
};

// Subscription history component
const SubscriptionHistory = () => {
  // In a real implementation, you would fetch subscription history data
  // For now, we'll just display the current subscription details
  return (
    <div className="my-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Current Subscription</h2>
      </div>
      <SubscriptionDetailsCard />

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Payment History</h3>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-center text-gray-500 py-6">
            <span className="material-symbols-outlined text-4xl mb-2">history</span>
            <p>Your payment history will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// KYC Verification Banner component
const KycVerificationBanner = () => {
  const { auth } = useAuth();
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    // Only fetch KYC status for sellers
    if (auth?.roles === 3 && auth?.id) {
      const fetchKycStatus = async () => {
        try {
          const response = await axiosPrivate.get(`/api/kyc/user/${auth.id}`);
          setKycStatus(response.data?.status);
        } catch (err) {
          // 404 is expected if no KYC exists yet
          if (err.response?.status !== 404) {
            console.error('Error fetching KYC status:', err);
          }
        } finally {
          setLoading(false);
        }
      };

      fetchKycStatus();
    } else {
      setLoading(false);
    }
  }, [auth, axiosPrivate]);

  // Don't show banner if:
  // 1. Not a seller
  // 2. Still loading
  // 3. KYC status is 'pending' or 'verified'
  if (
    auth?.roles !== 3 ||
    loading ||
    kycStatus === 'pending' ||
    kycStatus === 'verified'
  ) {
    return null;
  }

  // Show banner only for sellers with no KYC or rejected KYC
  return (
    <div className="w-full bg-gradient-to-r from-black to-purple-600 rounded-lg shadow-md p-6 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h3 className="text-xl font-bold mb-2 flex items-center">
            <span className="material-symbols-outlined mr-2">verified</span>
            Become a verified seller and get a verification badge
          </h3>
          <p className="text-white/80">Complete your KYC verification to build trust with buyers and increase your sales.</p>
        </div>
        <a
          href="/kyc-verification"
          className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-50 transition-colors inline-flex items-center"
        >
          <span className="material-symbols-outlined mr-2">badge</span>
          Submit your KYC Now
        </a>
      </div>
    </div>
  );
};

function App() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { products, setProducts, fetchSellerProducts } = useProductContext();
  const { accessories, setAccessories, fetchSellerAccessories} = useAccessoriesContext()
  const [product, setProduct] = useState(null);
  const [accessory, setAccessory] = useState(null)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });
  const [activeTab, setActiveTab] = useState("blogPosts");
  const itemsPerPage = 8;
  const Seller = auth?.id;

  // Fetch seller's products
  useEffect(() => {
    const getSellerProducts = async () => {
      if (!Seller || !auth?.accessToken) return;

      setIsLoading(true);
      try {
        const sellerProducts = await fetchSellerProducts(Seller);
        setProduct(sellerProducts);
      } catch (err) {
        // Handle specific error cases
        if (err.response?.status === 403) {
          setError('Access denied. You can only view your own products.');
        } else if (err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else {
          setError('Failed to load products');
        }
        console.error('Error fetching seller products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getSellerProducts();
  }, [Seller, fetchSellerProducts, auth?.accessToken]);

  // Fetch seller's Accessories
  useEffect(() => {
    const getSellerAccessories = async () => {
      if (!Seller || !auth?.accessToken) return;

      setIsLoading(true);
      try {
        const sellerAccessories = await fetchSellerAccessories(Seller);
        setAccessories(sellerAccessories);
      } catch (err) {
        // Handle specific error cases
        if (err.response?.status === 403) {
          setError('Access denied. You can only view your own accessories.');
        } else if (err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else {
          setError('Failed to load accessories');
        }
        console.error('Error fetching seller accessories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getSellerAccessories();
  }, [Seller, fetchSellerAccessories, auth?.accessToken]);

  // Removed logging useEffect to prevent infinite loops

  // Handle product deletion
  const handleDelete = async () => {
    try {
      const response = await axiosPrivate.delete(`/api/product/${productToDelete}`);
      if (response.status === 200) {
        // Update products list by filtering out the deleted product
        setProduct(prevProducts => prevProducts.filter(product => product.id !== productToDelete));
        showSuccess("Product deleted successfully.");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      showError("Failed to delete product. Please try again.");
    } finally {
      setIsModalOpen(false);
      setProductToDelete(null);
    }
  };

  // Render appropriate content based on active tab
  const renderTabContent = () => {
    if (!auth?.id) {
      return (
        <div className="p-8 text-center">
          <p className="text-gray-600 mb-4">Please log in to view your dashboard.</p>
        </div>
      );
    }

    switch (activeTab) {
      case "fleetAdverts":
        return (auth?.roles === 3 || auth?.roles === 5) ? (
          <div className="mt-4">
            <StatsOverviewProducts products={product} />
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">My Listings</h2>
              <UploadProduct />
            </div>

            <SellersCarsTable
              products={product}
              isLoading={isLoading}
              error={error}
              sortConfig={sortConfig}
              setSortConfig={setSortConfig}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              openDeleteModal={(productId) => {
                setProductToDelete(productId);
                setIsModalOpen(true);
              }}
              itemsPerPage={itemsPerPage}
              onProductUpdate={(updatedProduct) => {
                setProduct(prevProducts => {
                  if (!prevProducts) return null;

                  return prevProducts.map(prod => {
                    if (prod.id === updatedProduct.id) {
                      return { ...prod, ...updatedProduct };
                    }
                    return prod;
                  });
                });

                if (setProducts && products) {
                  setProducts(prevProducts => {
                    if (!prevProducts) return [];

                    return prevProducts.map(prod => {
                      if (prod.id === updatedProduct.id) {
                        return { ...prod, ...updatedProduct };
                      }
                      return prod;
                    });
                  });
                }
              }}
            />
          </div>
        ) : (
          <div className="p-8 bg-gray-50 rounded-lg mt-4 text-center">
            <p className="text-gray-600 mb-4">Upgrade your account to start listing vehicles for sale</p>
            <BtnBeSeller />
          </div>
        );

      case "accessoriesAdverts":
        return (auth?.roles === 5) ? (
          <div className="mt-4">
            <StatsOverviewAccessories accessories={accessories} /> {/* Use accessories instead of accessory */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">My Accessories</h2>
              <UploadAccessory />
            </div>

            <SellersAccessoriesTable
              accessories={accessories}
              isLoading={isLoading}
              error={error}
              sortConfig={sortConfig}
              setSortConfig={setSortConfig}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              openDeleteModal={(accessoryId) => {
                setProductToDelete(accessoryId);
                setIsModalOpen(true);
              }}
              itemsPerPage={itemsPerPage}
              onProductUpdate={(updatedAccessory) => {
                setAccessories(prevAccessories => {
                  if (!prevAccessories) return [];

                  return prevAccessories.map(acc => {
                    if (acc.id === updatedAccessory.id) {
                      return { ...acc, ...updatedAccessory };
                    }
                    return acc;
                  });
                });
              }}
            />
          </div>
        ) : (
          <div className="p-8 bg-gray-50 rounded-lg mt-4 text-center">
            <h3 className="font-medium mb-4">Become a Seller to Post Adverts</h3>
            <p className="text-gray-600 mb-4">Upgrade your account to start listing accessories for sale</p>
            <BtnBeSeller />
          </div>
        );

      case "blogPosts":
        // Only Admins and Moderators should see/manage blog posts
        return (auth?.roles === 4 || auth?.roles === 5) ? (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">My Blogs</h2>
              <UploadBlog/>
            </div>
            <BlogTable />
          </div>
        ) : (
          <div className="p-8 bg-gray-50 rounded-lg mt-4 text-center">
            <p className="text-gray-600 mb-4">
              You do not have permission to manage blog posts. Admin access is required.
            </p>
          </div>
        );

      case "account":
        return (
          <div className="mt-6 flex flex-col gap-6">
            {/* KYC Verification Banner - Dynamically rendered based on KYC status */}
            <KycVerificationBanner />

            <div className="flex flex-col md:flex-row gap-6">
              <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/2">
                <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                <PersonalDetailsCard />
              </div>

              { auth?.roles === 3 || auth?.roles === 5 ? (
                <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/2">
                  <h2 className="text-xl font-semibold mb-4">Seller Profile</h2>
                  <SellerDetailsCard />
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/2">
                  <h2 className="text-xl font-semibold mb-4">Become a Seller</h2>
                  <p className="text-gray-600 mb-4">Upgrade your account to start listing vehicles for sale</p>
                  <BtnBeSeller />
                </div>
              )}
            </div>
          </div>
        );

      case "subscription":
        return <SubscriptionHistory />;

      case "settings":
        return (
          <div className="my-4">
            <h2 className="text-xl font-semibold mb-6">Account Settings</h2>

            {/* Security Settings */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-start mb-4">
                <span className="material-symbols-outlined text-amber-600 text-2xl mr-3">security</span>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Security Settings</h3>
                  <p className="text-gray-600 mb-4">Manage your password and security preferences</p>
                </div>
              </div>
              <a
                href="/reset-password"
                className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition"
              >
                <span className="material-symbols-outlined mr-1">lock_reset</span>
                Change Password
              </a>
            </div>

            {/* Danger Zone */}
            <div className="border border-red-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg text-red-600 mb-4">Danger Zone</h3>

              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <div className="flex items-start">
                  <span className="material-symbols-outlined text-red-600 text-2xl mr-3">delete_forever</span>
                  <div>
                    <h4 className="font-semibold mb-1">Delete Account</h4>
                    <p className="text-gray-600 mb-4">
                      This action is permanent and cannot be undone. All your data, listings, and history will be deleted.
                    </p>
                    <button
                      onClick={() => {
                        // Show confirmation dialog before deleting
                        if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
                          // Here you would call your account deletion API
                          alert("Account deletion functionality will be implemented here.");
                        }
                      }}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                    >
                      <span className="material-symbols-outlined mr-1">delete</span>
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
      <Layout>
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6 pb-px">
            <div className="flex overflow-x-auto hide-scrollbar">
              <div className="flex w-full md:w-auto">
                <TabNavItem
                  id="fleetAdverts"
                  title="My Fleet"
                  icon="directions_car"
                  activeTab={activeTab}
                  onClick={setActiveTab}
                />
                {/* Only show accessories tab for admin users */}
                {auth?.roles === 5 && (
                  <TabNavItem
                    id="accessoriesAdverts"
                    title="My Accessories"
                    icon="build"
                    activeTab={activeTab}
                    onClick={setActiveTab}
                  />
                )}
                {/* Only show blog posts tab for admins and moderators */}
                {(auth?.roles === 4 || auth?.roles === 5) && (
                  <TabNavItem
                    id="blogPosts"
                    title="My Posts"
                    icon="article"
                    activeTab={activeTab}
                    onClick={setActiveTab}
                  />
                )}
                <TabNavItem
                  id="account"
                  title="My Account"
                  icon="account_circle"
                  activeTab={activeTab}
                  onClick={setActiveTab}
                />
                <TabNavItem
                  id="subscription"
                  title="Subscription History"
                  icon="payments"
                  activeTab={activeTab}
                  onClick={setActiveTab}
                />
                <TabNavItem
                  id="settings"
                  title="Settings"
                  icon="settings"
                  activeTab={activeTab}
                  onClick={setActiveTab}
                />
              </div>
            </div>
          </div>

          {/* Tab Content Area */}
          <div className="min-h-[60vh] bg-gray-50 p-6 rounded-lg">
            {renderTabContent()}
          </div>
        </main>

        <DeleteConfirmationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setProductToDelete(null);
          }}
          onConfirm={handleDelete}
        />

        {/* Add custom scrollbar styles */}
        <style>
          {`
          .hide-scrollbar::-webkit-scrollbar {
            height: 0px;
          }
          .hide-scrollbar {
            scrollbar-width: none;
          }
        `}
        </style>
      </Layout>
  );
}

export default App;
