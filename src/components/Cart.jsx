import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import '../App.css';

const Cart = ({ cart, setCart }) => {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isPhoneSubmitted, setIsPhoneSubmitted] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  // Fetch user name on mount if authenticated
  useEffect(() => {
    const fetchUserName = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (response.ok) {
            setUserName(data.name || 'Customer');
          } else {
            console.error('Failed to fetch user name:', data.error);
            setUserName('Customer');
          }
        } catch (error) {
          console.error('Error fetching user name:', error);
          setUserName('Customer');
        }
      }
    };

    fetchUserName();
  }, []);

  // Session expiry logic
  useEffect(() => {
    const checkSession = () => {
      const currentTime = Date.now();
      if (currentTime - lastActivity >= 10000) { // 10 seconds
        const token = localStorage.getItem('token');
        if (token) {
          localStorage.setItem('pendingCart', JSON.stringify(cart));
          localStorage.setItem('pendingPhone', phoneNumber);
          navigate('/login', { state: { from: '/cart' } });
        }
      }
    };

    const interval = setInterval(checkSession, 1000);

    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, [lastActivity, cart, phoneNumber, navigate]);

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
    setLastActivity(Date.now());
  };

  const handleClearCart = () => {
    setCart([]);
    setIsPhoneSubmitted(false);
    setPhoneNumber('');
    setCheckoutSuccess(null);
    setLastActivity(Date.now());
  };

  const getImageUrl = (image) => {
    if (!image) return '/placeholder.jpg';
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    return `${process.env.REACT_APP_API_URL}/${image.startsWith('Uploads/') ? image : `Uploads/${image}`}`;
  };

  const validatePhoneNumber = (phone) => {
    return /^(?:\+2547|07)\d{8}$/.test(phone);
  };

  const handleProceedToCheckout = () => {
    setShowPhoneModal(true);
    setLastActivity(Date.now());
  };

  const handlePhoneSubmit = () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError('Please enter a valid Kenyan phone number (e.g., +254712345678 or 0712345678)');
      return;
    }

    setIsPhoneSubmitted(true);
    setShowPhoneModal(false);
    setPhoneError('');
    setLastActivity(Date.now());
  };

  const handleOrderNow = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.setItem('pendingCart', JSON.stringify(cart));
      localStorage.setItem('pendingPhone', phoneNumber);
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cart, phoneNumber }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      setCheckoutSuccess(`Thank you ${userName}, we have received your order, we will get back to you in your email. Free Deliveries Smartech Global`);
      setCart([]); // Clear cart after successful checkout
      setIsPhoneSubmitted(false);
      setPhoneNumber('');
      setLastActivity(Date.now());
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutSuccess(`Checkout failed: ${error.message}`);
      setLastActivity(Date.now());
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-wrapper">
        <img src="/logo.png" alt="SMARTECH SALES Logo" className="cart-logo" />
        <Link to="/" className="cart-back-home">
          <FaHome /> Back to Home
        </Link>
        <div className="cart-content">
          {checkoutSuccess && (
            <div className="cart-success-message">
              {checkoutSuccess}
            </div>
          )}
          {cart.length === 0 && !checkoutSuccess ? (
            <p className="cart-no-results">Your cart is empty</p>
          ) : (
            <>
              <div className="cart-table-container">
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Details</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(item => (
                      <tr key={item.id}>
                        <td>
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="cart-table-image"
                            onError={(e) => {
                              console.error(`Failed to load cart image: ${e.target.src}`);
                              if (e.target.src !== '/placeholder.jpg') {
                                e.target.src = '/placeholder.jpg';
                                e.target.alt = 'Image unavailable';
                              }
                            }}
                            onLoad={(e) => {
                              console.log(
                                `Successfully loaded cart image: ${e.target.src}`,
                                `Dimensions: ${e.target.naturalWidth}x${e.target.naturalHeight}`
                              );
                            }}
                          />
                        </td>
                        <td>
                          <h4>{item.name}</h4>
                          <p>Price: KSh {item.price.toLocaleString()}</p>
                          <p>Quantity: {item.quantity}</p>
                        </td>
                        <td>
                          <button
                            className="cart-remove-button"
                            onClick={() => handleRemoveFromCart(item.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="cart-summary">
                <p>Total: KSh {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}</p>
                <div className="cart-actions">
                  {isPhoneSubmitted ? (
                    <button className="cart-checkout-button" onClick={handleOrderNow}>
                      Order Now
                    </button>
                  ) : (
                    <button className="cart-checkout-button" onClick={handleProceedToCheckout}>
                      Proceed to Checkout
                    </button>
                  )}
                  <button className="cart-clear-button" onClick={handleClearCart}>
                    Clear Cart
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showPhoneModal && (
        <div className="cart-modal">
          <div className="cart-modal-content">
            <h3>Enter Your Phone Number</h3>
            <p>Please provide a valid Kenyan phone number for checkout.</p>
            <div className="cart-modal-input-container">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setPhoneError('');
                }}
                placeholder="e.g., +254712345678 or 0712345678"
                className={phoneError ? 'invalid' : ''}
              />
            </div>
            {phoneError && <p className="cart-modal-error">{phoneError}</p>}
            <div className="cart-modal-actions">
              <button className="cart-modal-submit" onClick={handlePhoneSubmit}>
                Submit
              </button>
              <button
                className="cart-modal-cancel"
                onClick={() => {
                  setShowPhoneModal(false);
                  setPhoneNumber('');
                  setPhoneError('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;