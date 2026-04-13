export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;
  const stripe = getStripe();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getAdminSupabase();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const contractorId = session.metadata?.contractorId;
      if (!contractorId) break;

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      let priceId: string | null = null;
      if (subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        priceId = sub.items.data[0]?.price.id || null;
      }

      const plan = getPlanFromPriceId(priceId);

      await supabase
        .from("contractors")
        .update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
          subscription_status: "active",
          subscription_plan: plan,
          trial_ends_at: null,
        })
        .eq("id", contractorId);
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object;
      const contractorId = sub.metadata?.contractorId;
      if (!contractorId) break;

      const priceId = sub.items.data[0]?.price.id || null;
      const plan = getPlanFromPriceId(priceId);

      await supabase
        .from("contractors")
        .update({
          subscription_status: sub.status === "active" ? "active" : sub.status,
          subscription_plan: plan,
          current_period_end: sub.items.data[0]?.current_period_end
            ? new Date(sub.items.data[0].current_period_end * 1000).toISOString()
            : null,
        })
        .eq("id", contractorId);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const contractorId = sub.metadata?.contractorId;
      if (!contractorId) break;

      await supabase
        .from("contractors")
        .update({
          subscription_status: "canceled",
          subscription_plan: "starter",
        })
        .eq("id", contractorId);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as unknown as Record<string, unknown>;
      const rawSub = invoice.subscription;
      const subId =
        typeof rawSub === "string"
          ? rawSub
          : (rawSub as { id?: string })?.id;

      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId);
        const contractorId = sub.metadata?.contractorId;
        if (contractorId) {
          await supabase
            .from("contractors")
            .update({ subscription_status: "past_due" })
            .eq("id", contractorId);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

function getPlanFromPriceId(priceId: string | null): string {
  if (!priceId) return "starter";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) return "professional";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID) return "enterprise";
  return "professional";
}
