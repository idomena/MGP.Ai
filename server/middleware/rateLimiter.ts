import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: "AI rate limit exceeded. Please wait a moment before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictAiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: "Rate limit exceeded. Please try again in a minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
