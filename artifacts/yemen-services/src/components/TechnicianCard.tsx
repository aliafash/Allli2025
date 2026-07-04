import { Link } from "wouter";
import { Heart, MapPin, MessageCircle } from "lucide-react";
import { StarRating } from "@/components/StarRating";
import { useSession } from "@/contexts/SessionContext";
import type { Technician } from "@/lib/types";

export function TechnicianCard({ tech }: { tech: Technician }) {
  const { isFavorite, toggleFavorite } = useSession();
  const avg = tech.ratingCount > 0 ? tech.ratingSum / tech.ratingCount : 0;
  const fav = isFavorite(tech.id);

  return (
    <div className="rounded-xl border bg-card overflow-hidden hover-elevate" data-testid={`card-technician-${tech.id}`}>
      <Link href={`/technician/${tech.id}`} className="block">
        <div className="aspect-[4/3] w-full bg-muted overflow-hidden">
          {tech.photoUrl ? (
            <img src={tech.photoUrl} alt={tech.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
              {tech.name?.charAt(0)}
            </div>
          )}
        </div>
      </Link>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/technician/${tech.id}`}>
            <h3 className="font-semibold text-card-foreground truncate">{tech.name}</h3>
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(tech.id);
            }}
            className="shrink-0"
            data-testid={`button-favorite-${tech.id}`}
          >
            <Heart size={18} className={fav ? "fill-destructive text-destructive" : "text-muted-foreground"} />
          </button>
        </div>
        <p className="text-sm text-primary font-medium">{tech.category}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <MapPin size={12} />
          <span>{tech.city}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <StarRating value={avg} size={13} />
            <span className="text-xs text-muted-foreground">({tech.ratingCount})</span>
          </div>
          <Link
            href={`/chat/${tech.id}`}
            className="flex items-center gap-1 text-xs text-primary font-medium"
            data-testid={`link-chat-${tech.id}`}
          >
            <MessageCircle size={14} />
            محادثة
          </Link>
        </div>
      </div>
    </div>
  );
}
