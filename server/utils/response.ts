import type { Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  message?: string;
  [key: string]: unknown;
}

export function sendSuccess<T extends Record<string, unknown>>(res: Response, data: T, message?: string, statusCode = 200): void {
  const response: ApiResponse<T> = {
    success: true,
    ...data,
  };
  if (message) {
    response.message = message;
  }
  res.status(statusCode).json(response);
}

export function sendError(res: Response, error: string, statusCode = 500, message?: string): void {
  const response: ApiResponse = {
    success: false,
    error,
  };
  if (message) {
    response.message = message;
  }
  res.status(statusCode).json(response);
}

export function sendValidationError(res: Response, error: string): void {
  sendError(res, error, 400, "Validation failed");
}

export function sendNotFound(res: Response, resource: string): void {
  sendError(res, `${resource} not found`, 404);
}

export function sendUnauthorized(res: Response, message = "Unauthorized"): void {
  sendError(res, message, 401);
}

export function sendForbidden(res: Response, message = "Access denied"): void {
  sendError(res, message, 403);
}

export function sendRateLimited(res: Response): void {
  sendError(res, "Rate limit exceeded. Please try again in a moment.", 429);
}
