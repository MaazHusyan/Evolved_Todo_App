const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.resolve(__dirname, '.env.local');
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key === 'DATABASE_URL') process.env.DATABASE_URL = val;
    }
  });
} catch (e) {
  console.log("Could not read .env.local: " + e.message);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not found in env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function inspect() {
  try {
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log("Tables:", tables.rows.map(r => r.table_name));

    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user';
    `);
    console.log("\nColumns in 'user' table:", res.rows.map(r => r.column_name));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

inspect();
