"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Image } from "lucide-react";
import { clsx } from "clsx";
import { Badge } from "@/components/ui/badge";
import { PhotoLightbox } from "./photo-lightbox";
import type { ServiceCategory } from "@/types";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  category: ServiceCategory | null;
}

interface PhotoGalleryProps {
  photos: Photo[];
  editable?: boolean;
  onDelete?: (id: string) => void;
  onAddClick?: () => void;
}

const categoryTabs = [
  { key: "all", label: "All" },
  { key: "pool", label: "Pool" },
  { key: "landscaping", label: "Landscaping" },
  { key: "maid", label: "Maid" },
] as const;

type FilterCategory = (typeof categoryTabs)[number]["key"];

export function PhotoGallery({
  photos,
  editable = false,
  onDelete,
  onAddClick,
}: PhotoGalleryProps) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredPhotos = useMemo(() => {
    if (activeFilter === "all") return photos;
    return photos.filter((p) => p.category === activeFilter);
  }, [photos, activeFilter]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = () => {
    if (lightboxIndex !== null && lightboxIndex < filteredPhotos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const goPrev = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setDeletingId(id);
    onDelete?.(id);
    // Reset after a moment in case the parent doesn't remove it immediately
    setTimeout(() => setDeletingId(null), 2000);
  }

  // Count photos per category for tab badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: photos.length };
    for (const p of photos) {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    }
    return counts;
  }, [photos]);

  return (
    <div>
      {/* Filter tabs */}
      {photos.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {categoryTabs.map((tab) => {
            const count = categoryCounts[tab.key] || 0;
            if (tab.key !== "all" && count === 0) return null;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  activeFilter === tab.key
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {tab.label}
                <span
                  className={clsx(
                    "ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                    activeFilter === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-gray-200/80 text-gray-500"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Gallery grid */}
      {filteredPhotos.length > 0 || editable ? (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className={clsx(
                "group relative mb-4 break-inside-avoid overflow-hidden rounded-xl bg-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
                deletingId === photo.id && "scale-95 opacity-50"
              )}
            >
              {/* Photo */}
              <button
                onClick={() => openLightbox(index)}
                className="block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-xl"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || "Portfolio photo"}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </button>

              {/* Hover overlay with caption & category */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex items-end justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {photo.caption && (
                      <p className="truncate text-sm font-medium text-white">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                  {photo.category && (
                    <Badge
                      variant={photo.category}
                      className="shrink-0 text-[10px] shadow-sm"
                    >
                      {photo.category}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Delete button (editable mode) */}
              {editable && (
                <button
                  onClick={(e) => handleDelete(e, photo.id)}
                  className="absolute right-2 top-2 rounded-full bg-red-500/90 p-2 text-white opacity-0 shadow-lg transition-all duration-200 hover:bg-red-600 hover:scale-110 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Delete photo"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}

          {/* Add photo card (editable mode) */}
          {editable && (
            <div className="mb-4 break-inside-avoid">
              <button
                onClick={onAddClick}
                className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <div className="rounded-full bg-gray-100 p-3 transition-colors group-hover:bg-emerald-100">
                  <Plus size={24} />
                </div>
                <span className="text-sm font-medium">Add Photo</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-16">
          <div className="rounded-full bg-gray-100 p-4">
            <Image size={32} className="text-gray-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-500">
            No photos to display
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {editable
              ? "Add your first photo to showcase your work"
              : "This contractor hasn't added portfolio photos yet"}
          </p>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
        <PhotoLightbox
          photo={filteredPhotos[lightboxIndex]}
          onClose={closeLightbox}
          onNext={lightboxIndex < filteredPhotos.length - 1 ? goNext : undefined}
          onPrev={lightboxIndex > 0 ? goPrev : undefined}
          currentIndex={lightboxIndex}
          totalCount={filteredPhotos.length}
        />
      )}
    </div>
  );
}
