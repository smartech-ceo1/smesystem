import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaHome, FaSync, FaDownload } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import '../App.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

// Error Boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <p className="error-message">Error in Purchase Analysis. Check console for details.</p>;
    }
    return this.props.children;
  }
}

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/transactions`, { headers });
      if (!response.data.length) {
        setError('No transactions found for the selected period.');
        setDailyData(Array(24).fill(0));
        setMonthlyData([]);
        setLoading(false);
        return;
      }

      const formattedTransactions = response.data
        .map(transaction => ({
          ...transaction,
          user_email: transaction.user_name ? `${transaction.user_name}@example.com` : 'Unknown',
          phone_number: transaction.phone_number || '+254700000000',
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setTransactions(formattedTransactions);

      const start = startOfDay(selectedDate);
      const end = endOfDay(selectedDate);
      const dailyPurchases = Array(24).fill(0);
      response.data
        .filter(t => {
          const createdAt = new Date(t.created_at);
          return createdAt >= start && createdAt <= end;
        })
        .forEach(t => {
          const hour = new Date(t.created_at).getHours();
          t.items.forEach(item => {
            dailyPurchases[hour] += item.quantity;
          });
        });
      setDailyData(dailyPurchases);

      const monthStart = startOfDay(subDays(selectedMonth, 30));
      const monthEnd = endOfDay(selectedMonth);
      const productQuantities = {};
      response.data
        .filter(t => {
          const createdAt = new Date(t.created_at);
          return createdAt >= monthStart && createdAt <= end;
        })
        .forEach(t => {
          t.items.forEach(item => {
            productQuantities[item.product_name] = (productQuantities[item.product_name] || 0) + item.quantity;
          });
        });

      const sortedProducts = Object.entries(productQuantities)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, quantity]) => ({ product_name: name, total_quantity: quantity }));
      setMonthlyData(sortedProducts);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.status === 401 ? 'Unauthorized. Please log in again.' : 'Failed to load transactions. Please try again.');
      setDailyData(Array(24).fill(0));
      setMonthlyData([]);
      setLoading(false);
    }
  }, [selectedDate, selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (transactionId) => {
    alert(`Edit transaction #${transactionId} (Placeholder: Implement edit functionality)`);
  };

  const handleDelete = async (transactionId) => {
    if (window.confirm(`Are you sure you want to delete transaction #${transactionId}?`)) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found.');
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/transactions/${transactionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(transactions.filter(t => t.id !== transactionId));
        alert(`Transaction #${transactionId} deleted successfully.`);
      } catch (err) {
        console.error('Error deleting transaction:', err);
        alert('Failed to delete transaction. Please try again.');
      }
    }
  };

  const getDailyChartData = () => ({
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Daily Purchases',
        data: dailyData,
        fill: true,
        backgroundColor: 'rgba(49, 130, 206, 0.2)',
        borderColor: 'rgba(49, 130, 206, 1)',
        tension: 0.4,
      },
    ],
  });

  const getDailyChartOptions = () => ({
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top', labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-color') } },
      title: { display: true, text: `Daily Purchases (${format(selectedDate, 'PPP')})`, color: getComputedStyle(document.documentElement).getPropertyValue('--text-color') },
    },
    scales: {
      x: { title: { display: true, text: 'Hour of Day', color: getComputedStyle(document.documentElement).getPropertyValue('--text-color') }, ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-color') } },
      y: { title: { display: true, text: 'Total Quantity', color: getComputedStyle(document.documentElement).getPropertyValue('--text-color') }, ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-color') }, beginAtZero: true },
    },
  });

  const getMonthlyChartData = () => ({
    labels: monthlyData.map(item => item.product_name),
    datasets: [
      {
        label: 'Monthly Demand',
        data: monthlyData.map(item => item.total_quantity),
        backgroundColor: 'rgba(56, 161, 105, 0.2)',
        borderColor: 'rgba(56, 161, 105, 1)',
      },
    ],
  });

  const getMonthlyChartOptions = () => ({
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top', labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-color') } },
      title: { display: true, text: `Top 5 Products Demand (Last 30 Days from ${format(selectedMonth, 'PPP')})`, color: getComputedStyle(document.documentElement).getPropertyValue('--text-color') },
    },
    scales: {
      x: { title: { display: true, text: 'Product Name', color: getComputedStyle(document.documentElement).getPropertyValue('--text-color') }, ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-color') } },
      y: { title: { display: true, text: 'Total Quantity', color: getComputedStyle(document.documentElement).getPropertyValue('--text-color') }, ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-color') }, beginAtZero: true },
    },
  });

  const exportToCSV = () => {
    const csvRows = [
      'Daily Purchases',
      'Hour,Total Quantity',
      ...dailyData.map((quantity, index) => `${index}:00,${quantity}`),
      '',
      'Monthly Product Demand',
      'Product Name,Total Quantity',
      ...monthlyData.map(item => `${item.product_name},${item.total_quantity}`),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `purchase_analysis_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard transactions-container">
      <div className="fixed-header">
        <div className="dashboard-header">
          <img src="/logo.png" alt="SMARTECH SALES Logo" className="header-logo" />
          <h2>
            <span className="welcome-text">
              {'Transactions'.split('').map((letter, index) => (
                <span key={index} className="welcome-letter">
                  {letter}
                </span>
              ))}
            </span>
          </h2>
        </div>
        <div className="cart-controls">
          <Link to="/" className="back-home-button" aria-label="Back to Home">
            <FaHome /> Back to Home
          </Link>
        </div>
      </div>
      <div className="scrollable-content">
        <div className="test-div">
          Test Div - Scrollable Content
        </div>
        {error && <p className="error-message">{error}</p>}
        {transactions.length === 0 ? (
          <p className="no-results">No transactions found</p>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>User</th>
                <th>Date</th>
                <th>Total Amount</th>
                <th>Items</th>
                <th>Edit</th>
                <th>Delete</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="transaction-row">
                  <td className="transaction-cell">#{transaction.id}</td>
                  <td className="transaction-cell">{transaction.user_name || 'Unknown'}</td>
                  <td className="transaction-cell">{new Date(transaction.created_at).toLocaleString()}</td>
                  <td className="transaction-cell">KSh {transaction.total_amount.toLocaleString()}</td>
                  <td className="transaction-cell">
                    <ul className="items-list">
                      {transaction.items.map((item, index) => (
                        <li key={`${transaction.id}-${index}`}>
                          <strong>{item.product_name}</strong> - {item.quantity} x KSh {item.price.toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="transaction-cell">
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(transaction.id)}
                      aria-label={`Edit transaction ${transaction.id}`}
                    >
                      Edit
                    </button>
                  </td>
                  <td className="transaction-cell">
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(transaction.id)}
                      aria-label={`Delete transaction ${transaction.id}`}
                    >
                      Delete
                    </button>
                  </td>
                  <td className="transaction-cell"></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <ErrorBoundary>
          <div className="purchase-analysis">
            <h3>Purchase Analysis</h3>
            <div className="analysis-controls">
              <div className="date-filter">
                <label htmlFor="daily-date">Daily Purchases Date:</label>
                <DatePicker
                  id="daily-date"
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="MMMM d, yyyy"
                  className="date-picker"
                  aria-label="Select date for daily purchases"
                />
              </div>
              <div className="date-filter">
                <label htmlFor="monthly-date">Monthly Demand Period:</label>
                <DatePicker
                  id="monthly-date"
                  selected={selectedMonth}
                  onChange={(date) => setSelectedMonth(date)}
                  dateFormat="MMMM d, yyyy"
                  className="date-picker"
                  aria-label="Select period for monthly demand"
                />
              </div>
              <div className="analysis-buttons">
                <button
                  className="refresh-button"
                  onClick={fetchData}
                  aria-label="Refresh purchase analysis data"
                >
                  <FaSync /> Refresh
                </button>
                <button
                  className="export-button"
                  onClick={exportToCSV}
                  aria-label="Export purchase analysis to CSV"
                >
                  <FaDownload /> Export Data
                </button>
              </div>
            </div>
            <div className="charts-container">
              <div className="chart">
                {dailyData.every(val => val === 0) ? (
                  <p className="no-results">No data available for selected date</p>
                ) : (
                  <Line data={getDailyChartData()} options={getDailyChartOptions()} />
                )}
              </div>
              <div className="chart">
                {monthlyData.length === 0 ? (
                  <p className="no-results">No data available for selected period</p>
                ) : (
                  <Bar data={getMonthlyChartData()} options={getMonthlyChartOptions()} />
                )}
              </div>
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default Transactions;