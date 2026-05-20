require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const progressRoutes = require('./routes/progressRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);

// Serve React build static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // Wildcard redirect for client-side single page app routing
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    } else {
      res.status(404).json({ message: 'API endpoint not found' });
    }
  });
} else {
  // Base route for development
  app.get('/', (req, res) => {
    res.json({ message: 'Online Course Platform API is running...' });
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Something went wrong on the server',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/online-course-platform';

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const { autoSeedIfEmpty } = require('./autoSeed');

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected successfully.');
    await autoSeedIfEmpty();
  })
  .catch((err) => {
    console.error('Database connection failed: Please make sure local MongoDB is running at mongodb://127.0.0.1:27017.', err.message);
  });
