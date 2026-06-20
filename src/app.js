const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')
const authRoutes = require('./routes/authRoutes');
const problemRoutes = require('./routes/problemRoutes');

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'public')))

app.get('/health', async(req, res) => {
  res.status(200).json({status: 'UP', environment: process.env.NODE_ENV});
});

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    }
  });
});

module.exports = app;
