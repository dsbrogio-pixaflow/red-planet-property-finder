import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GeographicRegion } from "@/data/marsRegions";

export function MarsRegionInfo({ region, count }: { region: GeographicRegion; count: number }) {
  return <section aria-label="Região selecionada" aria-live="polite" className="grid gap-6 border-t border-border py-8 md:grid-cols-[1fr_auto]">
    <div className="max-w-2xl">
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-primary-glow"><MapPin className="size-4" aria-hidden /> Região selecionada</p>
      <h2 className="mt-3 text-3xl font-semibold">{region.name}</h2>
      <p className="mt-3 text-muted-foreground">{region.description}</p>
      <p className="mt-3 font-mono text-xs text-muted-foreground">{Math.abs(region.latitude).toFixed(2)}° {region.latitude < 0 ? "S" : "N"} · {region.longitude.toFixed(2)}° E · Centro aproximado</p>
      {region.catalogNote && <p className="mt-4 text-sm text-muted-foreground">{region.catalogNote}</p>}
    </div>
    <div className="self-center space-y-4 md:max-w-xs">
      <p className="text-sm">{count > 0 ? `${count} ${count === 1 ? "terreno disponível" : "terrenos disponíveis"}${region.catalogNote ? ` no catálogo de ${region.catalogRegion}` : " nesta região"}.` : "Nenhum terreno anunciado nesta região no momento."}</p>
      {count > 0 && region.catalogRegion && <Button asChild variant="hero" className="h-auto min-h-10 whitespace-normal"><Link to="/terrenos" search={{ region: region.catalogRegion }}>Ver terrenos disponíveis <ArrowRight aria-hidden /></Link></Button>}
    </div>
  </section>;
}