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

  const { data, error } = await r.supabase
    .from("booking_scope_items")
    .insert({
      booking_id: id,
      title: body.title,
      description: body.description ?? null,
      quantity: body.quantity ?? 1,
      unit: body.unit ?? "ea",
      unit_price: body.unit_price ?? 0,
      sort_order: body.sort_order ?? 0,
      is_optional: body.is_optional ?? false,
      is_change_order: body.is_change_order ?? false,
    })
    .select("*")
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  await r.supabase.from("booking_events").insert({
    booking_id: id,
    actor_id: r.user.id,
    actor_role: "contractor",
    event_type: "scope_change",
    title: body.is_change_order
      ? `Change order: ${body.title}`
      : `Added scope: ${body.title}`,
    metadata: { scope_item_id: data.id },
  });

  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const r = await assertContractor(id);
  if ("error" in r)
    return NextResponse.json({ error: r.error }, { status: r.status });
  const body = await request.json();
  const { itemId, ...fields } = body;
  if (!itemId)
    return NextResponse.json({ error: "Missing itemId" }, { status: 400 });

  const { error } = await r.supabase
    .from("booking_scope_items")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("booking_id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const r = await assertContractor(id);
  if ("error" in r)
    return NextResponse.json({ error: r.error }, { status: r.status });
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId");
  if (!itemId)
    return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
  const { error } = await r.supabase
    .from("booking_scope_items")
    .delete()
    .eq("id", itemId)
    .eq("booking_id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
