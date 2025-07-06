import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGoogle, FaFacebook, FaTwitter } from 'react-icons/fa';
import Layout from '../components/Layout';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const result = await register(formData.name, formData.email, formData.password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Layout showHeader={false}>
      {/* Register Form Overlay - exact CSS classes from your HTML */}
      <div id="loginFormOverlay">
        <div id="loginForm">
          {/* Close Button */}
          <Link to="/" className="close-btn">×</Link>

          {/* Title */}
          <h2>Register</h2>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <label htmlFor="registerName">Full Name</label>
            <input
              type="text"
              id="registerName"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />

            <label htmlFor="registerEmail">Email</label>
            <input
              type="email"
              id="registerEmail"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />

            <label htmlFor="registerPassword">Password</label>
            <input
              type="password"
              id="registerPassword"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

            <label htmlFor="registerConfirmPassword">Confirm Password</label>
            <input
              type="password"
              id="registerConfirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />

            {/* Error Message */}
            {error && (
              <p style={{ color: '#dc3545', textAlign: 'center', marginTop: '10px', marginBottom: '-10px' }}>
                {error}
              </p>
            )}

            {/* Register Button */}
            <button id="loginButton" type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register'}
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

          {/* Login Link */}
          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <p style={{ color: '#666' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#800000', fontWeight: 'bold', textDecoration: 'none' }}>
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;

