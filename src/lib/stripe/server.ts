import "server-only";
import Stripe from "stripe";
import { clientEnv, getServerEnv } from "@/lib/env";

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeSingleton) {
    const env = getServerEnv();
    stripeSingleton = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return stripeSingleton;
}

/** True when a real Stripe publishable key is present. */
export function isStripeConfigured(): boolean {
  const key = clientEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  return Boolean(key) && !key.includes("placeholder");
}
