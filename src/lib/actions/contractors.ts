"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateContractorProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Update profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: formData.get("full_name") as string,
      phone: formData.get("phone") || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  // Update contractor
  const lat = parseFloat(formData.get("lat") as string);
  const lng = parseFloat(formData.get("lng") as string);

  const updateData: Record<string, unknown> = {
    business_name: formData.get("business_name") || null,
    bio: formData.get("bio") || null,
    years_experience: parseInt(formData.get("years_experience") as string) || 0,
    hourly_rate: parseFloat(formData.get("hourly_rate") as string) || null,
    service_radius_m:
      parseInt(formData.get("service_radius_m") as string) || 40000,
    updated_at: new Date().toISOString(),
  };

  if (!isNaN(lat) && !isNaN(lng)) {
    // Use raw SQL for PostGIS point
    const { error } = await supabase.rpc("update_contractor_location", {
      contractor_profile_id: user.id,
      lat,
      lng,
    });
    if (error) {
      // Fallback: update without location if RPC doesn't exist yet
      console.error("Location update failed:", error.message);
    }
  }

  const { error: contractorError } = await supabase
    .from("contractors")
    .update(updateData)
    .eq("profile_id", user.id);

  if (contractorError) return { error: contractorError.message };

  revalidatePath("/pro");
  return { success: true };
}

export async function updateContractorServices(
  contractorId: string,
  services: { service_id: string; price: number | null; price_unit: string }[]
) {
  const supabase = await createClient();

  // Delete existing
  await supabase
    .from("contractor_services")
    .delete()
    .eq("contractor_id", contractorId);

  if (services.length > 0) {
    const { error } = await supabase.from("contractor_services").insert(
      services.map((s) => ({
        contractor_id: contractorId,
        service_id: s.service_id,
        price: s.price,
        price_unit: s.price_unit,
      }))
    );

    if (error) return { error: error.message };
  }

  revalidatePath("/pro");
  return { success: true };
}
