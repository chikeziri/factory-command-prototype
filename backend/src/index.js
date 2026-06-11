const express = require('express');
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

// Import simulator
const { startSimulator } = require('./simulator');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const { JWT_SECRET } = require('./middleware/auth');

// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(limiter);

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
  console.log(`🚀 Factory Command API running on port ${PORT}`);
  console.log(`📡 Socket.io ready for real-time updates`);

  // Start data simulator for demo
  if (process.env.DEMO_MODE === 'true') {
    console.log('🎮 Demo mode enabled — starting data simulator...');
    startSimulator(io, prisma);
  }
});

module.exports = { app, io, prisma };
