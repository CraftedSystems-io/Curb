import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

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
  return { supabase, user };
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const r = await assertParty(id);
  if ("error" in r)
    return NextResponse.json({ error: r.error }, { status: r.status });

  // revoke any existing active tokens for this booking
  await r.supabase
    .from("booking_share_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("booking_id", id)
    .is("revoked_at", null);

  const token = randomBytes(24).toString("base64url");
  const expires = new Date();
  expires.setDate(expires.getDate() + 90);

  const { data, error } = await r.supabase
    .from("booking_share_tokens")
    .insert({
      booking_id: id,
      token,
      created_by: r.user.id,
      expires_at: expires.toISOString(),
    })
    .select("*")
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const r = await assertParty(id);
  if ("error" in r)
    return NextResponse.json({ error: r.error }, { status: r.status });

  const { error } = await r.supabase
    .from("booking_share_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("booking_id", id)
    .is("revoked_at", null);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
