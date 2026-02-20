import { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Admin from './pages/app.jsx';

import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import ForgotPassword from './components/forms/forgotPassword.jsx';
import ResetPassword from './components/forms/resetPassword.jsx';

import Unauthorized from './pages/unauthorized.jsx';
import NotFound from './pages/notFound.jsx';

import Users from './pages/users.jsx';
import Products from './pages/products.jsx';
import Sellers from './pages/sellers.jsx';
import Reports from './pages/reports.jsx';
import Subscriptions from './pages/subscriptions.jsx';
import KycVerification from './pages/kycVerification.jsx';

import { AuthProvider } from './providers/AuthProvider.jsx';
import { ProductProvider } from './providers/ProductProvider.jsx';
import { AccessoriesProvider } from './providers/AccessoriesProvider.jsx';
import { BlogProvider } from './providers/BlogProvider.jsx';
import { SearchProvider } from './providers/SearchProvider.jsx';
import { SellerProvider } from './providers/SellerProvider.jsx';
import SeoProvider from './providers/SeoProvider.jsx';
import PersistLogin from './authorization/PersistLogin.jsx';
import RequireAuth from './authorization/RequireAuth.jsx';



import { setupSmoothAnchorLinks } from './utils/scrollUtils';

import 'material-symbols';
import './assets/index.css';

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




    {/* Protected Routes */}
    <Route element={<PersistLogin />}>








      {/* Nested Routes for Authorization */}

      <Route element={<RequireAuth allowedRoles={[ROLES.Modarator, ROLES.Admin]} />}>
        <Route path="/" element={<Admin />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={[ROLES.Modarator, ROLES.Admin]} />}>
        <Route path="/users" element={<Users />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={[ROLES.Modarator, ROLES.Admin]} />}>
        <Route path="/products" element={<Products />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={[ROLES.Modarator, ROLES.Admin]} />}>
        <Route path="/subscriptions" element={<Subscriptions />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={[ROLES.Modarator, ROLES.Admin]} />}>
        <Route path="/sellers" element={<Sellers />} />
      </Route>
      <Route element={<RequireAuth allowedRoles={[ROLES.Modarator, ROLES.Admin]} />}>
        <Route path="/reports" element={<Reports />} />
      </Route>

      <Route element={<RequireAuth allowedRoles={[ROLES.Modarator, ROLES.Admin]} />}>
        <Route path="/kyc" element={<KycVerification />} />
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