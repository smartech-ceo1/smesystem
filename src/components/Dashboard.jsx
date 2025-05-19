import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';
import { FaHome, FaUser, FaShoppingCart, FaQuestionCircle, FaArrowUp, FaArrowDown, FaChevronDown, FaSun, FaMoon } from 'react-icons/fa';
import HelpModal from './HelpModal';
import '../App.css';

const Dashboard = ({ cart, setCart, refreshKey }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const selectedCategory = queryParams.get('category');
  const [searchQuery, setSearchQuery] = useState(queryParams.get('search') || '');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [scrollState, setScrollState] = useState('scroll-stop'); // Track scrolling state
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); 
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [noFlipProducts, setNoFlipProducts] = useState(new Set()); // Track products that shouldn't flip
  const productRefs = useRef({}); // Refs to track product elements

  // Toggle theme and save to localStorage
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch categories from public endpoint
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/public/categories`)
      .then(response => {
        console.log('Categories received:', response.data);
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          console.error('Invalid categories data:', response.data);
          setError('Invalid categories data from server.');
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        let errorMessage = 'Failed to load categories. Please check the server.';
        if (error.response) {
          errorMessage = `Server error: ${error.response.status} - ${error.response.data.error || 'Unknown error'}`;
        } else if (error.request) {
          errorMessage = 'No response from server. Please ensure the server is running.';
        }
        setError(errorMessage);
        setIsLoading(false);
      });
  }, [refreshKey]);

  // Memoize selectedCategory
  const memoizedSelectedCategory = useMemo(() => selectedCategory, [selectedCategory]);

  // Fetch products from public endpoint
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/public/products`)
      .then(response => {
        console.log('Products received:', response.data);
        if (Array.isArray(response.data)) {
          let filtered = response.data;
          if (memoizedSelectedCategory) {
            filtered = filtered.filter(product =>
              product.category?.toLowerCase() === memoizedSelectedCategory.toLowerCase()
            );
          }
          if (searchQuery) {
            filtered = filtered.filter(product =>
              product.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
          console.log('Filtered products:', filtered);
          setProducts(filtered);
        } else {
          console.error('Invalid products data:', response.data);
          setError('Invalid products data from server.');
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        let errorMessage = 'Failed to load products. Please check the server.';
        if (error.response) {
          errorMessage = `Server error: ${error.response.status} - ${error.response.data.error || 'Unknown error'}`;
        } else if (error.request) {
          errorMessage = 'No response from server. Please ensure the server is running.';
        }
        setError(errorMessage);
        setIsLoading(false);
      });
  }, [memoizedSelectedCategory, searchQuery, refreshKey]);

  // Determine initially visible products after products are loaded
  useEffect(() => {
    if (products.length === 0) return;

    const viewportHeight = window.innerHeight;
    const initiallyVisible = new Set();

    products.forEach(product => {
      const element = productRefs.current[product.id];
      if (element) {
        const rect = element.getBoundingClientRect();
        // Consider a product initially visible if its top is within the viewport
        if (rect.top >= 0 && rect.top <= viewportHeight) {
          initiallyVisible.add(product.id);
        }
      }
    });

    setNoFlipProducts(initiallyVisible);
  }, [products]);

  // Handle search input and suggestions
  useEffect(() => {
    const handler = setTimeout(() => {
      const newSearchParams = new URLSearchParams(location.search);
      if (searchQuery) {
        newSearchParams.set('search', searchQuery);
        const lowerQuery = searchQuery.toLowerCase();
        const matchedCategory = categories.find(cat =>
          cat.name?.toLowerCase().includes(lowerQuery)
        );
        const productSuggestions = products
          .filter(product => product.name?.toLowerCase().includes(lowerQuery))
          .map(product => product.name)
          .slice(0, 5);
        const categorySuggestions = categories
          .filter(cat =>
            cat.name?.toLowerCase().includes(lowerQuery) &&
            cat.name?.toLowerCase() !== lowerQuery
          )
          .map(cat => cat.name)
          .slice(0, 5);
        setSearchSuggestions([...productSuggestions, ...categorySuggestions]);
        if (matchedCategory) {
          newSearchParams.set('category', matchedCategory.name);
          newSearchParams.delete('search');
        } else {
          if (!newSearchParams.has('category')) {
            newSearchParams.delete('category');
          }
        }
      } else {
        newSearchParams.delete('search');
        setSearchSuggestions([]);
      }
      console.log('Navigating with search params:', newSearchParams.toString());
      navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, categories, products, location.search, navigate]);

  // Handle scroll behavior for both scroll buttons and product flip animation
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let scrollTimeout = null;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const atBottom = window.innerHeight + currentScrollY >= document.body.offsetHeight - 50;

      // Update scroll direction for buttons
      setScrollDirection(atBottom ? 'up' : 'down');

      // Determine scroll direction for product flip animation
      if (currentScrollY > lastScrollY) {
        setScrollState('scroll-down'); // Scrolling down
      } else if (currentScrollY < lastScrollY) {
        setScrollState('scroll-up'); // Scrolling up
      }

      // Reset scroll state after scrolling stops
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setScrollState('scroll-stop'); // Reset when scrolling stops
      }, 150);

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const handleAddToCart = (product) => {
    if (!product.id || !product.name || product.quantity === undefined) {
      console.error('Invalid product data:', product);
      return;
    }
    const selectedQuantity = quantities[product.id] || 1;
    const existingItem = cart.find(item => item.id === product.id);
    const currentCartQuantity = existingItem ? existingItem.quantity : 0;
    if (currentCartQuantity + selectedQuantity > product.quantity) {
      alert(`Cannot add ${selectedQuantity} more of ${product.name}. Only ${product.quantity - currentCartQuantity} left in stock.`);
      return;
    }
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + selectedQuantity } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: selectedQuantity }]);
    }
    console.log(`Added to cart: ${product.name}, Quantity: ${selectedQuantity}`);
  };

  const handleQuantityChange = (productId, value, stock) => {
    const quantity = Math.max(1, Math.min(parseInt(value) || 1, stock));
    setQuantities({ ...quantities, [productId]: quantity });
  };

  const getStarRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`fa-star ${i <= Math.floor(rating) ? 'fas' : 'far'}`}
          style={{ color: '#f5c518', marginRight: '2px' }}
        ></i>
      );
    }
    return stars;
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery('');
    setSearchSuggestions([]);
    const matchedCategory = categories.find(cat => cat.name === suggestion);
    if (matchedCategory) {
      navigate(`/?category=${encodeURIComponent(suggestion)}`);
    } else {
      navigate(`/?search=${encodeURIComponent(suggestion)}`);
    }
  };

  const toggleHelpModal = () => setShowHelpModal(!showHelpModal);
  const toggleAccountDropdown = () => setShowAccountDropdown(!showAccountDropdown);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const getImageUrl = (image) => {
    if (!image) return '/placeholder.jpg';
    return image;
  };

  const promoMessages = [
    'Best prices in town, with Free Deliveries',
    'Up to 40% off, just shop now!!',
    'New arrivals,We Got you Covered',
    'Call or WhatsApp +254 92006514',
    '#BuiltToSell',
    '#SalesInMotion'
  ];

  const welcomeLetters = 'Shop with Us today'.split('');

  const selectedCategoryData = categories.find(
    cat => cat.name?.toLowerCase() === selectedCategory?.toLowerCase()
  );

  return (
    <div className="dashboard" data-theme={theme}>
      <div className="category-hover-popup" id="categoryHoverPopup"></div>
      <div className="fixed-header">
        <div className="promo-banner">
          {promoMessages.map((message, index) => (
            <span key={index} className={`promo-message ${index < 3 ? 'promo-message--left' : ''}`}>
              {message}
            </span>
          ))}
        </div>
        <div className="dashboard-header">
          <h2>
            <span className="welcome-text">
              {["Shop", "with", "Us", "today!!"].map((word, wordIndex) => (
                <span key={wordIndex} className="word" style={{ animationDelay: `${1.7 + wordIndex * 0.425}s` }}>
                  {word.split('').map((letter, letterIndex) => (
                    <span
                      key={`${wordIndex}-${letterIndex}`}
                      className="welcome-letter"
                      style={{ animationDelay: `${(wordIndex * 4 + letterIndex) * 0.1}s` }}
                    >
                      {letter}
                    </span>
                  ))}
                </span>
              ))}
            </span>
            <span className="smartech-text"> SMARTECH GLOBAL</span>
          </h2>
        </div>
        <div className="dashboard-controls">
          <img src="/logo.png" alt="SMARTECH SALES Logo" className="header-logo" />
          <Link to="/" className="home-button">
            <FaHome /> Home
          </Link>
          <div className="search-container">
            <form onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                name="search"
                className="search-input"
                placeholder="Search products or categories..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </form>
            {searchSuggestions.length > 0 && (
              <div className="search-suggestions">
                {searchSuggestions.map(suggestion => (
                  <div
                    key={suggestion}
                    className="search-suggestion"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="dashboard-buttons">
            <div className="account-container">
              <button className="account-button" onClick={toggleAccountDropdown}>
                <FaUser /> Account <FaChevronDown />
              </button>
              {showAccountDropdown && (
                <div className="account-dropdown">
                  <Link to="/login" onClick={() => setShowAccountDropdown(false)}>
                    Login
                  </Link>
                  <Link to="/signup" onClick={() => setShowAccountDropdown(false)}>
                    Signup
                  </Link>
                  <Link to="/admin" onClick={() => setShowAccountDropdown(false)}>
                    Admin
                  </Link>
                </div>
              )}
            </div>
            <Link to="/cart" className="cart-button">
              <FaShoppingCart /> Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </Link>
            <button className="help-button" onClick={toggleHelpModal}>
              <FaQuestionCircle /> Help
            </button>
            <button className="theme-button" onClick={toggleTheme}>
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>
          </div>
        </div>
      </div>
   
      <div className="scrollable-content">
              <div className="gif-banner">
  <img src="/ANIMATE9.png" alt="Banner GIF" className="gif-image" />
           <div className="gif-banner">
    <img src="/ANIMATE2.png" alt="Image 2" className="gif-image" />
    <img src="/ANIMAT10.png" alt="Image 3" className="gif-image" />
    <img src="/ANIMATE4.png" alt="Image 4" className="gif-image" />
    <img src="/ANIMATE6.png" alt="Image 5" className="gif-image" />
    <img src="/ANIMATE1.png" alt="Image 6" className="gif-image" />
    <img src="/ANIMATE7.png" alt="Image 7" className="gif-image" />
    <img src="/ANIMATE5.png" alt="Image 8" className="gif-image" />
    <img src="/ANIMATE3.png" alt="Image 9" className="gif-image" />
  </div>   
  <hr />
</div>
        {error && (
          <div className="error-message" style={{ color: 'red', textAlign: 'center', margin: '20px' }}>
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : (
          <>
            {selectedCategoryData && selectedCategoryData.images?.length > 0 && (
              <div className="category-images">
                <h3>{selectedCategoryData.name} Images</h3>
                <div className="category-image-grid">
                  {selectedCategoryData.images.map(image => (
                    <div key={image.id} className="category-image-item">
                      <img
                        src={getImageUrl(image.image)}
                        alt={`${selectedCategoryData.name} Image`}
                        className="category-image"
                        onError={(e) => {
                          console.error(`Failed to load category image: ${e.target.src}`);
                          e.target.src = '/placeholder.jpg';
                        }}
                        onLoad={(e) => {
                          console.log(`Successfully loaded category image: ${e.target.src}`);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {products.length === 0 ? (
              <p className="no-results">
                {searchQuery
                  ? `No products found for "${searchQuery}"`
                  : selectedCategory
                  ? `No products available in ${selectedCategory}`
                  : 'No products available'}
              </p>
            ) : (
              <div className="product-grid">
                {products.map(product => {
                  if (!product.id || !product.name || !product.category || product.price === undefined || product.quantity === undefined) {
                    console.error('Invalid product:', product);
                    return null;
                  }
                  return (
                    <div
                      key={product.id}
                      className={`product-item ${scrollState} ${noFlipProducts.has(product.id) ? 'no-flip' : ''}`}
                      ref={el => (productRefs.current[product.id] = el)}
                    >
                      {product.image && (
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="product-image"
                          onError={(e) => {
                            console.error(`Failed to load product image: ${e.target.src}`);
                            e.target.src = '/placeholder.jpg';
                          }}
                          onLoad={(e) => {
                            console.log(`Successfully loaded product image: ${e.target.src}`);
                          }}
                        />
                      )}
                      <h3>{product.name}</h3>
                      <p>Category: {product.category}</p>
                      <p>Price: KSh {product.price.toLocaleString()}</p>
                      <p>Stock: {product.quantity}</p>
                      <div className="product-rating">
                        {getStarRating(product.rating)}
                        <span>({product.rating})</span>
                      </div>
                      <div className="quantity-selector">
                        <button
                          onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) - 1, product.quantity)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={quantities[product.id] || 1}
                          onChange={(e) => handleQuantityChange(product.id, e.target.value, product.quantity)}
                          min="1"
                          max={product.quantity}
                        />
                        <button
                          onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) + 1, product.quantity)}
                        >
                          +
                        </button>
                      </div>
                      <p>
                        Total: KSh {(product.price * (quantities[product.id] || 1)).toLocaleString()}
                      </p>
                      <button
                        className="add-to-cart"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        <div className="scroll-buttons">
          <button
            className="scroll-icon"
            onClick={scrollToTop}
            style={{ display: scrollDirection === 'up' ? 'block' : 'none' }}
          >
            <FaArrowUp />
          </button>
          <button
            className="scroll-icon"
            onClick={scrollToBottom}
            style={{ display: scrollDirection === 'down' ? 'block' : 'none' }}
          >
            <FaArrowDown />
          </button>
        </div>

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>About Us</h4>
              <p>SMARTECH GLOBAL is your one-stop shop for electronics, fashion, and more in Kenya.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/cart">Cart</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <p>Email: support@smartechglobal.co.ke</p>
              <p>Phone: +254 792006514</p>
            </div>
            <div className="footer-section">
              <h4>Follow Us</h4>
              <div className="social-icons">
                <button className="social-button"><i className="fab fa-facebook-f"></i></button>
                <button className="social-button"><i className="fab fa-twitter"></i></button>
                <button className="social-button"><i className="fab fa-instagram"></i></button>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 SMARTECH GLOBAL. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {showHelpModal && <HelpModal onClose={toggleHelpModal} />}
    </div>
  );
};

Dashboard.propTypes = {
  cart: PropTypes.array.isRequired,
  setCart: PropTypes.func.isRequired,
  refreshKey: PropTypes.number.isRequired,
};

export default Dashboard;
