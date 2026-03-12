import { createClient } from "@/lib/supabase/server";

export async function getBookingsForClient(clientId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      services (*),
      contractors (
        *,
        profiles (full_name, avatar_url)
      )
    `
    )
    .eq("client_id", clientId)
    .order("scheduled_date", { ascending: false });

  if (error) return [];
  return data;
}

export async function getBookingsForContractor(contractorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      services (*),
      profiles (full_name, avatar_url, phone, email)
    `
    )
    .eq("contractor_id", contractorId)
    .order("scheduled_date", { ascending: false });

  if (error) return [];
  return data;
}

export async function getBookingById(bookingId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      services (*),
      contractors (
        *,
        profiles (full_name, avatar_url, phone, email)
      ),
      profiles (full_name, avatar_url, phone, email)
    `
    )
    .eq("id", bookingId)
    .single();

  if (error) return null;
  return data;
}
