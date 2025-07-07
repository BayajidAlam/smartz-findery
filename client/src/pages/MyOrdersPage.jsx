import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const MyOrderPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Checking authentication...', { user, isAuthenticated });

        // Check if user is authenticated
        if (!isAuthenticated || !user) {
          console.log('❌ User not authenticated');
          setError('Please log in to view your orders');
          setLoading(false);
          return;
        }

        console.log('✅ User authenticated, fetching orders for user:', user);

        // Fetch real orders from backend
        const response = await apiClient.getUserOrders(user.id);
        
        console.log('📦 Raw API response:', response);

        // Handle the actual API response structure
        let fetchedOrders = [];
        if (response && response.success && response.orders) {
          fetchedOrders = response.orders;
        } else if (Array.isArray(response)) {
          // Fallback if API returns array directly
          fetchedOrders = response;
        } else {
          console.log('⚠️ Unexpected API response format:', response);
          fetchedOrders = [];
        }

        console.log('📦 Extracted orders:', fetchedOrders);

        // Check if we got actual data
        if (!fetchedOrders || fetchedOrders.length === 0) {
          console.log('⚠️ No orders found for user');
          setOrders([]);
          setLoading(false);
          return;
        }

        // Transform backend data to match frontend structure
        const transformedOrders = fetchedOrders.map(order => {
          console.log('🔄 Transforming order:', order);
          return {
            id: order._id || order.id,
            orderNumber: order.orderNumber || `ORD-${order._id}`,
            date: order.createdAt || order.updatedAt || order.date || new Date().toISOString(),
            total: order.total || 0,
            subtotal: order.subtotal || 0,
            vatTotal: order.vatTotal || 0,
            status: order.status || 'pending',
            paymentMethod: order.paymentMethod || 'unknown',
            customerDetails: order.customerDetails || {},
            items: (order.items || []).map(item => ({
              id: item.productId || item._id || item.id,
              name: item.name || 'Unknown Product',
              price: item.price || 0,
              quantity: item.quantity || 1,
              image: item.image || 'https://via.placeholder.com/80x80'
            }))
          };
        });

        console.log('✨ Transformed orders:', transformedOrders);
        setOrders(transformedOrders);
        
      } catch (err) {
        console.error('💥 Error fetching orders:', {
          message: err.message,
          stack: err.stack,
          user: user
        });
        
        setError(`Backend error: ${err.message}`);
        
        // Only use mock data in development and show clear indication
        if (import.meta.env.NODE_ENV === 'development') {
          console.log('🔧 Development mode: Using mock data as fallback');
          const mockOrders = [
            {
              id: 'MOCK-001',
              orderNumber: 'MOCK-ORD-001',
              date: '2025-01-05',
              total: 3500,
              subtotal: 3500,
              vatTotal: 0,
              status: 'paid',
              paymentMethod: 'stripe',
              customerDetails: {
                firstName: 'Mock',
                lastName: 'User'
              },
              items: [
                {
                  id: 1,
                  name: '[MOCK] FILA Casual Shirt',
                  price: 2000,
                  quantity: 1,
                  image: 'https://via.placeholder.com/80x80'
                }
              ]
            }
          ];
          setOrders(mockOrders);
        } else {
          // In production, don't show mock data
          setOrders([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, isAuthenticated]);

  const handleBuyAgain = (order) => {
    alert(`Adding items from order ${order.id} to cart...`);
  };

  const handleShowInvoice = (order) => {
    alert(`Showing invoice for order ${order.id}`);
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', paddingTop: '100px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #800000',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p style={{ color: '#666' }}>Loading your orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show login message if not authenticated
  if (!isAuthenticated) {
    return (
      <Layout>
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '60px 30px',
              textAlign: 'center',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              border: '1px solid #eee',
              marginTop: '100px'
            }}>
              <span style={{ fontSize: '64px', color: '#ccc', display: 'block', marginBottom: '20px' }}>🔐</span>
              <h3 style={{ color: '#666', margin: '0 0 10px 0' }}>Please Log In</h3>
              <p style={{ color: '#999', margin: 0 }}>You need to be logged in to view your order history.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Page Header */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ fontSize: '0.9em', color: '#777', marginBottom: '15px' }}>
              Home / My Account / Order History
            </div>
            <h1 style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#333', margin: 0 }}>
              My Orders
            </h1>
            <p style={{ color: '#666', marginTop: '8px', fontSize: '1.1em' }}>
              View your past purchases {user && `(${user.name})`}
            </p>
          </div>

          {/* Debug Info - Remove in production */}
          {import.meta.env.NODE_ENV === 'development' && (
            <div style={{
              background: '#f0f8ff',
              border: '1px solid #d1ecf1',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '30px',
              fontSize: '0.9em'
            }}>
              <strong>🔧 Debug Info:</strong>
              <br />
              User: {user ? `${user.name} (ID: ${user.id})` : 'Not logged in'}
              <br />
              Authenticated: {isAuthenticated ? 'Yes' : 'No'}
              <br />
              Orders loaded: {orders.length}
              <br />
              API Base URL: {import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}
              {error && (
                <>
                  <br />
                  <span style={{ color: '#d32f2f' }}>Last Error: {error}</span>
                </>
              )}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '30px',
              marginBottom: '30px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              border: '1px solid #ffebee'
            }}>
              <div style={{
                background: '#ffebee',
                color: '#c62828',
                padding: '15px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <strong>⚠️ Backend Connection Issue:</strong> {error}
                <br />
                <small style={{ marginTop: '10px', display: 'block' }}>
                  Check browser console for detailed API logs
                </small>
                {orders.length > 0 && orders[0].id && orders[0].id.includes('MOCK') && (
                  <small style={{ marginTop: '5px', display: 'block', fontStyle: 'italic' }}>
                    Currently showing mock data for development
                  </small>
                )}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            border: '1px solid #eee'
          }}>
            <h3 style={{ fontSize: '1.4em', color: '#333', margin: '0 0 20px 0' }}>
              Order Summary
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                background: '#f8f8f8',
                borderRadius: '10px',
                border: '1px solid #eee'
              }}>
                <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#800000', marginBottom: '5px' }}>
                  {orders.length}
                </div>
                <div style={{ color: '#666', fontSize: '1.1em' }}>Total Orders</div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                background: '#f0fff4',
                borderRadius: '10px',
                border: '1px solid #e0ffe0'
              }}>
                <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#009900', marginBottom: '5px' }}>
                  {orders.filter(order => order.status === 'paid').length}
                </div>
                <div style={{ color: '#666', fontSize: '1.1em' }}>Completed</div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.length === 0 ? (
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '60px 30px',
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                border: '1px solid #eee'
              }}>
                <span style={{ fontSize: '64px', color: '#ccc', display: 'block', marginBottom: '20px' }}>📦</span>
                <h3 style={{ color: '#666', margin: '0 0 10px 0' }}>No orders found</h3>
                <p style={{ color: '#999', margin: 0 }}>You haven't placed any orders yet.</p>
              </div>
            ) : (
              orders.map(order => (
                <div
                  key={order.id}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '25px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #eee'
                  }}
                >
                  {/* Order Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '20px',
                    paddingBottom: '15px',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', fontSize: '1.3em', color: '#333' }}>
                        {order.orderNumber || `Order #${order.id}`}
                      </h3>
                      <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '0.95em' }}>
                        Placed on {new Date(order.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      {order.customerDetails && order.customerDetails.firstName && (
                        <p style={{ margin: '0', color: '#888', fontSize: '0.85em' }}>
                          Customer: {order.customerDetails.firstName} {order.customerDetails.lastName}
                        </p>
                      )}
                      {order.paymentMethod && (
                        <p style={{ margin: '0', color: '#888', fontSize: '0.85em' }}>
                          Payment: {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#800000' }}>
                        BDT {order.total.toFixed(2)}
                      </div>
                      {order.subtotal && order.vatTotal && (
                        <div style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>
                          Subtotal: BDT {order.subtotal.toFixed(2)}
                          <br />
                          VAT: BDT {order.vatTotal.toFixed(2)}
                        </div>
                      )}
                      <div style={{
                        display: 'inline-block',
                        marginTop: '8px',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75em',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        background: order.status === 'paid' ? '#e8f5e8' : '#fff8e1',
                        color: order.status === 'paid' ? '#2e7d32' : '#f57c00',
                        border: `1px solid ${order.status === 'paid' ? '#4caf50' : '#ffcc02'}`
                      }}>
                        {order.status}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '1.1em', color: '#333' }}>
                      Items ({order.items.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {order.items.map(item => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '15px',
                            background: '#fcfcfc',
                            borderRadius: '8px',
                            border: '1px solid #f0f0f0',
                            gap: '15px'
                          }}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: '80px',
                              height: '80px',
                              objectFit: 'cover',
                              borderRadius: '6px'
                            }}
                          />
                          <div style={{ flexGrow: 1 }}>
                            <h5 style={{ margin: '0 0 5px 0', fontSize: '1.1em', color: '#333' }}>
                              {item.name}
                            </h5>
                            <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>
                              BDT {item.price.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                          <div style={{
                            fontSize: '1.1em',
                            fontWeight: 'bold',
                            color: '#800000',
                            minWidth: '100px',
                            textAlign: 'right'
                          }}>
                            BDT {(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end'
                  }}>
                    <button
                      onClick={() => handleShowInvoice(order)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 16px',
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9em',
                        fontWeight: '500',
                        transition: 'background-color 0.3s ease'
                      }}
                      onMouseOver={(e) => e.target.style.background = '#5a6268'}
                      onMouseOut={(e) => e.target.style.background = '#6c757d'}
                    >
                      <span style={{ fontSize: '16px' }}>📄</span>
                      Show Invoice
                    </button>
                    
                    <button
                      onClick={() => handleBuyAgain(order)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 16px',
                        background: '#800000',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9em',
                        fontWeight: '500',
                        transition: 'background-color 0.3s ease'
                      }}
                      onMouseOver={(e) => e.target.style.background = '#a00000'}
                      onMouseOut={(e) => e.target.style.background = '#800000'}
                    >
                      <span style={{ fontSize: '16px' }}>🛍️</span>
                      Buy Again
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CSS for loading animation */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </Layout>
  );
};

export default MyOrderPage;