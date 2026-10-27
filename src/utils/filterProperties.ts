import type { MarsRegion, Property } from "@/types/property";

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

export function filterProperties(list: Property[], f: PropertyFilterState): Property[] {
  const q = norm(f.query.trim());
  const min = f.minPrice ? Number(f.minPrice) : null;
  const max = f.maxPrice ? Number(f.maxPrice) : null;
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
