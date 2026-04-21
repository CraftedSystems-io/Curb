import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(
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
    .select("id, contractor_id, location, stage")
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

  const body = (await request.json()) as {
    kind?: "arrival" | "departure" | "break";
    lat: number;
    lng: number;
    accuracy_m?: number;
    note?: string;
  };

  const kind = body.kind ?? "arrival";

  // distance calculation via PostGIS (uses checkin_distance_to_job RPC)
  let distanceM: number | null = null;
  let withinGeofence: boolean | null = null;
  if (booking.location) {
    const { data: distRow } = await supabase.rpc("checkin_distance_to_job", {
      p_booking_id: id,
      p_lat: body.lat,
      p_lng: body.lng,
    });
    if (typeof distRow === "number") {
      distanceM = Math.round(distRow);
      withinGeofence = distanceM <= 150; // 150m geofence
    }
  }

  const { data, error } = await supabase
    .from("booking_checkins")
    .insert({
      booking_id: id,
      contractor_id: contractor.id,
      kind,
      location: `POINT(${body.lng} ${body.lat})`,
      accuracy_m: body.accuracy_m ?? null,
      distance_from_job_m: distanceM,
      is_within_geofence: withinGeofence,
      note: body.note ?? null,
    })
    .select("*")
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Auto-advance stage: on arrival, move scheduled/deposit_paid → on_site
  if (kind === "arrival" && ["scheduled", "deposit_paid", "accepted"].includes(booking.stage ?? "")) {
    await supabase
      .from("bookings")
      .update({ stage: "on_site", status: "in_progress", status_updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  await supabase.from("booking_events").insert({
    booking_id: id,
    actor_id: user.id,
    actor_role: "contractor",
    event_type: "checkin",
    title:
      kind === "arrival"
        ? "Pro arrived on site"
        : kind === "departure"
          ? "Pro left the job"
          : "Break",
    body:
      distanceM !== null
        ? `${distanceM}m from job location${withinGeofence ? " (on site)" : " (outside geofence)"}`
        : null,
    metadata: { checkin_id: data.id, kind, distance_m: distanceM },
  });

  return NextResponse.json({ data });
}
