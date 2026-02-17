import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import App from './App/App.jsx';
import Admin from './App/admin/Admin.jsx';
import Home from './App/home.jsx';
import Login from './App/login.jsx';
import Register from './App/register.jsx';
import ForgotPassword from './components/forms/forgotPassword.jsx';
import ResetPassword from './components/forms/resetPassword.jsx';
import AddProduct from './components/forms/addProduct.jsx';
import AddAccessories from './components/forms/addAccessories.jsx';
import BecomeSeller from './components/forms/becomeSeller.jsx';
import UpdateProduct from './components/forms/updateProduct.jsx';
import KnowYourCustomer from './components/forms/knowYourCustomer.jsx';
import PaymentCallback from './components/payment/PaymentCallback.jsx';
import BlogList from './components/cards/BlogList.jsx';
import BlogPost from './pages/BlogPost.jsx';
import AddBlogPost from './components/forms/addBlogPost.jsx';
import EditBlogPost from './components/forms/editBlogPost.jsx';
import AccessoriesItemPage from './accessoriesItemPage.jsx';
import ItemPage from './itemPage.jsx';
import UpdateAccessory from './components/forms/UpdateAccessory.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import Pricing from './pages/pricing.jsx';
import NotFound from './notFound.jsx';
import SellerPage from './pages/SellerPage.jsx';

import Product from './productPage.jsx';
import Support from './pages/support.jsx';
import Accessories from './accessories.jsx';

import Users from './App/admin/pages/users.jsx';
import Products from './App/admin/pages/products.jsx';
import Sellers from './App/admin/pages/sellers.jsx';
import Reports from './App/admin/pages/reports.jsx';
import Subscriptions from './App/admin/pages/subscriptions.jsx';
import KycVerification from './App/admin/pages/KycVerification.jsx';

import { AuthProvider } from './context/AuthProvider.jsx';
import { ProductProvider } from './context/ProductProvider.jsx';
import { AccessoriesProvider } from './context/AccessoriesProvider.jsx';
import { BlogProvider } from './context/BlogProvider.jsx';
import { SearchProvider } from './context/SearchProvider.jsx';
import { SellerProvider } from './context/SellerProvider.jsx';
import SeoProvider from './context/SeoProvider.jsx';
import PersistLogin from './controllers/PersistLogin';
import RequireAuth from './controllers/RequireAuth';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import * as analytics from './utils/analytics';
import { setupSmoothAnchorLinks } from './utils/scrollUtils';

import 'material-symbols';
import './index.css';

// Initialize smooth scrolling for anchor links
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', setupSmoothAnchorLinks);
}

// Roles constant
const ROLES = {
  Visitor: 1,
  Seller: 3,
  Modarator: 4,
  Admin: 5,
};

// Analytics listener component to track page views
function AnalyticsListener() {
  const location = useLocation();
  useEffect(() => {
    analytics.pageview(location.pathname + location.search);
  }, [location]);
  return null;
}

// Create a reusable loading component
const AdminLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="unauthorized" element={<Unauthorized />} />
    <Route path="notfound" element={<NotFound />} />
    <Route path="*" element={<NotFound />} /> {/* Add this line to catch all unmatched routes */}
    <Route path="register" element={<Register />} />
    <Route path="login" element={<Login />} />
    <Route path="forgot-password" element={<ForgotPassword />} />
    <Route path="reset-password" element={<ResetPassword />} />
    <Route path="/" element={< Home />} />
    <Route path="payment-callback" element={<PaymentCallback />} />


    {/* Protected Routes */}
    <Route element={<PersistLogin />}>
      <Route path="home" element={< Home />} />
      <Route path="pricing" element={<Pricing />} />
      <Route path="support" element={<Support />} />
      <Route path="vehicles" element={<Product />} />
      <Route path="accessories" element={<Accessories />} />
      {/* <Route path="accessory/:slug" element={<AccessoriesItemPage />} /> */}
      <Route path="vehicle/:productId" element={<ItemPage />} />
      <Route path="accessory/:accessoryId" element={<AccessoriesItemPage />} />
      <Route path="seller/:sellerSlug" element={<SellerPage />} />
      <Route path="blogs" element={<BlogList />} />
      <Route path="blog/:slug" element={<BlogPost />} />

      {/* Blog management routes - protected */}
      <Route element={<RequireAuth allowedRoles={[ROLES.Seller, ROLES.Modarator, ROLES.Admin]} />}>
        <Route path="blog/uploadpost" element={<AddBlogPost />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={[ROLES.Seller, ROLES.Modarator, ROLES.Admin]} />}>
        <Route path="blog/editpost/:id" element={<EditBlogPost />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
        <Route path="accessories/upload" element={<AddAccessories />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
        <Route path="accessory/update/:id" element={<UpdateAccessory />} />
      </Route>

      {/* Nested Routes for Authorization */}
      <Route element={<RequireAuth allowedRoles={[ ROLES.Seller, ROLES.Modarator, ROLES.Admin]} />}>
        <Route path="dashboard" element={<App />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={[ ROLES.Modarator, ROLES.Admin]} />}>
        <Route path="Admin" element={<Admin />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={[ ROLES.Modarator, ROLES.Admin]} />}>
        <Route path="admin/users" element={<Users />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={[ ROLES.Modarator, ROLES.Admin]} />}>
        <Route path="admin/products" element={<Products />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={[ ROLES.Modarator, ROLES.Admin]} />}>
        <Route path="admin/subscriptions" element={<Subscriptions />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={[ ROLES.Modarator, ROLES.Admin]} />}>
        <Route path="admin/sellers" element={<Sellers />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={[ ROLES.Modarator, ROLES.Admin]} />}>
        <Route path="admin/reports" element={<Reports />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={[ ROLES.Seller, ROLES.Admin]} />}>
        <Route path="products/upload" element={<AddProduct />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={[ ROLES.Seller, ROLES.Modarator, ROLES.Admin]} />}>
        <Route path="app/:productId" element={<UpdateProduct />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={[ ROLES.Visitor, ROLES.Seller, ROLES.Admin]} />}>
        <Route path="become-seller" element={<BecomeSeller />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={[ROLES.Seller, ROLES.Admin]} />}>
        <Route path="kyc-verification" element={<KnowYourCustomer />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={[ROLES.Modarator, ROLES.Admin]} />}>
        <Route path="admin/kyc" element={<KycVerification />} />
      </Route>
    </Route>
  </Routes>
);

ReactDOM.createRoot(document.getElementById('root')).render( 
    <SeoProvider>
      <AuthProvider>
        <ProductProvider>       
          <SearchProvider>
            <AccessoriesProvider>
              <SellerProvider>
                <BlogProvider>
                  <Router>
                    <AnalyticsListener />
                    <Analytics />
                    <SpeedInsights />
                    <AppRoutes />
                    <ToastContainer
                      position="top-right"
                      autoClose={5000}
                      hideProgressBar={false}
                      newestOnTop
                      closeOnClick
                      rtl={false}
                      pauseOnFocusLoss
                      draggable
                      pauseOnHover
                      theme="light"
                    />
                  </Router>
                </BlogProvider>
              </SellerProvider>
            </AccessoriesProvider>
          </SearchProvider>
        </ProductProvider>
      </AuthProvider>
    </SeoProvider>  
);