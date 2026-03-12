"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createBooking(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("bookings").insert({
    client_id: user.id,
    contractor_id: formData.get("contractor_id") as string,
    service_id: formData.get("service_id") as string,
    scheduled_date: formData.get("scheduled_date") as string,
    scheduled_time: formData.get("scheduled_time") || null,
    address: formData.get("address") as string,
    notes: formData.get("notes") || null,
    quoted_price: formData.get("quoted_price")
      ? parseFloat(formData.get("quoted_price") as string)
      : null,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/pro");
  return { success: true };
}

export async function updateBookingStatus(
  bookingId: string,
  status: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("bookings")
    .update({
      status,
      status_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/pro");
  return { success: true };
}
