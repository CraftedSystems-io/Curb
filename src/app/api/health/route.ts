import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "curb",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
}
