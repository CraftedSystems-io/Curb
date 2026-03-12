import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, ArrowLeft, Search, CheckCircle, Briefcase, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getFavoritesForUser } from "@/lib/queries/favorites";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { formatCurrency } from "@/lib/utils/format";
import type { ServiceCategory } from "@/types";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const favorites = await getFavoritesForUser(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Favorites
            </h1>
            <p className="text-sm text-gray-500">
              {favorites.length > 0
                ? `${favorites.length} saved pro${favorites.length !== 1 ? "s" : ""}`
                : "Save your favorite pros for quick rebooking"}
            </p>
          </div>
        </div>
        <Link href="/explore">
          <Button variant="secondary" size="sm">
            <Search size={16} className="mr-1.5" />
            Find Pros
          </Button>
        </Link>
      </div>

      {/* Content */}
      {favorites.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {favorites.map((fav) => {
            const contractor = fav.contractors;
            const profile = contractor?.profiles;
            const services = contractor?.contractor_services || [];

            if (!contractor || !profile) return null;

            return (
              <Card
                key={fav.id}
                className="group relative overflow-hidden transition-all hover:shadow-md"
              >
                {/* Favorite button - top right corner */}
                <div className="absolute right-3 top-3 z-10">
                  <FavoriteButton
                    contractorId={contractor.id}
                    initialFavorited={true}
                    size="sm"
                  />
                </div>

                <Link
                  href={`/contractor/${contractor.id}`}
                  className="block p-5"
                >
                  {/* Contractor info */}
                  <div className="flex items-start gap-4">
                    <Avatar
                      src={profile.avatar_url}
                      name={profile.full_name}
                      size="lg"
                      className="h-16 w-16 text-lg ring-2 ring-white shadow-sm"
                    />
                    <div className="min-w-0 flex-1 pr-8">
                      <h3 className="truncate text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {contractor.business_name || profile.full_name}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <StarRating
                          rating={contractor.rating_avg}
                          size={14}
                        />
                        <span className="text-xs text-gray-500">
                          {contractor.rating_avg.toFixed(1)} ({contractor.review_count})
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {contractor.is_verified && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle size={12} />
                            Verified
                          </span>
                        )}
                        {contractor.years_experience > 0 && (
                          <span className="flex items-center gap-1">
                            <Briefcase size={12} />
                            {contractor.years_experience}yr exp
                          </span>
                        )}
                        {contractor.hourly_rate && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            From {formatCurrency(contractor.hourly_rate)}/hr
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  {services.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {services.slice(0, 4).map(
                        (cs: {
                          id: string;
                          services: {
                            name: string;
                            category: string;
                          };
                        }) => (
                          <Badge
                            key={cs.id}
                            variant={
                              cs.services.category as ServiceCategory
                            }
                          >
                            {cs.services.name}
                          </Badge>
                        )
                      )}
                      {services.length > 4 && (
                        <Badge>+{services.length - 4} more</Badge>
                      )}
                    </div>
                  )}

                  {/* CTA hint */}
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-xs text-gray-400">
                      Tap to view profile
                    </span>
                    <span className="text-sm font-medium text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">
                      Book Now &rarr;
                    </span>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <Heart size={36} className="text-gray-300" />
          </div>
          <h2 className="mt-6 text-xl font-semibold text-gray-900">
            No favorites yet
          </h2>
          <p className="mt-2 max-w-sm text-sm text-gray-500">
            When you find a service pro you love, tap the heart icon to save
            them here for easy rebooking.
          </p>
          <Link href="/explore" className="mt-8">
            <Button size="lg">
              <Search size={18} className="mr-2" />
              Explore Pros Near You
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
