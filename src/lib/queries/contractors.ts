import { createClient } from "@/lib/supabase/server";

export async function getContractorById(contractorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contractors")
    .select(
      `
      *,
      profiles (*),
      contractor_services (
        *,
        services (*)
      )
    `
    )
    .eq("id", contractorId)
    .single();

  if (error) return null;
  return data;
}

export async function getContractorByProfileId(profileId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contractors")
    .select(
      `
      *,
      profiles (*),
      contractor_services (
        *,
        services (*)
      )
    `
    )
    .eq("profile_id", profileId)
    .single();

  if (error) return null;
  return data;
}

export async function getAllServices() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .order("category")
    .order("name");
  return data || [];
}
