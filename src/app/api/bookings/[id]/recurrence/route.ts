import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  const { data: booking } = await supabase
    .from("bookings")
    .select("contractor_id")
    .eq("id", id)
    .single();
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: contractor } = await supabase
    .from("contractors")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!contractor || contractor.id !== booking.contractor_id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as { recurrence_rule: string | null };
  const { error } = await supabase
    .from("bookings")
    .update({
      recurrence_rule: body.recurrence_rule,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("booking_events").insert({
    booking_id: id,
    actor_id: user.id,
    actor_role: "contractor",
    event_type: "note",
    title: body.recurrence_rule
      ? `Recurrence set: ${body.recurrence_rule}`
      : "Recurrence removed",
    metadata: { recurrence_rule: body.recurrence_rule },
  });

  return NextResponse.json({ success: true });
}
