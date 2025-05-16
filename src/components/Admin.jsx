import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';
import { FaHome } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../App.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Admin = ({ refreshCategories }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersWithProducts, setSuppliersWithProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newImages, setNewImages] = useState([]);
  const [newCategorySupplierId, setNewCategorySupplierId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editCategory, setEditCategory] = useState({ id: null, name: '', supplier_id: '' });
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    quantity: '',
    image: null,
    category_id: '',
  });
  const [editProduct, setEditProduct] = useState(null);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
  });
  const [editSupplier, setEditSupplier] = useState(null);
  const [editTransaction, setEditTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [viewImage, setViewImage] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [productError, setProductError] = useState('');
  const [supplierError, setSupplierError] = useState('');
  const [transactionError, setTransactionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuppliers, setShowSuppliers] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [categoryImagePreviews, setCategoryImagePreviews] = useState([]);
  const [productImagePreview, setProductImagePreview] = useState(null);
  const [activeSection, setActiveSection] = useState('manageCategories');
  const [stockCategory, setStockCategory] = useState(null);
  const [paymentStatuses, setPaymentStatuses] = useState({});

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  // Refs for file inputs
  const categoryFileInputRef = useRef(null);
  const productFileInputRef = useRef(null);
  const imageUploadFileInputRef = useRef(null);
  const editProductFileInputRef = useRef(null);

  // Placeholder image URL
  const placeholderImage = `${process.env.REACT_APP_API_URL}/uploads/placeholder.jpg`;

  // Memoized normalize image URLs
  const normalizeImageUrl = useCallback((image) => {
    if (!image) return placeholderImage;
    if (image.startsWith(`${process.env.REACT_APP_API_URL}/`)) {
      return image;
    }
    return `${process.env.REACT_APP_API_URL}/${image}`;
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCategoryError('');
      setProductError('');
      setSupplierError('');
      setTransactionError('');
      setSuccessMessage('');
      setResetError('');
      setResetSuccess('');
    }, 5000);
    return () => clearTimeout(timer);
  }, [categoryError, productError, supplierError, transactionError, successMessage, resetError, resetSuccess]);

  // Generate image previews for category images
  useEffect(() => {
    const previews = newImages.map(file => URL.createObjectURL(file));
    setCategoryImagePreviews(previews);
    return () => previews.forEach(url => URL.revokeObjectURL(url));
  }, [newImages]);

  // Generate image preview for product image
  useEffect(() => {
    if (newProduct.image) {
      const url = URL.createObjectURL(newProduct.image);
      setProductImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setProductImagePreview(null);
    }
  }, [newProduct.image]);

  // Validate file types
  const validateFiles = (files) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    return Array.from(files).every(file => allowedTypes.includes(file.type));
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin-login');
  };

  // Handle reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!oldPassword || !newPassword) {
      setResetError('Both old and new passwords are required');
      return;
    }

    if (newPassword.length < 8) {
      setResetError('New password must be at least 8 characters');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/reset-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResetSuccess(response.data.message);
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setResetError(err.response?.data?.error || 'Failed to update password');
    }
  };

  // Fetch data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin-login');
      return;
    }

    setIsLoading(true);
    Promise.all([
      axios.get(`${process.env.REACT_APP_API_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${process.env.REACT_APP_API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${process.env.REACT_APP_API_URL}/api/suppliers`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${process.env.REACT_APP_API_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([categoriesResponse, productsResponse, suppliersResponse, usersResponse, transactionsResponse]) => {
        setCategories(categoriesResponse.data);
        setProducts(productsResponse.data);
        setSuppliers(suppliersResponse.data);
        setUsers(usersResponse.data);
        setTransactions(transactionsResponse.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setIsLoading(false);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/admin-login');
        }
        setCategoryError(`Failed to load data: ${error.response?.data?.error || error.message}`);
      });
  }, [navigate]);

  // Fetch suppliers with products
  const fetchSuppliersWithProducts = async () => {
    setIsLoadingSuppliers(true);
    setSupplierError('');
    setSuccessMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/suppliers-with-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuppliersWithProducts(response.data);
      setSuccessMessage('Suppliers and products loaded successfully');
    } catch (error) {
      console.error('Error fetching suppliers with products:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin-login');
      }
      setSupplierError(`Failed to load suppliers: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  // Toggle suppliers view
  const handleViewSuppliers = () => {
    if (!showSuppliers) {
      fetchSuppliersWithProducts();
    }
    setShowSuppliers(!showSuppliers);
  };

  // Create a new supplier
  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    setSupplierError('');
    setSuccessMessage('');
    const token = localStorage.getItem('token');
    if (!newSupplier.name.trim()) {
      setSupplierError('Supplier name is required');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/suppliers`,
        newSupplier,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuppliers([...suppliers, response.data]);
      setNewSupplier({ name: '', contact_email: '', contact_phone: '', address: '' });
      setSuccessMessage('Supplier created successfully');
    } catch (error) {
      console.error('Error creating supplier:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin-login');
      }
      setSupplierError(`Failed to create supplier: ${error.response?.data?.error || error.message}`);
    }
  };

  // Edit a supplier
  const handleEditSupplier = (supplier) => {
    setEditSupplier({
      id: supplier.id,
      name: supplier.name,
      contact_email: supplier.contact_email || '',
      contact_phone: supplier.contact_phone || '',
      address: supplier.address || '',
    });
  };

  // Update a supplier
  const handleUpdateSupplier = async (e) => {
    e.preventDefault();
    setSupplierError('');
    setSuccessMessage('');
    const token = localStorage.getItem('token');
    if (!editSupplier.name.trim()) {
      setSupplierError('Supplier name is required');
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/suppliers/${editSupplier.id}`,
        editSupplier,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuppliers(
        suppliers.map((s) => (s.id === editSupplier.id ? response.data : s))
      );
      setSuppliersWithProducts(
        suppliersWithProducts.map((s) =>
          s.id === editSupplier.id ? { ...s, ...response.data } : s
        )
      );
      setEditSupplier(null);
      setSuccessMessage('Supplier updated successfully');
    } catch (error) {
      console.error('Error updating supplier:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin-login');
      }
      setSupplierError(`Failed to update supplier: ${error.response?.data?.error || error.message}`);
    }
  };

  // Delete a supplier
  const handleDeleteSupplier = async (supplierId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this supplier? This will unlink associated categories and products.'
      )
    ) {
      return;
    }
    setSupplierError('');
    setSuccessMessage('');
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/suppliers/${supplierId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuppliers(suppliers.filter((s) => s.id !== supplierId));
      setSuppliersWithProducts(suppliersWithProducts.filter((s) => s.id !== supplierId));
      setCategories(
        categories.map((c) =>
          c.supplier_id === supplierId ? { ...c, supplier_id: null, supplier_name: null } : c
        )
      );
      setProducts(
        products.map((p) =>
          p.supplier_id === supplierId ? { ...p, supplier_id: null, supplier: 'None' } : p
        )
      );
      setSuccessMessage('Supplier deleted successfully');
    } catch (error) {
      console.error('Error deleting supplier:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin-login');
      }
      setSupplierError(`Failed to delete supplier: ${error.response?.data?.error || error.message}`);
    }
  };

  // Create a new category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCategoryError('');
    setSuccessMessage('');
    const token = localStorage.getItem('token');
    if (!newCategory.trim()) {
      setCategoryError('Category name is required');
      return;
    }
    if (newImages.length === 0) {
      setCategoryError('At least one image is required');
      return;
    }
    if (!validateFiles(newImages)) {
      setCategoryError('Only .jpg, .jpeg, and .png files are allowed');
      return;
    }
    if (!newCategorySupplierId) {
      setCategoryError('Supplier is required');
      return;
    }

    const formData = new FormData();
    formData.append('name', newCategory.trim());
    formData.append('supplier_id', newCategorySupplierId);
    newImages.forEach((file) => formData.append('images', file));

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/categories`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories([...categories, response.data]);
      setNewCategory('');
      setNewImages([]);
      setCategoryImagePreviews([]);
      setNewCategorySupplierId('');
      setSuccessMessage('Category created successfully');
      if (categoryFileInputRef.current) categoryFileInputRef.current.value = null;
      refreshCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin-login');
      }
      setCategoryError(`Failed to create category: ${error.response?.data?.error || error.message}`);
    }
  };

  // Update a category
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setCategoryError('');
    setSuccessMessage('');
    const token = localStorage.getItem('token');
    if (!editCategory.name.trim()) {
      setCategoryError('Category name is required');
      return;
    }
    if (!editCategory.supplier_id) {
      setCategoryError('Supplier is required');
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/categories/${editCategory.id}`,
        { name: editCategory.name.trim(), supplier_id: editCategory.supplier_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories(
        categories.map((cat) =>
          cat.id === editCategory.id
            ? {
                ...cat,
                name: editCategory.name.trim(),
                supplier_id: response.data.supplier_id,
                supplier_name: suppliers.find((s) => s.id === parseInt(response.data.supplier_id))
                  ?.name || 'None',
              }
            : cat
        )
      );
      setEditCategory({ id: null, name: '', supplier_id: '' });
      setSuccessMessage('Category updated successfully');
      refreshCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin-login');
      }
      setCategoryError(`Failed to update category: ${error.response?.data?.error || error.message}`);
    }
  };

  // Delete a category
  const handleDeleteCategory = async (categoryId) => {
    setCategoryError('');
    setSuccessMessage('');
    const token = localStorage.getItem('token');
    if (
      window.confirm('Are you sure you want to delete this category? This will delete all associated products.')
    ) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/categories/${categoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(categories.filter((cat) => cat.id !== categoryId));
        setProducts(products.filter((prod) => prod.category_id !== categoryId));
        if (selectedCategory === categoryId) {
          setSelectedCategory(null);
        }
        if (stockCategory === categoryId) {
          setStockCategory(null);
        }
        setSuccessMessage('Category deleted successfully');
        refreshCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/admin-login');
        }
        setCategoryError(`Failed to delete category: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  // Upload images for a category
  const handleImageUpload = async (e) => {
    e.preventDefault();
    setCategoryError('');
    setSuccessMessage('');
    const token = localStorage.getItem('token');
    if (!newImages.length) {
      setCategoryError('Please select at least one image to upload');
      return;
    }
    if (!validateFiles(newImages)) {
      setCategoryError('Only .jpg, .jpeg, and .png files are allowed');
      return;
    }

    const formData = new FormData();
    newImages.forEach((file) => formData.append('images', file));

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/categories/${selectedCategory}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCategories(
        categories.map((cat) =>
          cat.id === selectedCategory
            ? { ...cat, images: [...cat.images, ...response.data.images] }
            : cat
        )
      );
      setNewImages([]);
      setCategoryImagePreviews([]);
      setSuccessMessage('Images uploaded successfully');
      if (imageUploadFileInputRef.current) imageUploadFileInputRef.current.value = null;
      refreshCategories();
    } catch (error) {
      console.error('Error uploading images:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin-login');
      }
      setCategoryError(`Failed to upload images: ${error.response?.data?.error || error.message}`);
    }
  };

  // Update a category image
  const handleImageUpdate = async (imageId) => {
    setCategoryError('');
    setSuccessMessage('');
    const token = localStorage.getItem('token');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.jpg,.jpeg,.png';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) {
        setCategoryError('Please select an image');
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setCategoryError('Only .jpg, .jpeg, and .png files are allowed');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/category-images/${imageId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCategories(
          categories.map((cat) =>
            cat.id === selectedCategory
              ? {
                  ...cat,
                  images: cat.images.map((img) =>
                    img.id === imageId ? { ...img, image: response.data.image } : img
                  ),
                }
              : cat
          )
        );
        setSuccessMessage('Image updated successfully');
        refreshCategories();
      } catch (error) {
        console.error('Error updating image:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/admin-login');
        }
        setCategoryError(`Failed to update image: ${error.response?.data?.error || error.message}`);
      }
    };
    fileInput.click();
  };

  // Delete a category image
  // Delete a category image
  const handleImageDelete = async (imageId) => {
    setCategoryError('');
    setSuccessMessage('');
    const token = localStorage.getItem('token');
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/category-images/${imageId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(
          categories.map((cat) =>
            cat.images.some((img) => img.id === imageId)
              ? {
                  ...cat,
                  images: cat.images.filter((img) => img.id !== imageId),
                }
              : cat
          )
        );
        setSuccessMessage('Image deleted successfully');
        refreshCategories();
      } catch (error) {
        console.error('Error deleting image:', error);
        if (error.code === 'ERR_NETWORK') {
          setCategoryError(`Cannot connect to server. Please ensure the backend is running on ${process.env.REACT_APP_API_URL}.`);
        } else if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/admin-login');
        } else {
          setCategoryError(`Failed to delete image: ${error.response?.data?.error || error.message}`);
        }
      }
    }
  };

  // Create a new product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setProductError('');
    setSuccessMessage('');
    const token = localStorage.getItem('token');
    if (!newProduct.name.trim() || !newProduct.price || !newProduct.quantity || !selectedCategory) {
      setProductError('Product name, price, quantity, and category are required');
      return;
    }
    if (parseFloat(newProduct.price) <= 0 || parseInt(newProduct.quantity) < 0) {
      setProductError('Price must be positive and quantity cannot be negative');
      return;
    }
    if (newProduct.image && !['image/jpeg', 'image/jpg', 'image/png'].includes(newProduct.image.type)) {
      setProductError('Only .jpg, .jpeg, and .png files are allowed for product images');
      return;
    }

    const formData = new FormData();
    formData.append('name', newProduct.name.trim());
    formData.append('price', parseFloat(newProduct.price));
    formData.append('quantity', parseInt(newProduct.quantity));
    formData.append('category_id', selectedCategory);
    if (newProduct.image) {
      formData.append('image', newProduct.image);
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      const selectedCat = categories.find((cat) => cat.id === selectedCategory);
      setProducts([
        ...products,
        {
          ...response.data,
          category: selectedCat ? selectedCat.name : 'Unknown',
          category_id: selectedCategory,
          supplier: suppliers.find((s) => s.id === response.data.supplier_id)?.name || 'None',
          supplier_id: response.data.supplier_id,
        },
      ]);
      setNewProduct({ name: '', price: '', quantity: '', image: null, category_id: '' });
      setProductImagePreview(null);
      setSuccessMessage('Product created successfully');
      if (productFileInputRef.current) productFileInputRef.current.value = null;
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin-login');
      }
      setProductError(`Failed to create product: ${error.response?.data?.error || error.message}`);
    }
  };

  // Update a product
  const handleUpdateProduct = async (e) => {
  e.preventDefault();
  setProductError('');
  setSuccessMessage('');
  const token = localStorage.getItem('token');

  // Validate required fields
  if (
    !editProduct.name.trim() ||
    !editProduct.price ||
    !editProduct.quantity ||
    !editProduct.category_id
  ) {
    setProductError('Product name, price, quantity, and category are required');
    return;
  }
  if (parseFloat(editProduct.price) <= 0 || parseInt(editProduct.quantity) < 0) {
    setProductError('Price must be positive and quantity cannot be negative');
    return;
  }
  if (
    editProduct.newImage &&
    !['image/jpeg', 'image/jpg', 'image/png'].includes(editProduct.newImage.type)
  ) {
    setProductError('Only .jpg, .jpeg, and .png files are allowed for product images');
    return;
  }

  const formData = new FormData();
  formData.append('name', editProduct.name.trim());
  formData.append('price', parseFloat(editProduct.price));
  formData.append('quantity', parseInt(editProduct.quantity));
  formData.append('category_id', editProduct.category_id);
  // Add a flag to indicate if the image is being updated
  formData.append('updateImage', editProduct.newImage ? 'true' : 'false');
  if (editProduct.newImage) {
    formData.append('image', editProduct.newImage);
  }

  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/api/products/${editProduct.id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const updatedCat = categories.find((cat) => cat.id === response.data.category_id);
    setProducts(
      products.map((prod) =>
        prod.id === editProduct.id
          ? {
              ...response.data,
              category: updatedCat ? updatedCat.name : 'Unknown',
              category_id: response.data.category_id,
              supplier: suppliers.find((s) => s.id === response.data.supplier_id)?.name || 'None',
              supplier_id: response.data.supplier_id,
            }
          : prod
      )
    );
    setEditProduct(null);
    setSuccessMessage('Product updated successfully');
    if (editProductFileInputRef.current) editProductFileInputRef.current.value = null;
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/admin-login');
    }
    setProductError(`Failed to update product: ${error.response?.data?.error || error.message}`);
  }
};
  // Delete a product
  const handleDeleteProduct = async (productId) => {
    setProductError('');
    setSuccessMessage('');
    const token = localStorage.getItem('token');
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(products.filter((prod) => prod.id !== productId));
        setSuppliersWithProducts(
          suppliersWithProducts.map((s) => ({
            ...s,
            products: s.products.filter((p) => p.id !== productId),
          }))
        );
        setPaymentStatuses((prev) => {
          const newStatuses = { ...prev };
          delete newStatuses[productId];
          return newStatuses;
        });
        setSuccessMessage('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/admin-login');
        }
        setProductError(`Failed to delete product: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  // Edit a transaction
  const handleEditTransaction = (transaction) => {
    setEditTransaction({
      id: transaction.id,
      total_amount: transaction.total_amount,
      user_id: transaction.user_id || '',
      items: transaction.items,
    });
  };

  // Update a transaction
  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    setTransactionError('');
    setSuccessMessage('');
    const token = localStorage.getItem('token');

    const totalAmount = parseFloat(editTransaction.total_amount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      setTransactionError('Valid total amount is required');
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/transactions/${editTransaction.id}`,
        {
          total_amount: totalAmount,
          user_id: editTransaction.user_id || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTransactions(
        transactions.map((t) =>
          t.id === editTransaction.id
            ? {
                ...t,
                total_amount: response.data.total_amount,
                user_id: response.data.user_id,
                user_name: users.find((u) => u.id === response.data.user_id)?.name || 'Guest',
              }
            : t
        )
      );
      setEditTransaction(null);
      setSuccessMessage('Transaction updated successfully');
    } catch (error) {
      console.error('Error updating transaction:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin-login');
      }
      setTransactionError(`Failed to update transaction: ${error.response?.data?.error || error.message}`);
    }
  };

  // Delete a transaction
  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    setTransactionError('');
    setSuccessMessage('');
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/transactions/${transactionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(transactions.filter((t) => t.id !== transactionId));
      setSuccessMessage('Transaction deleted successfully');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin-login');
      }
      setTransactionError(`Failed to delete transaction: ${error.response?.data?.error || error.message}`);
    }
  };

//   // Handle payment status change

const handlePaymentStatusChange = async (productId, field, value) => {
  setTransactionError('');
  setSuccessMessage('');

  // Update local state with mutually exclusive paid/notPaid
  setPaymentStatuses((prev) => ({
    ...prev,
    [productId]: {
      paid: field === 'paid' ? value : false,
      notPaid: field === 'notPaid' ? value : false,
    },
  }));

  // Prepare payment status for API
  const payment = {
    paid: field === 'paid' ? value : false,
    notPaid: field === 'notPaid' ? value : false,
  };

  const token = localStorage.getItem('token');
  try {
    await axios.put(
      `${process.env.REACT_APP_API_URL}/api/products/${productId}/payment-status`,
      { paymentStatus: payment },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setSuccessMessage('Payment status updated successfully');
  } catch (error) {
    console.error('Error updating payment status:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/admin-login');
    }
    setTransactionError(`Failed to update payment status: ${error.response?.data?.error || error.message}`);
  }
};
// // Handle payment status change
//   const handlePaymentStatusChange = async (productId, field, value) => {
//     setTransactionError('');
//     setSuccessMessage('');

//     // Update local state
//     setPaymentStatuses((prev) => ({
//       ...prev,
//       [productId]: {
//         ...prev[productId],
//         [field]: typeof value === 'boolean' ? value : (value || 0),
//       },
//     }));

//     // Prepare payment status for API
//     const payment = {
//       paid: field === 'paid' ? value : paymentStatuses[productId]?.paid || false,
//       notPaid: field === 'notPaid' ? value : paymentStatuses[productId]?.notPaid || false,
//       discount: field === 'discount' ? value : paymentStatuses[productId]?.discount || 0,
//       due: field === 'due' ? value : paymentStatuses[productId]?.due || 0,
//     };

//     const token = localStorage.getItem('token');
//     try {
//       await axios.put(
//         `http://localhost:3001/api/products/${productId}/payment-status`,
//         { paymentStatus: payment },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setSuccessMessage('Payment status updated successfully');
//     } catch (error) {
//       console.error('Error updating payment status:', error);
//       if (error.response?.status === 401 || error.response?.status === 403) {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         navigate('/admin-login');
//       }
//       setTransactionError(`Failed to update payment status: ${error.response?.data?.error || error.message}`);
//     }
//   };

//   // Save payment status
//   const handleSaveProduct = async (productId) => {
//     setTransactionError('');
//     setSuccessMessage('');
//     const token = localStorage.getItem('token');
//     const payment = paymentStatuses[productId] || {
//       paid: false,
//       notPaid: false,
//       discount: 0,
//       due: 0,
//     };

//     // Validate inputs
//     if (payment.discount < 0 || payment.due < 0) {
//       setTransactionError('Discount and Due cannot be negative');
//       return;
//     }

//     try {
//       await axios.put(
//         `http://localhost:3001/api/products/${productId}/payment-status`,
//         { paymentStatus: payment },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setSuccessMessage('Payment status saved successfully');
//     } catch (error) {
//       console.error('Error saving payment status:', error);
//       if (error.response?.status === 401 || error.response?.status === 403) {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         navigate('/admin-login');
//       }
//       setTransactionError(`Failed to save payment status: ${error.response?.data?.error || error.message}`);
//     }
//   };
  // Handle print statement
  // Handle print statement
  const handlePrintStatement = () => {
  if (!stockCategory || products.filter((prod) => prod.category_id === stockCategory).length === 0) {
    alert('Please select a category with products to print.');
    return;
  }

  let printContent = `
    <h2>Stock Statement</h2>
    <p>Category: ${categories.find((cat) => cat.id === stockCategory)?.name || 'Unknown'}</p>
    <p>Date: ${new Date().toLocaleString()}</p>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 1px solid #000;">
          <th style="padding: 8px; text-align: left;">Item Name</th>
          <th style="padding: 8px; text-align: left;">Stock Remaining</th>
          <th style="padding: 8px; text-align: left;">Number Sold</th>
          <th style="padding: 8px; text-align: left;">Total Price</th>
          <th style="padding: 8px; text-align: left;">Payment Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  products
    .filter((prod) => prod.category_id === stockCategory)
    .forEach((product) => {
      const { sold, totalSales } = calculateProductStats(product);
      const payment = paymentStatuses[product.id] || { paid: false, notPaid: false };
      const paymentStatus = sold > 0 ? (payment.paid ? 'Paid: Yes' : payment.notPaid ? 'Not Paid: Yes' : '') : '';

      printContent += `
        <tr style="border-bottom: 1px solid #ccc;">
          <td style="padding: 8px;">${product.name}</td>
          <td style="padding: 8px;">${product.quantity}</td>
          <td style="padding: 8px;">${sold}</td>
          <td style="padding: 8px;">KSh ${Number((product.price || 0) * (product.quantity || 0)).toLocaleString()}</td>
          <td style="padding: 8px;">${paymentStatus}</td>
        </tr>
      `;
    });

  printContent += `
      </tbody>
    </table>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Stock Statement</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          tr { border-bottom: 1px solid #ccc; }
          h2 { margin-bottom: 10px; }
          p { margin: 5px 0; }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};
  // View image in modal
  const handleViewImage = (imageUrl) => {
    setViewImage(normalizeImageUrl(imageUrl));
  };

  // Close image modal
  const closeImageModal = () => {
    setViewImage(null);
  };

  // Toggle transactions view
  const handleViewTransactions = () => {
    setShowTransactions(!showTransactions);
  };

  // Calculate stock and sales data for a product
  const calculateProductStats = (product) => {
    const soldItems = transactions
      .filter(t => t.items.some(item => item.product_id === product.id))
      .reduce((acc, t) => {
        const relevantItems = t.items.filter(item => item.product_id === product.id);
        return acc + relevantItems.reduce((sum, item) => sum + item.quantity, 0);
      }, 0);
    const totalSales = transactions
      .filter(t => t.items.some(item => item.product_id === product.id))
      .reduce((acc, t) => {
        const relevantItems = t.items.filter(item => item.product_id === product.id);
        return acc + relevantItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
      }, 0);
    return {
      sold: soldItems,
      totalSales: totalSales,
    };
  };

  // Sales Analysis Chart Data
  const getSalesChartData = () => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const salesByDate = {};
    const dates = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(last30Days);
      date.setDate(last30Days.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      salesByDate[dateStr] = 0;
      dates.push(dateStr);
    }

    transactions
      .filter(t => new Date(t.created_at) >= last30Days)
      .forEach(t => {
        const dateStr = new Date(t.created_at).toISOString().split('T')[0];
        if (salesByDate[dateStr] !== undefined) {
          salesByDate[dateStr] += t.total_amount;
        }
      });

    return {
      labels: dates,
      datasets: [
        {
          label: 'Sales (KSh)',
          data: dates.map(date => salesByDate[date]),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
        },
      ],
    };
  };

  const getTopProductsChartData = () => {
    const productSales = {};
    transactions.forEach(t => {
      t.items.forEach(item => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = { name: item.product_name, quantity: 0 };
        }
        productSales[item.product_id].quantity += item.quantity;
      });
    });

    const sortedProducts = Object.entries(productSales)
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 5);

    return {
      labels: sortedProducts.map(([_, data]) => data.name),
      datasets: [
        {
          label: 'Units Sold',
          data: sortedProducts.map(([_, data]) => data.quantity),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };
  const handlePrintTransactions = () => {
  if (transactions.length === 0) {
    alert('No transactions available to print.');
    return;
  }

  let printContent = `
    <h2>Transaction Report</h2>
    <p>Date: ${new Date().toLocaleString()}</p>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 1px solid #000;">
          <th style="padding: 8px; text-align: left;">Transaction ID</th>
          <th style="padding: 8px; text-align: left;">User</th>
          <th style="padding: 8px; text-align: left;">Date</th>
          <th style="padding: 8px; text-align: left;">Total Amount</th>
          <th style="padding: 8px; text-align: left;">Items</th>
        </tr>
      </thead>
      <tbody>
  `;

  transactions.forEach((transaction) => {
    const itemsList = transaction.items
      .map((item, index) => 
        `${item.product_name} (Qty: ${item.quantity}, KSh ${Number(item.price).toLocaleString()})${index < transaction.items.length - 1 ? ', ' : ''}`
      )
      .join('');

    printContent += `
      <tr style="border-bottom: 1px solid #ccc;">
        <td style="padding: 8px;">${transaction.id}</td>
        <td style="padding: 8px;">${transaction.user_name || 'Guest'}</td>
        <td style="padding: 8px;">${new Date(transaction.created_at).toLocaleString()}</td>
        <td style="padding: 8px;">KSh ${Number(transaction.total_amount).toLocaleString()}</td>
        <td style="padding: 8px;">
          ${transaction.items.length} item${transaction.items.length !== 1 ? 's' : ''}: ${itemsList}
        </td>
      </tr>
    `;
  });

  printContent += `
      </tbody>
    </table>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Transaction Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          tr { border-bottom: 1px solid #ccc; }
          h2 { margin-bottom: 10px; }
          p { margin: 5px 0; }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};

  return (
    <div className="admin-container">
      <div className="fixed-header">
        <div className="dashboard-header">
          <h2>Point of Sale (POS) and Inventory Management</h2>
          <div>
            <button onClick={handleLogout} className="logout-button" disabled={isLoading}>
              Logout
            </button>
            <Link to="/" className="home-button">
              <FaHome /> Back to Home
            </Link>
          </div>
        </div>
      </div>
      <div className="admin-content">
        <div className="admin-sidebar">
          <div className="sidebar-header">
            <span>Admin Menu</span>
          </div>
          <div className="sidebar-nav">
            <button
              className={`sidebar-link ${activeSection === 'resetPassword' ? 'active-section' : ''}`}
              onClick={() => setActiveSection('resetPassword')}
            >
              Reset Password
            </button>
            <button
              className={`sidebar-link ${activeSection === 'createCategory' ? 'active-section' : ''}`}
              onClick={() => setActiveSection('createCategory')}
            >
              Create New Category
            </button>
            <button
              className={`sidebar-link ${activeSection === 'manageCategories' ? 'active-section' : ''}`}
              onClick={() => setActiveSection('manageCategories')}
            >
              Manage Categories
            </button>
            <button
              className={`sidebar-link ${activeSection === 'manageSuppliers' ? 'active-section' : ''}`}
              onClick={() => setActiveSection('manageSuppliers')}
            >
              Manage Suppliers
            </button>
            <button
              className={`sidebar-link ${activeSection === 'manageTransactions' ? 'active-section' : ''}`}
              onClick={() => setActiveSection('manageTransactions')}
            >
              Manage Transactions
            </button>
            <button
              className={`sidebar-link ${activeSection === 'stockManagement' ? 'active-section' : ''}`}
              onClick={() => setActiveSection('stockManagement')}
            >
              Stock Management
            </button>
            <button
              className={`sidebar-link ${activeSection === 'salesAnalysis' ? 'active-section' : ''}`}
              onClick={() => setActiveSection('salesAnalysis')}
            >
              Sales Analysis
            </button>
          </div>
        </div>
        <div className="admin-main-content">
          {(categoryError || productError || supplierError || transactionError) && (
            <p className="error-message">{categoryError || productError || supplierError || transactionError}</p>
          )}
          {successMessage && <p className="success-message">{successMessage}</p>}

          {viewImage && (
            <div className="image-modal">
              <div className="image-modal-content">
                <span className="image-modal-close" onClick={closeImageModal}>×</span>
                <img src={viewImage} alt="Full Size" className="image-modal-image" />
              </div>
            </div>
          )}

          {activeSection === 'resetPassword' && (
            <div className="section-content">
              <h3>Reset Password</h3>
              <form onSubmit={handleResetPassword} className="dashboard-controls">
                <input
                  type="password"
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className={`search-input ${resetError && !oldPassword ? 'invalid' : ''}`}
                  disabled={isLoading}
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`search-input ${resetError && !newPassword ? 'invalid' : ''}`}
                  disabled={isLoading}
                />
                {resetError && <p className="error-message">{resetError}</p>}
                {resetSuccess && <p className="success-message">{resetSuccess}</p>}
                <button type="submit" className="add-to-cart" disabled={isLoading}>
                  Update Password
                </button>
              </form>
            </div>
          )}

          {activeSection === 'createCategory' && (
            <div className="section-content">
              <h3>Create New Category</h3>
              <form onSubmit={handleCreateCategory} className="dashboard-controls">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="search-input"
                  disabled={isLoading}
                />
                <select
                  value={newCategorySupplierId}
                  onChange={(e) => setNewCategorySupplierId(e.target.value)}
                  className="search-input"
                  disabled={isLoading}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png"
                  ref={categoryFileInputRef}
                  onChange={(e) => setNewImages([...e.target.files])}
                  disabled={isLoading}
                />
                {categoryImagePreviews.length > 0 && (
                  <div className="category-grid" style={{ marginTop: '10px' }}>
                    {categoryImagePreviews.map((preview, index) => (
                      <div key={index} className="category-item">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="category-image"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <button type="submit" className="add-to-cart" disabled={isLoading}>
                  Create Category
                </button>
              </form>
            </div>
          )}

          {activeSection === 'manageCategories' && (
            <div className="section-content">
              <h3>Manage Categories</h3>
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading...</p>
                </div>
              ) : (
                <>
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(parseInt(e.target.value) || null)}
                    className="search-input"
                    style={{ marginBottom: '20px' }}
                    disabled={isLoading}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  {selectedCategory ? (
                    <>
                      <div style={{ marginBottom: '30px' }}>
                        <h4>
                          Edit Category:{' '}
                          {categories.find((c) => c.id === selectedCategory)?.name || 'Unknown'}
                        </h4>
                        <p>
                          Supplier:{' '}
                          {categories.find((c) => c.id === selectedCategory)?.supplier_name || 'None'}
                        </p>
                        {editCategory.id === selectedCategory ? (
                          <form onSubmit={handleUpdateCategory} className="dashboard-controls">
                            <input
                              type="text"
                              value={editCategory.name}
                              onChange={(e) =>
                                setEditCategory({ ...editCategory, name: e.target.value })
                              }
                              className="search-input"
                              disabled={isLoading}
                            />
                            <select
                              value={editCategory.supplier_id}
                              onChange={(e) =>
                                setEditCategory({ ...editCategory, supplier_id: e.target.value })
                              }
                              className="search-input"
                              disabled={isLoading}
                            >
                              <option value="">Select Supplier</option>
                              {suppliers.map((supplier) => (
                                <option key={supplier.id} value={supplier.id}>
                                  {supplier.name}
                                </option>
                              ))}
                            </select>
                            <button type="submit" className="add-to-cart" disabled={isLoading}>
                              Save
                            </button>
                            <button
                              type="button"
                              className="remove-from-cart"
                              onClick={() => setEditCategory({ id: null, name: '', supplier_id: '' })}
                              disabled={isLoading}
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <div className="dashboard-controls">
                            <button
                              className="add-to-cart"
                              onClick={() =>
                                setEditCategory({
                                  id: selectedCategory,
                                  name: categories.find((c) => c.id === selectedCategory)?.name || '',
                                  supplier_id:
                                    categories.find((c) => c.id === selectedCategory)?.supplier_id || '',
                                })
                              }
                              disabled={isLoading}
                            >
                              Edit Category
                            </button>
                            <button
                              className="remove-from-cart"
                              onClick={() => handleDeleteCategory(selectedCategory)}
                              disabled={isLoading}
                            >
                              Delete Category
                            </button>
                          </div>
                        )}
                      </div>

                      <h4>Category Images</h4>
                      <form onSubmit={handleImageUpload} className="dashboard-controls">
                        <input
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png"
                          ref={imageUploadFileInputRef}
                          onChange={(e) => setNewImages([...e.target.files])}
                          disabled={isLoading}
                        />
                        {categoryImagePreviews.length > 0 && (
                          <div className="category-grid" style={{ marginTop: '10px' }}>
                            {categoryImagePreviews.map((preview, index) => (
                              <div key={index} className="category-item">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="category-image"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        <button type="submit" className="add-to-cart" disabled={isLoading}>
                          Upload Images
                        </button>
                      </form>
                      {categories.find((c) => c.id === selectedCategory)?.images?.length === 0 ? (
                        <p>No images for this category</p>
                      ) : (
                        <div className="category-grid">
                          {categories
                            .find((c) => c.id === selectedCategory)
                            ?.images?.map((image) => (
                              <div key={image.id} className="category-item">
                                <img
                                  src={normalizeImageUrl(image.image)}
                                  alt="Category Image"
                                  className="category-image"
                                  onError={(e) => {
                                    if (e.target.src !== placeholderImage) {
                                      console.error(`Failed to load category image: ${e.target.src}`);
                                      e.target.src = placeholderImage;
                                    }
                                  }}
                                />
                                <div className="dashboard-controls">
                                  <button
                                    className="add-to-cart"
                                    onClick={() => handleViewImage(image.image)}
                                    disabled={isLoading}
                                  >
                                    View
                                  </button>
                                  <button
                                    className="add-to-cart"
                                    onClick={() => handleImageUpdate(image.id)}
                                    disabled={isLoading}
                                  >
                                    Update
                                  </button>
                                  <button
                                    className="remove-from-cart"
                                    onClick={() => handleImageDelete(image.id)}
                                    disabled={isLoading}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      <h4>Create New Product</h4>
                      <form onSubmit={handleCreateProduct} className="dashboard-controls">
                        <input
                          type="text"
                          placeholder="Product Name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          className="search-input"
                          disabled={isLoading}
                        />
                        <input
                          type="number"
                          placeholder="Price (KSh)"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          className="search-input"
                          min="0"
                          step="0.01"
                          disabled={isLoading}
                        />
                        <input
                          type="number"
                          placeholder="Quantity"
                          value={newProduct.quantity}
                          onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                          className="search-input"
                          min="0"
                          disabled={isLoading}
                        />
                        <input
                          type="text"
                          value={
                            categories.find((c) => c.id === selectedCategory)?.supplier_name || 'None'
                          }
                          className="search-input"
                          disabled
                        />
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          ref={productFileInputRef}
                          onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
                          disabled={isLoading}
                        />
                        {productImagePreview && (
                          <div className="product-item" style={{ marginTop: '10px' }}>
                            <img
                              src={productImagePreview}
                              alt="Product Preview"
                              className="product-image"
                            />
                          </div>
                        )}
                        <button type="submit" className="add-to-cart" disabled={isLoading}>
                          Create Product
                        </button>
                      </form>

                      <h4>Manage Products</h4>
                      {products.filter((prod) => prod.category_id === selectedCategory).length === 0 ? (
                        <p>No products in this category. Create a new product above.</p>
                      ) : (
                        <div className="product-grid">
                          {products
                            .filter((prod) => prod.category_id === selectedCategory)
                            .map((product) => (
                              <div key={product.id} className="product-item">
                                {product.image ? (
                                  <img
                                    src={normalizeImageUrl(product.image)}
                                    alt={product.name}
                                    className="product-image"
                                    onError={(e) => {
                                      if (e.target.src !== placeholderImage) {
                                        console.error(`Failed to load product image: ${e.target.src}`);
                                        e.target.src = placeholderImage;
                                      }
                                    }}
                                  />
                                ) : (
                                  <img src={placeholderImage} alt="No Image" className="product-image" />
                                )}
                                {editProduct && editProduct.id === product.id ? (
                                  <form onSubmit={handleUpdateProduct} className="dashboard-controls">
                                    <input
                                      type="text"
                                      value={editProduct.name}
                                      onChange={(e) =>
                                        setEditProduct({ ...editProduct, name: e.target.value })
                                      }
                                      className="search-input"
                                      disabled={isLoading}
                                    />
                                    <input
                                      type="number"
                                      value={editProduct.price}
                                      onChange={(e) =>
                                        setEditProduct({ ...editProduct, price: e.target.value })
                                      }
                                      className="search-input"
                                      min="0"
                                      step="0.01"
                                      disabled={isLoading}
                                    />
                                    <input
                                      type="number"
                                      value={editProduct.quantity}
                                      onChange={(e) =>
                                        setEditProduct({ ...editProduct, quantity: e.target.value })
                                      }
                                      className="search-input"
                                      min="0"
                                      disabled={isLoading}
                                    />
                                    <select
                                      value={editProduct.category_id}
                                      onChange={(e) =>
                                        setEditProduct({
                                          ...editProduct,
                                          category_id: parseInt(e.target.value),
                                        })
                                      }
                                      className="search-input"
                                      disabled={isLoading}
                                    >
                                      <option value="">Select Category</option>
                                      {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                          {category.name}
                                        </option>
                                      ))}
                                    </select>
                                    <input
                                      type="text"
                                      value={
                                        categories.find((c) => c.id === editProduct.category_id)?.supplier_name ||
                                        'None'
                                      }
                                      className="search-input"
                                      disabled
                                    />
                                    <input
                                      type="file"
                                      accept=".jpg,.jpeg,.png"
                                      ref={editProductFileInputRef}
                                      onChange={(e) =>
                                        setEditProduct({ ...editProduct, newImage: e.target.files[0] })
                                      }
                                      disabled={isLoading}
                                    />
                                    <button type="submit" className="add-to-cart" disabled={isLoading}>
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      className="remove-from-cart"
                                      onClick={() => setEditProduct(null)}
                                      disabled={isLoading}
                                    >
                                      Cancel
                                    </button>
                                  </form>
                                ) : (
                                  <>
                                    <h3>{product.name}</h3>
                                    <p>Price: KSh {Number(product.price).toLocaleString()}</p>
                                    <p>Quantity: {product.quantity}</p>
                                    <p>Category: {product.category || 'Unknown'}</p>
                                    <p>Supplier: {product.supplier || 'None'}</p>
                                    <div className="dashboard-controls">
                                      <button
                                        className="add-to-cart"
                                        onClick={() =>
                                          setEditProduct({
                                            id: product.id,
                                            name: product.name,
                                            price: product.price,
                                            quantity: product.quantity,
                                            category_id: product.category_id,
                                            image: product.image,
                                            newImage: null,
                                          })
                                        }
                                        disabled={isLoading}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="remove-from-cart"
                                        onClick={() => handleDeleteProduct(product.id)}
                                        disabled={isLoading}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p>Please select a category to manage its images and products.</p>
                  )}
                </>
              )}
            </div>
          )}

          {activeSection === 'manageSuppliers' && (
            <div className="section-content">
              <h3>Manage Suppliers</h3>
              <button
                className="add-to-cart"
                onClick={handleViewSuppliers}
                style={{ marginBottom: '20px' }}
                disabled={isLoading || isLoadingSuppliers}
              >
                {showSuppliers ? 'Hide Suppliers' : 'Show Suppliers'}
              </button>
              {showSuppliers && (
                <div>
                  <h4>Create New Supplier</h4>
                  <form onSubmit={handleCreateSupplier} className="dashboard-controls">
                    <input
                      type="text"
                      placeholder="Supplier Name"
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                      className="search-input"
                      disabled={isLoading}
                    />
                    <input
                      type="email"
                      placeholder="Contact Email"
                      value={newSupplier.contact_email}
                      onChange={(e) => setNewSupplier({ ...newSupplier, contact_email: e.target.value })}
                      className="search-input"
                      disabled={isLoading}
                    />
                    <input
                      type="tel"
                      placeholder="Contact Phone"
                      value={newSupplier.contact_phone}
                      onChange={(e) => setNewSupplier({ ...newSupplier, contact_phone: e.target.value })}
                      className="search-input"
                      disabled={isLoading}
                    />
                    <input
                      type="text"
                      placeholder="Address"
                      value={newSupplier.address}
                      onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                      className="search-input"
                      disabled={isLoading}
                    />
                    <button type="submit" className="add-to-cart" disabled={isLoading}>
                      Create Supplier
                    </button>
                  </form>

                  <h4>Supplier List</h4>
                  {isLoadingSuppliers ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Loading suppliers...</p>
                    </div>
                  ) : suppliersWithProducts.length === 0 ? (
                    <p>No suppliers found.</p>
                  ) : (
                    <div className="product-grid">
                      {suppliersWithProducts.map((supplier) => (
                        <div key={supplier.id} className="product-item">
                          {editSupplier && editSupplier.id === supplier.id ? (
                            <form onSubmit={handleUpdateSupplier} className="dashboard-controls">
                              <input
                                type="text"
                                value={editSupplier.name}
                                onChange={(e) =>
                                  setEditSupplier({ ...editSupplier, name: e.target.value })
                                }
                                className="search-input"
                                disabled={isLoading}
                              />
                              <input
                                type="email"
                                value={editSupplier.contact_email}
                                onChange={(e) =>
                                  setEditSupplier({ ...editSupplier, contact_email: e.target.value })
                                }
                                className="search-input"
                                disabled={isLoading}
                              />
                              <input
                                type="tel"
                                value={editSupplier.contact_phone}
                                onChange={(e) =>
                                  setEditSupplier({ ...editSupplier, contact_phone: e.target.value })
                                }
                                className="search-input"
                                disabled={isLoading}
                              />
                              <input
                                type="text"
                                value={editSupplier.address}
                                onChange={(e) =>
                                  setEditSupplier({ ...editSupplier, address: e.target.value })
                                }
                                className="search-input"
                                disabled={isLoading}
                              />
                              <button type="submit" className="add-to-cart" disabled={isLoading}>
                                Save
                              </button>
                              <button
                                type="button"
                                className="remove-from-cart"
                                onClick={() => setEditSupplier(null)}
                                disabled={isLoading}
                              >
                                Cancel
                              </button>
                            </form>
                          ) : (
                            <>
                              <h3>{supplier.name}</h3>
                              <p>Email: {supplier.contact_email || 'N/A'}</p>
                              <p>Phone: {supplier.contact_phone || 'N/A'}</p>
                              <p>Address: {supplier.address || 'N/A'}</p>
                              <p>Products:</p>
                              {supplier.products.length === 0 ? (
                                <p>No products assigned</p>
                              ) : (
                                <div className="supplier-products">
                                  {supplier.products.map((product) => (
                                    <div key={product.id} className="supplier-product-item">
                                      {product.image ? (
                                        <img
                                          src={normalizeImageUrl(product.image)}
                                          alt={product.name}
                                          className="supplier-product-image"
                                          onError={(e) => {
                                            if (e.target.src !== placeholderImage) {
                                              console.error(`Failed to load supplier product image: ${e.target.src}`);
                                              e.target.src = placeholderImage;
                                            }
                                          }}
                                        />
                                      ) : (
                                        <img
                                          src={placeholderImage}
                                          alt="No Image"
                                          className="supplier-product-image"
                                        />
                                      )}
                                      <div className="supplier-product-details">
                                        <h4>{product.name}</h4>
                                        <p className="supplier-product-price">
                                          KSh {Number(product.price).toLocaleString()}
                                        </p>
                                        <span className="supplier-product-quantity">
                                          Qty: {product.quantity}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="dashboard-controls">
                                <button
                                  className="add-to-cart"
                                  onClick={() => handleEditSupplier(supplier)}
                                  disabled={isLoading}
                                >
                                  Edit
                                </button>
                                <button
                                  className="remove-from-cart"
                                  onClick={() => handleDeleteSupplier(supplier.id)}
                                  disabled={isLoading}
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* print for transactions */}
      

  {/* //mnage trasaction new code now */}
{activeSection === 'manageTransactions' && (
  <div className="section-content">
    <h3>Manage Transactions</h3>
    <button
      className="add-to-cart"
      onClick={handleViewTransactions}
      style={{ marginBottom: '20px', marginRight: '10px' }}
      disabled={isLoading || isLoadingTransactions}
    >
      {showTransactions ? 'Hide Transactions' : 'Show Transactions'}
    </button>
    <button
      className="add-to-cart"
      onClick={handlePrintTransactions}
      style={{ marginBottom: '20px' }}
      disabled={isLoading || isLoadingTransactions || transactions.length === 0}
    >
      Print Transactions
    </button>
    {editTransaction && (
      <div>
        <h4>Edit Transaction #{editTransaction.id}</h4>
        <form onSubmit={handleUpdateTransaction} className="dashboard-controls">
          <input
            type="number"
            placeholder="Total Amount (KSh)"
            value={editTransaction.total_amount}
            onChange={(e) =>
              setEditTransaction({ ...editTransaction, total_amount: e.target.value })
            }
            className="search-input"
            min="0"
            step="0.01"
            disabled={isLoading}
          />
          <select
            value={editTransaction.user_id || ''}
            onChange={(e) =>
              setEditTransaction({ ...editTransaction, user_id: e.target.value })
            }
            className="search-input"
            disabled={isLoading}
          >
            <option value="">Guest</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <button type="submit" className="add-to-cart" disabled={isLoading}>
            Save
          </button>
          <button
            type="button"
            className="remove-from-cart"
            onClick={() => setEditTransaction(null)}
            disabled={isLoading}
          >
            Cancel
          </button>
        </form>
      </div>
    )}
    {showTransactions && (
      <div>
        <h4>Transaction History</h4>
        {isLoadingTransactions ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <div className="table-responsive">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th data-label="Transaction ID">Transaction ID</th>
                  <th data-label="User">User</th>
                  <th data-label="Date">Date</th>
                  <th data-label="Total Amount">Total Amount</th>
                  <th data-label="Items">Items</th>
                  <th data-label="Edit">Edit</th>
                  <th data-label="Delete">Delete</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="transaction-row">
                    <td data-label="Transaction ID">{transaction.id}</td>
                    <td data-label="User">{transaction.user_name || 'Guest'}</td>
                    <td data-label="Date">{new Date(transaction.created_at).toLocaleString()}</td>
                    <td data-label="Total Amount">KSh {Number(transaction.total_amount).toLocaleString()}</td>
                    <td data-label="Items">
                      {transaction.items.length} item{transaction.items.length !== 1 ? 's' : ''}:<br />
                      {transaction.items.map((item, index) => (
                        <span key={index}>
                          {item.product_name} (Qty: {item.quantity}, KSh {Number(item.price).toLocaleString()})
                          {index < transaction.items.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </td>
                    <td data-label="Edit">
                      <button
                        className="add-to-cart"
                        onClick={() => handleEditTransaction(transaction)}
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                    </td>
                    <td data-label="Delete">
                      <button
                        className="remove-from-cart"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}
  </div>
)}

{/* stock maanagemtn */}
{/* 
      {activeSection === 'stockManagement' && (
  <div className="section-content">
    <h3>Stock Management</h3>
    <select
      value={stockCategory || ''}
      onChange={(e) => setStockCategory(parseInt(e.target.value) || null)}
      className="search-input"
      style={{ marginBottom: '20px' }}
      disabled={isLoading}
    >
      <option value="">Select a category</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
    <button
      className="add-to-cart"
      onClick={handlePrintStatement}
      style={{ marginBottom: '20px' }}
      disabled={isLoading || !stockCategory}
    >
      Print Statement
    </button>
    {stockCategory ? (
      products.filter((prod) => prod.category_id === stockCategory).length === 0 ? (
        <p>No products in this category.</p>
      ) : (
        <div className="table-responsive">
          <table className="transactions-table">
            <thead>
              <tr>
                <th data-label="Item Name">Item Name</th>
                <th data-label="Stock Remaining">Stock Remaining</th>
                <th data-label="Total Price">Total Price</th>
                <th data-label="Number Sold">Number Sold</th>
                <th data-label="Total Sales">Total Sales</th>
                <th data-label="Discounts">Discounts</th>
                <th data-label="Paid">Paid</th>
                <th data-label="Not Paid">Not Paid</th>
                <th data-label="Due">Due</th>
                <th data-label="Total Amount">Total Amount</th>
                <th data-label="Edit">Edit</th>
                <th data-label="Save">Save</th>
              </tr>
            </thead>
            <tbody>
              {products
                .filter((prod) => prod.category_id === stockCategory)
                .map((product) => {
                  const { sold, totalSales } = calculateProductStats(product);
                  const payment = paymentStatuses[product.id] || {
                    paid: false,
                    notPaid: false,
                    discount: 0,
                    due: 0,
                  };
                  const totalAmount = Math.max(
                    0,
                    Number(totalSales || 0) - (Number(payment.discount) || 0) - (Number(payment.due) || 0)
                  );

                  return (
                    <tr key={product.id} className="transaction-row">
                      <td data-label="Item Name">{product.name}</td>
                      <td data-label="Stock Remaining">{product.quantity}</td>
                      <td data-label="Total Price">
                        KSh {Number((product.price || 0) * (product.quantity || 0)).toLocaleString()}
                      </td>
                      <td data-label="Number Sold">{sold}</td>
                      <td data-label="Total Sales">KSh {Number(totalSales || 0).toLocaleString()}</td>
                      <td data-label="Discounts">
                        <input
                          type="number"
                          value={payment.discount || 0}
                          onChange={(e) =>
                            handlePaymentStatusChange(product.id, 'discount', Number(e.target.value))
                          }
                          className="search-input"
                          min="0"
                          step="0.01"
                          disabled={isLoading}
                        />
                      </td>
                      <td data-label="Paid">
                        <input
                          type="checkbox"
                          checked={payment.paid || false}
                          onChange={(e) =>
                            handlePaymentStatusChange(product.id, 'paid', e.target.checked)
                          }
                          disabled={isLoading}
                        />
                      </td>
                      <td data-label="Not Paid">
                        <input
                          type="checkbox"
                          checked={payment.notPaid || false}
                          onChange={(e) =>
                            handlePaymentStatusChange(product.id, 'notPaid', e.target.checked)
                          }
                          disabled={isLoading}
                        />
                      </td>
                      <td data-label="Due">
                        <input
                          type="number"
                          value={payment.due || 0}
                          onChange={(e) =>
                            handlePaymentStatusChange(product.id, 'due', Number(e.target.value))
                          }
                          className="search-input"
                          min="0"
                          step="0.01"
                          disabled={isLoading}
                        />
                      </td>
                      <td data-label="Total Amount">KSh {Number(totalAmount).toLocaleString()}</td>
                      <td data-label="Edit">
                        <button
                          className="add-to-cart"
                          onClick={() =>
                            setEditProduct({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              quantity: product.quantity,
                              category_id: product.category_id,
                              image: product.image,
                              newImage: null,
                            })
                          }
                          disabled={isLoading}
                        >
                          Edit
                        </button>
                      </td>
                      <td data-label="Save">
                        <button
                          className="add-to-cart"
                          onClick={() => handleSaveProduct(product.id)}
                          disabled={isLoading}
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )
    ) : (
      <p>Please select a category to view its stock.</p>
    )}
    {editProduct && (
      <div>
        <h4>Edit Product #{editProduct.id}</h4>
        <form onSubmit={handleUpdateProduct} className="dashboard-controls">
          <input
            type="text"
            value={editProduct.name}
            onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
            className="search-input"
            disabled={isLoading}
          />
          <input
            type="number"
            value={editProduct.price}
            onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
            className="search-input"
            min="0"
            step="0.01"
            disabled={isLoading}
          />
          <input
            type="number"
            value={editProduct.quantity}
            onChange={(e) => setEditProduct({ ...editProduct, quantity: e.target.value })}
            className="search-input"
            min="0"
            disabled={isLoading}
          />
          <select
            value={editProduct.category_id}
            onChange={(e) =>
              setEditProduct({ ...editProduct, category_id: parseInt(e.target.value) })
            }
            className="search-input"
            disabled={isLoading}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={
              categories.find((c) => c.id === editProduct.category_id)?.supplier_name || 'None'
            }
            className="search-input"
            disabled
          />
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            ref={editProductFileInputRef}
            onChange={(e) => setEditProduct({ ...editProduct, newImage: e.target.files[0] })}
            disabled={isLoading}
          />
          <button type="submit" className="add-to-cart" disabled={isLoading}>
            Save
          </button>
          <button
            type="button"
            className="remove-from-cart"
            onClick={() => setEditProduct(null)}
            disabled={isLoading}
          >
            Cancel
          </button>
        </form>
      </div>
    )}
  </div>
)} */}

{/* stock mangmetn done here */}
{activeSection === 'stockManagement' && (
  <div className="section-content">
    <h3>Stock Management</h3>
    <select
      value={stockCategory || ''}
      onChange={(e) => setStockCategory(parseInt(e.target.value) || null)}
      className="search-input"
      style={{ marginBottom: '20px' }}
      disabled={isLoading}
    >
      <option value="">Select a category</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
    <button
      className="add-to-cart"
      onClick={handlePrintStatement}
      style={{ marginBottom: '20px' }}
      disabled={isLoading || !stockCategory}
    >
      Print Statement
    </button>
    {stockCategory ? (
      products.filter((prod) => prod.category_id === stockCategory).length === 0 ? (
        <p>No products in this category.</p>
      ) : (
        <div className="table-responsive">
          <table className="transactions-table">
            <thead>
              <tr>
                <th data-label="Item Name">Item Name</th>
                <th data-label="Stock Remaining">Stock Remaining</th>
                <th data-label="Number Sold">Number Sold</th>
                <th data-label="Total Price">Total Price</th>
                <th data-label="Paid">Paid</th>
                <th data-label="Not Paid">Not Paid</th>
              </tr>
            </thead>
            <tbody>
              {products
                .filter((prod) => prod.category_id === stockCategory)
                .map((product) => {
                  const { sold, totalSales } = calculateProductStats(product);
                  const payment = paymentStatuses[product.id] || {
                    paid: false,
                    notPaid: false,
                  };

                  return (
                    <tr key={product.id} className="transaction-row">
                      <td data-label="Item Name">{product.name}</td>
                      <td data-label="Stock Remaining">{product.quantity}</td>
                      <td data-label="Number Sold">{sold}</td>
                      <td data-label="Total Price">
                        KSh {Number((product.price || 0) * (product.quantity || 0)).toLocaleString()}
                      </td>
                      <td data-label="Paid">
                        {(!payment.notPaid || !payment.paid) && (
                          <input
                            type="radio"
                            name={`payment-status-${product.id}`}
                            checked={payment.paid || false}
                            onChange={() => handlePaymentStatusChange(product.id, 'paid', true)}
                            disabled={isLoading || sold === 0}
                          />
                        )}
                      </td>
                      <td data-label="Not Paid">
                        {(!payment.paid || !payment.notPaid) && (
                          <input
                            type="radio"
                            name={`payment-status-${product.id}`}
                            checked={payment.notPaid || false}
                            onChange={() => handlePaymentStatusChange(product.id, 'notPaid', true)}
                            disabled={isLoading || sold === 0}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )
    ) : (
      <p>Please select a category to view its stock.</p>
    )}
  </div>
)}
 {/* final stock mamnagemtn */}
{activeSection === 'salesAnalysis' && (
  <div className="section-content">
    <h3>Sales Analysis</h3>
    {isLoading ? (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    ) : transactions.length === 0 ? (
      <p>No sales data available.</p>
    ) : (
      <div className="charts-container">
        <div className="chart-wrapper">
          <h4>Sales Trend (Last 30 Days)</h4>
          <Line
            data={getSalesChartData()}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Sales Over Time',
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Date',
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: 'Sales (KSh)',
                  },
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
        <div className="chart-wrapper">
          <h4>Top 5 Products by Units Sold</h4>
          <Bar
            data={getTopProductsChartData()}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Top Products',
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Product',
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: 'Units Sold',
                  },
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>
    )}
  </div>
)}
        </div>
      </div>
    </div>
  );
};

Admin.propTypes = {
  refreshCategories: PropTypes.func.isRequired,
};

export default Admin;