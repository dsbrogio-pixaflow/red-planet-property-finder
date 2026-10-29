import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, MapPin, Maximize2, MessageSquare, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/common/States";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { FeatureList, PointsOfInterest, PriceDisplay, StatusBadge } from "@/components/property/PropertyBits";
import { useProperty } from "@/hooks/useProperties";
import { SEED_PROPERTIES } from "@/data/properties";
import { formatArea, formatDate } from "@/utils/format";

export const Route = createFileRoute("/terrenos/$id")({
  head: ({ params }) => {
    const p = SEED_PROPERTIES.find((x) => x.id === params.id);
    const title = p ? `${p.title} — Mars Real Estate` : "Anúncio — Mars Real Estate";
    const description = p ? p.description.slice(0, 150) : "Detalhes de terreno fictício em Marte.";
    return {
      meta: [
        { title },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const p = useProperty(id);

  if (!p) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-4 py-20">
          <EmptyState
            title="Anúncio não encontrado"
            description="Este terreno não existe ou foi removido do catálogo."
            action={<Button asChild variant="hero"><Link to="/terrenos">Voltar ao catálogo</Link></Button>}
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Button asChild variant="ghost" size="sm"><Link to="/terrenos"><ArrowLeft /> Voltar ao catálogo</Link></Button>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-8">
            <PropertyGallery images={p.images} title={p.title} />
            <section>
              <h2 className="text-xl font-semibold">Descrição</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{p.description}</p>
            </section>
            <section>
              <h2 className="mb-3 text-xl font-semibold">Características</h2>
              <FeatureList features={p.features} />
            </section>
            {p.pointsOfInterest.length > 0 && (
              <section>
                <h2 className="mb-3 text-xl font-semibold">Pontos de interesse</h2>
                <PointsOfInterest points={p.pointsOfInterest} />
              </section>
            )}
          </div>
          <aside className="h-fit space-y-5 rounded-xl border border-border/60 bg-card p-6 lg:sticky lg:top-24">
            <StatusBadge status={p.status} />
            <h1 className="text-3xl font-bold">{p.title}</h1>
            <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="size-4" aria-hidden /> {p.location} · {p.region}</p>
            <PriceDisplay value={p.price} className="block text-3xl text-primary-glow" />
            <dl className="grid grid-cols-2 gap-4 border-y border-border/60 py-4 text-sm">
              <div><dt className="flex items-center gap-1 text-muted-foreground"><Maximize2 className="size-3.5" /> Área total</dt><dd className="mt-1 font-medium">{formatArea(p.area)}</dd></div>
              <div><dt className="flex items-center gap-1 text-muted-foreground"><Calendar className="size-3.5" /> Publicado em</dt><dd className="mt-1 font-medium">{formatDate(p.publishedAt)}</dd></div>
            </dl>
            <div className="flex items-center gap-3 text-sm">
              <span className="grid size-10 place-items-center rounded-full bg-secondary"><UserRound className="size-5 text-primary" /></span>
              <div><p className="font-medium">{p.advertiser.name}</p><p className="text-xs text-muted-foreground">Anunciante {p.advertiser.role === "admin" ? "administrador" : ""}</p></div>
            </div>
            <Button variant="hero" className="w-full" onClick={() => toast.info("O contato com o anunciante será disponibilizado em uma etapa posterior.")}>
              <MessageSquare /> Entrar em contato
            </Button>
            <p className="text-xs text-muted-foreground">Anúncio fictício. Não há venda real de propriedades em Marte.</p>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
