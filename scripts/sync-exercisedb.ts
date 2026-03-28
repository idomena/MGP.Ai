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
  id: string; name: string; gifUrl: string;
  target: string; bodyPart: string; equipment: string;
  secondaryMuscles: string[]; instructions: string[];
}

const GIF_BASE = "https://exercisedb.io/image";

function buildGifUrl(id: string): string {
  return `${GIF_BASE}/${id}.gif`;
}

async function edbSearch(query: string): Promise<EDBExercise[]> {
  const url = `https://${RAPIDAPI_HOST}/exercises/name/${encodeURIComponent(query.toLowerCase())}?limit=5&offset=0`;
  const res = await fetch(url, { headers: EDB_HEADERS });
  if (!res.ok) { console.warn(`  ⚠  ExerciseDB ${res.status} for "${query}"`); return []; }
  const json = await res.json();
  const results: EDBExercise[] = Array.isArray(json) ? json : [];
  // Inject gifUrl from ID since API v2 no longer includes it in the response
  return results.map(r => ({ ...r, gifUrl: r.gifUrl || buildGifUrl(r.id) }));
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

// ── Step 2: fetch rows with NULL gif_url via direct SQL ───────────────────────
interface DBRow { id: string; title: string; muscle_group: string }

async function fetchNullRows(): Promise<DBRow[]> {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT id, title, muscle_group FROM exercises_library WHERE gif_url IS NULL ORDER BY title`
    );
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

async function syncRow(row: DBRow): Promise<SyncResult> {
  const queries = ALIASES[row.title.toLowerCase()] ?? [row.title];

  // Search ExerciseDB
  let match: EDBExercise | null = null;
  for (const q of queries) {
    const results = await edbSearch(q);
    match = bestMatch(results, queries);
    if (match) break;
    await sleep(150);
  }

  if (!match) {
    return { title: row.title, success: false, reason: "no ExerciseDB match" };
  }

  const client = await pool.connect();
  try {
    // Direct SQL UPDATE
    await client.query(
      `UPDATE exercises_library
          SET gif_url            = $1,
              target_muscle      = $2,
              instructions_list  = $3,
              secondary_muscles  = COALESCE($4::text[], secondary_muscles),
              description        = COALESCE($5, description)
        WHERE id = $6`,
      [
        match.gifUrl,
        match.target,
        match.instructions?.length ? match.instructions : null,
        match.secondaryMuscles?.length ? match.secondaryMuscles : null,
        match.instructions?.[0] ?? null,
        row.id,
      ]
    );

    // Verify: read back the row
    const { rows } = await client.query(
      `SELECT gif_url, target_muscle, array_length(instructions_list,1) AS steps
         FROM exercises_library WHERE id = $1`,
      [row.id]
    );

    const saved = rows[0];
    if (!saved?.gif_url) {
      return { title: row.title, success: false, reason: "gif_url still NULL after direct UPDATE" };
    }

    return {
      title:   row.title,
      success: true,
      gifUrl:  saved.gif_url,
      target:  saved.target_muscle,
      steps:   saved.steps ?? 0,
    };
  } finally {
    client.release();
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🏋️  ExerciseDB → Supabase Sync  (direct Postgres)\n" + "─".repeat(58));

  console.log("Step 1 — Ensuring schema columns via direct SQL…");
  await ensureColumns();

  console.log("Step 2 — Fetching NULL rows…");
  const nullRows = await fetchNullRows();
  if (!nullRows.length) {
    console.log("  ✓  All exercises already have gif_url — nothing to do!\n");
    await pool.end();
    process.exit(0);
  }
  console.log(`  ✓  ${nullRows.length} rows need syncing\n`);

  console.log("Step 3 — Search ExerciseDB → UPDATE → Verify…\n");
  const results: SyncResult[] = [];

  for (let i = 0; i < nullRows.length; i++) {
    const row = nullRows[i];
    process.stdout.write(`  [${String(i + 1).padStart(2)}/${nullRows.length}]  ${row.title.padEnd(34)} `);
    const r = await syncRow(row);
    results.push(r);
    if (r.success) {
      const short = (r.gifUrl ?? "").split("/").pop()?.slice(0, 28) ?? "";
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
  console.log(`  ✅  Verified updates : ${ok.length} / ${nullRows.length}`);
  console.log(`  ❌  No match / error  : ${fail.length}`);
  if (fail.length) {
    console.log("\n  Unresolved rows:");
    fail.forEach(r => console.log(`    • ${r.title}  — ${r.reason}`));
  }
  if (ok.length) {
    console.log(`\n  🎉  ${ok.length} rows confirmed written.`);
    console.log("  Refresh Supabase dashboard → exercises_library to see the URLs.\n");
  }
  console.log("─".repeat(58) + "\n");
  process.exit(fail.length === nullRows.length ? 1 : 0);
}

main().catch(err => { console.error("Fatal:", err.message); pool.end(); process.exit(1); });
