
import { useEffect, useState } from "react";

import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  PageShell,
  PageHeading,
} from "@/components/layout/PageShell";

import { ApiPropertyForm } from "@/components/property/ApiPropertyForm";

import { authService } from "@/services/authService";
import type { AuthUser } from "@/services/authService";

import { propertyApi } from "@/services/propertyApi";

import type { ApiPropertyRequest } from "@/services/propertyApi";

export const Route = createFileRoute("/anuncios/novo")({
  head: () => ({
    meta: [
      { title: "Novo imóvel — Mars Real Estate" },
      {
        name: "description",
        content: "Cadastre um imóvel nas colônias marcianas.",
      },
    ],
  }),

  component: NewListing,
});

function NewListing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [user, setUser] = useState<AuthUser | null | undefined>(
    undefined
  );

  // Recuperar usuário autenticado
  useEffect(() => {
    const syncUser = () => {
      setUser(authService.getCurrentUser());
    };

    syncUser();

    return authService.subscribe(syncUser);
  }, []);

  const createMutation = useMutation({
    mutationFn: (data: ApiPropertyRequest) =>
      propertyApi.create(data),

    onSuccess: async (property) => {
      await queryClient.invalidateQueries({
        queryKey: ["properties", "published"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["properties", "mine"],
      });

      toast.success("Imóvel publicado com sucesso!");

      await navigate({
        to: "/terrenos/$id",
        params: {
          id: String(property.id),
        },
      });
    },

    onError: (error: Error) => {
      toast.error(
        error.message || "Não foi possível cadastrar o imóvel."
      );
    },
  });

  const handleSubmit = async (data: ApiPropertyRequest) => {
    try {
      await createMutation.mutateAsync(data);
    } catch {
      // O erro já é apresentado pela configuração onError.
    }
  };

  const profile =
    user?.accountType === "AGENCY"
      ? "imobiliária"
      : "proprietário";

  if (user === undefined) {
    return (
      <PageShell>
        <div className="mx-auto max-w-6xl px-4 py-20 text-center text-muted-foreground">
          Verificando autenticação...
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl space-y-5 px-4 py-20 text-center">
          <PageHeading
            eyebrow="Anunciar"
            title="Entre na sua conta"
            description="Você precisa estar autenticado para cadastrar imóveis."
          />

          <Button asChild variant="hero">
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6">

        <PageHeading
          eyebrow="Anunciar"
          title={`Novo imóvel — ${profile}`}
          description="Preencha os dados do seu imóvel e publique seu anúncio em Marte."
        />

        <ApiPropertyForm
          submitLabel="Publicar imóvel"
          onCancel={() => navigate({ to: "/" })}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
        />

      </div>
    </PageShell>
  );
}
