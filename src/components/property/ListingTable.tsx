import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, Pencil, Power, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PriceDisplay, StatusBadge } from "./PropertyBits";
import { propertyService } from "@/services/propertyService";
import type { Property } from "@/types/property";

export function ListingTable({ items, adminActions }: { items: Property[]; adminActions?: boolean }) {
  const [toDelete, setToDelete] = useState<Property | null>(null);
  return (
    <>
      <ul className="divide-y divide-border/60 rounded-xl border border-border/60 bg-card">
        {items.map((p) => (
          <li key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <img src={p.images[0]} alt="" className="h-16 w-24 rounded-md object-cover" />
            <div className="flex-1">
              <p className="font-medium"><Link to="/terrenos/$id" params={{ id: p.id }} className="hover:text-primary-glow hover:underline">{p.title}</Link></p>
              <div className="mt-1 flex items-center gap-3 text-sm"><PriceDisplay value={p.price} /><StatusBadge status={p.status} /></div>
            </div>
            <div className="flex flex-wrap gap-1">
              <Button asChild variant="ghost" size="sm"><Link to="/terrenos/$id" params={{ id: p.id }} aria-label={`Visualizar ${p.title}`}><Eye /></Link></Button>
              <Button asChild variant="ghost" size="sm"><Link to="/anuncios/$id/editar" params={{ id: p.id }} aria-label={`Editar ${p.title}`}><Pencil /></Link></Button>
              {adminActions && p.status !== "publicado" && (
                <Button variant="ghost" size="sm" aria-label={`Publicar ${p.title}`} onClick={() => { propertyService.setStatus(p.id, "publicado"); toast.success("Anúncio publicado (demonstração)."); }}><Send /></Button>
              )}
              {adminActions && p.status === "publicado" && (
                <Button variant="ghost" size="sm" aria-label={`Desativar ${p.title}`} onClick={() => { propertyService.setStatus(p.id, "desativado"); toast.success("Anúncio desativado (demonstração)."); }}><Power /></Button>
              )}
              <Button variant="ghost" size="sm" aria-label={`Excluir ${p.title}`} onClick={() => setToDelete(p)}><Trash2 className="text-destructive" /></Button>
            </div>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Excluir anúncio?"
        description={`"${toDelete?.title ?? ""}" será removido nesta sessão de demonstração.`}
        confirmLabel="Excluir"
        onConfirm={() => { if (toDelete) { propertyService.remove(toDelete.id); toast.success("Anúncio excluído (demonstração)."); } setToDelete(null); }}
      />
    </>
  );
}
