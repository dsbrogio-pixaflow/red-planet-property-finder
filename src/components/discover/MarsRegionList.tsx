import { ArrowUpRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MARS_REGIONS, listingsForRegion } from "@/data/marsRegions";
import type { Property } from "@/types/property";

export function MarsRegionList({ selectedId, onSelect, properties }: { selectedId: string; onSelect: (id: string) => void; properties: Property[] }) {
  return <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Regiões de Marte">
    {MARS_REGIONS.map(region => {
      const selected = selectedId === region.id;
      const count = listingsForRegion(region, properties).length;
      return <Button key={region.id} variant="ghost" aria-pressed={selected} onClick={() => onSelect(region.id)}
        className={`h-auto min-h-12 justify-start gap-3 whitespace-normal rounded-none border-b border-border/50 px-2 py-3 text-left ${selected ? "bg-accent text-primary-glow" : "text-foreground"}`}>
        <MapPin className={selected ? "text-primary-glow" : "text-muted-foreground"} aria-hidden />
        <span className="flex-1"><span className="block">{region.name}</span>{count > 0 && <span className="block text-xs font-normal text-muted-foreground">{count} {count === 1 ? "terreno" : "terrenos"}{region.catalogNote ? ` em ${region.catalogRegion}` : ""}</span>}</span>
        {selected && <ArrowUpRight aria-hidden />}
      </Button>;
    })}
  </div>;
}