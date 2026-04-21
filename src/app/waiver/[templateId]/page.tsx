import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { WaiverSignClient } from "./waiver-sign-client";

export const dynamic = "force-dynamic";

export default async function WaiverSigningPage({
  params,
  searchParams,
}: {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{ booking?: string }>;
}) {
  const { templateId } = await params;
  const { booking } = await searchParams;
  const supabase = await createClient();

  const { data: tmpl } = await supabase
    .from("waiver_templates")
    .select(
      `
      *,
      contractors (
        business_name,
        profiles (full_name, avatar_url)
      )
    `
    )
    .eq("id", templateId)
    .eq("is_active", true)
    .maybeSingle();

  if (!tmpl) notFound();

  const contractor = tmpl.contractors as {
    business_name: string | null;
    profiles?: { full_name?: string };
  };
  const proName =
    contractor?.business_name ?? contractor?.profiles?.full_name ?? "Service pro";

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="bg-emerald-900 text-white">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-5 sm:px-6">
          <MapPin className="h-5 w-5 text-emerald-300" />
          <Link href="/" className="text-lg font-bold">
            Curb
          </Link>
          <span className="ml-auto text-sm text-emerald-200">
            Waiver from {proName}
          </span>
        </div>
      </header>

      <WaiverSignClient
        templateId={templateId}
        bookingId={booking ?? null}
        title={tmpl.title}
        body={tmpl.body}
        proName={proName}
      />
    </div>
  );
}
