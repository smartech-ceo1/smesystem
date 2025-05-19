const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const NodeCache = require('node-cache');
require('dotenv').config();


const app = express();
const port = 3001;
const JWT_SECRET = 'your_jwt_secret_key'; // Replace with a secure key in production
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // Cache with 10-minute TTL

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(UploadsPath, { recursive: true });
}
console.log('Serving uploads from:', uploadsPath);
console.log('Uploads folder exists:', fs.existsSync(uploadsPath));
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    console.log(`Serving file: ${filePath}`);
  },
  index: false,
  extensions: ['jpg', 'jpeg', 'png']
}));
app.use('/uploads', (req, res) => {
  console.error(`File not found: ${req.originalUrl}`);
  res.status(404).sendFile(path.join(uploadsPath, 'placeholder.jpg'));
});

// Test route to list uploads folder contents
app.get('/api/uploads/list', (req, res) => {
  fs.readdir(uploadsPath, (err, files) => {
    if (err) {
      console.error('Error reading uploads folder:', err);
      return res.status(500).json({ error: 'Unable to read uploads folder' });
    }
    console.log('Uploads folder contents:', files);
    return res.json(files);
  });
});
// MySQL Connection

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
  initializeSuppliers();
});


// Initialize predefined suppliers
function initializeSuppliers() {
  const predefinedSuppliers = [
    {
      name: 'ElectroTech Solutions',
      contact_email: 'contact@electrotech.com',
      contact_phone: '0726900272',
      address: 'Marson, Nakuru City'
    },
    {
      name: 'FashionTrendz',
      contact_email: 'support@fashiontrendz.com',
      contact_phone: '0794572255',
      address: 'Moi Avenue, Fashion City'
    },
    {
      name: 'StepIn Style',
      contact_email: 'info@stepinstyle.com',
      contact_phone: '0798627653',
      address: 'Footwear Lane, Eldoret City'
    },
    {
      name: 'AutoWorld',
      contact_email: 'sales@autoworld.com',
      contact_phone: '0727550071',
      address: '101 Motor Road, Mombasa City'
    },
    {
      name: 'HomeHaven',
      contact_email: 'care@homehaven.com',
      contact_phone: '0725222792',
      address: 'Comfort Street, Nairobi City'
    },
    {
      name: 'AdventureGear',
      contact_email: 'contact@adventuregear.com',
      contact_phone: '+1234567895',
      address: '303 Outdoor Trail, Adventure City'
    }
  ];

  predefinedSuppliers.forEach(supplier => {
    db.query(
      'SELECT id FROM suppliers WHERE name = ?',
      [supplier.name],
      (err, results) => {
        if (err) {
          console.error('Error checking supplier:', err);
          return;
        }
        if (results.length === 0) {
          db.query(
            'INSERT INTO suppliers (name, contact_email, contact_phone, address) VALUES (?, ?, ?, ?)',
            [supplier.name, supplier.contact_email, supplier.contact_phone, supplier.address],
            (err, result) => {
              if (err) {
                console.error('Error inserting supplier:', err);
                return;
              }
              console.log(`Initialized supplier: ${supplier.name}`);
            }
          );
        }
      }
    );
  });
}

// Multer Configuration for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `image-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log('File received:', file);
    if (!file || !file.originalname) {
      console.error('No file uploaded or invalid file');
      return cb(new Error('No file uploaded or invalid file'));
    }
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    console.error(`Invalid file type: ${file.mimetype}`);
    return cb(new Error('Only .jpg, .jpeg, and .png files are allowed!'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});



// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Multer error: ${err.message}` });
  }
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// API Routes

// User Signup
app.post('/api/signup', async (req, res) => {
  console.log('POST /api/signup body:', req.body);
  const { name, email, password, isAdmin } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, isAdmin || false],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
          }
          console.error('Error creating user:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        const user = { id: result.insertId, name, email, is_admin: isAdmin || false };
        console.log('User created:', user);
        const token = jwt.sign(
          { id: user.id, email: user.email, is_admin: user.is_admin },
          JWT_SECRET,
          { expiresIn: '1h' }
        );
        res.json({ success: true, user, token });
      }
    );
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  console.log('POST /api/login body:', req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      console.error('No user found for email:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = results[0];
    console.log('User found:', { id: user.id, email: user.email, is_admin: user.is_admin });
    try {
      const match = await bcrypt.compare(password, user.password);
      console.log('Password match:', match);
      if (!match) {
        console.error('Password mismatch for user:', email);
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const token = jwt.sign(
        { id: user.id, email: user.email, is_admin: user.is_admin },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      console.log('Login successful:', { email, is_admin: user.is_admin });
      res.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin },
        token
      });
    } catch (error) {
      console.error('Error verifying password:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
});

// Reset Password (Admin only)
app.post('/api/reset-password', authenticateToken, requireAdmin, async (req, res) => {
  console.log('POST /api/reset-password body:', req.body);
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Old and new passwords are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  try {
    db.query('SELECT password FROM users WHERE id = ?', [userId], async (err, results) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = results[0];
      const match = await bcrypt.compare(oldPassword, user.password);
      if (!match) {
        return res.status(401).json({ error: 'Incorrect old password' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (err) => {
        if (err) {
          console.error('Error updating password:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        console.log('Password updated for user:', userId);
        res.json({ message: 'Password updated successfully' });
      });
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all categories with their images and supplier info (Admin only)
app.get('/api/categories', authenticateToken, requireAdmin, (req, res) => {
  console.log('GET /api/categories');
  const query = `
    SELECT c.id, c.name, c.supplier_id, ci.id AS image_id, ci.image, s.name AS supplier_name
    FROM categories c
    LEFT JOIN category_images ci ON c.id = ci.category_id
    LEFT JOIN suppliers s ON c.supplier_id = s.id
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    const categories = [];
    const categoryMap = new Map();
    results.forEach(row => {
      if (!categoryMap.has(row.id)) {
        categoryMap.set(row.id, {
          id: row.id,
          name: row.name,
          supplier_id: row.supplier_id,
          supplier_name: row.supplier_name || null,
          images: []
        });
        categories.push(categoryMap.get(row.id));
      }
      if (row.image_id) {
        categoryMap.get(row.id).images.push({
          id: row.image_id,
          image: row.image ? `${process.env.REACT_APP_API_URL}/${row.image}` : null
        });
      }
    });
    console.log('Categories fetched:', categories);
    return res.json(categories);
  });
});

// Get all categories for public access (no authentication required)
app.get('/api/public/categories', (req, res) => {
  const cacheKey = 'public_categories';
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    console.log('Cache hit for public categories');
    return res.json(cachedData);
  }

  console.log('GET /api/public/categories');
  const query = `
    SELECT c.id, c.name, c.supplier_id, ci.id AS image_id, ci.image, s.name AS supplier_name
    FROM categories c
    LEFT JOIN category_images ci ON c.id = ci.category_id
    LEFT JOIN suppliers s ON c.supplier_id = s.id
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching public categories:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    const categories = [];
    const categoryMap = new Map();
    results.forEach(row => {
      if (!categoryMap.has(row.id)) {
        categoryMap.set(row.id, {
          id: row.id,
          name: row.name,
          supplier_id: row.supplier_id,
          supplier_name: row.supplier_name || null,
          images: []
        });
        categories.push(categoryMap.get(row.id));
      }
      if (row.image_id) {
        categoryMap.get(row.id).images.push({
          id: row.image_id,
          image: row.image ? `${process.env.REACT_APP_API_URL}/${row.image}` : null
        });
      }
    });
    console.log('Public categories fetched:', categories);
    cache.set(cacheKey, categories);
    return res.json(categories);
  });
});

// Create a new category (Admin only)
app.post('/api/categories', authenticateToken, requireAdmin, upload.array('images', 10), (req, res) => {
  console.log('POST /api/categories body:', req.body, 'files:', req.files);
  const { name, supplier_id } = req.body;
  const files = req.files || [];

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'At least one image is required' });
  }
  if (!supplier_id) {
    return res.status(400).json({ error: 'Supplier ID is required' });
  }

  db.query('SELECT id, name AS supplier_name FROM suppliers WHERE id = ?', [supplier_id], (err, results) => {
    if (err) {
      console.error('Error validating supplier:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid supplier_id' });
    }

    db.query('INSERT INTO categories (name, supplier_id) VALUES (?, ?)', [name, supplier_id], (err, result) => {
      if (err) {
        console.error('Error creating category:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      const categoryId = result.insertId;

      if (files.length > 0) {
        const values = files.map(file => [categoryId, `uploads/${file.filename}`]);
        db.query('INSERT INTO category_images (category_id, image) VALUES ?', [values], (err, imageResult) => {
          if (err) {
            console.error('Error saving images:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          const images = files.map((file, index) => ({
            id: imageResult.insertId + index,
            image: `${process.env.REACT_APP_API_URL}/uploads/${file.filename}`
          }));
          console.log('Category created:', { id: categoryId, name, supplier_id, images });
          cache.del('public_categories');
          return res.json({ id: categoryId, name, supplier_id, supplier_name: results[0].supplier_name, images });
        });
      } else {
        console.log('Category created:', { id: categoryId, name, supplier_id, images: [] });
        cache.del('public_categories');
        return res.json({ id: categoryId, name, supplier_id, supplier_name: results[0].supplier_name, images: [] });
      }
    });
  });
});

// Update a category (Admin only)
app.put('/api/categories/:id', authenticateToken, requireAdmin, (req, res) => {
  console.log('PUT /api/categories/:id', req.params, req.body);
  const { id } = req.params;
  const { name, supplier_id } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }
  if (!supplier_id) {
    return res.status(400).json({ error: 'Supplier ID is required' });
  }

  db.query('SELECT id FROM categories WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error validating category:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    db.query('SELECT id, name AS supplier_name FROM suppliers WHERE id = ?', [supplier_id], (err, supplierResults) => {
      if (err) {
        console.error('Error validating supplier:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (supplierResults.length === 0) {
        return res.status(400).json({ error: 'Invalid supplier_id' });
      }

      db.beginTransaction(err => {
        if (err) {
          console.error('Error starting transaction:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        db.query('UPDATE categories SET name = ?, supplier_id = ? WHERE id = ?', [name, supplier_id, id], err => {
          if (err) {
            console.error('Error updating category:', err);
            return db.rollback(() => {
              res.status(500).json({ error: 'Database error' });
            });
          }

          db.query('UPDATE products SET supplier_id = ? WHERE category_id = ?', [supplier_id, id], err => {
            if (err) {
              console.error('Error updating product suppliers:', err);
              return db.rollback(() => {
                res.status(500).json({ error: 'Database error' });
              });
            }

            db.commit(err => {
              if (err) {
                console.error('Error committing transaction:', err);
                return db.rollback(() => {
                  res.status(500).json({ error: 'Database error' });
                });
              }
              console.log('Category updated:', { id, name, supplier_id });
              cache.del('public_categories');
              return res.json({ id, name, supplier_id, supplier_name: supplierResults[0].supplier_name });
            });
          });
        });
      });
    });
  });
});

// Delete a category (Admin only)
app.delete('/api/categories/:id', authenticateToken, requireAdmin, (req, res) => {
  console.log('DELETE /api/categories/:id', req.params);
  const { id } = req.params;

  db.query('SELECT id FROM categories WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error validating category:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    db.query('SELECT image FROM category_images WHERE category_id = ?', [id], (err, imageResults) => {
      if (err) {
        console.error('Error fetching category images for deletion:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      db.query('SELECT image FROM products WHERE category_id = ?', [id], (err, productResults) => {
        if (err) {
          console.error('Error fetching product images for deletion:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        imageResults.forEach(row => {
          const imagePath = path.join(uploadsPath, path.basename(row.image));
          try {
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
              console.log(`Deleted category image file: ${imagePath}`);
            }
          } catch (unlinkErr) {
            console.error(`Error deleting category image file ${imagePath}:`, unlinkErr);
          }
        });

        productResults.forEach(row => {
          if (row.image) {
            const imagePath = path.join(uploadsPath, path.basename(row.image));
            try {
              if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log(`Deleted product image file: ${imagePath}`);
              }
            } catch (unlinkErr) {
              console.error(`Error deleting product image file ${imagePath}:`, unlinkErr);
            }
          }
        });

        db.query('DELETE FROM categories WHERE id = ?', [id], err => {
          if (err) {
            console.error('Error deleting category:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          console.log('Category deleted:', { id });
          cache.del('public_categories');
          return res.json({ message: 'Category deleted' });
        });
      });
    });
  });
});

// Upload images for a category (Admin only)
app.post('/api/categories/:categoryId/images', authenticateToken, requireAdmin, upload.array('images', 10), (req, res) => {
  console.log('POST /api/categories/:categoryId/images body:', req.body, 'files:', req.files);
  const { categoryId } = req.params;
  const files = req.files || [];

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No images uploaded' });
  }

  db.query('SELECT id FROM categories WHERE id = ?', [categoryId], (err, results) => {
    if (err) {
      console.error('Error validating category:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const values = files.map(file => [categoryId, `uploads/${file.filename}`]);
    db.query('INSERT INTO category_images (category_id, image) VALUES ?', [values], (err, result) => {
      if (err) {
        console.error('Error saving images:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      const images = files.map((file, index) => ({
        id: result.insertId + index,
        image: `${process.env.REACT_APP_API_URL}/uploads/${file.filename}`
      }));
      console.log('Images uploaded for category:', { categoryId, images });
      cache.del('public_categories');
      return res.json({ message: 'Images uploaded successfully', images });
    });
  });
});

// Update a category image (Admin only)
app.put('/api/category-images/:imageId', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  console.log('PUT /api/category-images/:imageId body:', req.body, 'file:', req.file);
  const { imageId } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  db.query('SELECT image FROM category_images WHERE id = ?', [imageId], (err, results) => {
    if (err) {
      console.error('Error fetching image:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const oldImagePath = path.join(uploadsPath, path.basename(results[0].image));
    const newImagePath = `uploads/${file.filename}`;

    db.query('UPDATE category_images SET image = ? WHERE id = ?', [newImagePath, imageId], err => {
      if (err) {
        console.error('Error updating image:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      try {
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log(`Deleted old image file: ${oldImagePath}`);
        }
      } catch (unlinkErr) {
        console.error(`Error deleting old image file ${oldImagePath}:`, unlinkErr);
      }

      console.log('Image updated:', { imageId, newImagePath });
      cache.del('public_categories');
      return res.json({ message: 'Image updated successfully', image: `${process.env.REACT_APP_API_URL}/${newImagePath}` });
    });
  });
});

// Delete a category image (Admin only)
// Update a category image (Admin only)
app.put('/api/category-images/:imageId', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  console.log('PUT /api/category-images/:imageId body:', req.body, 'file:', req.file);
  const { imageId } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  db.query('SELECT image FROM category_images WHERE id = ?', [imageId], (err, results) => {
    if (err) {
      console.error('Error fetching image:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const oldImageFile = results[0].image ? path.basename(results[0].image) : null;
    const oldImagePath = oldImageFile ? path.join(uploadsPath, oldImageFile) : null;
    const newImagePath = `/uploads/${file.filename}`;

    db.query('UPDATE category_images SET image = ? WHERE id = ?', [newImagePath, imageId], (err) => {
      if (err) {
        console.error('Error updating image:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (oldImagePath && fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
          console.log(`Deleted old image file: ${oldImagePath}`);
        } catch (unlinkErr) {
          console.error(`Error deleting old image file ${oldImagePath}:`, unlinkErr);
        }
      }

      console.log('Image updated:', { imageId, newImagePath });
      cache.del('public_categories');
      return res.json({ message: 'Image updated successfully', image: `${process.env.REACT_APP_API_URL}${newImagePath}` });
    });
  });
});
// Delete a product (Admin only)
app.delete('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
  console.log('DELETE /api/products/:id', req.params);
  const { id } = req.params;

  db.query('SELECT image FROM products WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const imageFile = results[0].image ? path.basename(results[0].image) : null;
    const imagePath = imageFile ? path.join(uploadsPath, imageFile) : null;

    db.query('DELETE FROM products WHERE id = ?', [id], (err) => {
      if (err) {
        console.error('Error deleting product:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (imagePath && fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
          console.log(`Deleted image file: ${imagePath}`);
        } catch (unlinkErr) {
          console.error(`Error deleting image file ${imagePath}:`, unlinkErr);
        }
      }

      console.log('Product deleted:', { id });
      return res.json({ message: 'Product deleted successfully' });
    });
  });
});
// Update a product (Admin only)
app.put('/api/products/:id', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  console.log('PUT /api/products/:id', req.params, req.body, req.file);
  const { id } = req.params;
  const { name, price, quantity, category_id, updateImage } = req.body;
  const file = req.file;

  // Validate required fields
  if (!name || !price || !quantity || !category_id) {
    return res.status(400).json({ error: 'Product name, price, quantity, and category are required' });
  }
  if (parseFloat(price) <= 0 || parseInt(quantity) < 0) {
    return res.status(400).json({ error: 'Price must be positive and quantity cannot be negative' });
  }

  // Validate category
  db.query('SELECT id FROM categories WHERE id = ?', [category_id], (err, results) => {
    if (err) {
      console.error('Error validating category:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid category_id' });
    }

    // Fetch existing product to get current image
    db.query('SELECT image FROM products WHERE id = ?', [id], (err, productResults) => {
      if (err) {
        console.error('Error fetching product:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (productResults.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const currentImage = productResults[0].image;
      let newImagePath = currentImage; 

      // Handle image update only if updateImage is true and a file is provided
      if (updateImage === 'true' && file) {
        newImagePath = `uploads/${file.filename}`;
        // Delete old image file if it exists
        if (currentImage) {
          const oldImagePath = path.join(uploadsPath, path.basename(currentImage));
          try {
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
              console.log(`Deleted old image file: ${oldImagePath}`);
            }
          } catch (unlinkErr) {
            console.error(`Error deleting old image file ${oldImagePath}:`, unlinkErr);
          }
        }
      }

      // Update product in database
      db.query(
        'UPDATE products SET name = ?, price = ?, quantity = ?, category_id = ?, image = ? WHERE id = ?',
        [name, parseFloat(price), parseInt(quantity), category_id, newImagePath, id],
        (err) => {
          if (err) {
            console.error('Error updating product:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          // Fetch updated product details
          db.query(
            'SELECT id, name, price, quantity, category_id, image, supplier_id FROM products WHERE id = ?',
            [id],
            (err, updatedProduct) => {
              if (err) {
                console.error('Error fetching updated product:', err);
                return res.status(500).json({ error: 'Database error' });
              }

              // Ensure image URL is fully qualified
              const product = updatedProduct[0];
              if (product.image) {
                product.image = `${process.env.REACT_APP_API_URL}/${product.image}`;
              }

              console.log('Product updated:', product);
              return res.json(product);
            }
          );
        }
      );
    });
  });
});
// Supplier Routes
app.get('/api/suppliers', authenticateToken, requireAdmin, (req, res) => {
  console.log('GET /api/suppliers');
  const query = `
    SELECT id, name, contact_email, contact_phone, address
    FROM suppliers
    ORDER BY name
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching suppliers:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('Suppliers fetched:', results);
    res.json(results);
  });
});

app.post('/api/suppliers', authenticateToken, requireAdmin, (req, res) => {
  console.log('POST /api/suppliers body:', req.body);
  const { name, contact_email, contact_phone, address } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Supplier name is required' });
  }

  if (contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (contact_phone && !/^\+?\d{10,15}$/.test(contact_phone)) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  const query = 'INSERT INTO suppliers (name, contact_email, contact_phone, address) VALUES (?, ?, ?, ?)';
  db.query(query, [name, contact_email || null, contact_phone || null, address || null], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Supplier name already exists' });
      }
      console.error('Error creating supplier:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    const supplierId = result.insertId;
    console.log('Supplier created:', { id: supplierId, name, contact_email, contact_phone, address });
    res.status(201).json({ id: supplierId, name, contact_email, contact_phone, address });
  });
});

app.put('/api/suppliers/:id', authenticateToken, requireAdmin, (req, res) => {
  console.log('PUT /api/suppliers/:id', req.params, req.body);
  const { id } = req.params;
  const { name, contact_email, contact_phone, address } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Supplier name is required' });
  }

  if (contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (contact_phone && !/^\+?\d{10,15}$/.test(contact_phone)) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  db.query('SELECT id FROM suppliers WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error validating supplier:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const query = 'UPDATE suppliers SET name = ?, contact_email = ?, contact_phone = ?, address = ? WHERE id = ?';
    db.query(query, [name, contact_email || null, contact_phone || null, address || null, id], (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Supplier name already exists' });
        }
        console.error('Error updating supplier:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      console.log('Supplier updated:', { id, name, contact_email, contact_phone, address });
      res.json({ id, name, contact_email, contact_phone, address });
    });
  });
});

app.delete('/api/suppliers/:id', authenticateToken, requireAdmin, (req, res) => {
  console.log('DELETE /api/suppliers/:id', req.params);
  const { id } = req.params;

  db.query('SELECT id FROM suppliers WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error validating supplier:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    db.beginTransaction(err => {
      if (err) {
        console.error('Error starting transaction:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      db.query('UPDATE categories SET supplier_id = NULL WHERE supplier_id = ?', [id], err => {
        if (err) {
          console.error('Error unlinking categories from supplier:', err);
          return db.rollback(() => {
            res.status(500).json({ error: 'Database error' });
          });
        }

        db.query('UPDATE products SET supplier_id = NULL WHERE supplier_id = ?', [id], err => {
          if (err) {
            console.error('Error unlinking products from supplier:', err);
            return db.rollback(() => {
              res.status(500).json({ error: 'Database error' });
            });
          }

          db.query('DELETE FROM suppliers WHERE id = ?', [id], err => {
            if (err) {
              console.error('Error deleting supplier:', err);
              return db.rollback(() => {
                res.status(500).json({ error: 'Database error' });
              });
            }

            db.commit(err => {
              if (err) {
                console.error('Error committing transaction:', err);
                return db.rollback(() => {
                  res.status(500).json({ error: 'Database error' });
                });
              }
              console.log('Supplier deleted:', { id });
              res.json({ message: 'Supplier deleted successfully' });
            });
          });
        });
      });
    });
  });
});

app.get('/api/suppliers-with-products', authenticateToken, requireAdmin, (req, res) => {
  console.log('GET /api/suppliers-with-products');
  const supplierQuery = `
    SELECT s.id, s.name, s.contact_email, s.contact_phone, s.address
    FROM suppliers s
    ORDER BY s.name
  `;
  db.query(supplierQuery, (err, suppliers) => {
    if (err) {
      console.error('Error fetching suppliers:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const productQuery = `
      SELECT p.id, p.name, p.price, p.quantity, p.supplier_id, p.image,
             c.name AS category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.supplier_id IS NOT NULL
    `;
    db.query(productQuery, (err, products) => {
      if (err) {
        console.error('Error fetching products:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      const suppliersWithProducts = suppliers.map(supplier => ({
        ...supplier,
        products: products
          .filter(product => product.supplier_id === supplier.id)
          .map(product => ({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            quantity: product.quantity,
            category: product.category || 'Unknown',
            image: product.image ? `${process.env.REACT_APP_API_URL}/${product.image}` : null
          }))
      }));

      console.log('Suppliers with products fetched:', suppliersWithProducts);
      res.json(suppliersWithProducts);
    });
  });
});

// Product Routes
app.get('/api/products', authenticateToken, requireAdmin, (req, res) => {
  console.log('GET /api/products');
  const query = `
    SELECT p.id, p.name, p.price, p.quantity, p.image, p.category_id, p.supplier_id,
           c.name AS category, s.name AS supplier
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN suppliers s ON p.supplier_id = s.id
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    const products = results.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category || 'Unknown',
      category_id: product.category_id,
      supplier: product.supplier || 'None',
      supplier_id: product.supplier_id,
      price: parseFloat(product.price),
      quantity: product.quantity,
      rating: 4.0,
      image: product.image ? `${process.env.REACT_APP_API_URL}/${product.image}` : null
    }));
    console.log('Products fetched:', products);
    return res.json(products);
  });
});

// Public endpoint to get products (no authentication required)
app.get('/api/public/products', (req, res) => {
  const cacheKey = 'public_products';
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    console.log('Cache hit for public products');
    return res.json(cachedData);
  }

  console.log('GET /api/public/products');
  const query = `
    SELECT p.id, p.name, p.price, p.quantity, p.image, p.category_id, p.supplier_id,
           c.name AS category, s.name AS supplier
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN suppliers s ON p.supplier_id = s.id
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching public products:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    console.log('Raw query results:', results);
    const products = results.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category || 'Unknown',
      category_id: product.category_id,
      supplier: product.supplier || 'None',
      supplier_id: product.supplier_id,
      price: parseFloat(product.price),
      quantity: product.quantity,
      rating: 4.0,
      image: product.image ? `${process.env.REACT_APP_API_URL}/${product.image}` : null
    }));
    console.log('Public products fetched:', products);
    cache.set(cacheKey, products);
    return res.json(products);
  });
});

app.post('/api/products', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  console.log('POST /api/products body:', req.body, 'file:', req.file);
  const { name, price, quantity, category_id } = req.body;
  const image = req.file ? `uploads/${req.file.filename}` : null;

  if (!name || !price || !quantity || !category_id) {
    return res.status(400).json({ error: 'Name, price, quantity, and category_id are required' });
  }

  const parsedPrice = parseFloat(price);
  const parsedQuantity = parseInt(quantity, 10);
  const parsedCategoryId = parseInt(category_id, 10);

  if (isNaN(parsedPrice) || isNaN(parsedQuantity) || isNaN(parsedCategoryId)) {
    return res.status(400).json({ error: 'Invalid price, quantity, or category_id' });
  }

  db.query('SELECT id, supplier_id FROM categories WHERE id = ?', [parsedCategoryId], (err, results) => {
    if (err) {
      console.error('Error validating category:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid category_id' });
    }

    const supplier_id = results[0].supplier_id;

    const query = 'INSERT INTO products (name, price, quantity, image, category_id, supplier_id) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [name, parsedPrice, parsedQuantity, image, parsedCategoryId, supplier_id], (err, result) => {
      if (err) {
        console.error('Error adding product:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      console.log('Product added:', { id: result.insertId, name, price: parsedPrice, quantity: parsedQuantity, image, category_id: parsedCategoryId, supplier_id });
      cache.del('public_products');
      return res.json({ id: result.insertId, name, price: parsedPrice, quantity: parsedQuantity, image: image ? `${process.env.REACT_APP_API_URL}/${image}` : null, category_id: parsedCategoryId, supplier_id });
    });
  });
});

app.put('/api/products/:id', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  console.log('PUT /api/products/:id body:', req.body, 'file:', req.file);
  const { id } = req.params;
  const { name, price, quantity, category_id } = req.body;
  const image = req.file ? `uploads/${req.file.filename}` : req.body.image;

  if (!name || !price || !quantity || !category_id) {
    return res.status(400).json({ error: 'Name, price, quantity, and category_id are required' });
  }

  const parsedPrice = parseFloat(price);
  const parsedQuantity = parseInt(quantity, 10);
  const parsedCategoryId = parseInt(category_id, 10);

  if (isNaN(parsedPrice) || isNaN(parsedQuantity) || isNaN(parsedCategoryId)) {
    return res.status(400).json({ error: 'Invalid price, quantity, or category_id' });
  }

  db.query('SELECT id, supplier_id FROM categories WHERE id = ?', [parsedCategoryId], (err, results) => {
    if (err) {
      console.error('Error validating category:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid category_id' });
    }

    db.query('SELECT image FROM products WHERE id = ?', [id], (err, productResults) => {
      if (err) {
        console.error('Error fetching product image:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (productResults.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      const oldImagePath = productResults[0].image ? path.join(uploadsPath, path.basename(productResults[0].image)) : null;

      const supplier_id = results[0].supplier_id;

      const query = 'UPDATE products SET name = ?, price = ?, quantity = ?, image = ?, category_id = ?, supplier_id = ? WHERE id = ?';
      db.query(query, [name, parsedPrice, parsedQuantity, image, parsedCategoryId, supplier_id, id], err => {
        if (err) {
          console.error('Error updating product:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (req.file && oldImagePath && fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
            console.log(`Deleted old image file: ${oldImagePath}`);
          } catch (unlinkErr) {
            console.error(`Error deleting old image file ${oldImagePath}:`, unlinkErr);
          }
        }

        console.log('Product updated:', { id, name, price: parsedPrice, quantity: parsedQuantity, image, category_id: parsedCategoryId, supplier_id });
        cache.del('public_products');
        return res.json({ id, name, price: parsedPrice, quantity: parsedQuantity, image: image ? `${process.env.REACT_APP_API_URL}/${image}` : null, category_id: parsedCategoryId, supplier_id });
      });
    });
  });
});

app.delete('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
  console.log('DELETE /api/products/:id', req.params);
  const { id } = req.params;

  db.query('SELECT image FROM products WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching product image:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const imagePath = results[0].image ? path.join(UploadsPath, path.basename(results[0].image)) : null;

    db.query('DELETE FROM products WHERE id = ?', [id], err => {
      if (err) {
        console.error('Error deleting product:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (imagePath && fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
          console.log(`Deleted image file: ${imagePath}`);
        } catch (unlinkErr) {
          console.error(`Error deleting image file ${imagePath}:`, unlinkErr);
        }
      }

      console.log('Product deleted:', { id });
      cache.del('public_products');
      return res.json({ message: 'Product deleted' });
    });
  });
});

// Checkout endpoint
app.post('/api/checkout', authenticateToken, (req, res) => {
  console.log('POST /api/checkout body:', req.body, 'user:', req.user);
  const { cart, phoneNumber } = req.body;
  const userId = req.user.id;
  const userEmail = req.user.email;

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty or invalid' });
  }

  if (!phoneNumber || !/^\+2547\d{8}$|^07\d{8}$/.test(phoneNumber)) {
    return res.status(400).json({ error: 'Valid Kenyan phone number is required (e.g., +2547XXXXXXXX or 07XXXXXXXX)' });
  }

  db.beginTransaction(err => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    let stockValid = true;
    let stockError = '';
    const checkStockPromises = cart.map(item => {
      return new Promise((resolve, reject) => {
        if (!item.id || !item.quantity || item.quantity <= 0) {
          stockValid = false;
          stockError = 'Invalid cart item';
          return reject(new Error(stockError));
        }
        db.query('SELECT quantity, name FROM products WHERE id = ?', [item.id], (err, results) => {
          if (err) {
            console.error('Error checking stock:', err);
            stockValid = false;
            stockError = 'Database error';
            return reject(err);
          }
          if (results.length === 0) {
            stockValid = false;
            stockError = `Product ${item.id} not found`;
            return reject(new Error(stockError));
          }
          if (results[0].quantity < item.quantity) {
            stockValid = false;
            stockError = `Insufficient stock for ${results[0].name}: ${results[0].quantity} available`;
            return reject(new Error(stockError));
          }
          resolve();
        });
      });
    });

    Promise.all(checkStockPromises)
      .then(() => {
        if (!stockValid) {
          db.rollback(() => {
            console.error('Stock validation failed:', stockError);
            return res.status(400).json({ error: stockError });
          });
          return;
        }

        const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        db.query(
          'INSERT INTO transactions (user_id, total_amount) VALUES (?, ?)',
          [userId, totalAmount],
          (err, transactionResult) => {
            if (err) {
              console.error('Error creating transaction:', err);
              return db.rollback(() => {
                res.status(500).json({ error: 'Database error' });
              });
            }
            const transactionId = transactionResult.insertId;

            const insertItemsPromises = cart.map(item => {
              return new Promise((resolve, reject) => {
                db.query(
                  'INSERT INTO transaction_items (transaction_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                  [transactionId, item.id, item.quantity, item.price],
                  err => {
                    if (err) {
                      console.error('Error inserting transaction item:', err);
                      return reject(err);
                    }
                    db.query(
                      'UPDATE products SET quantity = quantity - ? WHERE id = ?',
                      [item.quantity, item.id],
                      err => {
                        if (err) {
                          console.error('Error updating product quantity:', err);
                          return reject(err);
                        }
                        resolve();
                      }
                    );
                  }
                );
              });
            });

            Promise.all(insertItemsPromises)
              .then(() => {
                const mailOptions = {
                  from: userEmail,
                  to: process.env.EMAIL_USER,
                  subject: `New Transaction #${transactionId} from ${userEmail}`,
                  text: `
                    New transaction received:
                    Transaction ID: ${transactionId}
                    User: ${userEmail}
                    Phone: ${phoneNumber}
                    Total Amount: KSh ${totalAmount.toLocaleString()}
                    Items:
                    ${cart.map(item => `- ${item.name}: ${item.quantity} x KSh ${item.price.toLocaleString()} = KSh ${(item.quantity * item.price).toLocaleString()}`).join('\n')}
                  `
                };

                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    console.error('Error sending email:', error);
                  } else {
                    console.log('Email sent:', info.response);
                  }

                  db.commit(err => {
                    if (err) {
                      console.error('Error committing transaction:', err);
                      return db.rollback(() => {
                        res.status(500).json({ error: 'Database error' });
                      });
                    }
                    console.log('Checkout successful:', { transactionId, userId, userEmail, totalAmount, phoneNumber });
                    cache.del('public_products');
                    res.json({ message: 'Checkout successful', transactionId });
                  });
                });
              })
              .catch(err => {
                console.error('Error in transaction items:', err);
                db.rollback(() => {
                  res.status(500).json({ error: 'Database error' });
                });
              });
          }
        );
      })
      .catch(err => {
        console.error('Stock validation error:', err);
        db.rollback(() => {
          res.status(400).json({ error: err.message });
        });
      });
  });
});

// Get all users (Admin only)
app.get('/api/users', authenticateToken, requireAdmin, (req, res) => {
  console.log('GET /api/users');
  db.query('SELECT id, name FROM users', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('Users fetched:', results);
    res.json(results);
  });
});

// Get transactions (Admin only)
app.get('/api/transactions', authenticateToken, requireAdmin, (req, res) => {
  console.log('GET /api/transactions');
  const transactionQuery = `
    SELECT t.id, t.user_id, t.total_amount, t.created_at, u.name as user_name
    FROM transactions t
    LEFT JOIN users u ON t.user_id = u.id
    ORDER BY t.created_at DESC
  `;
  db.query(transactionQuery, (err, transactions) => {
    if (err) {
      console.error('Error fetching transactions:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const itemsQuery = `
      SELECT ti.transaction_id, ti.product_id, ti.quantity, ti.price, p.name as product_name
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
    `;
    db.query(itemsQuery, (err, items) => {
      if (err) {
        console.error('Error fetching transaction items:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      const transactionsWithItems = transactions.map(transaction => ({
        ...transaction,
        total_amount: parseFloat(transaction.total_amount),
        items: items
          .filter(item => item.transaction_id === transaction.id)
          .map(item => ({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            price: parseFloat(item.price)
          }))
      }));

      console.log('Transactions fetched:', transactionsWithItems);
      res.json(transactionsWithItems);
    });
  });
});

app.put('/api/transactions/:id', authenticateToken, requireAdmin, (req, res) => {
  console.log('PUT /api/transactions/:id', req.params, req.body);
  const { id } = req.params;
  const { total_amount, user_id } = req.body;

  if (!total_amount || total_amount <= 0) {
    return res.status(400).json({ error: 'Valid total_amount is required' });
  }

  db.query('SELECT id FROM transactions WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error validating transaction:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const queryParams = [];
    let query = 'UPDATE transactions SET total_amount = ?';
    queryParams.push(parseFloat(total_amount));

    if (user_id === null || user_id === '') {
      query += ', user_id = NULL';
    } else {
      query += ', user_id = ?';
      queryParams.push(parseInt(user_id, 10));
    }

    query += ' WHERE id = ?';
    queryParams.push(id);

    db.query(query, queryParams, err => {
      if (err) {
        console.error('Error updating transaction:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      console.log('Transaction updated:', { id, total_amount, user_id });
      res.json({ id, total_amount: parseFloat(total_amount), user_id });
    });
  });
});

app.delete('/api/transactions/:id', authenticateToken, requireAdmin, (req, res) => {
  console.log('DELETE /api/transactions/:id', req.params);
  const { id } = req.params;

  db.query('SELECT id FROM transactions WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error validating transaction:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    db.beginTransaction(err => {
      if (err) {
        console.error('Error starting transaction:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      db.query('DELETE FROM transaction_items WHERE transaction_id = ?', [id], err => {
        if (err) {
          console.error('Error deleting transaction items:', err);
          return db.rollback(() => {
            res.status(500).json({ error: 'Database error' });
          });
        }

        db.query('DELETE FROM transactions WHERE id = ?', [id], err => {
          if (err) {
            console.error('Error deleting transaction:', err);
            return db.rollback(() => {
              res.status(500).json({ error: 'Database error' });
            });
          }

          db.commit(err => {
            if (err) {
              console.error('Error committing transaction:', err);
              return db.rollback(() => {
                res.status(500).json({ error: 'Database error' });
              });
            }
            console.log('Transaction deleted:', { id });
            res.json({ message: 'Transaction deleted successfully' });
          });
        });
      });
    });
  });
});

// Start Server
app.listen(process.env.PORT || 3001, () => {
  console.log('Server running');
});



