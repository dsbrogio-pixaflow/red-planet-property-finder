
import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  propertyApi,
  type ApiPropertyImage,
} from "@/services/propertyApi";

import fallbackImage from "@/assets/olympus.jpg";

const MAX_IMAGES = 20;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function PropertyImageManager({
  propertyId,
  images,
}: {
  propertyId: number;
  images: ApiPropertyImage[];
}) {
  const queryClient = useQueryClient();

  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [validationError, setValidationError] = useState("");

  const refreshProperties = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["properties", "detail", propertyId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["properties", "published"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["properties", "mine"],
      }),
    ]);
  };

  // Adicionar fotografia
  const addMutation = useMutation({
    mutationFn: () =>
      propertyApi.addImage(propertyId, {
        imageUrl: imageUrl.trim(),
        caption: caption.trim() || null,
      }),

    onSuccess: async () => {
      setImageUrl("");
      setCaption("");
      setValidationError("");

      await refreshProperties();

      toast.success("Fotografia adicionada com sucesso!");
    },

    onError: (error: Error) => {
      toast.error(error.message || "Não foi possível adicionar a fotografia.");
    },
  });

  // Definir fotografia principal
  const primaryMutation = useMutation({
    mutationFn: (imageId: number) =>
      propertyApi.setPrimaryImage(propertyId, imageId),

    onSuccess: async () => {
      await refreshProperties();
      toast.success("Imagem principal atualizada.");
    },

    onError: (error: Error) => {
      toast.error(error.message || "Não foi possível alterar a imagem principal.");
    },
  });

  // Excluir fotografia
  const deleteMutation = useMutation({
    mutationFn: (imageId: number) =>
      propertyApi.deleteImage(propertyId, imageId),

    onSuccess: async () => {
      await refreshProperties();
      toast.success("Fotografia excluída com sucesso.");
    },

    onError: (error: Error) => {
      toast.error(error.message || "Não foi possível excluir a fotografia.");
    },
  });

  const isBusy =
    addMutation.isPending ||
    primaryMutation.isPending ||
    deleteMutation.isPending;

  const orderedImages = [...images].sort(
    (a, b) =>
      Number(b.primary) - Number(a.primary) ||
      a.displayOrder - b.displayOrder
  );

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError("");

    const url = imageUrl.trim();

    if (!isHttpUrl(url)) {
      setValidationError(
        "Informe um endereço de imagem válido, começando com HTTP ou HTTPS."
      );
      return;
    }

    addMutation.mutate();
  };

  const handleDelete = (image: ApiPropertyImage) => {
    const confirmed = window.confirm(
      "Deseja realmente excluir esta fotografia?"
    );

    if (confirmed) {
      deleteMutation.mutate(image.id);
    }
  };

  return (
    <section className="space-y-5 rounded-xl border border-border/60 bg-card p-6">

      <div>
        <h2 className="text-xl font-semibold">
          Gerenciar fotografias
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Adicione fotografias, escolha a imagem principal ou remova imagens
          do anúncio.
        </p>
      </div>

      {/* Fotografias existentes */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-medium">
            Fotografias cadastradas
          </h3>

          <span className="text-xs text-muted-foreground">
            {images.length} de {MAX_IMAGES}
          </span>
        </div>

        {images.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <ImagePlus className="mx-auto size-8 text-muted-foreground" />

            <p className="mt-3 text-sm text-muted-foreground">
              Nenhuma fotografia cadastrada.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orderedImages.map((image) => (
              <article
                key={image.id}
                className="overflow-hidden rounded-lg border border-border/60"
              >
                <div className="relative aspect-[16/10] bg-muted">
                  <img
                    src={image.imageUrl}
                    alt={image.caption || "Fotografia do imóvel"}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = fallbackImage;
                    }}
                    className="size-full object-cover"
                  />

                  {image.primary && (
                    <span className="absolute left-2 top-2 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                      Imagem principal
                    </span>
                  )}
                </div>

                <div className="space-y-3 p-3">
                  <p className="min-h-5 text-sm text-muted-foreground">
                    {image.caption || "Sem legenda"}
                  </p>

                  <div className="flex flex-col gap-2">
                    {!image.primary && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isBusy}
                        onClick={() =>
                          primaryMutation.mutate(image.id)
                        }
                      >
                        <Star className="size-4" />
                        Definir como principal
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => handleDelete(image)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                      Excluir fotografia
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Adicionar fotografia */}
      {images.length < MAX_IMAGES && (
        <form
          onSubmit={handleAdd}
          className="space-y-4 border-t border-border/60 pt-5"
        >
          <h3 className="font-medium">
            Adicionar nova fotografia
          </h3>

          <div className="space-y-2">
            <label
              htmlFor={`image-url-${propertyId}`}
              className="text-sm font-medium"
            >
              Endereço da imagem
            </label>

            <Input
              id={`image-url-${propertyId}`}
              type="url"
              placeholder="https://exemplo.com/imagem.jpg"
              value={imageUrl}
              required
              onChange={(event) => setImageUrl(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`image-caption-${propertyId}`}
              className="text-sm font-medium"
            >
              Legenda (opcional)
            </label>

            <Input
              id={`image-caption-${propertyId}`}
              value={caption}
              maxLength={200}
              placeholder="Ex.: Vista externa do habitat"
              onChange={(event) => setCaption(event.target.value)}
            />
          </div>

          {validationError && (
            <p className="text-sm text-destructive" role="alert">
              {validationError}
            </p>
          )}

          <Button
            type="submit"
            variant="hero"
            disabled={isBusy}
          >
            <ImagePlus className="size-4" />
            {addMutation.isPending
              ? "Adicionando..."
              : "Adicionar fotografia"}
          </Button>

          <p className="text-xs text-muted-foreground">
            A primeira fotografia será definida como principal automaticamente
            quando o imóvel ainda não possuir uma imagem principal.
          </p>
        </form>
      )}

      {images.length >= MAX_IMAGES && (
        <p className="border-t border-border/60 pt-4 text-sm text-muted-foreground">
          O limite de 20 fotografias por imóvel foi atingido.
        </p>
      )}

    </section>
  );
}
