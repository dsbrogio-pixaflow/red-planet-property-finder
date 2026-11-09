import { useEffect, useMemo, useState } from "react";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { PageShell, PageHeading } from "@/components/layout/PageShell";

import { EmptyState } from "@/components/common/States";

import { ApiPropertyForm } from "@/components/property/ApiPropertyForm";

import { useMyProperties } from "@/hooks/useApiProperties";

import { authService, type AuthUser } from "@/services/authService";

import { propertyApi } from "@/services/propertyApi";

import type { ApiPropertyRequest } from "@/services/propertyApi";
import type { ApiProperty } from "@/types/api";

export const Route = createFileRoute("/anuncios/$id/editar")({
  head: () => ({
    meta: [
      { title: "Editar imóvel — Mars Real Estate" },
      {
        name: "description",
        content: "Edite seu imóvel nas colônias marcianas.",
      },
    ],
  }),

  component: EditListing,
});

// Converter resposta da API para os dados do formulário
function propertyToRequest(property: ApiProperty): ApiPropertyRequest {
  return {
    title: property.title,
    description: property.description,

    propertyType: property.propertyType,
    transactionType: property.transactionType,
    price: property.price,

    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    habitableArea: property.habitableArea,
    capacity: property.capacity,

    colonyName: property.colonyName,
    sectorName: property.sectorName,
    complexName: property.complexName,
    unitCode: property.unitCode,

    ...(property.details
      ? {
          details: {
            hasParking: property.details.hasParking,
            parkingSpaces: property.details.parkingSpaces,
            parkingType: property.details.parkingType,

            radiationProtection: property.details.radiationProtection,

            radiationProtectionLevel: property.details.radiationProtectionLevel,

            shieldingMaterial: property.details.shieldingMaterial,

            energySource: property.details.energySource,

            energyAutonomyHours: property.details.energyAutonomyHours,

            energyStorageSystem: property.details.energyStorageSystem,

            oxygenSystem: property.details.oxygenSystem,

            atmosphericPressureControl: property.details.atmosphericPressureControl,

            waterRecycling: property.details.waterRecycling,

            environmentalControl: property.details.environmentalControl,
          },
        }
      : {}),
    images: property.images.map((image) => ({
      imageUrl: image.imageUrl,
      caption: image.caption,
      displayOrder: image.displayOrder,
      primary: image.primary,
    })),
  };
}

function EditListing() {
  const { id } = Route.useParams();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const propertyId = Number(id);

  const validId = Number.isSafeInteger(propertyId) && propertyId > 0;

  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  // Acompanhar autenticação
  useEffect(() => {
    const syncUser = () => {
      setUser(authService.getCurrentUser());
    };

    syncUser();

    return authService.subscribe(syncUser);
  }, []);

  // Consultar imóveis pertencentes ao usuário autenticado
  const {
    data: properties = [],
    isPending,
    isError,
    error,
    refetch,
  } = useMyProperties(user !== undefined && user !== null && validId);

  const property = properties.find((item) => item.id === propertyId);

  // Preparar dados iniciais do formulário
  const initial = useMemo(() => (property ? propertyToRequest(property) : undefined), [property]);

  // Atualizar imóvel
  const updateMutation = useMutation({
    mutationFn: (data: ApiPropertyRequest) => propertyApi.update(propertyId, data),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["properties", "mine"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["properties", "published"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["properties", "detail", propertyId],
        }),
      ]);

      toast.success("Imóvel atualizado com sucesso!");

      await navigate({
        to: "/meus-anuncios",
      });
    },

    onError: (error: Error) => {
      toast.error(error.message || "Não foi possível atualizar o imóvel.");
    },
  });

  const handleSubmit = async (data: ApiPropertyRequest) => {
    try {
      await updateMutation.mutateAsync(data);
    } catch {
      // O erro já é apresentado pela configuração onError.
    }
  };

  if (user === undefined) {
    return (
      <PageShell>
        <div className="py-20 text-center text-muted-foreground">Verificando autenticação...</div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <PageHeading
            eyebrow="Área do anunciante"
            title="Entre na sua conta"
            description="Você precisa estar autenticado para editar anúncios."
          />

          <Button asChild variant="hero" className="mt-6">
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  if (!validId) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-4 py-20">
          <EmptyState
            title="Identificador inválido"
            description="Não foi possível identificar o imóvel."
            action={
              <Button asChild variant="hero">
                <Link to="/meus-anuncios">Voltar aos meus anúncios</Link>
              </Button>
            }
          />
        </div>
      </PageShell>
    );
  }

  if (isPending) {
    return (
      <PageShell>
        <div className="py-20 text-center text-muted-foreground">
          Carregando informações do imóvel...
        </div>
      </PageShell>
    );
  }

  if (isError) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <p className="text-destructive">Não foi possível carregar o imóvel.</p>

          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Erro de comunicação com o servidor."}
          </p>

          <Button variant="outline" className="mt-5" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        </div>
      </PageShell>
    );
  }

  if (!property || !initial) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-4 py-20">
          <EmptyState
            title="Anúncio não encontrado"
            description="Este imóvel não existe ou não pertence à sua conta."
            action={
              <Button asChild variant="hero">
                <Link to="/meus-anuncios">Voltar aos meus anúncios</Link>
              </Button>
            }
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6">
        <PageHeading
          eyebrow="Gerenciamento de imóveis"
          title={`Editar: ${property.title}`}
          description="Atualize as informações do seu anúncio."
        />

        <ApiPropertyForm
          key={property.id}
          initial={initial}
          submitLabel="Salvar alterações"
          isSubmitting={updateMutation.isPending}
          onCancel={() => navigate({ to: "/meus-anuncios" })}
          onSubmit={handleSubmit}
        />
      </div>
    </PageShell>
  );
}
