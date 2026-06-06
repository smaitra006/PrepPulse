const jwt = require('jsonwebtoken')

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnlly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  });
};

module.exports = { generateToken, setTokenCookie };
