#!/usr/bin/env tsx
/**
 * Bulk ExerciseDB → Supabase Sync
 *
 * Strategy:
 *   1. Fetch ALL ~1300+ exercises from ExerciseDB in paginated chunks
 *   2. Build a name → exercise lookup
 *   3. Match our exercises_library rows using aliases + exact + partial fallback
 *   4. Bulk UPDATE matched rows — gif_url, target_muscle, instructions_list,
 *      secondary_muscles, description, equipment, difficulty
 *   5. Report matched / unmatched / gif-populated counts
 *
 * gifUrl is only present on paid ExerciseDB plans.
 * All other fields update regardless of plan tier.
 *
 * Run: npm run exercise:bulk-sync
 * Env: DATABASE_URL  EXERCISE_API_KEY
 */

import pg from "pg";
import "dotenv/config";

// ── Validation ────────────────────────────────────────────────────────────────
for (const k of ["DATABASE_URL", "EXERCISE_API_KEY"]) {
  if (!process.env[k]) { console.error(`❌  Missing env var: ${k}`); process.exit(1); }
}

// ── Postgres ──────────────────────────────────────────────────────────────────
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ── ExerciseDB ────────────────────────────────────────────────────────────────
const RAPIDAPI_HOST = "exercisedb.p.rapidapi.com";
const EDB_HEADERS = {
  "X-RapidAPI-Key":  process.env.EXERCISE_API_KEY!,
  "X-RapidAPI-Host": RAPIDAPI_HOST,
};

interface EDBExercise {
  id:               string;
  name:             string;
  gifUrl?:          string;       // paid plans only
  target:           string;
  bodyPart:         string;
  equipment:        string;
  difficulty?:      string;
  description?:     string;
  secondaryMuscles: string[];
  instructions:     string[];
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ── Alias map: our titles → ExerciseDB search names ───────────────────────────
// Keys are lowercase versions of exercises_library.title
const ALIASES: Record<string, string[]> = {
  "ab wheel rollout":         ["ab wheel rollout", "wheel rollout"],
  "barbell bench press":      ["barbell bench press", "bench press"],
  "barbell bicep curl":       ["barbell curl", "barbell bicep curl"],
  "barbell row":              ["barbell bent over row", "bent over row"],
  "barbell squat":            ["barbell squat", "barbell back squat", "squat"],
  "burpees":                  ["burpee"],
  "cable crunch":             ["cable seated crunch", "cable kneeling crunch", "cable crunch"],
  "deadlift":                 ["barbell deadlift", "deadlift"],
  "dips":                     ["chest dip", "dip", "tricep dip"],
  "dumbbell bench press":     ["dumbbell bench press"],
  "dumbbell bicep curl":      ["dumbbell bicep curl", "dumbbell curl"],
  "dumbbell fly":             ["dumbbell fly", "dumbbell flye"],
  "dumbell fly":              ["dumbbell fly", "dumbbell flye"],
  "dumbbell row":             ["dumbbell bent over row", "dumbbell row"],
  "dumbbell shoulder press":  ["dumbbell arnold press", "dumbbell shoulder press", "seated dumbbell shoulder press"],
  "face pull":                ["cable rear delt row (stirrups)", "cable rear delt row (with rope)", "cable rear delt row"],
  "farmer's carry":           ["farmer walk", "farmers walk", "farmer carry"],
  "front raise":              ["dumbbell front raise", "barbell front raise"],
  "hanging leg raises":       ["hanging leg raise", "hanging knee raise"],
  "hip thrust":               ["barbell hip thrust", "hip thrust"],
  "incline dumbbell press":   ["dumbbell incline bench press", "dumbbell incline press on exercise ball"],
  "kettlebell swing":         ["kettlebell swing"],
  "lat pulldown":             ["lat pulldown", "cable lat pulldown"],
  "lateral raise":            ["cable lateral raise", "dumbbell lateral raise"],
  "leg curl (machine)":       ["lever lying leg curl", "lever kneeling leg curl", "inverse leg curl (bench support)"],
  "leg extension":            ["leg extension", "lever leg extension"],
  "leg press":                ["leg press", "sled leg press"],
  "overhead press (barbell)": ["barbell seated overhead press", "dumbbell standing overhead press"],
  "plank":                    ["plank", "front plank"],
  "pull-up":                  ["pull-up", "pullup", "pull up"],
  "push-up":                  ["push-up", "pushup", "push up"],
  "rear delt fly":            ["rear delt fly", "dumbbell reverse fly"],
  "romanian deadlift":        ["barbell romanian deadlift", "romanian deadlift"],
  "russian twist":            ["russian twist"],
  "seated cable row":         ["cable low seated row", "cable seated row"],
  "skull crushers":           ["barbell lying triceps extension skull crusher", "skull crusher"],
  "triceps pushdown":         ["cable triceps pushdown", "triceps pushdown"],
  "walking lunges":           ["walking lunge", "lunge"],
  "z-bar curl":               ["ez barbell curl", "ez bar curl"],
};

// ── Step 1: fetch all exercises ───────────────────────────────────────────────
async function fetchAllExercises(): Promise<EDBExercise[]> {
  const PAGE_SIZE = 100;
  const all: EDBExercise[] = [];
  let offset = 0;

  while (true) {
    const url = `https://${RAPIDAPI_HOST}/exercises?limit=${PAGE_SIZE}&offset=${offset}`;
    const res = await fetch(url, { headers: EDB_HEADERS });
    if (!res.ok) { console.error(`  ❌  ExerciseDB ${res.status} at offset ${offset}`); break; }

    const page: EDBExercise[] = await res.json();
    if (!Array.isArray(page) || page.length === 0) break;

    all.push(...page);
    process.stdout.write(`\r  Fetched ${all.length} exercises…`);

    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
    await sleep(250);
  }

  process.stdout.write("\n");
  return all;
}

// ── Step 2: resolve our title → best EDB match ────────────────────────────────
function findMatch(
  title: string,
  nameMap: Map<string, EDBExercise>
): EDBExercise | null {
  const key = title.toLowerCase().trim();

  // 1. Exact lowercase match
  if (nameMap.has(key)) return nameMap.get(key)!;

  // 2. Alias candidates
  const candidates = ALIASES[key] ?? [];
  for (const alias of candidates) {
    if (nameMap.has(alias.toLowerCase())) return nameMap.get(alias.toLowerCase())!;
  }

  // 3. Partial: our title is contained in an EDB name
  for (const [edbName, ex] of nameMap) {
    if (edbName.includes(key) || key.includes(edbName)) return ex;
  }

  return null;
}

// ── Step 3: update one row ────────────────────────────────────────────────────
async function updateRow(
  client: pg.PoolClient,
  dbId: string,
  api: EDBExercise,
  gifUrl: string | null,
): Promise<void> {
  // Only update fields that have no enum check constraint.
  // equipment and difficulty use strict DB enums that don't map to ExerciseDB's
  // free-text values — leave those columns untouched.
  await client.query(
    `UPDATE exercises_library
        SET gif_url           = COALESCE($1, gif_url),
            target_muscle     = COALESCE($2, target_muscle),
            instructions_list = COALESCE(
                                  CASE WHEN array_length($3::text[], 1) > 0 THEN $3::text[] ELSE NULL END,
                                  instructions_list
                                ),
            secondary_muscles = COALESCE(
                                  CASE WHEN array_length($4::text[], 1) > 0 THEN $4::text[] ELSE NULL END,
                                  secondary_muscles
                                ),
            description       = COALESCE($5, description)
      WHERE id = $6`,
    [
      gifUrl,
      api.target           || null,
      api.instructions?.length     ? api.instructions     : null,
      api.secondaryMuscles?.length ? api.secondaryMuscles : null,
      api.description      || null,
      dbId,
    ]
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🏋️  Bulk ExerciseDB → Supabase Sync\n" + "─".repeat(58));

  // Step 1 — fetch
  console.log("\nStep 1 — Fetching all exercises from ExerciseDB…");
  const apiExercises = await fetchAllExercises();
  const withGif = apiExercises.filter(e => e.gifUrl).length;
  console.log(`  ✓  ${apiExercises.length} exercises fetched`);
  console.log(`  📸  gifUrl present : ${withGif}`);
  if (withGif === 0) {
    console.log(`  ⚠   gifUrl absent on all — expected on free plan.`);
    console.log(`      Other fields (target, instructions, etc.) will still update.\n`);
  }

  // Step 2 — build lookup
  const nameMap = new Map<string, EDBExercise>();
  for (const ex of apiExercises) nameMap.set(ex.name.toLowerCase(), ex);

  // Step 3 — load DB rows
  console.log("Step 2 — Loading exercises_library…");
  const client = await pool.connect();
  const { rows: dbRows } = await client.query<{ id: string; title: string }>(
    `SELECT id, title FROM exercises_library ORDER BY title`
  );
  console.log(`  ✓  ${dbRows.length} rows in exercises_library\n`);

  // Step 4 — match + update
  console.log("Step 3 — Matching and updating…\n");

  let updated = 0;
  let skipped = 0;
  const unmatched: string[] = [];

  for (const row of dbRows) {
    const match = findMatch(row.title, nameMap);

    if (!match) {
      unmatched.push(row.title);
      skipped++;
      console.log(`  ⚠   No match  — "${row.title}"`);
      continue;
    }

    // Always use the public v2 CDN — no auth required, works with wsrv.nl
    const gifUrl = `https://v2.exercisedb.io/image/${match.id}.gif`;

    await updateRow(client, row.id, match, gifUrl);
    updated++;
    console.log(`  ✅  ${row.title.padEnd(32)}  →  ${match.name.padEnd(36)}  v2/${match.id}.gif`);
  }

  client.release();

  // Step 5 — final counts
  const countClient = await pool.connect();
  const { rows: gifRows } = await countClient.query(
    `SELECT count(*) AS n FROM exercises_library WHERE gif_url IS NOT NULL AND gif_url != ''`
  );
  countClient.release();
  await pool.end();

  const gifPopulated = Number(gifRows[0].n);

  console.log("\n" + "─".repeat(58));
  console.log(`  ✅  Updated   : ${updated} / ${dbRows.length}`);
  console.log(`  ❌  Unmatched : ${skipped}`);
  console.log(`  📸  gif_url populated : ${gifPopulated} / ${dbRows.length}`);

  if (gifPopulated === 0 && withGif === 0) {
    console.log(`\n  ℹ️   No GIF URLs yet — API plan upgrade required.`);
    console.log(`      After upgrading, run:  npm run exercise:bulk-sync\n`);
  } else if (gifPopulated > 0) {
    console.log(`\n  🎉  ${gifPopulated} GIF URLs live in Supabase!\n`);
  }

  console.log("─".repeat(58) + "\n");
  process.exit(skipped === dbRows.length ? 1 : 0);
}

main().catch(err => {
  console.error("Fatal:", err.message);
  pool.end();
  process.exit(1);
});
