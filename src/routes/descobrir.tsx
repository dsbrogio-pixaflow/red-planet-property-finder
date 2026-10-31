import { lazy, Suspense, useState } from "react";
import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { MarsRegionList } from "@/components/discover/MarsRegionList";
import { MarsRegionInfo } from "@/components/discover/MarsRegionInfo";
import { GlobeStatus } from "@/components/discover/GlobeStatus";
import { MARS_REGIONS, listingsForRegion } from "@/data/marsRegions";
import { useProperties } from "@/hooks/useProperties";

const MarsGlobe = lazy(() => import("@/components/discover/MarsGlobe"));

export const Route = createFileRoute("/descobrir")({
  head: () => ({ meta: [
    { title: "Explore Marte — Globo interativo | Mars Real Estate" },
    { name: "description", content: "Explore 18 regiões de Marte em um globo 3D interativo, com coordenadas geográficas e acesso aos terrenos demonstrativos do catálogo." },
    { property: "og:title", content: "Explore Marte — Mars Real Estate" },
    { property: "og:description", content: "Descubra vulcões, cânions e planícies em um globo interativo do planeta vermelho." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Discover,
});

function Discover() {
  const properties = useProperties();
  const [selectedId, setSelectedId] = useState("olympus-mons");
  const region = MARS_REGIONS.find(r => r.id === selectedId) ?? MARS_REGIONS[0];
  if (!region) return null;

  return <PageShell>
    <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16">
      <header className="text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary-glow">Exploração planetária</p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Explore Marte</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Dos vulcões gigantes às antigas bacias de impacto, conheça as regiões que tornam o planeta vermelho único.</p>
      </header>
      <section className="pb-10 pt-10 sm:pt-12" aria-labelledby="regions-heading">
        <h2 id="regions-heading" className="text-center text-2xl font-semibold">Explore as regiões mais interessantes de Marte</h2>
        <p className="mx-auto mb-7 mt-3 max-w-2xl text-center text-sm text-muted-foreground">Conheça as principais regiões geográficas do planeta vermelho e descubra os terrenos disponíveis em cada localidade.</p>
        <MarsRegionList selectedId={selectedId} onSelect={setSelectedId} properties={properties} />
      </section>
    </div>
    <section aria-label="Globo interativo de Marte" className="border-y border-border/60 bg-background">
      <div className="mx-auto max-w-7xl">
        <ClientOnly fallback={<GlobeStatus />}><Suspense fallback={<GlobeStatus />}><MarsGlobe selectedId={selectedId} onSelect={setSelectedId} /></Suspense></ClientOnly>
      </div>
    </section>
    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
      <MarsRegionInfo region={region} count={listingsForRegion(region, properties).length} />
      <p className="border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
        Coordenadas: <a className="underline hover:text-foreground" href="https://planetarynames.wr.usgs.gov/GIS_Downloads" target="_blank" rel="noreferrer">USGS Gazetteer of Planetary Nomenclature</a> (latitude planetocêntrica e longitude leste). Marcadores indicam centros aproximados, não limites geográficos ou posições de lotes.
        {" "}Textura: <a className="underline hover:text-foreground" href="https://astrogeology.usgs.gov/search/map/mars_viking_colorized_global_mosaic_232m" target="_blank" rel="noreferrer">USGS Astrogeology / NASA Ames — Viking MDIM 2.1</a>, mosaico global colorizado de uso público, reduzido a 1024 px. Os anúncios e preços são demonstrativos.
      </p>
    </div>
  </PageShell>;
}