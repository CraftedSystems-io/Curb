"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoLightboxProps {
  photo: { url: string; caption: string | null };
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalCount?: number;
}

export function PhotoLightbox({
  photo,
  onClose,
  onNext,
  onPrev,
  currentIndex,
  totalCount,
}: PhotoLightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowRight":
          onNext?.();
          break;
        case "ArrowLeft":
          onPrev?.();
          break;
      }
    },
    [onClose, onNext, onPrev]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-2 text-white/80 transition-all hover:bg-black/60 hover:text-white"
        aria-label="Close lightbox"
      >
        <X size={24} />
      </button>

      {/* Counter */}
      {currentIndex !== undefined && totalCount !== undefined && (
        <div className="absolute left-4 top-4 z-10 rounded-full bg-black/40 px-3 py-1.5 text-sm font-medium text-white/80">
          {currentIndex + 1} / {totalCount}
        </div>
      )}

      {/* Previous button */}
      {onPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white/80 transition-all hover:bg-black/60 hover:text-white hover:scale-110"
          aria-label="Previous photo"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Next button */}
      {onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white/80 transition-all hover:bg-black/60 hover:text-white hover:scale-110"
          aria-label="Next photo"
        >
          <ChevronRight size={28} />
        </button>
      )}

      {/* Photo */}
      <div className="relative z-[1] flex max-h-[85vh] max-w-[90vw] flex-col items-center animate-in zoom-in-95 fade-in duration-200">
        <img
          src={photo.url}
          alt={photo.caption || "Portfolio photo"}
          className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
        />

        {/* Caption */}
        {photo.caption && (
          <div className="mt-4 max-w-2xl rounded-lg bg-black/50 px-6 py-3 text-center">
            <p className="text-sm text-white/90 sm:text-base">{photo.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}
