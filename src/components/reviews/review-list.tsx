import { Avatar } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { formatRelativeTime } from "@/lib/utils/format";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface ReviewListProps {
  reviews: ReviewItem[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-gray-500">No reviews yet.</p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-start gap-3">
            <Avatar
              src={review.profiles.avatar_url}
              name={review.profiles.full_name}
              size="sm"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {review.profiles.full_name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatRelativeTime(review.created_at)}
                </span>
              </div>
              <StarRating rating={review.rating} size={14} />
              {review.comment && (
                <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
