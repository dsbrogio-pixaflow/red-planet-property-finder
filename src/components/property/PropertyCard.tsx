import { Link } from "@tanstack/react-router";
import { MapPin, Maximize2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Property } from "@/types/property";
import { formatArea } from "@/utils/format";
import { PriceDisplay } from "./PropertyBits";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-card transition-transform hover:-translate-y-1">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={property.images[0]}
          alt={`Paisagem do terreno ${property.title}`}
          loading="lazy"
          width={1280}
          height={832}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-xs backdrop-blur">
          <Sparkles className="size-3 text-primary" aria-hidden /> {property.highlight}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-semibold">
            <Link to="/terrenos/$id" params={{ id: property.id }} className="transition-colors hover:text-primary-glow hover:underline">
              {property.title}
            </Link>
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5" aria-hidden /> {property.location}
          </p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <PriceDisplay value={property.price} className="text-xl text-primary-glow" />
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Maximize2 className="size-3" aria-hidden /> {formatArea(property.area)}
            </p>
          </div>
          <Button asChild variant="glass" size="sm">
            <Link to="/terrenos/$id" params={{ id: property.id }}>
              Ver detalhes
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
