import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-03-25.dahlia",
    });
  }
  return stripeInstance;
}

export async function createCheckoutSession(
  contractorId: string,
  priceId: string,
  customerId?: string
) {
  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/pro/billing?success=true`,
    cancel_url: `${appUrl}/pro/billing?canceled=true`,
    metadata: { contractorId },
    subscription_data: {
      metadata: { contractorId },
      trial_period_days: 14,
    },
    payment_method_collection: "always",
    allow_promotion_codes: true,
  };

  if (customerId) {
    params.customer = customerId;
  } else {
    params.customer_creation = "always";
  }

  return stripe.checkout.sessions.create(params);
}

export async function createPortalSession(customerId: string) {
  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/pro/billing`,
  });
}
