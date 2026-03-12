import { createClient } from "@/lib/supabase/server";

export async function getReviewsForContractor(contractorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      profiles (full_name, avatar_url)
    `
    )
    .eq("contractor_id", contractorId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}
