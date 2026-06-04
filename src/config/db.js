const {Pool, Query} = require('pg');
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  coonnectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  if(process.env.NODE_ENV == 'development') {
    console.log('Database Pool: New client allocated');
  }
})

pool.on('error', (err) => {
  console.error('Database pool error: unexpected failure on ideal lcient', err);
})

module.exports = {
  query: (text, para,s) => pool.query(text, params),
  pool
};
