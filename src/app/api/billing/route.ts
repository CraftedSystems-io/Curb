export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, createPortalSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, priceId } = await request.json();

    const { data: contractor } = await supabase
      .from("contractors")
      .select("id, stripe_customer_id")
      .eq("profile_id", user.id)
      .single();

    if (!contractor) {
      return NextResponse.json({ error: "Contractor not found" }, { status: 404 });
    }

    if (action === "checkout") {
      if (!priceId) {
        return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
      }
      const session = await createCheckoutSession(
        contractor.id,
        priceId,
        contractor.stripe_customer_id || undefined
      );
      return NextResponse.json({ url: session.url });
    }

    if (action === "portal") {
      if (!contractor.stripe_customer_id) {
        return NextResponse.json(
          { error: "No billing account found" },
          { status: 400 }
        );
      }
      const session = await createPortalSession(contractor.stripe_customer_id);
      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Billing API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
