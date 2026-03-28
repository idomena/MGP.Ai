/**
 * ExerciseDB API Client (RapidAPI)
 * Uses EXERCISE_API_KEY from environment variables.
 * All external calls are proxied through this module so the key never reaches the frontend.
 */

const BASE_URL = "https://exercisedb.p.rapidapi.com";

function getHeaders() {
  const key = process.env.EXERCISE_API_KEY;
  if (!key) throw new Error("EXERCISE_API_KEY is not set");
  return {
    "X-RapidAPI-Key": key,
    "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
  };
}

export interface ExerciseDBEntry {
  id: string;
  name: string;
  gifUrl: string;
  target: string;
  bodyPart: string;
  equipment: string;
  secondaryMuscles: string[];
  instructions: string[];
}

/** Search exercises by name (partial match) */
export async function searchByName(name: string, limit = 5): Promise<ExerciseDBEntry[]> {
  const encoded = encodeURIComponent(name.toLowerCase());
  const res = await fetch(
    `${BASE_URL}/exercises/name/${encoded}?limit=${limit}&offset=0`,
    { headers: getHeaders() },
  );
  if (!res.ok) throw new Error(`ExerciseDB error ${res.status}: ${await res.text()}`);
  return res.json();
}

/** Get exercises by body part (chest, back, shoulders, upper arms, lower arms, upper legs, lower legs, waist, cardio, neck) */
export async function getByBodyPart(bodyPart: string, limit = 20): Promise<ExerciseDBEntry[]> {
  const encoded = encodeURIComponent(bodyPart.toLowerCase());
  const res = await fetch(
    `${BASE_URL}/exercises/bodyPart/${encoded}?limit=${limit}&offset=0`,
    { headers: getHeaders() },
  );
  if (!res.ok) throw new Error(`ExerciseDB error ${res.status}: ${await res.text()}`);
  return res.json();
}

/** Get exercises by target muscle */
export async function getByTarget(target: string, limit = 20): Promise<ExerciseDBEntry[]> {
  const encoded = encodeURIComponent(target.toLowerCase());
  const res = await fetch(
    `${BASE_URL}/exercises/target/${encoded}?limit=${limit}&offset=0`,
    { headers: getHeaders() },
  );
  if (!res.ok) throw new Error(`ExerciseDB error ${res.status}: ${await res.text()}`);
  return res.json();
}

/** Get a single exercise by ExerciseDB ID */
export async function getById(id: string): Promise<ExerciseDBEntry> {
  const res = await fetch(
    `${BASE_URL}/exercises/exercise/${id}`,
    { headers: getHeaders() },
  );
  if (!res.ok) throw new Error(`ExerciseDB error ${res.status}: ${await res.text()}`);
  return res.json();
}

/**
 * MGP muscle group → ExerciseDB body part mapping
 */
export const MUSCLE_TO_BODY_PART: Record<string, string[]> = {
  chest:     ["chest"],
  back:      ["back"],
  shoulders: ["shoulders"],
  arms:      ["upper arms", "lower arms"],
  legs:      ["upper legs", "lower legs"],
  core:      ["waist"],
  cardio:    ["cardio"],
};
