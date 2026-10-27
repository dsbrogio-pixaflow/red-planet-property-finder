import { useMemo, useState } from "react";
import { Eye, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/common/FormField";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ImageUploader } from "./ImageUploader";
import { PropertyCard } from "./PropertyCard";
import { FEATURE_OPTIONS, REGIONS, ADMIN_ADVERTISER } from "@/data/properties";
import type { MarsRegion, PropertyInput, PropertyStatus } from "@/types/property";
import { formatBRL, parseBRLInput } from "@/utils/format";
import { validateProperty, type PropertyErrors } from "@/utils/validateProperty";
import { cn } from "@/lib/utils";

const selectCls =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export const EMPTY_PROPERTY: PropertyInput = {
  title: "",
  description: "",
  price: 0,
  area: 0,
  region: "Tharsis",
  location: "",
  features: [],
  highlight: "",
  pointsOfInterest: [],
  status: "rascunho",
  images: [],
};

export function PropertyForm({
  initial = EMPTY_PROPERTY,
  submitLabel = "Salvar",
  onSubmit,
  onCancel,
}: {
  initial?: PropertyInput;
  submitLabel?: string;
  onSubmit: (v: PropertyInput) => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState<PropertyInput>(initial);
  const [priceText, setPriceText] = useState(initial.price ? formatBRL(initial.price) : "");
  const [errors, setErrors] = useState<PropertyErrors>({});
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [preview, setPreview] = useState(false);
  const dirty = useMemo(() => JSON.stringify(v) !== JSON.stringify(initial), [v, initial]);

  const set = <K extends keyof PropertyInput>(k: K, val: PropertyInput[K]) => setV((s) => ({ ...s, [k]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateProperty(v);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({ ...v, highlight: v.highlight.trim() || v.features[0] });
  };

  const cancel = () => (dirty ? setConfirmDiscard(true) : onCancel());

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <FormField id="p-title" label="Título" required error={errors.title}>
          <Input id="p-title" value={v.title} onChange={(e) => set("title", e.target.value)} aria-invalid={!!errors.title} aria-describedby={errors.title ? "p-title-error" : undefined} />
        </FormField>
        <FormField id="p-desc" label="Descrição" required error={errors.description}>
          <Textarea id="p-desc" rows={5} value={v.description} onChange={(e) => set("description", e.target.value)} aria-invalid={!!errors.description} />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="p-price" label="Preço (R$)" required error={errors.price}>
            <Input
              id="p-price"
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={priceText}
              onChange={(e) => {
                const n = parseBRLInput(e.target.value);
                set("price", n);
                setPriceText(n ? formatBRL(n) : "");
              }}
              aria-invalid={!!errors.price}
            />
          </FormField>
          <FormField id="p-area" label="Área (m²)" required error={errors.area}>
            <Input id="p-area" type="number" min={1} value={v.area || ""} onChange={(e) => set("area", Number(e.target.value))} aria-invalid={!!errors.area} />
          </FormField>
          <FormField id="p-region" label="Região" required>
            <select id="p-region" className={selectCls} value={v.region} onChange={(e) => set("region", e.target.value as MarsRegion)}>
              {REGIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </FormField>
          <FormField id="p-loc" label="Localização" required error={errors.location}>
            <Input id="p-loc" value={v.location} onChange={(e) => set("location", e.target.value)} aria-invalid={!!errors.location} />
          </FormField>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">Características <span className="text-primary">*</span></legend>
          <div className="flex flex-wrap gap-2">
            {FEATURE_OPTIONS.map((f) => {
              const on = v.features.includes(f);
              return (
                <button key={f} type="button" aria-pressed={on}
                  onClick={() => set("features", on ? v.features.filter((x) => x !== f) : [...v.features, f])}
                  className={cn("rounded-full border px-3 py-1 text-xs", on ? "border-primary bg-primary/15" : "border-border text-muted-foreground hover:text-foreground")}
                >{f}</button>
              );
            })}
          </div>
          {errors.features && <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.features}</p>}
        </fieldset>

        <FormField id="p-hl" label="Característica principal (destaque)" hint="Opcional — usa a primeira característica se vazio.">
          <Input id="p-hl" value={v.highlight} onChange={(e) => set("highlight", e.target.value)} />
        </FormField>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Pontos de interesse</legend>
          {v.pointsOfInterest.map((p, i) => (
            <div key={i} className="flex gap-2">
              <Input aria-label={`Nome do ponto ${i + 1}`} placeholder="Nome" value={p.name}
                onChange={(e) => set("pointsOfInterest", v.pointsOfInterest.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
              <Input aria-label={`Distância do ponto ${i + 1} em km`} placeholder="km" type="number" min={0} className="w-28" value={p.distanceKm || ""}
                onChange={(e) => set("pointsOfInterest", v.pointsOfInterest.map((x, j) => (j === i ? { ...x, distanceKm: Number(e.target.value) } : x)))} />
              <Button type="button" variant="ghost" size="icon" aria-label={`Remover ponto ${i + 1}`}
                onClick={() => set("pointsOfInterest", v.pointsOfInterest.filter((_, j) => j !== i))}><Trash2 /></Button>
            </div>
          ))}
          {errors.poi && <p role="alert" className="text-xs text-destructive">{errors.poi}</p>}
          <Button type="button" variant="glass" size="sm" onClick={() => set("pointsOfInterest", [...v.pointsOfInterest, { name: "", distanceKm: 0 }])}>
            <Plus /> Adicionar ponto
          </Button>
          <p className="text-xs text-muted-foreground">Distâncias aproximadas e demonstrativas.</p>
        </fieldset>
      </div>

      <div className="space-y-5">
        <FormField id="p-status" label="Status">
          <select id="p-status" className={selectCls} value={v.status} onChange={(e) => set("status", e.target.value as PropertyStatus)}>
            <option value="rascunho">Rascunho</option>
            <option value="publicado">Publicado</option>
            <option value="desativado">Desativado</option>
          </select>
        </FormField>
        <div>
          <p className="mb-1.5 text-sm font-medium">Imagens</p>
          <ImageUploader images={v.images} onChange={(imgs) => set("images", imgs)} />
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <Button type="submit" variant="hero"><Save /> {submitLabel}</Button>
          <Button type="button" variant="glass" onClick={() => setPreview(true)}><Eye /> Visualizar anúncio</Button>
          <Button type="button" variant="ghost" onClick={cancel}>Cancelar</Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title="Descartar alterações?"
        description="As alterações não salvas serão perdidas."
        confirmLabel="Descartar"
        onConfirm={onCancel}
      />
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Pré-visualização do cartão</DialogTitle></DialogHeader>
          <PropertyCard
            property={{
              ...v,
              id: "preview",
              title: v.title || "Título do anúncio",
              location: v.location || "Localização",
              highlight: v.highlight || v.features[0] || "Destaque",
              images: v.images.length ? v.images : [""],
              publishedAt: new Date().toISOString().slice(0, 10),
              advertiser: ADMIN_ADVERTISER,
            }}
          />
        </DialogContent>
      </Dialog>
    </form>
  );
}
