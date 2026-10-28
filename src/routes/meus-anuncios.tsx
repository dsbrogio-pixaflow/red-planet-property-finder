import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeading, DemoBadge } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/common/States";
import { ListingTable } from "@/components/property/ListingTable";
import { useProperties } from "@/hooks/useProperties";
import { DEMO_USER } from "@/services/authService";

export const Route = createFileRoute("/meus-anuncios")({
  head: () => ({
    meta: [
      { title: "Meus anúncios — Mars Real Estate" },
      { name: "description", content: "Gerencie seus anúncios demonstrativos." },
      { property: "og:title", content: "Meus anúncios — Mars Real Estate" },
      { property: "og:description", content: "Área do usuário demonstrativa." },
    ],
  }),
  component: Mine,
});

function Mine() {
  const mine = useProperties().filter((p) => p.advertiser.id === DEMO_USER.id);
  const newBtn = <Button asChild variant="hero"><Link to="/anuncios/novo"><Plus /> Novo anúncio</Link></Button>;
  return (
    <PageShell>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-12 sm:px-6">
        <PageHeading eyebrow={DEMO_USER.name} title="Meus anúncios" description={`${mine.length} ${mine.length === 1 ? "anúncio" : "anúncios"} nesta sessão`} actions={newBtn} />
        <DemoBadge>Demonstração de interface: os anúncios não estão salvos em uma conta real.</DemoBadge>
        {mine.length ? <ListingTable items={mine} /> : <EmptyState title="Você ainda não tem anúncios" description="Crie seu primeiro anúncio para vê-lo aqui." action={newBtn} />}
      </div>
    </PageShell>
  );
}
