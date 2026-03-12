"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateAvailability(
  contractorId: string,
  slots: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
  }[]
) {
  const supabase = await createClient();

  // Delete existing
  await supabase
    .from("availability")
    .delete()
    .eq("contractor_id", contractorId);

  if (slots.length > 0) {
    const { error } = await supabase.from("availability").insert(
      slots.map((s) => ({
        contractor_id: contractorId,
        ...s,
      }))
    );

    if (error) return { error: error.message };
  }

  revalidatePath("/pro/availability");
  return { success: true };
}
