
import { useEffect, useMemo, useState } from "react";

import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  ArrowLeft,
  Calendar,
  MapPin,
  Maximize2,
  MessageSquare,
  UserRound,
  BedDouble,
  Bath,
  Users,
  Pencil,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { PageShell } from "@/components/layout/PageShell";

import { EmptyState } from "@/components/common/States";

import {
  PropertyGallery,
} from "@/components/property/PropertyGallery";

import {
  PriceDisplay,
} from "@/components/property/PropertyBits";

import {
  PropertyImageManager,
} from "@/components/property/PropertyImageManager";

import {
  PROPERTY_TYPE_LABEL,
} from "@/components/property/ApiPropertyFilters";

import {
  useApiProperty,
  useMyProperties,
} from "@/hooks/useApiProperties";

import {
  authService,
  type AuthUser,
} from "@/services/authService";

import type {
  ApiProperty,
} from "@/types/api";

import {
  formatArea,
  formatDate,
} from "@/utils/format";

import fallbackImage from "@/assets/olympus.jpg";

// ======================================================
// CONFIGURAÇÃO DA ROTA
// ======================================================

export const Route = createFileRoute("/terrenos/$id")({
  head: ({ params }) => ({
    meta: [
      {
        title: `Imóvel ${params.id} — Mars Real Estate`,
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "description",
        content: "Conheça os imóveis disponíveis nas colônias marcianas.",
      },
    ],
  }),

  component: Detail,
});

// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

function availabilityLabel(value: boolean | null | undefined) {
  if (value === null || value === undefined) {
    return "Não informado";
  }

  return value ? "Disponível" : "Não disponível";
}

function getTechnicalDetails(property: ApiProperty) {
  const details = property.details;

  if (!details) {
    return [];
  }

  const rows: { label: string; value: string }[] = [];

  if (details.hasParking !== null && details.hasParking !== undefined) {
    rows.push({
      label: "Estacionamento",
      value: details.hasParking
        ? `${details.parkingSpaces ?? 0} vaga(s)`
        : "Não possui",
    });
  }

  if (details.parkingType) {
    rows.push({
      label: "Tipo de estacionamento",
      value: details.parkingType,
    });
  }

  if (details.radiationProtection) {
    rows.push({
      label: "Proteção contra radiação",
      value: details.radiationProtection,
    });
  }

  if (details.radiationProtectionLevel) {
    rows.push({
      label: "Nível de proteção",
      value: details.radiationProtectionLevel,
    });
  }

  if (details.shieldingMaterial) {
    rows.push({
      label: "Material de blindagem",
      value: details.shieldingMaterial,
    });
  }

  if (details.energySource) {
    rows.push({
      label: "Fonte de energia",
      value: details.energySource,
    });
  }

  if (
    details.energyAutonomyHours !== null &&
    details.energyAutonomyHours !== undefined
  ) {
    rows.push({
      label: "Autonomia energética",
      value: `${details.energyAutonomyHours} horas`,
    });
  }

  if (details.energyStorageSystem) {
    rows.push({
      label: "Armazenamento de energia",
      value: details.energyStorageSystem,
    });
  }

  if (details.oxygenSystem !== null && details.oxygenSystem !== undefined) {
    rows.push({
      label: "Sistema de oxigenação",
      value: availabilityLabel(details.oxygenSystem),
    });
  }

  if (
    details.atmosphericPressureControl !== null &&
    details.atmosphericPressureControl !== undefined
  ) {
    rows.push({
      label: "Controle de pressão atmosférica",
      value: availabilityLabel(details.atmosphericPressureControl),
    });
  }

  if (
    details.waterRecycling !== null &&
    details.waterRecycling !== undefined
  ) {
    rows.push({
      label: "Reciclagem de água",
      value: availabilityLabel(details.waterRecycling),
    });
  }

  if (
    details.environmentalControl !== null &&
    details.environmentalControl !== undefined
  ) {
    rows.push({
      label: "Controle ambiental",
      value: availabilityLabel(details.environmentalControl),
    });
  }

  return rows;
}

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================

function Detail() {
  const { id } = Route.useParams();

  const parsedId = Number(id);

  const validId =
    Number.isSafeInteger(parsedId) &&
    parsedId > 0;

  // ====================================================
  // AUTENTICAÇÃO
  // ====================================================

  const [user, setUser] = useState<AuthUser | null | undefined>(
    undefined
  );

  useEffect(() => {
    const syncUser = () => {
      setUser(authService.getCurrentUser());
    };

    syncUser();

    return authService.subscribe(syncUser);
  }, []);

  // ====================================================
  // CONSULTA DO IMÓVEL
  // ====================================================

  const {
    data: property,
    isPending,
    isError,
    error,
    refetch,
  } = useApiProperty(validId ? parsedId : null);

  // ====================================================
  // CONSULTA DOS IMÓVEIS DO USUÁRIO
  // ====================================================

  const {
    data: myProperties = [],
    isSuccess: myPropertiesLoaded,
  } = useMyProperties(
    user !== undefined && user !== null
  );

  // Identificar se o usuário é proprietário do anúncio.
  // Esta verificação controla somente a apresentação dos
  // comandos. A autorização efetiva é feita pelo backend.

  const isOwner = Boolean(
    user &&
    property &&
    myPropertiesLoaded &&
    myProperties.some(
      (item) => item.id === property.id
    )
  );

  // ====================================================
  // PREPARAÇÃO DAS IMAGENS
  // ====================================================

  const images = useMemo(() => {
    if (!property?.images) {
      return [];
    }

    return [...property.images]
      .sort(
        (a, b) =>
          Number(b.primary) - Number(a.primary) ||
          a.displayOrder - b.displayOrder
      )
      .map((image) => image.imageUrl);
  }, [property?.images]);

  // ====================================================
  // INFORMAÇÕES TÉCNICAS
  // ====================================================

  const technicalDetails = useMemo(() => {
    return property
      ? getTechnicalDetails(property)
      : [];
  }, [property]);

  // ====================================================
  // VALIDAÇÃO DO IDENTIFICADOR
  // ====================================================

  if (!validId) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-4 py-20">

          <EmptyState
            title="Identificador inválido"
            description="Não foi possível identificar o imóvel solicitado."
            action={
              <Button asChild variant="hero">
                <Link to="/terrenos">
                  Voltar ao catálogo
                </Link>
              </Button>
            }
          />

        </div>
      </PageShell>
    );
  }

  // ====================================================
  // CARREGAMENTO
  // ====================================================

  if (isPending) {
    return (
      <PageShell>
        <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground">
          Carregando informações do imóvel...
        </div>
      </PageShell>
    );
  }

  // ====================================================
  // ERRO OU IMÓVEL NÃO ENCONTRADO
  // ====================================================

  if (isError || !property) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-4 py-20">

          <EmptyState
            title="Não foi possível carregar o imóvel"
            description={
              error instanceof Error
                ? error.message
                : "Este imóvel não existe ou não está disponível."
            }
            action={
              <div className="flex justify-center gap-2">

                <Button
                  variant="outline"
                  onClick={() => void refetch()}
                >
                  Tentar novamente
                </Button>

                <Button asChild variant="hero">
                  <Link to="/terrenos">
                    Voltar ao catálogo
                  </Link>
                </Button>

              </div>
            }
          />

        </div>
      </PageShell>
    );
  }

  // ====================================================
  // LOCALIZAÇÃO
  // ====================================================

  const location = [
    property.complexName,
    property.sectorName,
    property.colonyName,
    `Unidade ${property.unitCode}`,
  ].join(" · ");

  // ====================================================
  // EXIBIÇÃO
  // ====================================================

  return (
    <PageShell>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">

        {/* Voltar */}
        <Button asChild variant="ghost" size="sm">
          <Link to="/terrenos">
            <ArrowLeft />
            Voltar ao catálogo
          </Link>
        </Button>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.5fr_1fr]">

          {/* ==========================================
              COLUNA PRINCIPAL
          ========================================== */}

          <div className="space-y-8">

            {/* GERENCIAMENTO DE FOTOGRAFIAS */}

            {isOwner && (
              <PropertyImageManager
                propertyId={property.id}
                images={property.images ?? []}
              />
            )}

            {/* GALERIA */}

            <PropertyGallery
              images={images.length > 0 ? images : [fallbackImage]}
              title={property.title}
            />

            {/* DESCRIÇÃO */}

            <section>
              <h2 className="text-xl font-semibold">
                Descrição
              </h2>

              <p className="mt-3 leading-relaxed text-muted-foreground">
                {property.description}
              </p>
            </section>

            {/* CARACTERÍSTICAS */}

            <section>
              <h2 className="mb-4 text-xl font-semibold">
                Características do imóvel
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="flex items-center gap-3 rounded-lg border border-border/60 p-4">
                  <BedDouble className="text-primary" />

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Dormitórios
                    </p>

                    <p className="font-medium">
                      {property.bedrooms}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-border/60 p-4">
                  <Bath className="text-primary" />

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Banheiros
                    </p>

                    <p className="font-medium">
                      {property.bathrooms}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-border/60 p-4">
                  <Maximize2 className="text-primary" />

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Área habitável
                    </p>

                    <p className="font-medium">
                      {formatArea(property.habitableArea)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-border/60 p-4">
                  <Users className="text-primary" />

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Capacidade
                    </p>

                    <p className="font-medium">
                      {property.capacity} habitantes
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* INFRAESTRUTURA */}

            {technicalDetails.length > 0 && (
              <section>

                <h2 className="mb-4 text-xl font-semibold">
                  Infraestrutura e suporte à vida
                </h2>

                <dl className="divide-y divide-border/60 rounded-xl border border-border/60">

                  {technicalDetails.map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between gap-4 px-4 py-3 text-sm"
                    >

                      <dt className="text-muted-foreground">
                        {item.label}
                      </dt>

                      <dd className="text-right font-medium">
                        {item.value}
                      </dd>

                    </div>
                  ))}

                </dl>

              </section>
            )}

          </div>

          {/* ==========================================
              COLUNA LATERAL
          ========================================== */}

          <aside className="h-fit space-y-5 rounded-xl border border-border/60 bg-card p-6 lg:sticky lg:top-24">

            {/* STATUS */}

            <span className="inline-flex rounded-full border border-success/40 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
              Publicado
            </span>

            {/* TÍTULO */}

            <h1 className="text-3xl font-bold">
              {property.title}
            </h1>

            {/* TIPO */}

            <p className="text-sm text-primary">
              {PROPERTY_TYPE_LABEL[property.propertyType]}
            </p>

            {/* LOCALIZAÇÃO */}

            <p className="flex items-start gap-2 text-sm text-muted-foreground">

              <MapPin className="mt-0.5 size-4 shrink-0" />

              {location}

            </p>

            {/* PREÇO */}

            <PriceDisplay
              value={property.price}
              className="block text-3xl text-primary-glow"
            />

            <p className="text-sm text-muted-foreground">
              {property.transactionType === "SALE"
                ? "Imóvel à venda"
                : "Imóvel para aluguel"}
            </p>

            {/* INFORMAÇÕES */}

            <dl className="border-y border-border/60 py-4 text-sm">

              <div className="flex items-center justify-between gap-2">

                <dt className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-4" />
                  Publicado em
                </dt>

                <dd>
                  {formatDate(property.createdAt)}
                </dd>

              </div>

            </dl>

            {/* ANUNCIANTE */}

            <div className="flex items-center gap-3 text-sm">

              <span className="grid size-10 place-items-center rounded-full bg-secondary">
                <UserRound className="size-5 text-primary" />
              </span>

              <div>

                <p className="font-medium">
                  {property.ownerName}
                </p>

                <p className="text-xs text-muted-foreground">
                  {property.ownerAccountType === "AGENCY"
                    ? "Imobiliária"
                    : "Proprietário"}
                </p>

              </div>

            </div>

            {/* AÇÕES DO PROPRIETÁRIO */}

            {isOwner && (
              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <Link
                  to="/anuncios/$id/editar"
                  params={{ id: String(property.id) }}
                >
                  <Pencil />
                  Editar informações do imóvel
                </Link>
              </Button>
            )}

            {/* CONTATO */}

            <Button
              variant="hero"
              className="w-full"
              onClick={() =>
                toast.info(
                  "O contato com o anunciante será disponibilizado em uma etapa posterior."
                )
              }
            >
              <MessageSquare />
              Entrar em contato
            </Button>

            <p className="text-xs text-muted-foreground">
              Anúncio fictício. Não há venda real de propriedades em Marte.
            </p>

          </aside>

        </div>

      </div>

    </PageShell>
  );
}
