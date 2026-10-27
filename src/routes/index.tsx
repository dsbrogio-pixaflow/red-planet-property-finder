import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/PageShell";
import { SearchBar } from "@/components/common/SearchBar";
import { PropertyCard } from "@/components/property/PropertyCard";
import { HowItWorks } from "@/components/home/HowItWorks";
import { useProperties } from "@/hooks/useProperties";
import heroImg from "@/assets/hero-mars.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mars Real Estate — Terrenos fictícios em Marte" },
      { name: "description", content: "Compre já seu terreno em Marte com os melhores preços. Plataforma demonstrativa de anúncios fictícios." },
      { property: "og:title", content: "Mars Real Estate — Terrenos fictícios em Marte" },
      { property: "og:description", content: "Seu próximo destino está entre as estrelas." },
    ],
  }),
  component: Home,
});

function Home() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const featured = useProperties().filter((p) => p.status === "publicado").slice(0, 6);

  return (
    <PageShell>
      <section className="relative isolate overflow-hidden">
        <img src={heroImg} alt="Panorama de Marte ao anoitecer com estrelas" width={1920} height={1088} className="absolute inset-0 -z-20 size-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-horizon" />
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 -z-10 size-[36rem] orbit-ring animate-slow-spin opacity-50" />
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:pt-40">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary-glow">Simulação imobiliária interplanetária</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
            Seu próximo destino está <span className="text-gradient-mars">entre as estrelas.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Compre já seu terreno em Marte com os melhores preços e tenha um pedaço do planeta vermelho.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg">
              <Link to="/terrenos">Explorar terrenos <ArrowRight /></Link>
            </Button>
            <Button asChild variant="glass" size="lg">
              <Link to="/anuncios/novo"><Plus /> Anunciar terreno</Link>
            </Button>
          </div>
          <form
            className="mt-10 flex max-w-xl gap-2 rounded-xl border border-border/60 bg-surface-glass p-2 backdrop-blur"
            onSubmit={(e) => { e.preventDefault(); navigate({ to: "/terrenos", search: { q } }); }}
            role="search"
          >
            <div className="flex-1"><SearchBar value={q} onChange={setQ} id="home-busca" /></div>
            <Button type="submit" variant="hero" className="h-11">Buscar</Button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6" aria-labelledby="destaques">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Em destaque</p>
            <h2 id="destaques" className="mt-1 text-3xl font-semibold">Terrenos selecionados</h2>
          </div>
          <Link to="/terrenos" className="text-sm text-primary-glow hover:underline">Ver todos</Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      </section>

      <section className="starfield border-y border-border/60 bg-card/30" aria-labelledby="como">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">A plataforma</p>
            <h2 id="como" className="mt-1 text-3xl font-semibold">Como funciona</h2>
            <p className="mt-3 text-muted-foreground">
              A Mars Real Estate é uma vitrine demonstrativa de terrenos fictícios no planeta vermelho. Explore, compare e conheça cada anúncio — nenhuma venda real é realizada.
            </p>
          </div>
          <div className="mt-10"><HowItWorks /></div>
        </div>
      </section>
    </PageShell>
  );
}
