import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Specific field validation
    if (!email && !password) {
      setError('Email and password are required');
      return;
    }
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

      if (!user.is_admin) {
        setError('Access denied. Admin privileges required.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/admin');
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
        <button
          className="form-back-home"
          onClick={() => navigate('/')}
        >
          <i className="fas fa-home"></i> Return to Home
        </button>
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
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;