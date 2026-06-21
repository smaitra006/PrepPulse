const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const helmetMiddleware = helmet();

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts, please try again after an hour.' }
});

const corsMiddleware = cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://yourproductiondomain.com' : 'http://localhost:3000',
    credentials: true
});

module.exports = { helmetMiddleware, globalLimiter, authLimiter, corsMiddleware };
