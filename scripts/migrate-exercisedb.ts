#!/usr/bin/env tsx
/**
 * ExerciseDB → Supabase migration
 *
 * Run: npm run exercise:migrate
 *
 * Steps:
 *  1. Fetch all 38 exercises from Supabase exercises_library
 *  2. Add gif_url, target_muscle, instructions_list columns (if missing)
 *  3. Search ExerciseDB for each exercise by title
 *  4. UPDATE each matched row in Supabase with:
 *       gif_url          TEXT
 *       target_muscle    TEXT
 *       instructions_list TEXT[]
 *       secondary_muscles TEXT[]   (enriched from ExerciseDB)
 *       description      TEXT      (first instruction step — keeps existing UI working)
 *  5. Write data/exercisedb-enriched.json as a local cache
 */

import { writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import "dotenv/config";

// ── Types ─────────────────────────────────────────────────────────────────────
interface SupabaseExercise {
  id: string;
  title: string;
  muscle_group: string;
  secondary_muscles: string[] | null;
  equipment: string;
  difficulty: string;
  description: string | null;
}

interface ExerciseDBEntry {
  id: string;
  name: string;
  gifUrl: string;
  target: string;
  bodyPart: string;
  equipment: string;
  secondaryMuscles: string[];
  instructions: string[];
}

// ── ExerciseDB client ─────────────────────────────────────────────────────────
const BASE_URL = "https://exercisedb.p.rapidapi.com";

async function searchByName(name: string): Promise<ExerciseDBEntry[]> {
  const key = process.env.EXERCISE_API_KEY;
  if (!key) throw new Error("EXERCISE_API_KEY not set in environment");
  const res = await fetch(
    `${BASE_URL}/exercises/name/${encodeURIComponent(name.toLowerCase())}?limit=5&offset=0`,
    { headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": "exercisedb.p.rapidapi.com" } },
  );
  if (!res.ok) { console.warn(`  ⚠  API ${res.status} for "${name}"`); return []; }
  return res.json();
}

function bestMatch(results: ExerciseDBEntry[], query: string): ExerciseDBEntry | null {
  if (!results.length) return null;
  const q = query.toLowerCase();
  return results.find(r => r.name.toLowerCase() === q) ?? results[0];
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// Fallback aliases for titles that don't match verbatim
const ALIASES: Record<string, string> = {
  "barbell bench press":    "bench press",
  "dumbbell bench press":   "dumbbell press",
  "barbell bent over row":  "barbell bent over row",
  "lat pull down":          "lat pulldown",
  "seated cable row":       "cable row",
  "dumbbell rows":          "dumbbell bent over row",
  "pull-ups":               "pull up",
  "push-ups":               "push up",
  "barbell squats":         "barbell squat",
  "romanian deadlifts":     "romanian deadlift",
  "leg curls":              "leg curl",
  "calf raises":            "calf raise",
  "hip thrusts":            "hip thrust",
  "leg extension":          "leg extension",
  "barbell lunges":         "barbell lunge",
  "lying leg raises":       "lying leg raise",
  "hanging leg raises":     "hanging leg raise",
  "kettlebell swings":      "kettlebell swing",
  "lateral raises":         "lateral raise",
  "front raises":           "front raise",
  "rear delt flyes":        "rear delt fly",
  "face pulls":             "face pull",
  "dumbbell overhead press":"overhead press",
  "barbell curls":          "barbell curl",
  "ez bar curls":           "ez bar curl",
  "tricep pushdowns":       "triceps pushdown",
  "skull crushers":         "skull crusher",
  "cable crunches":         "cable crunch",
  "russian twists":         "russian twist",
};

// ── Add columns to Supabase via direct Postgres connection ───────────────────
async function ensureColumns() {
  const { Pool } = pg;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE exercises_library
        ADD COLUMN IF NOT EXISTS gif_url           TEXT,
        ADD COLUMN IF NOT EXISTS target_muscle     TEXT,
        ADD COLUMN IF NOT EXISTS instructions_list TEXT[];
    `);
    console.log("  ✓ Columns ensured (gif_url, target_muscle, instructions_list)");
  } finally {
    client.release();
    await pool.end();
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🏋️  ExerciseDB → Supabase Migration\n");

  // ── 1. Init Supabase ───────────────────────────────────────────────────────
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // ── 2. Add columns if missing ─────────────────────────────────────────────
  console.log("Step 1/3 — Ensuring Supabase schema columns…");
  await ensureColumns();

  // ── 3. Fetch all exercises from library ───────────────────────────────────
  console.log("\nStep 2/3 — Fetching exercises_library from Supabase…");
  const { data: exercises, error } = await supabase
    .from("exercises_library")
    .select("id, title, muscle_group, secondary_muscles, equipment, difficulty, description");

  if (error) { console.error("Supabase fetch failed:", error.message); process.exit(1); }
  console.log(`  ✓ Loaded ${exercises!.length} exercises\n`);

  // ── 4. Search ExerciseDB + update each row ────────────────────────────────
  console.log("Step 3/3 — Searching ExerciseDB and updating Supabase…\n");

  let hits = 0, misses = 0, updated = 0;
  const enrichedCache: object[] = [];

  for (const ex of exercises as SupabaseExercise[]) {
    const alias = ALIASES[ex.title.toLowerCase()];
    process.stdout.write(`  ${ex.title.padEnd(36)} `);

    let results = await searchByName(ex.title);
    if (!results.length && alias) results = await searchByName(alias);
    const match = bestMatch(results, alias ?? ex.title);

    if (!match) {
      misses++;
      process.stdout.write(`⚠️  no match\n`);
      enrichedCache.push({ id: ex.id, title: ex.title, matched: false });
      await sleep(250);
      continue;
    }

    hits++;
    process.stdout.write(`✅  ${match.name}  (${match.target})\n`);

    // Update Supabase row
    const { error: updateErr } = await supabase
      .from("exercises_library")
      .update({
        gif_url:           match.gifUrl,
        target_muscle:     match.target,
        instructions_list: match.instructions,
        secondary_muscles: match.secondaryMuscles?.length ? match.secondaryMuscles : ex.secondary_muscles,
        description:       match.instructions?.[0] ?? ex.description,
      })
      .eq("id", ex.id);

    if (updateErr) {
      console.error(`    ✗ Update failed for ${ex.title}: ${updateErr.message}`);
    } else {
      updated++;
    }

    enrichedCache.push({
      id:               ex.id,
      title:            ex.title,
      exerciseDbId:     match.id,
      gifUrl:           match.gifUrl,
      target:           match.target,
      bodyPart:         match.bodyPart,
      equipmentName:    match.equipment,
      secondaryMuscles: match.secondaryMuscles,
      instructions:     match.instructions,
    });

    await sleep(250);
  }

  // ── 5. Save local cache ───────────────────────────────────────────────────
  const cachePath = resolve(process.cwd(), "data/exercisedb-enriched.json");
  writeFileSync(cachePath, JSON.stringify(enrichedCache, null, 2));

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(52));
  console.log(`  ExerciseDB matches : ${hits}/${(exercises as SupabaseExercise[]).length}`);
  console.log(`  Supabase rows updated : ${updated}`);
  console.log(`  No match : ${misses}`);
  console.log(`  Local cache → data/exercisedb-enriched.json`);
  console.log("─".repeat(52));
  console.log("\n✅  Migration complete. Restart your dev server.\n");
}

main().catch(err => { console.error("Fatal:", err.message); process.exit(1); });
