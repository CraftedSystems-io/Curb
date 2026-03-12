import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getBookingById } from "@/lib/queries/bookings";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { BookingActions } from "@/components/bookings/booking-actions";
import { ReviewForm } from "@/components/reviews/review-form";
import { ChatWrapper } from "@/components/chat/chat-wrapper";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils/format";

export default async function ClientBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const booking = await getBookingById(id);
  if (!booking) notFound();

  const contractor = booking.contractors;
  const contractorProfile = contractor?.profiles;

  // Check if review exists
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", id)
    .single();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
        <StatusBadge status={booking.status} />
      </div>

      {/* Contractor info */}
      <Card className="mt-6">
        <CardContent className="flex items-center gap-4 py-4">
          <Avatar
            src={contractorProfile?.avatar_url}
            name={contractorProfile?.full_name || "Contractor"}
            size="md"
          />
          <div>
            <h3 className="font-semibold text-gray-900">
              {contractor?.business_name || contractorProfile?.full_name}
            </h3>
            <p className="text-sm text-gray-500">
              {booking.services.name}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="mt-4">
        <CardContent className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(booking.scheduled_date)}
              </p>
              {booking.scheduled_time && (
                <p className="text-xs text-gray-500">
                  at {formatTime(booking.scheduled_time)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-gray-400" />
            <p className="text-sm text-gray-900">{booking.address}</p>
          </div>
          {booking.notes && (
            <div className="flex items-start gap-3">
              <FileText size={16} className="mt-0.5 text-gray-400" />
              <p className="text-sm text-gray-700">{booking.notes}</p>
            </div>
          )}
          {booking.quoted_price && (
            <div className="rounded-lg bg-gray-50 p-3">
              <span className="text-sm text-gray-600">Quoted price: </span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(booking.quoted_price)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-6">
        <BookingActions
          bookingId={booking.id}
          currentStatus={booking.status}
          role="client"
        />
      </div>

      {/* Review (only for completed bookings) */}
      {booking.status === "completed" && !existingReview && (
        <Card className="mt-6">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Leave a Review
            </h2>
          </CardHeader>
          <CardContent>
            <ReviewForm
              bookingId={booking.id}
              contractorId={booking.contractor_id}
              clientId={user.id}
            />
          </CardContent>
        </Card>
      )}

      {/* Chat with contractor */}
      {booking.status !== "cancelled" && booking.status !== "declined" && (
        <ChatWrapper
          bookingId={booking.id}
          currentUserId={user.id}
          otherPartyName={
            contractor?.business_name ||
            contractorProfile?.full_name ||
            "Contractor"
          }
          otherPartyAvatar={contractorProfile?.avatar_url}
        />
      )}
    </div>
  );
}
