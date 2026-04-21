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
    .from("booking_invoices")
    .insert({
      booking_id: id,
      kind: body.kind,
      status: body.status ?? "draft",
      amount: body.amount,
      notes: body.notes ?? null,
      sort_order: body.sort_order ?? 0,
      due_date: body.due_date ?? null,
    })
    .select("*")
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  await r.supabase.from("booking_events").insert({
    booking_id: id,
    actor_id: r.user.id,
    actor_role: "contractor",
    event_type: "invoice",
    title: `Created ${body.kind} invoice for $${Number(body.amount).toFixed(2)}`,
    metadata: { invoice_id: data.id, kind: body.kind, amount: body.amount },
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
  const { invoiceId, ...fields } = body;
  if (!invoiceId)
    return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 });

  // auto-stamp paid_at when moving to paid
  if (fields.status === "paid" && !fields.paid_at) {
    fields.paid_at = new Date().toISOString();
  }
  if (fields.status === "sent" && !fields.sent_at) {
    fields.sent_at = new Date().toISOString();
  }

  const { error } = await r.supabase
    .from("booking_invoices")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", invoiceId)
    .eq("booking_id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  if (fields.status === "paid") {
    await r.supabase.from("booking_events").insert({
      booking_id: id,
      actor_id: r.user.id,
      actor_role: "contractor",
      event_type: "invoice",
      title: `Invoice marked paid`,
      metadata: { invoice_id: invoiceId },
    });
  }

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
  const invoiceId = searchParams.get("invoiceId");
  if (!invoiceId)
    return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 });
  const { error } = await r.supabase
    .from("booking_invoices")
    .delete()
    .eq("id", invoiceId)
    .eq("booking_id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
