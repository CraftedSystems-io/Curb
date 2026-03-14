import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://aoevhlsoqzjsvraeacdr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZXZobHNvcXpqc3ZyYWVhY2RyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzI4MDkyMSwiZXhwIjoyMDg4ODU2OTIxfQ.WPMs7nI0mKGtZbUZ5yV_ESm0WJY_0ikoFWmMBqCxOM8"
);

const DEMO_CLIENT_ID = "e1124314-e402-4310-ab25-b42328470ad8";

async function main() {
  // 1. Create profile for demo client
  console.log("Creating demo client profile...");
  const { error: profileErr } = await supabase.from("profiles").upsert({
    id: DEMO_CLIENT_ID,
    full_name: "Demo User",
    role: "client",
    email: "demo@curb-app.com",
  });

  if (profileErr) {
    console.log("Profile error:", profileErr.message);
    return;
  }
  console.log("  Profile created for demo@curb-app.com");

  // 2. Check nearby contractors
  const { data: contractors } = await supabase.rpc(
    "find_nearby_contractors",
    {
      user_lat: 34.0522,
      user_lng: -118.2437,
      radius_m: 80000,
    }
  );

  console.log("\nNearby contractors:", contractors?.length || 0);
  if (contractors) {
    for (const c of contractors) {
      console.log(
        `  - ${c.business_name} (${Math.round(c.distance_m)}m, rating: ${c.rating_avg})`
      );
    }
  }

  // 3. Check existing bookings for demo user
  const { data: existingBookings } = await supabase
    .from("bookings")
    .select("id, status")
    .eq("client_id", DEMO_CLIENT_ID);

  if (existingBookings && existingBookings.length > 0) {
    console.log(`\nDemo user already has ${existingBookings.length} bookings`);
    return;
  }

  // 4. Create bookings linked to existing contractors
  console.log("\nCreating bookings for demo user...");

  const { data: allContractors } = await supabase
    .from("contractors")
    .select("id, profile_id, business_name")
    .eq("is_active", true)
    .limit(3);

  const { data: services } = await supabase
    .from("services")
    .select("id, name")
    .limit(3);

  if (!allContractors || !services || allContractors.length === 0) {
    console.log("No contractors or services found");
    return;
  }

  // Completed booking with messages and review
  const { data: b1 } = await supabase
    .from("bookings")
    .insert({
      client_id: DEMO_CLIENT_ID,
      contractor_id: allContractors[0].id,
      service_id: services[0].id,
      status: "completed",
      scheduled_date: "2026-03-10",
      scheduled_time: "10:00",
      duration_hours: 2,
      address: "123 Main St, Santa Monica, CA 90401",
      notes: "Regular maintenance",
      quoted_price: 150,
      final_price: 150,
    })
    .select("id")
    .single();

  if (b1) {
    console.log(`  Completed booking with ${allContractors[0].business_name}`);

    await supabase.from("messages").insert([
      {
        booking_id: b1.id,
        sender_id: DEMO_CLIENT_ID,
        content: "Hi! Looking forward to the service tomorrow.",
        is_read: true,
      },
      {
        booking_id: b1.id,
        sender_id: allContractors[0].profile_id,
        content: "Great! I will be there at 10 AM. See you then!",
        is_read: true,
      },
      {
        booking_id: b1.id,
        sender_id: allContractors[0].profile_id,
        content:
          "All done! Everything looks great. Let me know if you need anything.",
        is_read: true,
      },
    ]);
    console.log("  Added messages");

    await supabase.from("reviews").insert({
      booking_id: b1.id,
      client_id: DEMO_CLIENT_ID,
      contractor_id: allContractors[0].id,
      rating: 5,
      comment:
        "Excellent service! Very professional and thorough. Will definitely book again.",
    });
    console.log("  Added review");
  }

  // Accepted (upcoming) booking
  if (allContractors.length > 1) {
    await supabase.from("bookings").insert({
      client_id: DEMO_CLIENT_ID,
      contractor_id: allContractors[1].id,
      service_id: services[1]?.id || services[0].id,
      status: "accepted",
      scheduled_date: "2026-03-20",
      scheduled_time: "09:00",
      duration_hours: 1.5,
      address: "456 Ocean Ave, Venice, CA 90291",
      notes: "Weekly pool service",
      quoted_price: 175,
    });
    console.log(`  Upcoming booking with ${allContractors[1].business_name}`);
  }

  // Pending booking
  if (allContractors.length > 2) {
    await supabase.from("bookings").insert({
      client_id: DEMO_CLIENT_ID,
      contractor_id: allContractors[2].id,
      service_id: services[2]?.id || services[0].id,
      status: "pending",
      scheduled_date: "2026-03-22",
      scheduled_time: "14:00",
      duration_hours: 3,
      address: "789 Sunset Blvd, Los Angeles, CA 90028",
      notes: "Standard cleaning for 2-bedroom apartment",
      quoted_price: 120,
    });
    console.log(`  Pending booking with ${allContractors[2].business_name}`);
  }

  // Add a favorite
  if (allContractors.length > 1) {
    await supabase.from("favorites").upsert(
      {
        client_id: DEMO_CLIENT_ID,
        contractor_id: allContractors[1].id,
      },
      { onConflict: "client_id,contractor_id" }
    );
    console.log("  Added favorite");
  }

  console.log("\n=== DONE ===");
  console.log("Demo account: demo@curb-app.com / CurbDemo2026!");
}

main().catch(console.error);
