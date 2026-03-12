import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  CheckCircle,
  Briefcase,
  Camera,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getContractorById } from "@/lib/queries/contractors";
import { getReviewsForContractor } from "@/lib/queries/reviews";
import { getPortfolioPhotos } from "@/lib/queries/portfolio";
import { isContractorFavorited } from "@/lib/queries/favorites";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReviewList } from "@/components/reviews/review-list";
import { PhotoGallery } from "@/components/portfolio/photo-gallery";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { formatCurrency } from "@/lib/utils/format";
import type { ServiceCategory } from "@/types";

export default async function ContractorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [contractor, reviews, portfolioPhotos] = await Promise.all([
    getContractorById(id),
    getReviewsForContractor(id),
    getPortfolioPhotos(id),
  ]);

  if (!contractor) notFound();

  // Check favorite status for logged-in users
  let isFavorited = false;
  if (user) {
    isFavorited = await isContractorFavorited(user.id, id);
  }

  const profile = contractor.profiles;
  const services = contractor.contractor_services || [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Link */}
      <Link
        href="/explore"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to Explore
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative">
          <Avatar
            src={profile.avatar_url}
            name={profile.full_name}
            size="lg"
            className="h-24 w-24 text-2xl"
          />
          {contractor.is_verified && (
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
              <CheckCircle size={14} className="text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {contractor.business_name || profile.full_name}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                <StarRating rating={contractor.rating_avg} size={18} />
                <span className="text-sm text-gray-600">
                  {contractor.rating_avg.toFixed(1)} ({contractor.review_count}{" "}
                  review{contractor.review_count !== 1 ? "s" : ""})
                </span>
              </div>
            </div>
            {user && (
              <div className="flex items-center gap-2">
                <FavoriteButton
                  contractorId={id}
                  initialFavorited={isFavorited}
                  variant="inline"
                  size="md"
                />
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
            {contractor.years_experience > 0 && (
              <span className="flex items-center gap-1">
                <Briefcase size={14} />
                {contractor.years_experience} year
                {contractor.years_experience !== 1 ? "s" : ""} experience
              </span>
            )}
            {contractor.is_verified && (
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle size={14} />
                Verified Pro
              </span>
            )}
            {contractor.hourly_rate && (
              <span className="flex items-center gap-1">
                <Clock size={14} />
                From {formatCurrency(contractor.hourly_rate)}/hr
              </span>
            )}
          </div>
          {contractor.bio && (
            <p className="mt-4 leading-relaxed text-gray-700">
              {contractor.bio}
            </p>
          )}
          <div className="mt-6 flex items-center gap-3">
            <Link href={`/book/${contractor.id}`}>
              <Button size="lg">Book This Pro</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Services */}
      <Card className="mt-8">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Services</h2>
        </CardHeader>
        <CardContent>
          {services.length > 0 ? (
            <div className="space-y-3">
              {services.map(
                (cs: {
                  id: string;
                  price: number | null;
                  price_unit: string;
                  services: {
                    name: string;
                    category: string;
                    description: string | null;
                  };
                }) => (
                  <div
                    key={cs.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            cs.services.category as ServiceCategory
                          }
                        >
                          {cs.services.category}
                        </Badge>
                        <span className="font-medium text-gray-900">
                          {cs.services.name}
                        </span>
                      </div>
                      {cs.services.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {cs.services.description}
                        </p>
                      )}
                    </div>
                    {cs.price && (
                      <span className="font-semibold text-emerald-600">
                        {formatCurrency(cs.price)}
                        <span className="text-xs font-normal text-gray-500">
                          /{cs.price_unit}
                        </span>
                      </span>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No services listed yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Portfolio */}
      {portfolioPhotos.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Camera size={18} className="text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Portfolio ({portfolioPhotos.length})
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            <PhotoGallery photos={portfolioPhotos} />
          </CardContent>
        </Card>
      )}

      {/* Reviews */}
      <Card className="mt-8">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Reviews ({reviews.length})
          </h2>
        </CardHeader>
        <CardContent>
          <ReviewList reviews={reviews} />
        </CardContent>
      </Card>
    </div>
  );
}
