import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../utils/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Simple filter state that works with your existing design
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    sort: 'newest'
  });

  useEffect(() => {
    loadProducts();
    loadCartFromStorage();
    loadDarkModePreference();
  }, []);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [filters]);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await apiClient.getProducts(filters);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Simple handlers that update filters
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleCategoryFilter = (category) => {
    setFilters(prev => ({ ...prev, category }));
  };

  const handleSort = (sort) => {
    setFilters(prev => ({ ...prev, sort }));
  };

  const loadCartFromStorage = () => {
    try {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const loadDarkModePreference = () => {
    try {
      const darkModePreference = localStorage.getItem('darkMode');
      const isDarkMode = darkModePreference === 'true';
      setDarkMode(isDarkMode);
      
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    } catch (error) {
      console.error('Error loading dark mode preference:', error);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => (item.id || item._id) === (product.id || product._id));
      
      if (existingItem) {
        return prevItems.map(item =>
          (item.id || item._id) === (product.id || product._id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => (item.id || item._id) !== productId));
  };

  const updateCartItemQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        (item.id || item._id) === productId
          ? { ...item, quantity: parseInt(quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      const vat = item.hasVat ? itemTotal * 0.15 : 0;
      return total + itemTotal + vat;
    }, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    products,
    cartItems,
    loading,
    darkMode,
    filters,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    toggleDarkMode,
    handleSearch,
    handleCategoryFilter,
    handleSort,
    refreshProducts: loadProducts,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};