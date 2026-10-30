import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, MapPin, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeading, DemoBadge } from "@/components/layout/PageShell";
import { useProperties } from "@/hooks/useProperties";
import type { MarsRegion } from "@/types/property";
import heroImg from "@/assets/hero-mars.jpg";

const REGIONS: { name: MarsRegion; blurb: string }[] = [
  { name: "Tharsis", blurb: "Planalto vulcânico que abriga o Olympus Mons, a maior montanha do sistema solar." },
  { name: "Valles Marineris", blurb: "Sistema de cânions com mais de 4.000 km de extensão." },
  { name: "Elysium", blurb: "Segunda maior região vulcânica, com planícies amplas e horizonte aberto." },
  { name: "Arabia Terra", blurb: "Terras altas craterizadas, ricas em história geológica." },
  { name: "Utopia Planitia", blurb: "Vasta bacia do hemisfério norte, com subsolo rico em gelo." },
  { name: "Hellas", blurb: "Bacia de impacto profunda, com as maiores pressões atmosféricas de Marte." },
];

export const Route = createFileRoute("/descobrir")({
  head: () => ({
    meta: [
      { title: "Descobrir Marte — Mars Real Estate" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "description", content: "Explore as regiões de Marte e encontre terrenos fictícios por região. Mapa 3D interativo em preparação." },
      { property: "og:title", content: "Descobrir Marte — Mars Real Estate" },
      { property: "og:description", content: "Conheça as regiões do planeta vermelho e os terrenos disponíveis em cada uma." },
    ],
  }),
  component: Discover,
});

function Discover() {
  const published = useProperties().filter((p) => p.status === "publicado");
  const countByRegion = (region: MarsRegion) => published.filter((p) => p.region === region).length;

  return (
    <PageShell>
      <section className="relative isolate overflow-hidden border-b border-border/60">
        <img
          src={heroImg}
          alt="Panorama da superfície de Marte ao anoitecer"
          width={1920}
          height={1088}
          className="absolute inset-0 -z-20 size-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-horizon" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary-glow">Exploração planetária</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Descubra as regiões do <span className="text-gradient-mars">planeta vermelho.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Navegue pelas principais regiões de Marte e veja quantos terrenos demonstrativos estão
            disponíveis em cada uma.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6">
        <DemoBadge>
          <span className="flex items-start gap-2">
            <Rocket className="mt-0.5 size-4 shrink-0" aria-hidden />
            O mapa 3D interativo de Marte está em preparação e ainda não está disponível. Enquanto
            isso, explore as regiões abaixo — os dados exibidos são os mesmos do catálogo
            demonstrativo.
          </span>
        </DemoBadge>

        <section aria-labelledby="regioes">
          <PageHeading
            eyebrow="Regiões"
            title="Por onde começar"
            description="Selecione uma região para ver os terrenos anunciados nela."
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {REGIONS.map((r) => {
              const count = countByRegion(r.name);
              return (
                <Link
                  key={r.name}
                  to="/terrenos"
                  search={{ region: r.name }}
                  className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex items-center gap-2 text-primary-glow">
                    <Compass className="size-5" aria-hidden />
                    <span className="text-xs font-medium uppercase tracking-[0.2em]">
                      {count} {count === 1 ? "terreno" : "terrenos"}
                    </span>
                  </span>
                  <h2 className="text-xl font-semibold transition-colors group-hover:text-primary-glow">
                    {r.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">{r.blurb}</p>
                  <span className="mt-auto flex items-center gap-1.5 text-sm text-primary-glow">
                    <MapPin className="size-3.5" aria-hidden /> Ver terrenos da região
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="hero" size="lg">
            <Link to="/terrenos">Ver catálogo completo</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
