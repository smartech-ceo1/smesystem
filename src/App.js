import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Cart from './components/Cart';
import Admin from './components/Admin';
import AdminLogin from './components/AdminLogin';
import Login from './components/Login';
import Signup from './components/Signup';
import Categories from './components/Categories';
import Suppliers from './components/Suppliers';
import Transactions from './components/Transactions';
import Checkout from './components/Checkout';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  if (!token || !user || !user.is_admin) {
    return <Navigate to="/admin-login" />;
  }
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [cart, setCart] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const refreshCategories = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Show sidebar only on the dashboard route
  const showSidebar = location.pathname === '/';

  return (
    <div className="app-container">
      {showSidebar && (
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          refreshKey={refreshKey}
        />
      )}
      <div className={`main-content ${!showSidebar ? 'no-sidebar' : ''}`}>
        <button
          className={`menu-toggle ${!showSidebar ? 'hide-menu-toggle' : ''}`}
          onClick={toggleSidebar}
        >
          ☰
        </button>
        <Routes>
          <Route
            path="/"
            element={<Dashboard cart={cart} setCart={setCart} refreshKey={refreshKey} />}
          />
          <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Admin refreshCategories={refreshCategories} />
              </PrivateRoute>
            }
          />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
};

export default App;

