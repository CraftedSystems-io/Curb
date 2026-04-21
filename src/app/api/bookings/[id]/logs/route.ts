import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function assertContractor(bookingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401 as const };

  const { data: booking } = await supabase
    .from("bookings")
    .select("contractor_id")
    .eq("id", bookingId)
    .single();
  if (!booking) return { error: "Not found", status: 404 as const };

  const { data: contractor } = await supabase
    .from("contractors")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!contractor || contractor.id !== booking.contractor_id)
    return { error: "Forbidden", status: 403 as const };

  return { supabase, user, contractor };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const r = await assertContractor(id);
  if ("error" in r)
    return NextResponse.json({ error: r.error }, { status: r.status });
  const body = await request.json();
  const logDate = body.log_date ?? new Date().toISOString().split("T")[0];

  // upsert by (booking_id, log_date)
  const { data, error } = await r.supabase
    .from("daily_logs")
    .upsert(
      {
        booking_id: id,
        contractor_id: r.contractor.id,
        log_date: logDate,
        hours_worked: body.hours_worked ?? null,
        crew_count: body.crew_count ?? null,
        weather: body.weather ?? null,
        percent_complete: body.percent_complete ?? null,
        notes: body.notes ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "booking_id,log_date" }
    )
    .select("*")
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  await r.supabase.from("booking_events").insert({
    booking_id: id,
    actor_id: r.user.id,
    actor_role: "contractor",
    event_type: "note",
    title: `Daily log for ${logDate}`,
    body:
      body.percent_complete != null
        ? `${body.percent_complete}% complete · ${body.hours_worked ?? 0}h`
        : null,
    metadata: { log_id: data.id, percent_complete: body.percent_complete },
  });

  return NextResponse.json({ data });
}
