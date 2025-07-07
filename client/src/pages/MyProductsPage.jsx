// client/src/pages/MyProductsPage.jsx - Cleaned version
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../utils/api';
import Layout from '../components/Layout';
import ProductModal from '../components/ProductModal';

const MyProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { user } = useAuth();

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div style={{
            textAlign: 'center',
            background: 'white',
            padding: '60px',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            maxWidth: '500px'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔒</div>
            <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '15px', fontWeight: '600' }}>
              Access Denied
            </h1>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>
              You need admin privileges to access this page.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProducts();
      setProducts(response);
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle add product
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    try {
      await apiClient.deleteProduct(productId);
      setProducts(products.filter(p => p._id !== productId));
      setDeleteConfirm(null); // Close the modal
      setError(''); // Clear any previous errors
    } catch (err) {
      setError('Failed to delete product');
      console.error(err);
      setDeleteConfirm(null); // Close modal even on error
    }
  };

  // Handle modal save
  const handleModalSave = async (productData) => {
    try {
      if (editingProduct) {
        // Update existing product
        const updatedProduct = await apiClient.updateProduct(editingProduct._id, productData);
        setProducts(products.map(p => 
          p._id === editingProduct._id ? updatedProduct : p
        ));
      } else {
        // Add new product
        const newProduct = await apiClient.createProduct(productData);
        setProducts([...products, newProduct]);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setError(''); // Clear any previous errors
    } catch (err) {
      setError('Failed to save product: ' + err.message);
      console.error(err);
      // Don't close modal on error so user can retry
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}>
          <div style={{
            textAlign: 'center',
            background: 'white',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            {/* Using CSS class instead of inline styles */}
            <div className="admin-spinner"></div>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>Loading products...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '40px 20px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Header Section */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            marginBottom: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <h1 style={{
                fontSize: '2.5rem',
                color: '#333',
                margin: '0 0 10px 0',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #800000, #a00000)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                My Products
              </h1>
              <p style={{
                color: '#666',
                fontSize: '1.1rem',
                margin: '0'
              }}>
                Manage your product inventory with ease
              </p>
            </div>
            <button
              onClick={handleAddProduct}
              className="admin-button"
              style={{
                background: 'linear-gradient(135deg, #800000, #a00000)',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(128,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>+</span>
              Add Product
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
              color: 'white',
              padding: '20px',
              borderRadius: '15px',
              marginBottom: '30px',
              boxShadow: '0 8px 20px rgba(255,107,107,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              {error}
            </div>
          )}

          {/* Products Grid */}
          {products.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '25px'
            }}>
              {products.map((product) => (
                <div
                  key={product._id}
                  className="admin-card"
                  style={{
                    background: 'white',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    cursor: 'pointer'
                  }}
                >
                  {/* Product Image */}
                  <div style={{
                    position: 'relative',
                    paddingBottom: '60%',
                    background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)'
                  }}>
                    <img
                      src={product.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                      alt={product.name}
                      style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {/* Category Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      background: 'rgba(255,255,255,0.9)',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: '#666',
                      backdropFilter: 'blur(10px)'
                    }}>
                      {product.category}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div style={{ padding: '25px' }}>
                    <h3 style={{
                      fontSize: '1.3rem',
                      fontWeight: '600',
                      color: '#333',
                      margin: '0 0 10px 0',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: '2',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.name}
                    </h3>
                    
                    <p style={{
                      color: '#666',
                      fontSize: '0.95rem',
                      margin: '0 0 15px 0',
                      lineHeight: '1.5',
                      display: '-webkit-box',
                      WebkitLineClamp: '2',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.description}
                    </p>

                    {/* Price */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px'
                    }}>
                      <span style={{
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        color: '#800000'
                      }}>
                        BDT {product.price}
                        {product.hasVat && (
                          <span style={{
                            fontSize: '0.8rem',
                            color: '#666',
                            fontWeight: '400'
                          }}> +VAT</span>
                        )}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                      display: 'flex',
                      gap: '10px'
                    }}>
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="admin-button"
                        style={{
                          flex: '1',
                          background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                          color: 'white',
                          border: 'none',
                          padding: '12px',
                          borderRadius: '12px',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product._id)}
                        className="admin-button"
                        style={{
                          flex: '1',
                          background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                          color: 'white',
                          border: 'none',
                          padding: '12px',
                          borderRadius: '12px',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '80px 40px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '20px',
                opacity: '0.6'
              }}>📦</div>
              <h2 style={{
                fontSize: '2rem',
                color: '#333',
                margin: '0 0 15px 0',
                fontWeight: '600'
              }}>
                No Products Found
              </h2>
              <p style={{
                color: '#666',
                fontSize: '1.1rem',
                marginBottom: '30px',
                lineHeight: '1.6'
              }}>
                Start building your inventory by adding your first product.
              </p>
              <button
                onClick={handleAddProduct}
                className="admin-button"
                style={{
                  background: 'linear-gradient(135deg, #800000, #a00000)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '50px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(128,0,0,0.3)'
                }}
              >
                Add Your First Product
              </button>
            </div>
          )}

          {/* Product Modal */}
          <ProductModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingProduct(null);
            }}
            onSave={handleModalSave}
            product={editingProduct}
          />

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div 
              style={{
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '1000',
                padding: '20px',
                backdropFilter: 'blur(5px)'
              }}
              onClick={(e) => {
                // Close modal when clicking backdrop
                if (e.target === e.currentTarget) {
                  setDeleteConfirm(null);
                }
              }}
            >
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '40px',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '20px'
                }}>🗑️</div>
                <h3 style={{
                  fontSize: '1.5rem',
                  color: '#333',
                  margin: '0 0 15px 0',
                  fontWeight: '600'
                }}>
                  Confirm Delete
                </h3>
                <p style={{
                  color: '#666',
                  fontSize: '1.1rem',
                  marginBottom: '30px',
                  lineHeight: '1.6'
                }}>
                  Are you sure you want to delete this product? This action cannot be undone.
                </p>
                <div style={{
                  display: 'flex',
                  gap: '15px'
                }}>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="admin-button"
                    style={{
                      flex: '1',
                      background: 'linear-gradient(135deg, #e9ecef, #f8f9fa)',
                      color: '#666',
                      border: 'none',
                      padding: '15px',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(deleteConfirm)}
                    className="admin-button"
                    style={{
                      flex: '1',
                      background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                      color: 'white',
                      border: 'none',
                      padding: '15px',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyProductsPage;