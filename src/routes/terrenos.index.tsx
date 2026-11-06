
import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { PageShell, PageHeading } from "@/components/layout/PageShell";
import { SearchBar } from "@/components/common/SearchBar";
import { EmptyState } from "@/components/common/States";
import { ApiPropertyCard } from "@/components/property/ApiPropertyCard";

import {
  ApiPropertyFilters,
  ApiSortSelect,
  DEFAULT_API_FILTERS,
  type ApiPropertyFilterState,
} from "@/components/property/ApiPropertyFilters";

import { usePublishedProperties } from "@/hooks/useApiProperties";

import type { ApiProperty } from "@/types/api";
import { MARS_REGIONS, apiListingsForRegion } from "@/data/marsRegions";

const PAGE = 6;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function filterProperties(
  properties: ApiProperty[],
  filters: ApiPropertyFilterState,
): ApiProperty[] {

  const query = normalize(filters.query.trim());

  const minPrice =
    filters.minPrice.trim() !== ""
      ? Number(filters.minPrice)
      : null;

  const maxPrice =
    filters.maxPrice.trim() !== ""
      ? Number(filters.maxPrice)
      : null;

  const minArea =
    filters.minArea.trim() !== ""
      ? Number(filters.minArea)
      : null;

  const filtered = properties.filter((property) => {

    const searchable = normalize([
      property.title,
      property.description,
      property.colonyName,
      property.sectorName,
      property.complexName,
      property.unitCode,
    ].join(" "));

    if (query && !searchable.includes(query)) {
      return false;
    }

    if (minPrice !== null && property.price < minPrice) {
      return false;
    }

    if (maxPrice !== null && property.price > maxPrice) {
      return false;
    }

    if (minArea !== null && property.habitableArea < minArea) {
      return false;
    }

    if (
      filters.colony !== "todas" &&
      property.colonyName !== filters.colony
    ) {
      return false;
    }

    if (
      filters.propertyType !== "todas" &&
      property.propertyType !== filters.propertyType
    ) {
      return false;
    }

    if (
      filters.transactionType !== "todas" &&
      property.transactionType !== filters.transactionType
    ) {
      return false;
    }

    return true;
  });

  return filtered.sort((a, b) => {

    if (filters.sort === "menor-preco") {
      return a.price - b.price;
    }

    if (filters.sort === "maior-preco") {
      return b.price - a.price;
    }

    return (
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
    );
  });
}

export const Route = createFileRoute("/terrenos/")({
  validateSearch: (search: Record<string, unknown>): { q?: string; region?: string } => ({
    ...(typeof search["q"] === "string" && search["q"]
      ? { q: search["q"] }
      : {}),
    ...(typeof search["region"] === "string" && MARS_REGIONS.some(region => region.id === search["region"])
      ? { region: search["region"] } : {}),
  }),

  head: () => ({
    meta: [
      { title: "Explorar imóveis em Marte — Mars Real Estate" },
      { property: "og:type", content: "website" },
      { name: "description", content: "Explore habitats e imóveis nas colônias marcianas." },
      { property: "og:title", content: "Explorar imóveis em Marte" },
    ],
  }),

  component: Catalog,
});

function Catalog() {

  const { q, region: regionId } = Route.useSearch();
  const selectedRegion = MARS_REGIONS.find(region => region.id === regionId);

  const {
    data: properties = [],
    isPending,
    isError,
    error,
    refetch,
  } = usePublishedProperties();

  const [filters, setFilters] =
    useState<ApiPropertyFilterState>({
      ...DEFAULT_API_FILTERS,
      query: q ?? "",
    });

  const [visible, setVisible] = useState(PAGE);

  // Sincronizar a busca recebida pela URL
  useEffect(() => {
    setFilters((current) => ({
      ...current,
      query: q ?? "",
    }));

    setVisible(PAGE);
  }, [q]);

  // Obter colônias disponíveis
  const colonies = useMemo(() => {

    return Array.from(
      new Set(properties.map((p) => p.colonyName))
    ).sort();

  }, [properties]);

  // Validar preços
  const minPrice = filters.minPrice.trim() === ""
    ? null
    : Number(filters.minPrice);

  const maxPrice = filters.maxPrice.trim() === ""
    ? null
    : Number(filters.maxPrice);

  const priceError =
    (minPrice !== null &&
      (!Number.isFinite(minPrice) || minPrice < 0)) ||
    (maxPrice !== null &&
      (!Number.isFinite(maxPrice) || maxPrice < 0))
      ? "Informe preços válidos e não negativos."
      : minPrice !== null &&
          maxPrice !== null &&
          minPrice > maxPrice
        ? "O preço mínimo não pode ser maior que o máximo."
        : null;

  // Aplicar filtros
  const results = useMemo(() => {

    if (priceError) {
      return [];
    }

    return filterProperties(selectedRegion ? apiListingsForRegion(selectedRegion, properties) : properties, filters);

  }, [properties, filters, priceError, selectedRegion]);

  const updateFilters = (newFilters: ApiPropertyFilterState) => {

    setFilters(newFilters);
    setVisible(PAGE);

  };

  return (
    <PageShell>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6">

        <PageHeading
          eyebrow="Catálogo"
          title="Explorar imóveis"
          description="Descubra habitats e residências nas colônias marcianas."
        />
        {selectedRegion && <p className="text-sm text-muted-foreground">
          Região: <strong className="text-foreground">{selectedRegion.name}</strong>{" · "}
          <Link to="/terrenos" search={q ? { q } : {}} className="underline hover:text-foreground">Ver todas as regiões</Link>
        </p>}

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">

          {/* Filtros */}
          <ApiPropertyFilters
            value={filters}
            onChange={updateFilters}
            colonies={colonies}
          />

          {/* Resultados */}
          <div className="space-y-5">

            <SearchBar
              value={filters.query}
              onChange={(query) =>
                updateFilters({ ...filters, query })
              }
              placeholder="Pesquisar imóvel, cidade ou colônia"
            />

            {priceError && (
              <p className="text-sm text-destructive" role="alert">
                {priceError}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">

              <p
                className="text-sm text-muted-foreground"
                aria-live="polite"
              >
                {isPending
                  ? "Consultando imóveis..."
                  : `${results.length} ${
                      results.length === 1
                        ? "imóvel encontrado"
                        : "imóveis encontrados"
                    }`}
              </p>

              <ApiSortSelect
                value={filters.sort}
                onChange={(sort) =>
                  setFilters({ ...filters, sort })
                }
              />

            </div>

            {/* Carregamento */}
            {isPending && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-80 animate-pulse rounded-xl border border-border/60 bg-card"
                  />
                ))}
              </div>
            )}

            {/* Erro */}
            {isError && (
              <div className="py-16 text-center" role="alert">

                <p className="text-destructive">
                  Não foi possível carregar os imóveis.
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                  {error instanceof Error
                    ? error.message
                    : "Erro de comunicação com o servidor."}
                </p>

                <Button
                  variant="hero"
                  className="mt-5"
                  onClick={() => void refetch()}
                >
                  Tentar novamente
                </Button>

              </div>
            )}

            {/* Nenhum resultado */}
            {!isPending && !isError && results.length === 0 && (
              <EmptyState
                title="Nenhum imóvel encontrado"
                description="Experimente modificar os filtros para explorar outras colônias marcianas."
                action={
                  <Button
                    variant="hero"
                    onClick={() =>
                      updateFilters({ ...DEFAULT_API_FILTERS })
                    }
                  >
                    Limpar filtros
                  </Button>
                }
              />
            )}

            {/* Lista de imóveis */}
            {!isPending && !isError && results.length > 0 && (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

                  {results.slice(0, visible).map((property) => (

                    <ApiPropertyCard
                      key={property.id}
                      property={property}
                    />

                  ))}

                </div>

                {visible < results.length && (
                  <div className="text-center">

                    <Button
                      variant="glass"
                      onClick={() =>
                        setVisible((current) => current + PAGE)
                      }
                    >
                      Carregar mais
                    </Button>

                  </div>
                )}

              </>
            )}

          </div>

        </div>

      </div>

    </PageShell>
  );
}
