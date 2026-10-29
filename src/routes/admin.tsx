import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeading, DemoBadge } from "@/components/layout/PageShell";
import { SearchBar } from "@/components/common/SearchBar";
import { EmptyState } from "@/components/common/States";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ListingTable } from "@/components/property/ListingTable";
import { PropertyForm } from "@/components/property/PropertyForm";
import { useProperties } from "@/hooks/useProperties";
import { propertyService } from "@/services/propertyService";
import type { PropertyStatus } from "@/types/property";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel administrativo — Mars Real Estate" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "description", content: "Painel administrativo demonstrativo." },
      { property: "og:title", content: "Painel administrativo — Mars Real Estate" },
      { property: "og:description", content: "Gerenciamento demonstrativo de anúncios." },
    ],
  }),
  component: () => <ProtectedRoute requireAdmin><Admin /></ProtectedRoute>,
});

function Admin() {
  const all = useProperties();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<PropertyStatus | "todos">("todos");
  const [creating, setCreating] = useState(false);
  const list = all.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()) && (status === "todos" || p.status === status));
  const stats = [
    { label: "Cadastrados", value: all.length },
    { label: "Publicados", value: all.filter((p) => p.status === "publicado").length },
    { label: "Rascunhos", value: all.filter((p) => p.status === "rascunho").length },
    { label: "Desativados", value: all.filter((p) => p.status === "desativado").length },
  ];
  return (
    <PageShell>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-12 sm:px-6">
        <PageHeading eyebrow="Administração" title="Painel administrativo" actions={
          <div className="flex gap-2">
            <Button variant="glass" onClick={() => { propertyService.reset(); toast.success("Os oito anúncios originais foram restaurados."); }}><RotateCcw /> Restaurar</Button>
            <Button variant="hero" onClick={() => setCreating((v) => !v)}><Plus /> Novo anúncio</Button>
          </div>
        } />
        <DemoBadge>Painel demonstrativo, sem proteção real. Na próxima etapa, as permissões serão verificadas no servidor.</DemoBadge>
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border/60 bg-card p-5">
              <dt className="text-sm text-muted-foreground">{s.label}</dt>
              <dd className="mt-1 font-display text-3xl font-semibold">{s.value}</dd>
            </div>
          ))}
        </dl>
        {creating && (
          <div className="rounded-xl border border-border/60 p-5">
            <PropertyForm onCancel={() => setCreating(false)} onSubmit={(v) => { propertyService.create(v); toast.success("Anúncio criado nesta sessão (demonstração)."); setCreating(false); }} />
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1"><SearchBar value={q} onChange={setQ} placeholder="Pesquisar por título" id="admin-busca" /></div>
          <label htmlFor="admin-status" className="sr-only">Filtrar por status</label>
          <select id="admin-status" value={status} onChange={(e) => setStatus(e.target.value as PropertyStatus | "todos")} className="h-11 rounded-md border border-input bg-background px-3 text-sm">
            <option value="todos">Todos os status</option>
            <option value="publicado">Publicados</option>
            <option value="rascunho">Rascunhos</option>
            <option value="desativado">Desativados</option>
          </select>
        </div>
        {list.length ? <ListingTable items={list} adminActions /> : <EmptyState title="Nenhum anúncio encontrado" />}
      </div>
    </PageShell>
  );
}
