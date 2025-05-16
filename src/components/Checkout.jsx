import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHome } from 'react-icons/fa';
import '../App.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart = [], phoneNumber = '' } = location.state || {};
  const [localPhoneNumber, setLocalPhoneNumber] = useState(phoneNumber);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Check authentication status and persist cart/phone on mount
  useEffect(() => {
    // Store cart and phone number in localStorage to persist during auth
    if (cart.length > 0) {
      localStorage.setItem('pendingCart', JSON.stringify(cart));
    }
    if (localPhoneNumber) {
      localStorage.setItem('pendingPhone', localPhoneNumber);
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    // Determine if auth prompt should be shown
    if (!localPhoneNumber || !/^\+2547\d{8}$|^07\d{8}$/.test(localPhoneNumber)) {
      setShowAuthPrompt(false); // Show phone input if no valid phone
    } else if (!token) {
      setShowAuthPrompt(true); // Show auth prompt if phone is valid but not authenticated
    } else {
      setShowAuthPrompt(false); // No auth prompt if phone is valid and authenticated
    }
  }, [cart, localPhoneNumber]);

  // Validate phone number
  const validatePhoneNumber = (number) => {
    return /^\+2547\d{8}$|^07\d{8}$/.test(number);
  };

  // Handle phone number submission
  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (!validatePhoneNumber(localPhoneNumber)) {
      setError('Please provide a valid Kenyan phone number (e.g., +254712345678 or 0712345678)');
      return;
    }
    setError('');
    localStorage.setItem('pendingPhone', localPhoneNumber);
    const token = localStorage.getItem('token');
    if (!token) {
      setShowAuthPrompt(true); // Show auth prompt if not authenticated
    } else {
      setShowAuthPrompt(false); // Proceed to order if authenticated
    }
  };

  // Handle order submission
  const handleOrderNow = async () => {
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    if (!token) {
      setShowAuthPrompt(true);
      return;
    }

    if (!cart.length) {
      setError('Cart is empty');
      return;
    }

    if (!localPhoneNumber || !validatePhoneNumber(localPhoneNumber)) {
      setError('Please provide a valid Kenyan phone number (e.g., +254712345678 or 0712345678)');
      setShowAuthPrompt(false);
      return;
    }

    try {
      console.log('Checkout payload:', { cart, phoneNumber: localPhoneNumber });
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/checkout`,
        { cart, phoneNumber: localPhoneNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Order placed successfully! You will receive a confirmation soon.');
      // Clear pending cart and phone from localStorage
      localStorage.removeItem('pendingCart');
      localStorage.removeItem('pendingPhone');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error('Order error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setShowAuthPrompt(true);
      } else {
        setError(err.response?.data?.error || 'Failed to place order. Please try again.');
      }
    }
  };

  const getImageUrl = (image) => {
    if (!image) return '/placeholder.jpg';
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    return `${process.env.REACT_APP_API_URL}/${image.startsWith('Uploads/') ? image : `Uploads/${image}`}`;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <img src="/logo.png" alt="SMARTECH SALES Logo" className="header-logo" />
        <h2>Order Confirmation</h2>
      </div>
      <div className="cart-controls">
        <Link to="/" className="back-home-button">
          <FaHome /> Back to Home
        </Link>
      </div>
      {cart.length === 0 ? (
        <p className="no-results">No items to checkout</p>
      ) : (
        <>
          {!showAuthPrompt ? (
            <div className="checkout-details">
              <h3>{isAuthenticated ? 'Confirm Details' : 'Enter Phone Number'}</h3>
              <form onSubmit={handlePhoneSubmit}>
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="e.g., +254712345678 or 0712345678"
                    value={localPhoneNumber}
                    onChange={(e) => setLocalPhoneNumber(e.target.value)}
                    className={error ? 'invalid' : ''}
                    disabled={isAuthenticated} // Disable if authenticated
                  />
                </div>
                {error && <p className="error-message">{error}</p>}
                {!isAuthenticated && (
                  <button type="submit" className="checkout-button">
                    Proceed
                  </button>
                )}
              </form>
            </div>
          ) : (
            <div className="auth-prompt">
              <h3>Please Log In or Sign Up</h3>
              <p>You need to authenticate to complete your order.</p>
              <div className="cart-actions">
                <Link
                  to="/login"
                  state={{ pendingCart: cart, pendingPhone: localPhoneNumber, from: '/checkout' }}
                >
                  <button className="checkout-button">Log In</button>
                </Link>
                <Link
                  to="/signup"
                  state={{ pendingCart: cart, pendingPhone: localPhoneNumber, from: '/checkout' }}
                >
                  <button className="checkout-button">Sign Up</button>
                </Link>
              </div>
              {error && <p className="error-message">{error}</p>}
            </div>
          )}

          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  style={{
                    maxWidth: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    display: 'block',
                    borderRadius: '6px',
                  }}
                  onError={(e) => {
                    console.error(`Failed to load checkout image: ${e.target.src}`);
                    if (e.target.src !== '/placeholder.jpg') {
                      e.target.src = '/placeholder.jpg';
                      e.target.alt = 'Image unavailable';
                    }
                  }}
                  onLoad={(e) => {
                    console.log(
                      `Successfully loaded checkout image: ${e.target.src}`,
                      `Dimensions: ${e.target.naturalWidth}x${e.target.naturalHeight}`
                    );
                  }}
                />
                <div>
                  <h4>{item.name}</h4>
                  <p>Price: KSh {item.price.toLocaleString()}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="checkout-details">
            <p>Phone Number: {localPhoneNumber || 'Not provided'}</p>
            <p>
              Total: KSh{' '}
              {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}
            </p>
            {success && <p className="success-message">{success}</p>}
            {isAuthenticated && !showAuthPrompt && (
              <button className="checkout-button" onClick={handleOrderNow}>
                Order Now
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Checkout;