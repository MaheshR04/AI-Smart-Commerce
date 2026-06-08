import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Wishlist from '../pages/Wishlist';
import Checkout from '../pages/Checkout';
import PaymentSuccess from '../pages/PaymentSuccess';
import OrderHistory from '../pages/OrderHistory';
import Invoice from '../pages/Invoice';
import AdminDashboard from '../pages/AdminDashboard';
import Profile from '../pages/Profile';
import ProtectedRoute from '../components/ProtectedRoute';
import NotFound from '../pages/NotFound';
import Compare from '../pages/Compare';
import GoalPlanner from '../pages/GoalPlanner';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/compare" element={<Compare />} />
      <Route path="/goal-planner" element={<GoalPlanner />} />

      {/* Protected User Pages */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout/success"
        element={
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrderHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id/invoice"
        element={
          <ProtectedRoute>
            <Invoice />
          </ProtectedRoute>
        }
      />

      {/* Protected Administrator Pages */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback redirect */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
