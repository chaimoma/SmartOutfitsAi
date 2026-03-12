"use client";

import Image from "next/image";
import { Trash2, Loader2 } from "lucide-react";

export default function ClothingCard({
  item,
  onDelete,
  showMatchScore = false,
  isDeleting = false,
}) {
  return (
    <div className="group relative animate-in fade-in zoom-in-95 duration-1000 ease-out">
      {/* Card Container */}
      <div className="relative bg-card overflow-hidden border border-border/10 hover:border-accent/40 hover:gold-glow-hover transition-all duration-700 ease-out">
        {/* Image Container */}
        <div className="aspect-[3/4] relative overflow-hidden bg-muted/20">
          <Image
            src={item.image}
            alt={item.category || "clothing item"}
            fill
            className="object-cover transition-all duration-1000 ease-out group-hover:scale-110 group-hover:rotate-1"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Shimmer Effect */}
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
          </div>

          {/* Luxury Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-40 group-hover:opacity-20 transition-all duration-700" />

          {/* Match Score Badge */}
          {showMatchScore && item.matchScore && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-background/90 backdrop-blur-md px-3 py-1.5 border border-accent/20 animate-in slide-in-from-right duration-500">
              <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-medium tracking-widest text-foreground">
                {item.matchScore}% MATCH
              </span>
            </div>
          )}

          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isDeleting) onDelete(item.id);
              }}
              disabled={isDeleting}
              className="absolute top-4 right-4 p-3 bg-background/90 backdrop-blur-md border border-border/50 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 hover:bg-destructive/10 hover:border-destructive/30 disabled:cursor-not-allowed z-20"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 text-foreground animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 text-foreground hover:text-destructive transition-colors" />
              )}
            </button>
          )}
        </div>

        {/* Content */}
        {item.category && (
          <div className="p-5 relative overflow-hidden group/text">
            <div className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground group-hover:text-accent transition-colors duration-500">
              {item.category}
            </div>
            {/* Elegant slide-line on hover */}
            <div className="absolute bottom-0 left-5 right-5 h-px bg-accent/30 translate-x-[-110%] group-hover/text:translate-x-0 transition-transform duration-700" />
          </div>
        )}
      </div>
    </div>
  );
}