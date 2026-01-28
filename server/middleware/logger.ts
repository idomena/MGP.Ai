import type { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, url } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    const logLevel = statusCode >= 500 ? "ERROR" : statusCode >= 400 ? "WARN" : "INFO";
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] ${logLevel} ${method} ${url} ${statusCode} ${duration}ms`);
  });

  next();
}
