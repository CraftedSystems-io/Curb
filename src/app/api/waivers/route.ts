import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function assertPro() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401 as const };
  const { data: contractor } = await supabase
    .from("contractors")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!contractor)
    return { error: "Contractor profile required", status: 403 as const };
  return { supabase, user, contractor };
}

export async function POST(request: NextRequest) {
  const r = await assertPro();
  if ("error" in r)
    return NextResponse.json({ error: r.error }, { status: r.status });
  const body = await request.json();
  const { data, error } = await r.supabase
    .from("waiver_templates")
    .insert({
      contractor_id: r.contractor.id,
      title: body.title,
      body: body.body,
      version: body.version ?? 1,
      is_active: body.is_active ?? true,
    })
    .select("*")
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest) {
  const r = await assertPro();
  if ("error" in r)
    return NextResponse.json({ error: r.error }, { status: r.status });
  const body = await request.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await r.supabase
    .from("waiver_templates")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("contractor_id", r.contractor.id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const r = await assertPro();
  if ("error" in r)
    return NextResponse.json({ error: r.error }, { status: r.status });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const { error } = await r.supabase
    .from("waiver_templates")
    .update({ is_active: false })
    .eq("id", id)
    .eq("contractor_id", r.contractor.id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
