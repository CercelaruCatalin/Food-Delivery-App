// config/db.js
import PostgresAdapter from "@auth/pg-adapter"
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export default pool;

export const adapter = PostgresAdapter(pool);