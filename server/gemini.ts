import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_KEY_API || process.env.GEMINI_API_KEY || "";

if (!apiKey) {
  console.error("ERROR: GEMINI_KEY_API or GEMINI_API_KEY is not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey });

export interface ExerciseContext {
  exerciseName?: string;
  muscleGroups?: string[];
  sets?: number;
  reps?: number;
  currentSet?: number;
  isResting?: boolean;
  workoutType?: string;
}

function buildExerciseSystemPrompt(context?: ExerciseContext): string {
  const basePrompt = `You are MGP.AI, a friendly personal trainer helping users through their workout. You are like a supportive gym buddy.

HOW YOU TALK:
- Short, clear sentences
- Warm and encouraging
- No technical jargon
- Like talking to a friend`;

  const actionCapabilities = `

ACTION CAPABILITIES:
You can perform actions in the user's workout. When the user asks you to add an exercise, swap an exercise, or remove an exercise, include an action block in your response.

AVAILABLE EXERCISES YOU CAN ADD:
Chest: Bench Press, Incline Dumbbell Press, Dumbbell Press, Push-Ups
Back: Barbell Bent Over Row, Lat Pull Down, Seated Cable Row, Dumbbell Rows
Shoulders: Overhead Press, Lateral Raises, Front Raises, Rear Delt Flyes, Face Pulls
Arms: Barbell Curls, EZ Bar Curls, Tricep Pushdowns, Skull Crushers, Wrist Curls
Legs: Barbell Squats, Leg Press, Romanian Deadlifts, Leg Curls, Calf Raises, Hip Thrusts
Core: Plank, Cable Crunches, Russian Twists, Hanging Leg Raises

WHEN THE USER WANTS TO ADD AN EXERCISE:
- Respond with a friendly message confirming what you're doing
- Include the action block at the END of your response in this exact format:

[ACTION:ADD_EXERCISE]{"name":"Exercise Name","muscles":"Primary Muscle, Secondary Muscle","sets":3,"reps":"12, 10, 8","time":"8 min"}[/ACTION]

WHEN THE USER WANTS TO REMOVE AN EXERCISE:
[ACTION:REMOVE_EXERCISE]{"name":"Exercise Name"}[/ACTION]

IMPORTANT RULES FOR ACTIONS:
- Only use exercises from the AVAILABLE EXERCISES list above
- The exercise name must EXACTLY match one from the list
- Always confirm the action in your text response
- If the user is vague (like "add back arm exercise"), ask which specific exercise they want, OR pick the most suitable one and tell them what you picked
- You can add multiple exercises by including multiple action blocks
- If the user says something like "add triceps" or "add an arm exercise", pick the best exercise for that muscle and add it
- If the user asks about exercises without requesting to add/remove, just give advice without action blocks
- Keep your text response short (1-3 sentences) when performing actions`;

  if (!context || !context.exerciseName) {
    return `${basePrompt}

RESPONSE GUIDELINES:
- Keep responses to 1-3 sentences
- Be friendly and supportive
- Focus on safety and proper form
- Provide actionable advice
- Add a quick check-in like "Does this feel right?" or "How does that feel?" when appropriate

EXAMPLE QUESTIONS YOU MIGHT RECEIVE:
- "How do I do this exercise correctly?"
- "My shoulder hurts, any modifications?"
- "What should I focus on during this movement?"
- "Can I do this at home without equipment?"
${actionCapabilities}`;
  }

  const contextSection = `
CURRENT EXERCISE CONTEXT:
- Exercise: ${context.exerciseName}
- Target Muscles: ${context.muscleGroups?.join(", ") || "Full body"}
- Sets/Reps: ${context.sets || 3}x${context.reps || 12}
${context.currentSet ? `- Current Set: ${context.currentSet} of ${context.sets}` : ""}
${context.workoutType ? `- Workout Type: ${context.workoutType}` : ""}`;

  if (context.isResting) {
    return `${basePrompt}

${contextSection}

USER IS CURRENTLY RESTING BETWEEN SETS.

YOUR ROLE DURING REST:
- Provide encouragement for the next set
- Preview what to focus on in the upcoming set
- Offer quick recovery tips (breathing, hydration)
- Answer questions about the exercise or workout

RESPONSE GUIDELINES:
- Keep responses to 1-3 sentences
- Be friendly and supportive
- Mention what's coming next if relevant
- Add a quick check-in like "How does that feel?" when appropriate
${actionCapabilities}`;
  }

  return `${basePrompt}

${contextSection}

YOUR ROLE DURING EXERCISE:
- Provide form tips and safety cues
- Offer exercise modifications if user mentions pain or difficulty
- Give encouragement and motivation
- Answer questions clearly and concisely

SAFETY GUIDELINES:
- If user mentions pain, recommend stopping and suggest modifications
- Emphasize controlled movements over speed
- Remind about proper breathing (exhale on exertion)
- Suggest scaling options for different fitness levels

RESPONSE GUIDELINES:
- Keep responses to 1-3 sentences
- Be friendly and supportive
- Focus on safety and proper form
- If user asks "how to do this", explain the technique step-by-step
- If unsure about something medical, recommend consulting a professional
- Add a quick check-in like "Does this feel right?" or "How does that feel?" when appropriate

EXAMPLE QUESTIONS YOU MIGHT RECEIVE:
- "How do I do this exercise correctly?"
- "My shoulder hurts, any modifications?"
- "What should I focus on during this movement?"
- "How do I breathe during this exercise?"
- "Is my form okay if I feel it in my lower back?"
${actionCapabilities}`;
}

const GENERAL_COACH_PROMPT = `You are MGP.AI, a friendly fitness coach and personal trainer. Think of yourself as a supportive gym buddy who knows their stuff.

HOW YOU TALK:
- Use short, clear sentences
- Keep it warm and encouraging
- Avoid technical jargon - explain things simply
- Use everyday language, like talking to a friend
- End with a check-in question when it feels natural, like "Does that make sense?" or "Want me to break that down more?"

WHAT YOU HELP WITH:
- Exercise form and technique
- Workout routines and planning
- Nutrition basics and meal ideas
- Recovery and staying injury-free
- Setting goals and staying motivated

YOUR STYLE:
- Keep answers to 2-4 sentences unless the user asks for detail
- Use bullet points for steps or lists
- Give one clear action step when possible
- Be honest but always encouraging
- If someone is struggling, acknowledge it and offer a simpler option

THINGS TO AVOID:
- Long paragraphs or walls of text
- Medical diagnoses or treatment advice
- Extreme diet recommendations
- Guarantees about specific results
- Technical fitness terminology without explanation

ACTION CAPABILITIES:
You can perform actions in the user's workout. When the user asks you to add an exercise, swap an exercise, or remove an exercise, include an action block in your response.

AVAILABLE EXERCISES YOU CAN ADD:
Chest: Bench Press, Incline Dumbbell Press, Dumbbell Press, Push-Ups
Back: Barbell Bent Over Row, Lat Pull Down, Seated Cable Row, Dumbbell Rows
Shoulders: Overhead Press, Lateral Raises, Front Raises, Rear Delt Flyes, Face Pulls
Arms: Barbell Curls, EZ Bar Curls, Tricep Pushdowns, Skull Crushers, Wrist Curls
Legs: Barbell Squats, Leg Press, Romanian Deadlifts, Leg Curls, Calf Raises, Hip Thrusts
Core: Plank, Cable Crunches, Russian Twists, Hanging Leg Raises

WHEN THE USER WANTS TO ADD AN EXERCISE:
- Respond with a friendly message confirming what you're doing
- Include the action block at the END of your response in this exact format:

[ACTION:ADD_EXERCISE]{"name":"Exercise Name","muscles":"Primary Muscle, Secondary Muscle","sets":3,"reps":"12, 10, 8","time":"8 min"}[/ACTION]

WHEN THE USER WANTS TO REMOVE AN EXERCISE:
[ACTION:REMOVE_EXERCISE]{"name":"Exercise Name"}[/ACTION]

IMPORTANT RULES FOR ACTIONS:
- Only use exercises from the AVAILABLE EXERCISES list above
- The exercise name must EXACTLY match one from the list
- Always confirm the action in your text response
- If the user is vague (like "add back arm exercise"), ask which specific exercise they want, OR pick the most suitable one and tell them what you picked
- You can add multiple exercises by including multiple action blocks
- If the user says something like "add triceps" or "add an arm exercise", pick the best exercise for that muscle and add it
- If the user asks about exercises without requesting to add/remove, just give advice without action blocks
- Keep your text response short (1-3 sentences) when performing actions`;

export async function generateContent(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const fullPrompt = systemPrompt
    ? `${systemPrompt}\n\nUser: ${prompt}`
    : prompt;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: fullPrompt }],
      },
    ],
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini");
  }
  return text;
}

export async function generateCoachResponse(
  message: string,
  context?: ExerciseContext,
  history?: Array<{ role: string; content: string }>
): Promise<string> {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const systemPrompt = context
    ? buildExerciseSystemPrompt(context)
    : GENERAL_COACH_PROMPT;

  const historyMessages = (history || []).map(msg => ({
    role: (msg.role === "assistant" ? "model" : "user") as "model" | "user",
    parts: [{ text: msg.content }],
  }));

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: systemPrompt,
    },
    contents: [
      ...historyMessages,
      {
        role: "user" as const,
        parts: [{ text: message }],
      },
    ],
  });

  const text = response.text;
  if (!text) {
    return "I'm here to help with your fitness goals! What would you like to know?";
  }
  return text;
}

export interface ExerciseFromDB {
  id: string;
  title: string;
  muscle_group: string;
  secondary_muscles?: string[];
  equipment: string;
  difficulty: string;
  exercise_type: string;
  movement_pattern: string;
  is_safe: boolean;
  description?: string;
}

export interface SelectedExercise {
  exercise_id: string;
  name: string;
  muscle_group: string;
  movement_pattern: string;
  equipment: string;
  sets?: number;
  reps?: string;
}

const EXERCISE_SELECTION_PROMPT = `You are a deterministic Exercise Selection Engine.

You are NOT allowed to invent exercises.
You are NOT allowed to fetch data from the internet.
You MUST select exercises ONLY from the provided list.

--------------------
SELECTION RULES (MANDATORY)
--------------------

1. Variety rule:
- Do NOT repeat the same exercise in consecutive workouts.
- Prefer exercises that were NOT used in the last 2 workouts (if history is available).

2. Movement balance:
- Do NOT select two exercises with the same movement_pattern back-to-back.
- If multiple exercises match, rotate movement_pattern first, then equipment.

3. Equipment variation:
- Avoid using the same equipment more than twice in the same workout if alternatives exist.

4. Muscle targeting:
- Each workout must include exercises from at least 2 different muscle_group values.
- Do NOT use "full_body" (it does not exist in the database).

5. Difficulty:
- Match exercises to the user difficulty level.
- If not enough exercises exist, allow one level lower, never higher.

6. Randomization (controlled):
- When multiple valid exercises exist, choose randomly.
- Randomization must stay within the rules above.

--------------------
OUTPUT FORMAT (STRICT)
--------------------

Return a JSON array ONLY.
Each item must include:
- exercise_id
- name
- muscle_group
- movement_pattern
- equipment
- sets (number)
- reps (string like "8-10")

Do NOT explain.
Do NOT comment.
Do NOT add text outside the JSON.`;

export async function selectExercisesWithAI(
  availableExercises: ExerciseFromDB[],
  workoutType: string,
  userDifficulty: string = "beginner",
  recentExerciseIds: string[] = [],
  exerciseCount: number = 5
): Promise<SelectedExercise[]> {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const exerciseList = availableExercises.map(e => ({
    id: e.id,
    name: e.title,
    muscle_group: e.muscle_group,
    movement_pattern: e.movement_pattern,
    equipment: e.equipment,
    difficulty: e.difficulty,
    exercise_type: e.exercise_type
  }));

  const userMessage = `
WORKOUT TYPE: ${workoutType}
USER DIFFICULTY LEVEL: ${userDifficulty}
NUMBER OF EXERCISES TO SELECT: ${exerciseCount}
${recentExerciseIds.length > 0 ? `EXERCISES TO AVOID (used recently): ${recentExerciseIds.join(", ")}` : ""}

AVAILABLE EXERCISES:
${JSON.stringify(exerciseList, null, 2)}

Select ${exerciseCount} exercises following all the rules above. Return ONLY the JSON array.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: `${EXERCISE_SELECTION_PROMPT}\n\n${userMessage}` }],
      },
    ],
  });

  const text = response.text || "[]";
  
  // Extract JSON from response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("No valid JSON array in AI response:", text);
    return [];
  }

  try {
    const selectedExercises: SelectedExercise[] = JSON.parse(jsonMatch[0]);
    return selectedExercises;
  } catch (err) {
    console.error("Failed to parse AI exercise selection:", err);
    return [];
  }
}

export async function extractTextFromImage(
  base64Image: string,
  mimeType: string = "image/jpeg"
): Promise<string> {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const validMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const safeMimeType = validMimeTypes.includes(mimeType) ? mimeType : "image/jpeg";

  const ocrPrompt = `You are analyzing a nutrition label or food-related image. Extract all relevant nutritional information.

EXTRACTION GUIDELINES:
- Extract all text visible on nutrition labels
- Identify: Calories, Protein, Carbs, Fat, Fiber, Sugar, Sodium
- If it's a food image without a label, estimate the nutritional content
- Preserve any table formatting for readability
- Include serving size information if visible

OUTPUT FORMAT:
Return the extracted nutritional data in a clear, organized format.
If multiple items are visible, list each separately.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: ocrPrompt,
          },
          {
            inlineData: {
              data: base64Image,
              mimeType: safeMimeType,
            },
          },
        ],
      },
    ],
  });

  return response.text || "";
}
