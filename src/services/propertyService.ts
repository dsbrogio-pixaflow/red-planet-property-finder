/**
 * Camada de serviço de anúncios — MODO DEMONSTRATIVO.
 * Mantém os dados apenas em memória durante a sessão do navegador.
 * Na próxima etapa, substituir a implementação por chamadas ao Lovable Cloud,
 * mantendo a mesma interface pública.
 */
import { ADMIN_ADVERTISER, SEED_PROPERTIES } from "@/data/properties";
import type { Advertiser, Property, PropertyInput, PropertyStatus } from "@/types/property";

type Listener = () => void;

let state: Property[] = SEED_PROPERTIES.map((p) => ({ ...p }));
const listeners = new Set<Listener>();

function emit(next: Property[]) {
  state = next;
  listeners.forEach((l) => l());
}

export const propertyService = {
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => state,
  getServerSnapshot: () => SEED_PROPERTIES,

  list: () => state,
  listPublished: () => state.filter((p) => p.status === "publicado"),
  getById: (id: string) => state.find((p) => p.id === id),

  create(input: PropertyInput, advertiser: Advertiser = ADMIN_ADVERTISER): Property {
    const slug = input.title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const property: Property = {
      ...input,
      id: `${slug || "anuncio"}-${Date.now().toString(36)}`,
      publishedAt: new Date().toISOString().slice(0, 10),
      advertiser,
    };
    emit([property, ...state]);
    return property;
  },
  update(id: string, input: PropertyInput) {
    emit(state.map((p) => (p.id === id ? { ...p, ...input } : p)));
  },
  setStatus(id: string, status: PropertyStatus) {
    emit(state.map((p) => (p.id === id ? { ...p, status } : p)));
  },
  remove(id: string) {
    emit(state.filter((p) => p.id !== id));
  },
  /** Restaura os oito anúncios originais. */
  reset() {
    emit(SEED_PROPERTIES.map((p) => ({ ...p })));
  },
};
