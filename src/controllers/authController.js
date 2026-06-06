const bycrypt = require('bcrypt');
const { pool } = require('../config/db');
const { generateToken, setTokenCookie } = require('../utils/auth')

const register = async(req, res) => {
  const { username, email, password } = req.body;

  if(!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const salt = await bycrypt.genSalt(10);
    const passwordHash = await bycrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, passwordHash]
    );

    const newUser = result.rows[0];

    const token = generateToken(newUser.id);
    setTokenCookie(res, token);

    res.status(201).json({ mesage: 'User registered successfully', user: newUser });
  }
  catch(error) {
    if(error.code === '23505') {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    throw error;
  }
}

const login = async (req, res) => {
  const { email, password } = req.body;

  if(!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if(!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isValidPassword = await bycrypt.compare(password, user.password_hash);

  if(!isValidPassword) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = generateToken(user.id);
  setTokenCookie(res, token);

  res.status(200).json({
        message: 'Logged in successfully',
        user: { id: user.id, username: user.username, email: user.email }
    });
}

const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
}

// Protected route
const getMe = async (req, res) => {
    const result = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [req.user.id]);
    res.status(200).json({ user: result.rows[0] });
};

module.exports = { register, login, logout, getMe };
