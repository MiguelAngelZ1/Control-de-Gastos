const { dbUrl } = require('./config');
const { Pool } = require('pg');

if (!dbUrl) {
  throw new Error('DATABASE_URL no está definida en las variables de entorno');
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;
