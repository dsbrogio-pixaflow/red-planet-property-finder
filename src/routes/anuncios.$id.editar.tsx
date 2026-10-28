import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeading, DemoBadge } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/common/States";
import { PropertyForm } from "@/components/property/PropertyForm";
import { propertyService } from "@/services/propertyService";
import { useProperty } from "@/hooks/useProperties";

export const Route = createFileRoute("/anuncios/$id/editar")({
  head: () => ({
    meta: [
      { title: "Editar anúncio — Mars Real Estate" },
      { name: "description", content: "Edição demonstrativa de anúncio." },
      { property: "og:title", content: "Editar anúncio — Mars Real Estate" },
      { property: "og:description", content: "Edição demonstrativa de anúncio." },
    ],
  }),
  component: EditListing,
});

function EditListing() {
  const { id } = Route.useParams();
  const p = useProperty(id);
  const navigate = useNavigate();
  return (
    <PageShell>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-12 sm:px-6">
        {!p ? (
          <EmptyState title="Anúncio não encontrado" action={<Button asChild variant="hero"><Link to="/terrenos">Voltar ao catálogo</Link></Button>} />
        ) : (
          <>
            <PageHeading eyebrow="Editar" title={p.title} />
            <DemoBadge>Alterações valem só nesta sessão. Os oito anúncios originais voltam ao recarregar a página.</DemoBadge>
            <PropertyForm
              initial={{ title: p.title, description: p.description, price: p.price, area: p.area, region: p.region, location: p.location, features: p.features, highlight: p.highlight, pointsOfInterest: p.pointsOfInterest, status: p.status, images: p.images }}
              onCancel={() => window.history.back()}
              onSubmit={(v) => {
                propertyService.update(id, v);
                toast.success("Alterações aplicadas nesta sessão (demonstração).");
                navigate({ to: "/terrenos/$id", params: { id } });
              }}
            />
          </>
        )}
      </div>
    </PageShell>
  );
}
