const { Pool } = require('pg');

const pool = process.env.DATABASE_URL
    ? new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
      })
    : new Pool({
          host: process.env.PGHOST || 'localhost',
          port: Number(process.env.PGPORT) || 5432,
          user: process.env.PGUSER || 'postgres',
          password: process.env.PGPASSWORD || 'postgres',
          database: process.env.PGDATABASE || 'recipeverse',
      });

pool.on('error', (err) => {
    console.error('Unexpected PG pool error', err);
});

const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
