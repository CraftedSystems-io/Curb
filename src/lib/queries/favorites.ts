import { createClient } from "@/lib/supabase/server";

export async function getFavoritesForUser(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("favorites")
    .select(
      `
      *,
      contractors (
        *,
        profiles (full_name, avatar_url),
        contractor_services (
          *,
          services (*)
        )
      )
    `
    )
    .eq("client_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}

export async function isContractorFavorited(
  userId: string,
  contractorId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("client_id", userId)
    .eq("contractor_id", contractorId)
    .maybeSingle();

  if (error) return false;
  return !!data;
}
