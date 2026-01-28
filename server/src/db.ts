import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'legal_diary',
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || ''),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

console.log('🔌 Database config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  passwordLength: process.env.DB_PASSWORD?.length,
  ssl: process.env.DB_SSL === 'true',
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully at:', res.rows[0].now);
  }
});

// Disable RLS for backend operations
pool.on('connect', async (client) => {
  try {
    await client.query('SET row_security = off');
  } catch (error) {
    // Ignore if RLS doesn't exist
  }
});

export default pool;
