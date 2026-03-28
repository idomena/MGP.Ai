import { Request, Response, NextFunction } from "express";
import { isSubscriptionActive } from "../stripe";

export async function requireSubscription(req: Request, res: Response, next: NextFunction) {
  const userId = req.query.userId as string || req.body?.userId;
  if (!userId) {
    return res.status(401).json({ error: "User ID required" });
  }

  const active = await isSubscriptionActive(userId);
  if (!active) {
    return res.status(402).json({
      error: "Subscription required",
      code: "SUBSCRIPTION_REQUIRED",
      upgradeUrl: "/pricing",
    });
  }

  next();
}
