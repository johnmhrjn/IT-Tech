"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({ rating, max = 5, size = "md", interactive, onChange }: StarRatingProps) {
  const sizeClass = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  }[size];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => interactive && onChange?.(i + 1)}
          className={cn(!interactive && "pointer-events-none")}
        >
          <Star
            className={cn(
              sizeClass,
              "transition-colors",
              i < Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200",
              interactive && "hover:fill-yellow-300 hover:text-yellow-300 cursor-pointer"
            )}
          />
        </button>
      ))}
    </div>
  );
}
