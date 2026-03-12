import { createClient } from "@/lib/supabase/server";

export async function getPortfolioPhotos(contractorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("portfolio_photos")
    .select("id, url, caption, category, sort_order")
    .eq("contractor_id", contractorId)
    .order("sort_order", { ascending: true });

  if (error) return [];
  return data;
}
