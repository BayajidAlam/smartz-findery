import { createContext, useContext, useState, useEffect } from 'react';
import { fetchProducts } from '../data/Products';

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

  // Load products on app start
  useEffect(() => {
    loadProducts();
    loadCartFromStorage();
    loadDarkModePreference();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await fetchProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
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
      
      // Apply dark mode class to body immediately
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
    
    // Save to localStorage
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    // Toggle body class for CSS styling
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
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
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    toggleDarkMode,
    refreshProducts: loadProducts,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};