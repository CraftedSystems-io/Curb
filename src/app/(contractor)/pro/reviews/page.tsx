import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getContractorByProfileId } from "@/lib/queries/contractors";
import { getReviewsForContractor } from "@/lib/queries/reviews";
import { ReviewList } from "@/components/reviews/review-list";
import { StarRating } from "@/components/ui/star-rating";
import { Card, CardContent } from "@/components/ui/card";

export default async function ContractorReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const contractor = await getContractorByProfileId(user.id);
  if (!contractor) redirect("/explore");

  const reviews = await getReviewsForContractor(contractor.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>

      {/* Summary */}
      <Card className="mt-6">
        <CardContent className="flex items-center gap-6 py-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900">
              {contractor.rating_avg > 0
                ? contractor.rating_avg.toFixed(1)
                : "N/A"}
            </p>
            <StarRating rating={contractor.rating_avg} size={20} />
            <p className="mt-1 text-sm text-gray-500">
              {contractor.review_count} review
              {contractor.review_count !== 1 ? "s" : ""}
            </p>
          </div>
          {contractor.review_count > 0 && (
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(
                  (r) => r.rating === star
                ).length;
                const pct =
                  contractor.review_count > 0
                    ? (count / contractor.review_count) * 100
                    : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-3 text-xs text-gray-600">{star}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-xs text-gray-500">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review list */}
      <div className="mt-6">
        <ReviewList reviews={reviews} />
      </div>
    </div>
  );
}
