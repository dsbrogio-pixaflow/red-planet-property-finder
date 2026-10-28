import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeading } from "@/components/layout/PageShell";
import { SearchBar } from "@/components/common/SearchBar";
import { EmptyState } from "@/components/common/States";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyFilters, SortSelect } from "@/components/property/PropertyFilters";
import { useProperties } from "@/hooks/useProperties";
import { DEFAULT_FILTERS, filterProperties, type PropertyFilterState } from "@/utils/filterProperties";

const PAGE = 6;

export const Route = createFileRoute("/terrenos/")({
  validateSearch: (s: Record<string, unknown>): { q?: string | undefined } => ({
    q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Explorar terrenos em Marte — Mars Real Estate" },
      { name: "description", content: "Catálogo de terrenos fictícios em Marte com filtros por preço, área, região e características." },
      { property: "og:title", content: "Explorar terrenos em Marte" },
      { property: "og:description", content: "Filtre e compare anúncios demonstrativos de terrenos marcianos." },
    ],
  }),
  component: Catalog,
});

function Catalog() {
  const { q } = Route.useSearch();
  const all = useProperties();
  const [filters, setFilters] = useState<PropertyFilterState>({ ...DEFAULT_FILTERS, query: q ?? "" });
  const [visible, setVisible] = useState(PAGE);
  const published = useMemo(() => all.filter((p) => p.status === "publicado"), [all]);
  const results = useMemo(() => filterProperties(published, filters), [published, filters]);
  const update = (f: PropertyFilterState) => { setFilters(f); setVisible(PAGE); };

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6">
        <PageHeading eyebrow="Catálogo" title="Explorar terrenos" description="Anúncios fictícios para fins de demonstração." />
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <PropertyFilters value={filters} onChange={update} />
          <div className="space-y-5">
            <SearchBar value={filters.query} onChange={(query) => update({ ...filters, query })} placeholder="Pesquisar por título ou localização" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {results.length} {results.length === 1 ? "terreno encontrado" : "terrenos encontrados"}
              </p>
              <SortSelect value={filters.sort} onChange={(sort) => setFilters({ ...filters, sort })} />
            </div>
            {results.length === 0 ? (
              <EmptyState
                title="Nenhum terreno nesta órbita"
                description="Ajuste os filtros ou limpe a busca para ver mais resultados."
                action={<Button variant="hero" onClick={() => update({ ...DEFAULT_FILTERS })}>Limpar filtros</Button>}
              />
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {results.slice(0, visible).map((p) => <PropertyCard key={p.id} property={p} />)}
                </div>
                {visible < results.length && (
                  <div className="text-center">
                    <Button variant="glass" onClick={() => setVisible((v) => v + PAGE)}>Carregar mais</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
