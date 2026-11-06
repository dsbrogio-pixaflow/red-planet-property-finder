
import { useQuery } from "@tanstack/react-query";
import { propertyApi } from "@/services/propertyApi";

export function usePublishedProperties() {
  return useQuery({
    queryKey: ["properties", "published"],
    queryFn: propertyApi.listPublished,
    enabled: typeof window !== "undefined",
    staleTime: 30_000,
  });
}

export function useApiProperty(id: number | null) {
  return useQuery({
    queryKey: ["properties", "detail", id],
    queryFn: () => {
      if (id === null) {
        throw new Error("Identificador do imóvel inválido.");
      }

      return propertyApi.getById(id);
    },
    enabled: typeof window !== "undefined" && id !== null,
    staleTime: 30_000,
  });
}

// Listar anúncios do usuário autenticado
export function useMyProperties(enabled = true) {
  return useQuery({
    queryKey: ["properties", "mine"],
    queryFn: propertyApi.listMine,
    enabled: typeof window !== "undefined" && enabled,
    staleTime: 15_000,
  });
}
