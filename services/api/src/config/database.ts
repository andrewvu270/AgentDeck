import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  // Only log queries in development (avoid logging sensitive data in production)
  if (process.env.NODE_ENV !== 'production') {
    console.log('Executed query', { text, duration, rows: res.rowCount });
  }
  
  return res;
};

export const getClient = () => pool.connect();

export default pool;
