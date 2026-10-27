import { Check, MapPin, Navigation } from "lucide-react";
import type { PointOfInterest, PropertyStatus } from "@/types/property";
import { formatBRL, formatKm } from "@/utils/format";
import { cn } from "@/lib/utils";

export function PriceDisplay({ value, className }: { value: number; className?: string }) {
  return <span className={cn("font-display font-semibold tabular-nums", className)}>{formatBRL(value)}</span>;
}

export function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {features.map((f) => (
        <li key={f} className="flex items-center gap-2 text-sm">
          <Check className="size-4 text-primary" aria-hidden /> {f}
        </li>
      ))}
    </ul>
  );
}

export function PointsOfInterest({ points }: { points: PointOfInterest[] }) {
  return (
    <div>
      <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
        {points.map((p) => (
          <li key={p.name} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" aria-hidden /> {p.name}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Navigation className="size-3.5" aria-hidden /> {formatKm(p.distanceKm)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">
        Distâncias demonstrativas, não verificadas.
      </p>
    </div>
  );
}

const STATUS_LABEL: Record<PropertyStatus, string> = {
  publicado: "Publicado",
  rascunho: "Rascunho",
  desativado: "Desativado",
};

export function StatusBadge({ status }: { status: PropertyStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        status === "publicado" && "border-success/40 bg-success/10 text-success",
        status === "rascunho" && "border-warning/40 bg-warning/10 text-warning",
        status === "desativado" && "border-border bg-muted text-muted-foreground",
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
