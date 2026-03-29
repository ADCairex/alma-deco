import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

function getStripeSecretKey() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
  }

  return secretKey;
}

export function getStripe() {
  if (!stripeInstance) {
    stripeInstance = new Stripe(getStripeSecretKey());
  }

  return stripeInstance;
}

export function getStripeWebhookSecret() {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable.");
  }

  return webhookSecret;
}
