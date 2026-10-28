import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageShell, PageHeading, DemoBadge } from "@/components/layout/PageShell";
import { PropertyForm } from "@/components/property/PropertyForm";
import { propertyService } from "@/services/propertyService";
import { DEMO_USER_ADVERTISER } from "@/services/authService";

export const Route = createFileRoute("/anuncios/novo")({
  head: () => ({
    meta: [
      { title: "Novo anúncio — Mars Real Estate" },
      { name: "description", content: "Crie um anúncio demonstrativo de terreno em Marte." },
      { property: "og:title", content: "Novo anúncio — Mars Real Estate" },
      { property: "og:description", content: "Formulário demonstrativo de anúncio." },
    ],
  }),
  component: NewListing,
});

function NewListing() {
  const navigate = useNavigate();
  return (
    <PageShell>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-12 sm:px-6">
        <PageHeading eyebrow="Anunciar" title="Novo anúncio" />
        <DemoBadge>Modo demonstrativo: o anúncio fica apenas nesta sessão do navegador e some ao recarregar a página.</DemoBadge>
        <PropertyForm
          onCancel={() => navigate({ to: "/meus-anuncios" })}
          onSubmit={(v) => {
            propertyService.create(v, DEMO_USER_ADVERTISER);
            toast.success("Anúncio criado nesta sessão (demonstração).");
            navigate({ to: "/meus-anuncios" });
          }}
        />
      </div>
    </PageShell>
  );
}
