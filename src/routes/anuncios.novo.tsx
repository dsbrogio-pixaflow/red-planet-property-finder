import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageShell, PageHeading, DemoBadge } from "@/components/layout/PageShell";
import { PropertyForm } from "@/components/property/PropertyForm";
import { propertyService } from "@/services/propertyService";
import { DEMO_USER_ADVERTISER } from "@/services/authService";

export const Route = createFileRoute("/anuncios/novo")({
  validateSearch: (s: Record<string, unknown>): { tipo?: "proprietario" | "imobiliaria" } => ({
    tipo: s["tipo"] === "imobiliaria" ? "imobiliaria" : s["tipo"] === "proprietario" ? "proprietario" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Novo anúncio — Mars Real Estate" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "description", content: "Crie um anúncio demonstrativo de terreno em Marte." },
      { property: "og:title", content: "Novo anúncio — Mars Real Estate" },
      { property: "og:description", content: "Formulário demonstrativo de anúncio." },
    ],
  }),
  component: NewListing,
});

function NewListing() {
  const navigate = useNavigate();
  const { tipo } = Route.useSearch();
  const perfil = tipo === "imobiliaria" ? "imobiliária" : tipo === "proprietario" ? "proprietário" : undefined;
  return (
    <PageShell>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-12 sm:px-6">
        <PageHeading
          eyebrow="Anunciar"
          title={perfil ? `Novo anúncio — ${perfil}` : "Novo anúncio"}
          description={perfil ? `Fluxo de cadastro para ${perfil}.` : undefined}
        />
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
