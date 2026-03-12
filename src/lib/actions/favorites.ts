"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavorite(contractorId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Check if already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("client_id", user.id)
    .eq("contractor_id", contractorId)
    .maybeSingle();

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id);

    if (error) return { error: error.message };

    revalidatePath("/favorites");
    revalidatePath("/explore");
    return { favorited: false };
  } else {
    // Add favorite
    const { error } = await supabase.from("favorites").insert({
      client_id: user.id,
      contractor_id: contractorId,
    });

    if (error) return { error: error.message };

    revalidatePath("/favorites");
    revalidatePath("/explore");
    return { favorited: true };
  }
}

export async function getFavorites() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

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
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}
