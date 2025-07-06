import { useState } from 'react';
import Header from './Header';
import CartOverlay from './CartOverlay';

const Layout = ({ children, showHeader = true }) => {
  const [showCart, setShowCart] = useState(false);

  const handleCartClick = () => {
    setShowCart(true);
  };

  const handleCartClose = () => {
    setShowCart(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E1ccc7' }}>
      {showHeader && <Header onCartClick={handleCartClick} />}
      
      <main>
        {children}
      </main>

      {/* Cart Overlay - Global across all pages */}
      {showCart && (
        <CartOverlay onClose={handleCartClose} />
      )}
    </div>
  );
};

export default Layout;