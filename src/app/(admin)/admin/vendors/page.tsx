import { createClient } from "@/lib/supabase/server";
import { VendorsClient } from "./vendors-client";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const supabase = await createClient();

  const { data: vendors } = await supabase
    .from("contractors")
    .select(
      "id, business_name, bio, hourly_rate, rating_avg, review_count, is_active, is_verified, subscription_plan, subscription_status, created_at, profiles!contractors_profile_id_fkey(full_name, email, phone)"
    )
    .order("created_at", { ascending: false });

  return <VendorsClient vendors={vendors || []} />;
}
