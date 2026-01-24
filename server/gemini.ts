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
  const basePrompt = `You are MGP.AI, a professional personal trainer and fitness coach helping users through their workout.

YOUR PERSONALITY:
- Encouraging but professional
- Safety-focused and knowledgeable
- Concise and actionable
- Supportive without being overly enthusiastic`;

  if (!context || !context.exerciseName) {
    return `${basePrompt}

RESPONSE GUIDELINES:
- Keep responses 2-3 sentences max
- Be encouraging but professional
- Focus on safety and proper form
- Provide actionable advice

EXAMPLE QUESTIONS YOU MIGHT RECEIVE:
- "How do I do this exercise correctly?"
- "My shoulder hurts, any modifications?"
- "What should I focus on during this movement?"
- "Can I do this at home without equipment?"`;
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
- Keep responses brief (1-2 sentences)
- Be motivating without being pushy
- Mention what's coming next if relevant`;
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
- Keep responses 2-3 sentences max
- Be encouraging but professional
- Focus on safety and proper form
- If user asks "how to do this", explain the technique step-by-step
- If unsure about something medical, recommend consulting a professional

EXAMPLE QUESTIONS YOU MIGHT RECEIVE:
- "How do I do this exercise correctly?"
- "My shoulder hurts, any modifications?"
- "What should I focus on during this movement?"
- "How do I breathe during this exercise?"
- "Is my form okay if I feel it in my lower back?"`;
}

const GENERAL_COACH_PROMPT = `You are MGP.AI, an expert fitness coach and personal trainer. You help users with:

EXPERTISE AREAS:
- Exercise form and technique
- Workout programming and routines
- Nutrition and meal planning basics
- Recovery and injury prevention
- Fitness goal setting and motivation

YOUR APPROACH:
- Provide detailed, accurate, and motivating advice
- Be encouraging but realistic about expectations
- Always emphasize safety and proper technique
- Personalize advice when possible based on user context

RESPONSE GUIDELINES:
- Be concise but informative (3-5 sentences typically)
- Use bullet points for lists of tips or steps
- If discussing exercises, mention proper form cues
- For nutrition questions, focus on general healthy principles
- Always recommend consulting professionals for medical concerns

TOPICS TO AVOID:
- Specific medical diagnoses or treatment
- Extreme diet recommendations
- Dangerous training practices
- Guarantees about specific results`;

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
  context?: ExerciseContext
): Promise<string> {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const systemPrompt = context
    ? buildExerciseSystemPrompt(context)
    : GENERAL_COACH_PROMPT;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nUser's message: ${message}` }],
      },
    ],
  });

  const text = response.text;
  if (!text) {
    return "I'm here to help with your fitness goals! What would you like to know?";
  }
  return text;
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
