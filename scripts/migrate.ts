/**
 * Direct migration — creates subscriptions and nutrition_logs tables if they don't exist.
 * Run: npx tsx scripts/migrate.ts
 */
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const SQL = `
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'trialing',
  trial_ends_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nutrition_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  log_date DATE NOT NULL,
  food_name TEXT NOT NULL,
  calories INTEGER,
  protein_g DECIMAL(6,1),
  carbs_g DECIMAL(6,1),
  fat_g DECIMAL(6,1),
  serving_size TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_programs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 90
);

CREATE TABLE IF NOT EXISTS workout_completions_v2 (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  day_number INTEGER NOT NULL,
  workout_name TEXT,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day_number)
);
`;

async function main() {
  console.log('Running migration...');
  const client = await pool.connect();
  try {
    await client.query(SQL);
    console.log('✅ Migration complete. Tables created (if not already present):');
    console.log('   - subscriptions');
    console.log('   - nutrition_logs');
    console.log('   - user_programs');
    console.log('   - workout_completions_v2');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
