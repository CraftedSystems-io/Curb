import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getContractorByProfileId } from "@/lib/queries/contractors";
import { getBookingsForContractor } from "@/lib/queries/bookings";
import { BookingCard } from "@/components/bookings/booking-card";

export default async function ContractorBookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const contractor = await getContractorByProfileId(user.id);
  if (!contractor) redirect("/explore");

  const bookings = await getBookingsForContractor(contractor.id);

  const sections = [
    {
      title: "Pending",
      bookings: bookings.filter((b) => b.status === "pending"),
    },
    {
      title: "Active",
      bookings: bookings.filter((b) =>
        ["accepted", "in_progress"].includes(b.status)
      ),
    },
    {
      title: "Completed",
      bookings: bookings.filter((b) => b.status === "completed"),
    },
    {
      title: "Other",
      bookings: bookings.filter((b) =>
        ["declined", "cancelled"].includes(b.status)
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>

      {sections.map(
        (section) =>
          section.bookings.length > 0 && (
            <section key={section.title} className="mt-8">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {section.title} ({section.bookings.length})
              </h2>
              <div className="space-y-3">
                {section.bookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    otherParty={{
                      name: booking.profiles?.full_name || "Client",
                      avatar_url: booking.profiles?.avatar_url || null,
                    }}
                    href={`/dashboard/bookings/${booking.id}`}
                  />
                ))}
              </div>
            </section>
          )
      )}

      {bookings.length === 0 && (
        <p className="mt-8 text-center text-gray-500">No bookings yet.</p>
      )}
    </div>
  );
}
