const app = require('./src/app')
const {pool} = require('./src/config/db')
require('dotenv').config()

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connectivity verified successfully');

    app.listen(PORT, () => {
      console.log(`PrepPulse server running natively on https://localhost:${PORT}`);
    })
  }
  catch(error) {
    console.error('Database connectivity failed. Terminating process...');
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
