import type { Express } from "express";
import { generateContent, generateCoachResponse, extractTextFromImage } from "./gemini";
import { generateRequestSchema, ocrRequestSchema } from "../shared/schema";

export function registerRoutes(app: Express): void {
  app.post("/api/generate", async (req, res) => {
    try {
      const validation = generateRequestSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.errors[0].message,
        });
      }

      const { prompt, systemPrompt } = validation.data;
      const text = await generateContent(prompt, systemPrompt);

      res.json({
        success: true,
        text,
      });
    } catch (error) {
      console.error("Error generating content:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  });

  app.post("/api/ai-coach", async (req, res) => {
    try {
      const { message } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({
          success: false,
          error: "Message is required",
        });
      }

      if (message.length > 5000) {
        return res.status(400).json({
          success: false,
          error: "Message too long (max 5000 characters)",
        });
      }

      const response = await generateCoachResponse(message);

      res.json({
        success: true,
        response,
        advice: response,
      });
    } catch (error) {
      console.error("Error in AI coach:", error);
      const message = error instanceof Error ? error.message : "Unknown error";

      if (message.includes("429") || message.includes("quota")) {
        return res.status(429).json({
          success: false,
          error: "Rate limit exceeded. Please try again in a moment.",
        });
      }

      res.status(500).json({
        success: false,
        error: message,
      });
    }
  });

  app.post("/api/ocr-extract", async (req, res) => {
    try {
      const validation = ocrRequestSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.errors[0].message,
        });
      }

      const { image, mimeType } = req.body;

      if (image.length > 5000000) {
        return res.status(400).json({
          success: false,
          error: "Image too large (max 3.75MB)",
        });
      }

      const text = await extractTextFromImage(image, mimeType);

      res.json({
        success: true,
        text,
      });
    } catch (error) {
      console.error("Error extracting text:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
}
