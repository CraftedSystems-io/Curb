"use client";

import Link from "next/link";
import { RotateCcw, ArrowRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import type { ServiceCategory } from "@/types";

interface QuickRebookItem {
  contractorId: string;
  contractorName: string;
  businessName: string | null;
  avatarUrl: string | null;
  rating: number;
  reviewCount: number;
  serviceName: string;
  serviceCategory: ServiceCategory;
  lastBookingDate: string;
}

interface QuickRebookProps {
  items: QuickRebookItem[];
}

export function QuickRebook({ items }: QuickRebookProps) {
  if (items.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center gap-2">
        <RotateCcw size={18} className="text-emerald-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Book Again
        </h2>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        Quickly rebook a pro you&apos;ve worked with before
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, i) => (
          <Link
            key={`${item.contractorId}-${i}`}
            href={`/book/${item.contractorId}`}
            className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-50"
          >
            <Avatar
              src={item.avatarUrl}
              name={item.contractorName}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate text-sm">
                {item.businessName || item.contractorName}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <StarRating rating={item.rating} size={12} />
                <span className="text-[11px] text-gray-400">
                  ({item.reviewCount})
                </span>
              </div>
              <Badge
                variant={item.serviceCategory}
                className="mt-1.5"
              >
                {item.serviceName}
              </Badge>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 opacity-0 transition-all group-hover:opacity-100">
              <ArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
