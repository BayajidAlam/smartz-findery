// pages/MyOrdersPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../utils/api';
import Layout from '../components/Layout';
import {
  FiShoppingBag,
  FiPackage,
  FiArrowLeft,
  FiLoader,
  FiCheck,
  FiClock,
  FiX,
  FiShoppingCart
} from 'react-icons/fi';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'user') {
      navigate('/');
      return;
    }

    fetchOrders();
  }, [isAuthenticated, user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUserOrders(user.id);
      let ordersArray = [];

      if (Array.isArray(response)) {
        ordersArray = response;
      } else if (response && typeof response === 'object') {
        if (response.orders && Array.isArray(response.orders)) {
          ordersArray = response.orders;
        } else if (response.data && Array.isArray(response.data)) {
          ordersArray = response.data;
        } else {
          ordersArray = [response];
        }
      }

      const sortedOrders = ordersArray.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);
    } catch (err) {
      setError(`Failed to fetch orders: ${err.message}`);
      console.error('❌ Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  // Calculate stats
  const totalOrders = orders.length;
  const activeOrders = orders.filter(order => order.status === 'pending').length;
  const completedOrders = orders.filter(order => order.status === 'paid').length;
  const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FiLoader className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading your orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors font-medium"
            >
              <FiArrowLeft />
              Back to Shopping
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
                <p className="text-gray-500">Order History Is Track Your Purchases and View Past Orders</p>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  Show Invoice
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiPackage className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                  <p className="text-gray-500 text-sm">Total Order</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FiClock className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{activeOrders}</p>
                  <p className="text-gray-500 text-sm">Active order</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <FiCheck className="text-orange-600 text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{completedOrders}</p>
                  <p className="text-gray-500 text-sm">Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <FiX className="text-red-600 text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-300">{cancelledOrders}</p>
                  <p className="text-gray-400 text-sm">Cancelled</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiShoppingCart className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-500 mb-8">Start shopping to see your order history here</p>
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                <FiShoppingBag className="inline mr-2" />
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {orders.map((order) => {
                  // Show only first item for each order
                  const firstItem = order.items?.[0];
                  const remainingItems = (order.items?.length || 0) - 1;
                  
                  return (
                    <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-6">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                          {firstItem?.image ? (
                            <img
                              src={firstItem.image}
                              alt={firstItem.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-full h-full bg-gray-200 flex items-center justify-center" 
                            style={{ display: firstItem?.image ? 'none' : 'flex' }}
                          >
                            <FiPackage className="text-gray-400 text-xl" />
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {firstItem?.name || 'Order Items'}
                          </h3>
                          {remainingItems > 0 && (
                            <p className="text-sm text-gray-500 mb-2">
                              +{remainingItems} more item{remainingItems !== 1 ? 's' : ''}
                            </p>
                          )}
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Quantity:</span> {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Order:</span> {order.orderNumber || order._id.slice(-8).toUpperCase()}
                            </p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyOrdersPage;