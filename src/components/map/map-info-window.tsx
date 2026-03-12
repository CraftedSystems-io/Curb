"use client";

import { InfoWindow } from "@vis.gl/react-google-maps";
import Link from "next/link";
import { StarRating } from "@/components/ui/star-rating";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistance, formatCurrency } from "@/lib/utils/format";
import type { NearbyContractor, ServiceCategory } from "@/types";

interface MapInfoWindowProps {
  contractor: NearbyContractor;
  onClose: () => void;
}

export function MapInfoWindow({ contractor, onClose }: MapInfoWindowProps) {
  return (
    <InfoWindow
      position={{ lat: contractor.base_lat, lng: contractor.base_lng }}
      onCloseClick={onClose}
      pixelOffset={[0, -40]}
    >
      <div className="min-w-[240px] p-1">
        <div className="flex items-start gap-3">
          <Avatar
            src={contractor.avatar_url}
            name={contractor.full_name}
            size="md"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {contractor.business_name || contractor.full_name}
            </h3>
            <div className="flex items-center gap-2">
              <StarRating rating={contractor.rating_avg} size={14} />
              <span className="text-xs text-gray-500">
                ({contractor.review_count})
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {formatDistance(contractor.distance_m)} away
            </p>
          </div>
        </div>

        {contractor.services && contractor.services.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {contractor.services.slice(0, 3).map((svc) => (
              <Badge
                key={svc.id}
                variant={svc.category as ServiceCategory}
              >
                {svc.name}
                {svc.price && ` ${formatCurrency(svc.price)}`}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-3">
          <Link href={`/contractor/${contractor.id}`}>
            <Button size="sm" className="w-full">
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    </InfoWindow>
  );
}
