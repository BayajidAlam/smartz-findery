import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGoogle, FaFacebook, FaTwitter } from 'react-icons/fa';
import Layout from '../components/Layout';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    emailOrNumber: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.emailOrNumber, formData.password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Layout showHeader={false}>
      {/* Login Form Overlay - exact CSS classes from your HTML */}
      <div id="loginFormOverlay">
        <div id="loginForm">
          {/* Close Button */}
          <Link to="/" className="close-btn">×</Link>

          {/* Title */}
          <h2>Login</h2>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <label htmlFor="loginEmailOrNumber">Email or Number</label>
            <input
              type="text"
              id="loginEmailOrNumber"
              name="emailOrNumber"
              value={formData.emailOrNumber}
              onChange={handleChange}
              placeholder="Enter your email or number"
              required
            />

            <label htmlFor="loginPassword">Password</label>
            <input
              type="password"
              id="loginPassword"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

            {/* Error Message */}
            {error && (
              <p style={{ color: '#dc3545', textAlign: 'center', marginTop: '10px', marginBottom: '-10px' }}>
                {error}
              </p>
            )}

            {/* Login Button */}
            <button id="loginButton" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Social Icons */}
          <div className="social-icons">
            <div style={{ cursor: 'pointer' }}>
              <FaGoogle size={38} color="#dd4b39" />
            </div>
            <div style={{ cursor: 'pointer' }}>
              <FaFacebook size={38} color="#3b5998" />
            </div>
            <div style={{ cursor: 'pointer' }}>
              <FaTwitter size={38} color="#1da1f2" />
            </div>
          </div>

          {/* Register Link */}
          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <p style={{ color: '#666' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#800000', fontWeight: 'bold', textDecoration: 'none' }}>
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;

