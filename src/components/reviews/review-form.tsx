"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { createClient } from "@/lib/supabase/client";

interface ReviewFormProps {
  bookingId: string;
  contractorId: string;
  clientId: string;
  onSuccess?: () => void;
}

export function ReviewForm({
  bookingId,
  contractorId,
  clientId,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("reviews").insert({
      booking_id: bookingId,
      contractor_id: contractorId,
      client_id: clientId,
      rating,
      comment: comment || null,
    });

    if (error) {
      toast.error("Failed to submit review");
    } else {
      toast.success("Review submitted!");
      onSuccess?.();
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Rating
        </label>
        <StarRating
          rating={rating}
          size={28}
          interactive
          onChange={setRating}
        />
      </div>
      <div>
        <label
          htmlFor="comment"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Comment (optional)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          placeholder="How was your experience?"
        />
      </div>
      <Button type="submit" loading={loading}>
        Submit Review
      </Button>
    </form>
  );
}
