import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "34.0522");
  const lng = parseFloat(searchParams.get("lng") || "-118.2437");
  const radius = parseInt(searchParams.get("radius") || "40000");
  const category = searchParams.get("category") || null;

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("find_nearby_contractors", {
    user_lat: lat,
    user_lng: lng,
    radius_m: radius,
    service_filter: category,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
