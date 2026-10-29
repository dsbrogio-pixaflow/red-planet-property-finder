import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeading } from "@/components/layout/PageShell";
import { HowItWorks } from "@/components/home/HowItWorks";

export const Route = createFileRoute("/como-funciona")({
  head: () => ({
    meta: [
      { title: "Como funciona — Mars Real Estate" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "description", content: "Entenda como explorar e comparar terrenos fictícios em Marte." },
      { property: "og:title", content: "Como funciona — Mars Real Estate" },
      { property: "og:description", content: "Explore, compare e consulte anúncios demonstrativos de terrenos marcianos." },
    ],
  }),
  component: () => (
    <PageShell>
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6">
        <PageHeading eyebrow="Guia" title="Como funciona" description="Três passos para explorar os anúncios demonstrativos da plataforma. Todos os terrenos são fictícios." />
        <HowItWorks />
        <Button asChild variant="hero"><Link to="/terrenos">Começar a explorar</Link></Button>
      </div>
    </PageShell>
  ),
});
