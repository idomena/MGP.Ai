import { z } from "zod";

export const generateRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(10000, "Prompt too long"),
  systemPrompt: z.string().optional(),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export const generateResponseSchema = z.object({
  text: z.string(),
  success: z.boolean(),
});

export type GenerateResponse = z.infer<typeof generateResponseSchema>;

export const ocrRequestSchema = z.object({
  image: z.string().min(1, "Image data is required"),
});

export type OcrRequest = z.infer<typeof ocrRequestSchema>;

export const ocrResponseSchema = z.object({
  text: z.string(),
  success: z.boolean(),
});

export type OcrResponse = z.infer<typeof ocrResponseSchema>;
