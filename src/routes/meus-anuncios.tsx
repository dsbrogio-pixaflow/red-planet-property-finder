
import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Plus,
  MapPin,
  Maximize2,
  BedDouble,
  Bath,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  PageShell,
  PageHeading,
} from "@/components/layout/PageShell";

import { EmptyState } from "@/components/common/States";
import { PriceDisplay } from "@/components/property/PropertyBits";

import { useMyProperties } from "@/hooks/useApiProperties";

import {
  authService,
  type AuthUser,
} from "@/services/authService";

import { propertyApi } from "@/services/propertyApi";

import { formatArea } from "@/utils/format";

import fallbackImage from "@/assets/olympus.jpg";

import type {
  ApiPropertyStatus,
  ApiProperty,
} from "@/types/api";

export const Route = createFileRoute("/meus-anuncios")({
  head: () => ({
    meta: [
      { title: "Meus anúncios — Mars Real Estate" },
      { name: "description", content: "Gerencie seus imóveis nas colônias marcianas." },
    ],
  }),
  component: Mine,
});

const STATUS_LABEL: Record<ApiPropertyStatus, string> = {
  PUBLISHED: "Publicado",
  INACTIVE: "Inativo",
  SOLD: "Vendido",
};

const STATUS_CLASS: Record<ApiPropertyStatus, string> = {
  PUBLISHED: "border-success/40 bg-success/10 text-success",
  INACTIVE: "border-border bg-muted text-muted-foreground",
  SOLD: "border-primary/40 bg-primary/10 text-primary",
};

const selectCls =
  "h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function Mine() {
  const [user, setUser] = useState<AuthUser | null | undefined>(
    undefined
  );

  const queryClient = useQueryClient();

  // Acompanhar a sessão de autenticação
  useEffect(() => {
    const syncUser = () => {
      setUser(authService.getCurrentUser());
    };

    syncUser();

    return authService.subscribe(syncUser);
  }, []);

  const {
    data: mine = [],
    isPending,
    isError,
    error,
    refetch,
  } = useMyProperties(user !== undefined && user !== null);

  // Alterar status do anúncio
  const statusMutation = useMutation<
    ApiProperty,
    Error,
    { id: number; status: ApiPropertyStatus }
  >({
    mutationFn: ({ id, status }) =>
      propertyApi.updateStatus(id, status),

    onSuccess: async (_updatedProperty, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["properties", "mine"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["properties", "published"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["properties", "detail", variables.id],
        }),
      ]);

      toast.success(
        `Anúncio atualizado para "${STATUS_LABEL[variables.status]}".`
      );
    },

    onError: (error) => {
      toast.error(
        error.message || "Não foi possível alterar o status do anúncio."
      );
    },
  });

  const newButton = (
    <Button asChild variant="hero">
      <Link to="/anuncios/novo">
        <Plus /> Novo imóvel
      </Link>
    </Button>
  );

  if (user === undefined) {
    return (
      <PageShell>
        <div className="py-20 text-center text-muted-foreground">
          Verificando autenticação...
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <PageHeading
            eyebrow="Área do anunciante"
            title="Meus anúncios"
            description="Entre na sua conta para administrar seus imóveis."
          />

          <Button asChild variant="hero" className="mt-6">
            <Link to="/login">Entrar na minha conta</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-12 sm:px-6">

        <PageHeading
          eyebrow={user.fullName}
          title="Meus anúncios"
          description={`${mine.length} ${
            mine.length === 1 ? "imóvel cadastrado" : "imóveis cadastrados"
          }`}
          actions={newButton}
        />

        {/* Carregamento */}
        {isPending && (
          <div className="py-16 text-center text-muted-foreground">
            Consultando seus imóveis...
          </div>
        )}

        {/* Erro */}
        {isError && (
          <div className="rounded-xl border border-border/60 bg-card p-8 text-center">
            <p className="text-destructive">
              Não foi possível carregar seus anúncios.
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Erro de comunicação com o servidor."}
            </p>

            <Button
              variant="outline"
              className="mt-5"
              onClick={() => void refetch()}
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Nenhum anúncio */}
        {!isPending && !isError && mine.length === 0 && (
          <EmptyState
            title="Você ainda não tem imóveis cadastrados"
            description="Cadastre seu primeiro habitat para começar a anunciar nas colônias marcianas."
            action={newButton}
          />
        )}

        {/* Lista de anúncios */}
        {!isPending && !isError && mine.length > 0 && (
          <div className="space-y-4">

            {mine.map((property) => {
              const primaryImage =
                property.images.find((image) => image.primary) ??
                property.images[0];

              const imageUrl =
                primaryImage?.imageUrl ?? fallbackImage;

              const location = [
                property.complexName,
                property.sectorName,
                property.colonyName,
              ].join(" · ");

              const updating =
                statusMutation.isPending &&
                statusMutation.variables?.id === property.id;

              return (
                <article
                  key={property.id}
                  className="grid overflow-hidden rounded-xl border border-border/60 bg-card shadow-card sm:grid-cols-[220px_1fr]"
                >

                  {/* Imagem */}
                  <div className="aspect-[16/10] overflow-hidden bg-muted sm:aspect-auto">
                    <img
                      src={imageUrl}
                      alt={property.title}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = fallbackImage;
                      }}
                      className="size-full object-cover"
                    />
                  </div>

                  {/* Informações */}
                  <div className="flex flex-col justify-between gap-4 p-5">

                    <div className="space-y-3">

                      <div className="flex flex-wrap items-center justify-between gap-2">

                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[property.status]}`}
                        >
                          {STATUS_LABEL[property.status]}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          ID: {property.id}
                        </span>
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold">
                          {property.title}
                        </h2>

                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" />
                          {location}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">

                        <span className="flex items-center gap-1">
                          <Maximize2 className="size-3.5" />
                          {formatArea(property.habitableArea)}
                        </span>

                        <span className="flex items-center gap-1">
                          <BedDouble className="size-3.5" />
                          {property.bedrooms} dormitórios
                        </span>

                        <span className="flex items-center gap-1">
                          <Bath className="size-3.5" />
                          {property.bathrooms} banheiros
                        </span>
                      </div>

                      <PriceDisplay
                        value={property.price}
                        className="text-xl text-primary-glow"
                      />

                      {/* Alteração de status */}
                      <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-3">

                        <label
                          htmlFor={`status-${property.id}`}
                          className="text-sm font-medium"
                        >
                          Situação do anúncio:
                        </label>

                        <select
                          id={`status-${property.id}`}
                          className={selectCls}
                          value={property.status}
                          disabled={updating}
                          aria-label={`Alterar situação de ${property.title}`}
                          onChange={(event) => {
                            const status = event.target.value as ApiPropertyStatus;

                            if (status !== property.status) {
                              statusMutation.mutate({
                                id: property.id,
                                status,
                              });
                            }
                          }}
                        >
                          <option value="PUBLISHED">Publicado</option>
                          <option value="INACTIVE">Inativo</option>
                          <option value="SOLD">Vendido</option>
                        </select>

                        {updating && (
                          <span className="text-xs text-muted-foreground">
                            Salvando...
                          </span>
                        )}

                      </div>

                    </div>

                    <div className="flex flex-wrap justify-end gap-2">

                      <Button asChild variant="outline" size="sm">
                        <Link
                          to="/terrenos/$id"
                          params={{ id: String(property.id) }}
                        >
                          Ver anúncio
                        </Link>
                      </Button>

                      <Button asChild variant="hero" size="sm">
                        <Link
                          to="/anuncios/$id/editar"
                          params={{ id: String(property.id) }}
                        >
                          Editar
                        </Link>
                      </Button>

                    </div>

                  </div>
                </article>
              );
            })}

          </div>
        )}

      </div>
    </PageShell>
  );
}
