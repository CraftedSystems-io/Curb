"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { clsx } from "clsx";
import { toggleFavorite } from "@/lib/actions/favorites";

interface FavoriteButtonProps {
  contractorId: string;
  initialFavorited: boolean;
  /** "floating" renders as a circular overlay button; "inline" renders inline */
  variant?: "floating" | "inline";
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: { button: "h-8 w-8", icon: 16 },
  md: { button: "h-10 w-10", icon: 20 },
  lg: { button: "h-12 w-12", icon: 24 },
};

export function FavoriteButton({
  contractorId,
  initialFavorited,
  variant = "floating",
  size = "md",
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [animating, setAnimating] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle(e: React.MouseEvent) {
    // Prevent navigation when inside a Link
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    const newState = !favorited;
    setFavorited(newState);

    // Trigger pop animation
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    startTransition(async () => {
      const result = await toggleFavorite(contractorId);
      if (result.error) {
        // Revert on error
        setFavorited(!newState);
      }
    });
  }

  const { button: buttonSize, icon: iconSize } = sizeConfig[size];

  if (variant === "inline") {
    return (
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={clsx(
          "group inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          favorited
            ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
            : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-rose-500"
        )}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          size={iconSize}
          className={clsx(
            "transition-all duration-300",
            animating && "animate-favorite-pop",
            favorited
              ? "fill-rose-500 text-rose-500"
              : "fill-none text-current group-hover:text-rose-400"
          )}
        />
        <span>{favorited ? "Saved" : "Save"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={clsx(
        "group flex items-center justify-center rounded-full shadow-lg transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "hover:scale-110 active:scale-95",
        buttonSize,
        favorited
          ? "bg-white text-rose-500 hover:bg-rose-50"
          : "bg-white/90 text-gray-400 hover:bg-white hover:text-rose-400"
      )}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        size={iconSize}
        className={clsx(
          "transition-all duration-300",
          animating && "animate-favorite-pop",
          favorited
            ? "fill-rose-500 text-rose-500 drop-shadow-sm"
            : "fill-none text-current"
        )}
      />
    </button>
  );
}
