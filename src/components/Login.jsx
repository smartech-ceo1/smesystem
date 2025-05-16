import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaHome } from 'react-icons/fa';
import '../App.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/@/.test(email)) {
      setError("Email must include '@'");
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/login`, {
        email,
        password,
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      const pendingCart = location.state?.pendingCart || JSON.parse(localStorage.getItem('pendingCart') || '[]');
      const pendingPhone = location.state?.pendingPhone || localStorage.getItem('pendingPhone') || '';
      const redirectTo = location.state?.from || '/';
      if (redirectTo === '/checkout' && pendingCart.length > 0 && pendingPhone) {
        navigate('/checkout', {
          state: { cart: pendingCart, phoneNumber: pendingPhone },
        });
      } else {
        navigate(redirectTo);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.error || 'Invalid email or password. Please try again.'
      );
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <img src="/logo.png" alt="SMARTECH SALES Logo" className="form-logo" />
        <Link to="/" className="form-back-home">
          <FaHome /> Back to Home
        </Link>
        <div className="form-content">
          <form onSubmit={handleSubmit}>
            <div className="form-input-container">
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={error && (!email || !/@/.test(email)) ? 'invalid' : ''}
              />
            </div>
            <div className="form-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={error && !password ? 'invalid' : ''}
              />
              <button
                type="button"
                className="form-password-toggle"
                onClick={togglePasswordVisibility}
              >
                <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
              </button>
            </div>
            {error && <p className="form-error-message">{error}</p>}
            <button type="submit" className="form-submit">
              Login
            </button>
          </form>
          <p className="form-signup-link">
            Don't have an account? <Link to="/signup" state={location.state}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;