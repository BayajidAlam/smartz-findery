import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const Header = ({ onCartClick }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartItemsCount, toggleDarkMode } = useApp();

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
    } else {
      navigate('/login');
    }
  };

  return (
    <header>
      {/* Logo */}
      <div className="logo">Smart'Z Findery</div>

      {/* Navigation */}
      <nav>
        {/* Home Link */}
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          Home
        </a>

        {/* Cart Button */}
        <a href="#" onClick={(e) => { e.preventDefault(); onCartClick(); }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zm-8.7-7l.48-1.04L13.2 13h1.86l.66-1.32L17.77 8H10l-1-2H4V4h-.7c-.66 0-1.16.54-1.16 1.2s.5 1.2 1.16 1.2H4L6 14.5c.18 1.1 1.13 1.9 2.22 1.9h8.21c1.09 0 2.04-.8 2.22-1.9L22 6.5h-5.27l-2.5 5.5z"/>
          </svg>
          Cart
        </a>

        {/* Login/Logout Button */}
        <a href="#" onClick={(e) => { e.preventDefault(); handleAuthClick(); }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          {isAuthenticated ? `Logout (${user?.name || user?.email?.split('@')[0]})` : 'Login'}
        </a>

        {/* Dark Mode Toggle */}
        <button onClick={toggleDarkMode}>🌙</button>
      </nav>
    </header>
  );
};

export default Header;

