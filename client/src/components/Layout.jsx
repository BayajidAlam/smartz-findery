import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Header from './Header';
import CartOverlay from './CartOverlay';
import FloatingCart from './FloatingCart';
import Footer from './Footer';

const Layout = ({ children, showHeader = true }) => {
  const [showCart, setShowCart] = useState(false);
  const { darkMode } = useApp();

  // Update body background based on dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.style.backgroundColor = '#121212';
    } else {
      document.body.style.backgroundColor = '#E1ccc7';
    }
  }, [darkMode]);

  const handleCartClick = () => {
    setShowCart(true);
  };

  const handleCartClose = () => {
    setShowCart(false);
  };

  return (
    <div className="min-h-screen">
      {showHeader && <Header onCartClick={handleCartClick} />}
      
      <main>
        {children}
      </main>

      {showHeader && <Footer />}

      {/* Floating Cart Button - only show with header */}
      {showHeader && <FloatingCart onClick={handleCartClick} />}

      {/* Cart Overlay - Global across all pages */}
      {showCart && (
        <CartOverlay onClose={handleCartClose} />
      )}
    </div>
  );
};

export default Layout;

