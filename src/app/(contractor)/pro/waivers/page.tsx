import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getContractorByProfileId } from "@/lib/queries/contractors";
import { WaiversClient } from "./waivers-client";

export default async function WaiversPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const contractor = await getContractorByProfileId(user.id);
  if (!contractor) redirect("/explore");

  const { data: templates } = await supabase
    .from("waiver_templates")
    .select("*, waiver_signatures (count)")
    .eq("contractor_id", contractor.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Waivers</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create liability waivers clients sign before a job begins. Signatures
          are legally timestamped and stored permanently.
        </p>
      </div>
      <WaiversClient templates={templates ?? []} />
    </div>
  );
}
