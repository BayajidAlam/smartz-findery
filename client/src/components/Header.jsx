// components/Header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const Header = ({ onCartClick }) => {
  const { getCartItemsCount, toggleDarkMode } = useApp();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const totalItems = getCartItemsCount();

  const handleLoginLogout = () => {
    if (isAuthenticated) {
      logout();
    } else {
      navigate('/login');
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <header>
      <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        Smart'Z Findery
      </div>
      <nav>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          Home
        </a>
        
        {/* Show My Orders link only for users with 'user' role */}
        {isAuthenticated && user?.role === 'user' && (
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/my-orders'); }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h2v10z"/>
            </svg>
            My Orders
          </a>
        )}
        
        <a href="#" onClick={(e) => { e.preventDefault(); onCartClick(); }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zm-8.7-7l.48-1.04L13.2 13h1.86l.66-1.32L17.77 8H10l-1-2H4V4h-.7c-.66 0-1.16.54-1.16 1.2s.5 1.2 1.16 1.2H4L6 14.5c.18 1.1 1.13 1.9 2.22 1.9h8.21c1.09 0 2.04-.8 2.22-1.9L22 6.5h-5.27l-2.5 5.5z"/>
          </svg>
          Cart {totalItems > 0 && `(${totalItems})`}
        </a>
        
        <a href="#" onClick={(e) => { e.preventDefault(); handleLoginLogout(); }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          {isAuthenticated ? 'Logout' : 'Login'}
        </a>
        
        <button onClick={toggleDarkMode}>🌙</button>
      </nav>
    </header>
  );
};

export default Header;