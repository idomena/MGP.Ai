#!/usr/bin/env tsx
/**
 * Re-sync all gif_url values in exercises_library.
 *
 * Steps:
 *   1. NULLs every gif_url in the table (forces a full re-fetch)
 *   2. Hands off to the existing sync-exercisedb logic which fills NULLs
 *
 * Run:
 *   npx tsx scripts/resync-gifs.ts
 *
 * Env required: DATABASE_URL, EXERCISE_API_KEY
 */

import pg from "pg";
import "dotenv/config";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const REQUIRED = ["DATABASE_URL", "EXERCISE_API_KEY"];
for (const k of REQUIRED) {
  if (!process.env[k]) { console.error(`❌  Missing env var: ${k}`); process.exit(1); }
}

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log("\n🔄  Re-sync GIF URLs — full wipe + re-fetch\n" + "─".repeat(52));

  // Step 1: NULL out every gif_url so sync-exercisedb picks them all up
  const client = await pool.connect();
  try {
    const { rowCount } = await client.query(
      `UPDATE exercises_library SET gif_url = NULL`
    );
    console.log(`✅  Cleared gif_url on ${rowCount ?? "all"} rows\n`);
  } finally {
    client.release();
    await pool.end();
  }

  // Step 2: Run the main sync script (builds correct v2.exercisedb.io URLs)
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const syncScript = path.join(__dirname, "sync-exercisedb.ts");

  console.log("🏋️  Running sync-exercisedb.ts…\n");
  execSync(`npx tsx "${syncScript}"`, { stdio: "inherit" });
}

main().catch(err => {
  console.error("Fatal:", err.message);
  pool.end();
  process.exit(1);
});
