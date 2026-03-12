import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getContractorById } from "@/lib/queries/contractors";
import { BookingForm } from "@/components/bookings/booking-form";
import { Avatar } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { Card, CardContent } from "@/components/ui/card";

export default async function BookPage({
  params,
}: {
  params: Promise<{ contractorId: string }>;
}) {
  const { contractorId } = await params;
  const contractor = await getContractorById(contractorId);

  if (!contractor) notFound();

  const profile = contractor.profiles;
  const services = contractor.contractor_services || [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href={`/contractor/${contractorId}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to profile
      </Link>

      {/* Contractor summary */}
      <Card className="mb-6">
        <CardContent className="flex items-center gap-4 py-4">
          <Avatar
            src={profile.avatar_url}
            name={profile.full_name}
            size="md"
          />
          <div>
            <h2 className="font-semibold text-gray-900">
              {contractor.business_name || profile.full_name}
            </h2>
            <div className="flex items-center gap-2">
              <StarRating rating={contractor.rating_avg} size={14} />
              <span className="text-xs text-gray-500">
                ({contractor.review_count} reviews)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Book a Service
      </h1>

      <BookingForm
        contractorId={contractorId}
        contractorServices={services}
      />
    </div>
  );
}
