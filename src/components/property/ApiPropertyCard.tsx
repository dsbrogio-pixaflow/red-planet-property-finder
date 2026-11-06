
import { Link } from "@tanstack/react-router";
import { MapPin, Maximize2, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { PriceDisplay } from "@/components/property/PropertyBits";

import type { ApiProperty, ApiPropertyType } from "@/types/api";
import { formatArea } from "@/utils/format";

import fallbackImage from "@/assets/olympus.jpg";

const PROPERTY_TYPE_LABEL: Record<ApiPropertyType, string> = {
  CYLINDRICAL_HABITAT: "Habitat Cilíndrico Vertical",
  ICE_HOME: "Casa de Gelo",
  UNDERGROUND_MANSION: "Mansão Subterrânea",
  CONNECTED_MODULAR_COMPLEX: "Módulo Modulare Conectado",
  GEODESIC_SUPERADOBE_DOME: "Domo Geodésico SuperAdobe",
};

export function ApiPropertyCard({
  property,
}: {
  property: ApiProperty;
}) {
  const primaryImage =
    property.images.find((image) => image.primary)?.imageUrl ??
    property.images[0]?.imageUrl ??
    fallbackImage;

  const location = [
    property.complexName,
    property.sectorName,
    property.colonyName,
  ].filter(Boolean).join(" · ");

  return (
    <Link
      to="/terrenos/$id"
      params={{ id: String(property.id) }}
      aria-label={`Ver detalhes do imóvel ${property.title}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-card transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <article className="flex flex-1 flex-col">

        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={primaryImage}
            alt={`Imagem do imóvel ${property.title}`}
            loading="lazy"
            width={1280}
            height={832}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = fallbackImage;
            }}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-xs backdrop-blur">
            <Sparkles className="size-3 text-primary" aria-hidden />
            {PROPERTY_TYPE_LABEL[property.propertyType]}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">

          <div>
            <h3 className="text-lg font-semibold transition-colors group-hover:text-primary-glow">
              {property.title}
            </h3>

            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden />
              {location}
            </p>
          </div>

          <div className="mt-auto flex items-end justify-between gap-2">
            <div>
              <PriceDisplay
                value={property.price}
                className="text-xl text-primary-glow"
              />

              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Maximize2 className="size-3" aria-hidden />
                {formatArea(property.habitableArea)}
              </p>
            </div>

            <span className={buttonVariants({ variant: "glass", size: "sm" })}>
              Ver detalhes
            </span>
          </div>

          <span className="text-xs text-muted-foreground">
            {property.transactionType === "SALE" ? "À venda" : "Para alugar"}
          </span>

        </div>
      </article>
    </Link>
  );
}
