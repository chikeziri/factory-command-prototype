const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const attendanceRoutes = require('./routes/attendance');
const accessRoutes = require('./routes/access');
const machineRoutes = require('./routes/machines');
const inventoryRoutes = require('./routes/inventory');
const sensorRoutes = require('./routes/sensors');
const assetRoutes = require('./routes/assets');
const erpRoutes = require('./routes/erp');
const alertRoutes = require('./routes/alerts');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
const activityRoutes = require('./routes/activity');

// Import simulator
const { startSimulator } = require('./simulator');
const { corsOrigin } = require('./lib/cors');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const { JWT_SECRET } = require('./middleware/auth');

// Rate limit login attempts only — the dashboard polls often in demo mode
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many login attempts. Please wait a few minutes and try again.' }
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.DEMO_MODE === 'true' ? 10000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later.' }
  },
  skip: (req) => req.path === '/health'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/v1/auth/login', authLimiter);
app.use(apiLimiter);

// Attach io to requests
app.use((req, res, next) => {
  req.io = io;
  req.prisma = prisma;
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/access', accessRoutes);
app.use('/api/v1/machines', machineRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/sensors', sensorRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/erp', erpRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/activity', activityRoutes);

// Socket.io connection handling
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('subscribe', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined ${room}`);
  });

  socket.on('unsubscribe', (room) => {
    socket.leave(room);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
      requestId: req.id || 'unknown'
    },
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 SIFOS API running on port ${PORT}`);
  console.log(`📡 Socket.io ready for real-time updates`);

  // Start data simulator for demo
  if (process.env.DEMO_MODE === 'true') {
    console.log('🎮 Demo mode enabled — starting data simulator...');
    startSimulator(io, prisma);
  }
});

module.exports = { app, io, prisma };
