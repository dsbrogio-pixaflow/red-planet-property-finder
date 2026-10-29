import type { MarsRegion, Property } from "@/types/property";
import { parsePriceFilter } from "./format";

export type SortOption = "menor-preco" | "maior-preco" | "recentes";

export interface PropertyFilterState {
  query: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  region: MarsRegion | "todas";
  features: string[];
  sort: SortOption;
}

export const DEFAULT_FILTERS: PropertyFilterState = {
  query: "",
  minPrice: "",
  maxPrice: "",
  minArea: "",
  region: "todas",
  features: [],
  sort: "recentes",
};

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function getPriceFilterError(f: Pick<PropertyFilterState, "minPrice" | "maxPrice">): string | undefined {
  const min = parsePriceFilter(f.minPrice);
  const max = parsePriceFilter(f.maxPrice);
  if ((min !== null && Number.isNaN(min)) || (max !== null && Number.isNaN(max))) {
    return "Informe preços válidos e não negativos, como R$ 150.000,00.";
  }
  if (min !== null && max !== null && min > max) {
    return "O preço mínimo não pode ser maior que o preço máximo. O último intervalo válido foi mantido.";
  }
  return undefined;
}

export function filterProperties(list: Property[], f: PropertyFilterState): Property[] {
  const q = norm(f.query.trim());
  const priceError = getPriceFilterError(f);
  const min = priceError ? null : parsePriceFilter(f.minPrice);
  const max = priceError ? null : parsePriceFilter(f.maxPrice);
  const minArea = f.minArea ? Number(f.minArea) : null;

  const out = list.filter((p) => {
    if (q && !norm(`${p.title} ${p.location} ${p.region}`).includes(q)) return false;
    if (min !== null && p.price < min) return false;
    if (max !== null && p.price > max) return false;
    if (minArea !== null && p.area < minArea) return false;
    if (f.region !== "todas" && p.region !== f.region) return false;
    if (f.features.length && !f.features.every((ft) => p.features.includes(ft))) return false;
    return true;
  });

  return out.sort((a, b) => {
    if (f.sort === "menor-preco") return a.price - b.price;
    if (f.sort === "maior-preco") return b.price - a.price;
    return b.publishedAt.localeCompare(a.publishedAt);
  });
}
