import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BookingStage } from "@/types";
import { STAGE_NEXT } from "@/lib/utils/constants";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { stage: BookingStage; note?: string };

  // fetch booking + assert caller is a party
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, stage, client_id, contractor_id")
    .eq("id", id)
    .single();
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: contractor } = await supabase
    .from("contractors")
    .select("id, profile_id")
    .eq("profile_id", user.id)
    .maybeSingle();

  const isClient = booking.client_id === user.id;
  const isContractor = contractor?.id === booking.contractor_id;
  if (!isClient && !isContractor)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // enforce forward-only transitions
  const currentStage = (booking.stage ?? "inquiry") as BookingStage;
  const allowed = STAGE_NEXT[currentStage] ?? [];
  if (!allowed.includes(body.stage)) {
    return NextResponse.json(
      { error: `Cannot move from ${currentStage} to ${body.stage}` },
      { status: 400 }
    );
  }

  // keep legacy status in sync for back-compat with existing UI
  const legacyStatus =
    body.stage === "completed"
      ? "completed"
      : body.stage === "cancelled"
        ? "cancelled"
        : body.stage === "declined"
          ? "declined"
          : body.stage === "on_site" || body.stage === "punch_list"
            ? "in_progress"
            : body.stage === "accepted" ||
                body.stage === "deposit_paid" ||
                body.stage === "scheduled"
              ? "accepted"
              : "pending";

  const { error } = await supabase
    .from("bookings")
    .update({
      stage: body.stage,
      status: legacyStatus,
      status_updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // log note as a separate event if provided
  if (body.note) {
    await supabase.from("booking_events").insert({
      booking_id: id,
      actor_id: user.id,
      actor_role: isContractor ? "contractor" : "client",
      event_type: "note",
      title: "Note added",
      body: body.note,
    });
  }

  return NextResponse.json({ success: true });
}
