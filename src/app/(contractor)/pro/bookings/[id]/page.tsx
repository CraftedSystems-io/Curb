import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, FileText, Phone, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getBookingById } from "@/lib/queries/bookings";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { BookingActions } from "@/components/bookings/booking-actions";
import { ChatWrapper } from "@/components/chat/chat-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils/format";

export default async function ContractorBookingDetailPage({
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

  const clientProfile = booking.profiles;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/pro/bookings"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to bookings
      </Link>

      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
        <StatusBadge status={booking.status} />
      </div>

      {/* Client info */}
      <Card className="mt-6">
        <CardContent className="py-4">
          <h3 className="mb-3 text-sm font-medium text-gray-500">Client</h3>
          <div className="flex items-center gap-4">
            <Avatar
              src={clientProfile?.avatar_url}
              name={clientProfile?.full_name || "Client"}
              size="md"
            />
            <div>
              <p className="font-semibold text-gray-900">
                {clientProfile?.full_name}
              </p>
              {clientProfile?.email && (
                <p className="flex items-center gap-1 text-sm text-gray-500">
                  <Mail size={12} />
                  {clientProfile.email}
                </p>
              )}
              {clientProfile?.phone && (
                <p className="flex items-center gap-1 text-sm text-gray-500">
                  <Phone size={12} />
                  {clientProfile.phone}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="mt-4">
        <CardContent className="space-y-4 py-4">
          <div>
            <p className="text-sm text-gray-500">Service</p>
            <p className="font-medium text-gray-900">
              {booking.services.name}
            </p>
          </div>
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
          role="contractor"
        />
      </div>

      {/* Chat with client */}
      {booking.status !== "cancelled" && booking.status !== "declined" && (
        <ChatWrapper
          bookingId={booking.id}
          currentUserId={user.id}
          otherPartyName={clientProfile?.full_name || "Client"}
          otherPartyAvatar={clientProfile?.avatar_url}
        />
      )}
    </div>
  );
}
