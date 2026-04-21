import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function assertParty(bookingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401 as const };

  const { data: booking } = await supabase
    .from("bookings")
    .select("client_id, contractor_id")
    .eq("id", bookingId)
    .single();
  if (!booking) return { error: "Not found", status: 404 as const };

  const { data: contractor } = await supabase
    .from("contractors")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  const isClient = booking.client_id === user.id;
  const isContractor = contractor?.id === booking.contractor_id;
  if (!isClient && !isContractor)
    return { error: "Forbidden", status: 403 as const };

  return { supabase, user, role: isContractor ? "contractor" : "client" };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const r = await assertParty(id);
  if ("error" in r)
    return NextResponse.json({ error: r.error }, { status: r.status });
  const body = await request.json();

  // client provides an already-uploaded URL (Supabase Storage or similar)
  const { data, error } = await r.supabase
    .from("booking_photos")
    .insert({
      booking_id: id,
      uploader_id: r.user.id,
      url: body.url,
      caption: body.caption ?? null,
      phase: body.phase ?? "during",
      sort_order: body.sort_order ?? 0,
    })
    .select("*")
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  await r.supabase.from("booking_events").insert({
    booking_id: id,
    actor_id: r.user.id,
    actor_role: r.role,
    event_type: "photo",
    title: `Photo added (${body.phase ?? "during"})`,
    metadata: { photo_id: data.id, phase: body.phase ?? "during" },
  });

  return NextResponse.json({ data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const r = await assertParty(id);
  if ("error" in r)
    return NextResponse.json({ error: r.error }, { status: r.status });
  const { searchParams } = new URL(request.url);
  const photoId = searchParams.get("photoId");
  if (!photoId)
    return NextResponse.json({ error: "Missing photoId" }, { status: 400 });
  const { error } = await r.supabase
    .from("booking_photos")
    .delete()
    .eq("id", photoId)
    .eq("booking_id", id)
    .eq("uploader_id", r.user.id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
