import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { AppProvider } from "../context/AppContext";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";

// Import pages
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import CheckoutPage from "../pages/CheckoutPage";
import MyOrdersPage from "../pages/MyOrdersPage";
import MyProductsPage from "../pages/MyProductsPage"; // ADD THIS LINE

const AppRouter = () => {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Private Routes */}
            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <CheckoutPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/my-orders"
              element={
                <PrivateRoute>
                  <MyOrdersPage />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/my-products"
              element={
                <AdminRoute>
                  <MyProductsPage />
                </AdminRoute>
              }
            />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;