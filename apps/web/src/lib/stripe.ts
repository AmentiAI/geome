import Stripe from "stripe";
import { env } from "./env";

let _client: Stripe | null = null;

export function stripe(): Stripe {
  if (_client) return _client;
  const key = env.STRIPE_SECRET_KEY();
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  _client = new Stripe(key, { apiVersion: "2024-06-20" });
  return _client;
}

export function stripeConfigured(): boolean {
  return !!env.STRIPE_SECRET_KEY();
}
