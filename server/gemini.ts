import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_KEY_API || process.env.GEMINI_API_KEY || "";

if (!apiKey) {
  console.error("ERROR: GEMINI_KEY_API or GEMINI_API_KEY is not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey });

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

export async function generateCoachResponse(message: string): Promise<string> {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const systemPrompt = `You are an expert fitness coach and personal trainer. Provide detailed, accurate, and motivating advice about exercise, workout routines, proper form, nutrition, and fitness goals. Be encouraging but realistic. Always emphasize safety and proper technique. Keep responses concise but informative.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }],
      },
    ],
  });

  const text = response.text;
  if (!text) {
    return "I'm here to help with your fitness goals!";
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

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: "Extract all text from this image. Return only the extracted text, nothing else. If there are tables or structured data, preserve the formatting as much as possible.",
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
