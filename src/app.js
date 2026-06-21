const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')

const { helmetMiddleware, globalLimiter, corsMiddleware } = require('./middleware/security');

const authRoutes = require('./routes/authRoutes');
const problemRoutes = require('./routes/problemRoutes');
const userTrackingRoutes = require('./routes/userTrackingRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express()

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use('/api/', globalLimiter);
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')))

app.get('/health', async(req, res) => {
  res.status(200).json({status: 'UP', environment: process.env.NODE_ENV});
});

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/tracking', userTrackingRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    }
  });
});

module.exports = app;
