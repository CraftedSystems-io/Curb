import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = user.id;

  // Use service role to delete user data and auth record
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Delete related data in order (respecting foreign keys)
  // Reviews, bookings, messages, device_tokens, contractor_services, services, contractors, favorites, then profile
  await adminClient.from("reviews").delete().eq("client_id", userId);
  await adminClient.from("reviews").delete().eq("contractor_id", userId);
  await adminClient.from("messages").delete().eq("sender_id", userId);
  await adminClient.from("messages").delete().eq("receiver_id", userId);
  await adminClient.from("notifications").delete().eq("user_id", userId);
  await adminClient.from("device_tokens").delete().eq("user_id", userId);
  await adminClient.from("bookings").delete().eq("client_id", userId);

  // If contractor, delete contractor-specific data
  const { data: contractor } = await adminClient
    .from("contractors")
    .select("id")
    .eq("profile_id", userId)
    .single();

  if (contractor) {
    await adminClient.from("bookings").delete().eq("contractor_id", contractor.id);
    await adminClient.from("contractor_services").delete().eq("contractor_id", contractor.id);
    await adminClient.from("availability").delete().eq("contractor_id", contractor.id);
    await adminClient.from("portfolio_photos").delete().eq("contractor_id", contractor.id);
    await adminClient.from("contractors").delete().eq("profile_id", userId);
  }

  await adminClient.from("favorites").delete().eq("client_id", userId);
  await adminClient.from("profiles").delete().eq("id", userId);

  // Delete the auth user
  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete account. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
