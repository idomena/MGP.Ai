#!/usr/bin/env tsx
/**
 * ExerciseDB → Supabase Sync  (direct Postgres — bypasses PostgREST cache)
 *
 * Run: npm run exercise:sync-db
 *
 * Uses DATABASE_URL (direct Postgres) for all writes so schema changes
 * are reflected immediately without waiting for PostgREST to reload.
 */

import pg from "pg";
import "dotenv/config";

// ── Validation ────────────────────────────────────────────────────────────────
const REQUIRED = ["DATABASE_URL", "EXERCISE_API_KEY"];
for (const k of REQUIRED) {
  if (!process.env[k]) { console.error(`❌  Missing env var: ${k}`); process.exit(1); }
}

// ── Postgres pool ─────────────────────────────────────────────────────────────
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ── ExerciseDB client ─────────────────────────────────────────────────────────
const RAPIDAPI_HOST = "exercisedb.p.rapidapi.com";
const EDB_HEADERS = {
  "X-RapidAPI-Key":  process.env.EXERCISE_API_KEY!,
  "X-RapidAPI-Host": RAPIDAPI_HOST,
};

interface EDBExercise {
  id: string; name: string;
  // gifUrl is present on paid ExerciseDB plans only.
  // On free tier the field is absent from the response entirely.
  gifUrl?: string;
  target: string; bodyPart: string; equipment: string;
  secondaryMuscles: string[]; instructions: string[];
}

async function edbSearch(query: string, limit = 10): Promise<EDBExercise[]> {
  const url = `https://${RAPIDAPI_HOST}/exercises/name/${encodeURIComponent(query.toLowerCase())}?limit=${limit}&offset=0`;
  const res = await fetch(url, { headers: EDB_HEADERS });
  if (!res.ok) { console.warn(`  ⚠  ExerciseDB ${res.status} for "${query}"`); return []; }
  const json = await res.json();
  return Array.isArray(json) ? json : [];
}

/** Fetch all exercises from ExerciseDB in one shot (PRO plan — no per-page cap).
 *  The API supports up to 1 500 in a single request; default 1 400 covers the
 *  full catalogue with headroom. */
async function fetchAllExercises(limit = 1400): Promise<EDBExercise[]> {
  const url = `https://${RAPIDAPI_HOST}/exercises?limit=${limit}&offset=0`;
  const res = await fetch(url, { headers: EDB_HEADERS });
  if (!res.ok) {
    throw new Error(`ExerciseDB ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  return Array.isArray(json) ? json : [];
}

function bestMatch(results: EDBExercise[], queries: string[]): EDBExercise | null {
  if (!results.length) return null;
  for (const q of queries) {
    const exact = results.find(r => r.name.toLowerCase() === q.toLowerCase());
    if (exact) return exact;
  }
  return results[0];
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ── Alias map: exercises_library title → ExerciseDB search queries ────────────
const ALIASES: Record<string, string[]> = {
  "ab wheel rollout":          ["ab wheel rollout", "rollout"],
  "barbell bench press":       ["barbell bench press", "bench press"],
  "barbell bicep curl":        ["barbell curl", "barbell bicep curl"],
  "barbell row":               ["barbell bent over row", "bent over row"],
  "barbell squat":             ["barbell squat", "squat"],
  "burpees":                   ["burpee"],
  "cable crunch":              ["cable seated crunch", "cable kneeling crunch"],
  "deadlift":                  ["barbell deadlift", "deadlift"],
  "dips":                      ["chest dip", "dip"],
  "dumbbell bench press":      ["dumbbell bench press", "dumbbell press"],
  "dumbbell bicep curl":       ["dumbbell bicep curl", "dumbbell curl"],
  "dumbbell fly":              ["dumbbell fly", "dumbbell flye"],
  "dumbbell row":              ["dumbbell bent over row", "dumbbell row"],
  "dumbbell shoulder press":   ["dumbbell arnold press", "seated dumbbell shoulder press"],
  "face pull":                 ["cable rear delt row (stirrups)", "cable rear delt row"],
  "farmer's carry":            ["farmer walk", "farmers walk"],
  "front raise":               ["dumbbell front raise", "barbell front raise"],
  "hanging leg raises":        ["hanging leg raise", "hanging knee raise"],
  "hip thrust":                ["barbell hip thrust", "hip thrust"],
  "incline dumbbell press":    ["incline dumbbell press", "incline press"],
  "kettlebell swing":          ["kettlebell swing"],
  "lat pulldown":              ["lat pulldown", "cable lat pulldown"],
  "lateral raise":             ["cable lateral raise", "dumbbell lateral raise"],
  "leg curl (machine)":        ["leg curl", "lying leg curl"],
  "leg extension":             ["leg extension", "lever leg extension"],
  "leg press":                 ["leg press", "sled leg press"],
  "overhead press (barbell)":  ["barbell overhead press", "overhead press"],
  "plank":                     ["plank", "front plank"],
  "pull-up":                   ["pull-up", "pullup"],
  "push-up":                   ["push-up", "pushup"],
  "rear delt fly":             ["rear delt fly", "dumbbell reverse fly"],
  "romanian deadlift":         ["barbell romanian deadlift", "romanian deadlift"],
  "russian twist":             ["russian twist"],
  "seated cable row":          ["cable low seated row", "cable seated high row"],
  "skull crushers":            ["barbell lying triceps extension skull crusher", "skull crusher"],
  "triceps pushdown":          ["cable triceps pushdown", "triceps pushdown"],
  "walking lunges":            ["walking lunge", "lunge"],
  "z-bar curl":                ["ez barbell curl", "ez bar curl"],
};

// ── Step 1: ensure columns via direct SQL ─────────────────────────────────────
async function ensureColumns(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE exercises_library
        ADD COLUMN IF NOT EXISTS gif_url            TEXT,
        ADD COLUMN IF NOT EXISTS target_muscle      TEXT,
        ADD COLUMN IF NOT EXISTS instructions_list  TEXT[];
    `);
    // Verify they now exist
    const { rows } = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'exercises_library'
        AND column_name IN ('gif_url','target_muscle','instructions_list')
      ORDER BY column_name;
    `);
    const cols = rows.map((r: any) => r.column_name);
    console.log(`  ✓  Columns present: ${cols.join(", ")}\n`);
  } finally {
    client.release();
  }
}

// ── Step 2: fetch rows from DB ────────────────────────────────────────────────
interface DBRow { id: string; title: string; muscle_group: string }

/** Pass `all=true` to resync every row (useful after upgrading to PRO plan). */
async function fetchRows(all = false): Promise<DBRow[]> {
  const client = await pool.connect();
  try {
    const sql = all
      ? `SELECT id, title, muscle_group FROM exercises_library ORDER BY title`
      : `SELECT id, title, muscle_group FROM exercises_library WHERE gif_url IS NULL ORDER BY title`;
    const { rows } = await client.query(sql);
    return rows;
  } finally {
    client.release();
  }
}

// ── Step 3: update one row + verify ──────────────────────────────────────────
interface SyncResult {
  title: string; success: boolean;
  gifUrl?: string; target?: string; steps?: number; reason?: string;
}

async function syncRow(row: DBRow, preMatch?: EDBExercise): Promise<SyncResult> {
  const queries = ALIASES[row.title.toLowerCase()] ?? [row.title];

  // Use pre-fetched match (bulk mode) or search ExerciseDB by name
  let match: EDBExercise | null = preMatch ?? null;
  if (!match) {
    for (const q of queries) {
      const results = await edbSearch(q);
      match = bestMatch(results, queries);
      if (match) break;
      await sleep(150);
    }
  }

  if (!match) {
    return { title: row.title, success: false, reason: "no ExerciseDB match" };
  }

  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE exercises_library
          SET gif_url            = $1,
              target_muscle      = COALESCE($2, target_muscle),
              instructions_list  = COALESCE($3, instructions_list),
              secondary_muscles  = COALESCE($4::text[], secondary_muscles),
              description        = COALESCE($5, description)
        WHERE id = $6`,
      [
        `https://v2.exercisedb.io/image/${match.id}.gif`,      // public CDN — always available
        match.target,
        match.instructions?.length ? match.instructions : null,
        match.secondaryMuscles?.length ? match.secondaryMuscles : null,
        match.instructions?.[0] ?? null,
        row.id,
      ]
    );

    // Verify the write landed
    const { rows } = await client.query(
      `SELECT gif_url, target_muscle, array_length(instructions_list,1) AS steps
         FROM exercises_library WHERE id = $1`,
      [row.id]
    );

    const saved = rows[0];
    return {
      title:   row.title,
      success: true,
      gifUrl:  saved?.gif_url ?? undefined,
      target:  saved?.target_muscle,
      steps:   saved?.steps ?? 0,
    };
  } finally {
    client.release();
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
// Flags:
//   --all     resync every row in exercises_library (not just NULL gif_url)
//   --bulk    fetch all 1 300+ exercises from ExerciseDB first, then match by
//             name and upsert — fastest strategy on the PRO plan
async function main() {
  const args    = process.argv.slice(2);
  const resync  = args.includes("--all");
  const bulk    = args.includes("--bulk");

  console.log("\n🏋️  ExerciseDB → Supabase Sync  (direct Postgres)\n" + "─".repeat(58));
  if (resync) console.log("  Mode: --all  (resync every row)\n");
  if (bulk)   console.log("  Mode: --bulk (PRO bulk fetch → name-match upsert)\n");

  console.log("Step 1 — Ensuring schema columns via direct SQL…");
  await ensureColumns();

  // ── Bulk mode: pull full EDB catalogue, match by name, upsert ──────────────
  if (bulk) {
    console.log("Step 2 — Fetching full ExerciseDB catalogue (PRO)…");
    const allEdb = await fetchAllExercises();
    console.log(`  ✓  ${allEdb.length} exercises returned from ExerciseDB\n`);

    // Build a lookup: normalised name → EDBExercise
    const edbByName = new Map<string, EDBExercise>();
    for (const ex of allEdb) {
      edbByName.set(ex.name.toLowerCase().trim(), ex);
    }

    console.log("Step 3 — Fetching DB rows…");
    const dbRows = await fetchRows(true);
    console.log(`  ✓  ${dbRows.length} rows in exercises_library\n`);

    console.log("Step 4 — Matching and upserting…\n");
    const results: SyncResult[] = [];

    for (let i = 0; i < dbRows.length; i++) {
      const row = dbRows[i];
      process.stdout.write(`  [${String(i + 1).padStart(3)}/${dbRows.length}]  ${row.title.padEnd(34)} `);

      // Try ALIASES first, then direct name lookup
      const queries = ALIASES[row.title.toLowerCase()] ?? [row.title];
      let match: EDBExercise | null = null;
      for (const q of queries) {
        match = edbByName.get(q.toLowerCase().trim()) ?? null;
        if (match) break;
      }
      // Fallback: partial match
      if (!match) {
        for (const q of queries) {
          for (const [key, val] of edbByName) {
            if (key.includes(q.toLowerCase())) { match = val; break; }
          }
          if (match) break;
        }
      }

      if (!match) {
        console.log(`❌  no match`);
        results.push({ title: row.title, success: false, reason: "no EDB match in bulk set" });
        continue;
      }

      const r = await syncRow(row, match);
      results.push(r);
      if (r.success) {
        const short = (r.gifUrl ?? "(no gif)").split("/").pop()?.slice(0, 28) ?? "";
        console.log(`✅  ${(r.target ?? "").padEnd(16)} ${r.steps} steps  …${short}`);
      } else {
        console.log(`❌  ${r.reason}`);
      }
      await sleep(150); // lighter throttle — already have the data
    }

    await pool.end();
    const ok   = results.filter(r => r.success);
    const fail = results.filter(r => !r.success);
    console.log("\n" + "─".repeat(58));
    console.log(`  ✅  Updated : ${ok.length} / ${dbRows.length}`);
    console.log(`  ❌  No match : ${fail.length}`);
    if (fail.length) {
      console.log("\n  Unresolved rows:");
      fail.forEach(r => console.log(`    • ${r.title}  — ${r.reason}`));
    }
    if (ok.length) console.log(`\n  🎉  ${ok.length} rows written. Refresh Supabase → exercises_library.\n`);
    console.log("─".repeat(58) + "\n");
    process.exit(fail.length === dbRows.length ? 1 : 0);
  }

  // ── Default mode: name-search per row ──────────────────────────────────────
  console.log(`Step 2 — Fetching ${resync ? "all" : "NULL"} rows…`);
  const rows = await fetchRows(resync);
  if (!rows.length) {
    console.log("  ✓  Nothing to sync.\n");
    await pool.end();
    process.exit(0);
  }
  console.log(`  ✓  ${rows.length} rows to sync\n`);

  console.log("Step 3 — Search ExerciseDB → UPDATE → Verify…\n");
  const results: SyncResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    process.stdout.write(`  [${String(i + 1).padStart(2)}/${rows.length}]  ${row.title.padEnd(34)} `);
    const r = await syncRow(row);
    results.push(r);
    if (r.success) {
      const short = (r.gifUrl ?? "(no gif)").split("/").pop()?.slice(0, 28) ?? "";
      console.log(`✅  ${(r.target ?? "").padEnd(16)} ${r.steps} steps  …${short}`);
    } else {
      console.log(`❌  ${r.reason}`);
    }
    await sleep(300);
  }

  await pool.end();

  const ok   = results.filter(r => r.success);
  const fail = results.filter(r => !r.success);

  console.log("\n" + "─".repeat(58));
  console.log(`  ✅  Updated : ${ok.length} / ${rows.length}`);
  console.log(`  ❌  No match : ${fail.length}`);
  if (fail.length) {
    console.log("\n  Unresolved rows:");
    fail.forEach(r => console.log(`    • ${r.title}  — ${r.reason}`));
  }
  if (ok.length) {
    console.log(`\n  🎉  ${ok.length} rows written. Refresh Supabase → exercises_library.\n`);
  }
  console.log("─".repeat(58) + "\n");
  process.exit(fail.length === rows.length ? 1 : 0);
}

main().catch(err => { console.error("Fatal:", err.message); pool.end(); process.exit(1); });
