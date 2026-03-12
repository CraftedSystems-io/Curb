"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ServiceCategory } from "@/types";

export async function deletePortfolioPhoto(photoId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Verify the photo belongs to this contractor
  const { data: contractor } = await supabase
    .from("contractors")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!contractor) return { error: "Contractor not found" };

  const { error } = await supabase
    .from("portfolio_photos")
    .delete()
    .eq("id", photoId)
    .eq("contractor_id", contractor.id);

  if (error) return { error: error.message };

  revalidatePath("/pro/portfolio");
  return { success: true };
}

export async function updatePhotoCaption(photoId: string, caption: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: contractor } = await supabase
    .from("contractors")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!contractor) return { error: "Contractor not found" };

  const { error } = await supabase
    .from("portfolio_photos")
    .update({ caption })
    .eq("id", photoId)
    .eq("contractor_id", contractor.id);

  if (error) return { error: error.message };

  revalidatePath("/pro/portfolio");
  return { success: true };
}

export async function updatePhotoCategory(
  photoId: string,
  category: ServiceCategory
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: contractor } = await supabase
    .from("contractors")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!contractor) return { error: "Contractor not found" };

  const { error } = await supabase
    .from("portfolio_photos")
    .update({ category })
    .eq("id", photoId)
    .eq("contractor_id", contractor.id);

  if (error) return { error: error.message };

  revalidatePath("/pro/portfolio");
  return { success: true };
}

export async function addPortfolioPhoto(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: contractor } = await supabase
    .from("contractors")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!contractor) return { error: "Contractor not found" };

  const url = formData.get("url") as string;
  const caption = (formData.get("caption") as string) || null;
  const category = (formData.get("category") as ServiceCategory) || null;

  if (!url) return { error: "Photo URL is required" };

  // Get current max sort order
  const { data: maxSort } = await supabase
    .from("portfolio_photos")
    .select("sort_order")
    .eq("contractor_id", contractor.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const sortOrder = (maxSort?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("portfolio_photos").insert({
    contractor_id: contractor.id,
    url,
    caption,
    category,
    sort_order: sortOrder,
  });

  if (error) return { error: error.message };

  revalidatePath("/pro/portfolio");
  return { success: true };
}
