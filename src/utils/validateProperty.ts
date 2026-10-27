import type { PropertyInput } from "@/types/property";

export type PropertyErrors = Partial<Record<"title" | "description" | "price" | "area" | "location" | "features" | "poi", string>>;

export function validateProperty(v: PropertyInput): PropertyErrors {
  const e: PropertyErrors = {};
  if (!v.title.trim()) e.title = "Informe o título do anúncio.";
  if (v.description.trim().length < 20) e.description = "A descrição deve ter pelo menos 20 caracteres.";
  if (!(v.price > 0)) e.price = "Informe um preço maior que zero.";
  if (!(v.area > 0)) e.area = "Informe uma área maior que zero.";
  if (!v.location.trim()) e.location = "Informe a localização.";
  if (v.features.length === 0) e.features = "Selecione pelo menos uma característica.";
  if (v.pointsOfInterest.some((p) => !p.name.trim() || !(p.distanceKm > 0)))
    e.poi = "Cada ponto de interesse precisa de nome e distância positiva.";
  return e;
}
