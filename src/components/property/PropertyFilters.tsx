import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FEATURE_OPTIONS, REGIONS } from "@/data/properties";
import { DEFAULT_FILTERS, type PropertyFilterState } from "@/utils/filterProperties";
import type { MarsRegion } from "@/types/property";
import { cn } from "@/lib/utils";

const selectCls =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function PropertyFilters({
  value,
  onChange,
}: {
  value: PropertyFilterState;
  onChange: (v: PropertyFilterState) => void;
}) {
  const set = <K extends keyof PropertyFilterState>(k: K, v: PropertyFilterState[K]) =>
    onChange({ ...value, [k]: v });
  const toggleFeature = (f: string) =>
    set(
      "features",
      value.features.includes(f) ? value.features.filter((x) => x !== f) : [...value.features, f],
    );

  return (
    <aside className="space-y-5 rounded-xl border border-border/60 bg-card p-5" aria-label="Filtros">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Filtros</h2>
        <Button variant="ghost" size="sm" onClick={() => onChange({ ...DEFAULT_FILTERS })}>
          <RotateCcw /> Limpar
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="f-min">Preço mín. (R$)</Label>
          <Input id="f-min" type="number" min={0} inputMode="numeric" value={value.minPrice} onChange={(e) => set("minPrice", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-max">Preço máx. (R$)</Label>
          <Input id="f-max" type="number" min={0} inputMode="numeric" value={value.maxPrice} onChange={(e) => set("maxPrice", e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="f-area">Área mínima (m²)</Label>
        <Input id="f-area" type="number" min={0} inputMode="numeric" value={value.minArea} onChange={(e) => set("minArea", e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="f-region">Região</Label>
        <select id="f-region" className={selectCls} value={value.region} onChange={(e) => set("region", e.target.value as MarsRegion | "todas")}>
          <option value="todas">Todas as regiões</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Características</legend>
        <div className="flex flex-wrap gap-2">
          {FEATURE_OPTIONS.map((f) => {
            const on = value.features.includes(f);
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => toggleFeature(f)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  on ? "border-primary bg-primary/15 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {f}
              </button>
            );
          })}
        </div>
      </fieldset>
    </aside>
  );
}

export function SortSelect({
  value,
  onChange,
}: {
  value: PropertyFilterState["sort"];
  onChange: (v: PropertyFilterState["sort"]) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="f-sort" className="whitespace-nowrap text-sm text-muted-foreground">Ordenar por</Label>
      <select id="f-sort" className={cn(selectCls, "w-auto")} value={value} onChange={(e) => onChange(e.target.value as PropertyFilterState["sort"])}>
        <option value="recentes">Mais recentes</option>
        <option value="menor-preco">Menor preço</option>
        <option value="maior-preco">Maior preço</option>
      </select>
    </div>
  );
}
