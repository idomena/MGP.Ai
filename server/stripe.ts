import Stripe from "stripe";
import { db } from "./db";
import { subscriptions } from "../shared/schema";
import { eq } from "drizzle-orm";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("[Stripe] STRIPE_SECRET_KEY not set — payment features disabled.");
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" })
  : null;

export const PRICE_ID = process.env.STRIPE_PRICE_ID || "";
const TRIAL_DAYS = 7;

export async function createCheckoutSession(userId: string, userEmail: string, returnUrl: string) {
  if (!stripe) throw new Error("Stripe not configured");

  let sub = await getSubscription(userId);
  let customerId = sub?.stripeCustomerId ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({ email: userEmail, metadata: { userId } });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    subscription_data: { trial_period_days: TRIAL_DAYS },
    success_url: `${returnUrl}/profile?subscribed=true`,
    cancel_url: `${returnUrl}/pricing`,
    metadata: { userId },
  });

  return session;
}

export async function createPortalSession(userId: string, returnUrl: string) {
  if (!stripe) throw new Error("Stripe not configured");
  const sub = await getSubscription(userId);
  if (!sub?.stripeCustomerId) throw new Error("No Stripe customer found");

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${returnUrl}/profile`,
  });
  return session;
}

export async function getSubscription(userId: string) {
  const rows = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function isSubscriptionActive(_userId: string): Promise<boolean> {
  // Free for all users during beta — Stripe will be enabled later
  return true;
}

export async function handleWebhook(payload: Buffer, sig: string) {
  if (!stripe) throw new Error("Stripe not configured");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET not set");

  const event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const subscriptionId = session.subscription as string;
      if (!userId || !subscriptionId) break;

      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
      await db
        .insert(subscriptions)
        .values({
          userId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: stripeSub.items.data[0]?.price.id,
          status: stripeSub.status,
          trialEndsAt: stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000) : null,
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        })
        .onConflictDoUpdate({
          target: subscriptions.userId,
          set: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscriptionId,
            status: stripeSub.status,
            trialEndsAt: stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000) : null,
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            updatedAt: new Date(),
          },
        });
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const stripeSub = event.data.object as Stripe.Subscription;
      const userId = stripeSub.metadata?.userId;
      if (!userId) break;

      await db
        .update(subscriptions)
        .set({
          status: stripeSub.status,
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, userId));
      break;
    }
  }

  return { received: true };
}
