import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = (await request.json()) as {
    template_id: string;
    signer_name: string;
    signer_email?: string;
    signature_svg: string;
    booking_id?: string;
  };

  if (!body.template_id || !body.signer_name || !body.signature_svg) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // fetch the template so we can snapshot it
  const { data: tmpl } = await supabase
    .from("waiver_templates")
    .select("*")
    .eq("id", body.template_id)
    .eq("is_active", true)
    .maybeSingle();
  if (!tmpl)
    return NextResponse.json({ error: "Waiver not found" }, { status: 404 });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ua = request.headers.get("user-agent");
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip");

  const { data, error } = await supabase
    .from("waiver_signatures")
    .insert({
      template_id: body.template_id,
      signer_id: user?.id ?? null,
      booking_id: body.booking_id ?? null,
      signer_name: body.signer_name,
      signer_email: body.signer_email ?? null,
      signature_svg: body.signature_svg,
      ip_address: ip,
      user_agent: ua,
      template_snapshot: tmpl.body,
    })
    .select("*")
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.booking_id) {
    await supabase.from("booking_events").insert({
      booking_id: body.booking_id,
      actor_id: user?.id ?? null,
      actor_role: user ? "client" : "public",
      event_type: "signature",
      title: `${body.signer_name} signed: ${tmpl.title}`,
      metadata: { waiver_id: tmpl.id, signature_id: data.id },
    });
  }

  return NextResponse.json({ data });
}
