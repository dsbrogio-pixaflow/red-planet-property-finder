import { useState, type FormEvent } from "react";
import { Plus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/FormField";
import { PROPERTY_TYPE_LABEL } from "@/components/property/ApiPropertyFilters";

import type {
  ApiPropertyType,
  ApiTransactionType,
} from "@/types/api";
import type { ApiPropertyRequest } from "@/services/propertyApi";

type DetailsForm = NonNullable<ApiPropertyRequest["details"]>;
type ImageForm = NonNullable<ApiPropertyRequest["images"]>[number];

type FormValues = Omit<ApiPropertyRequest, "details" | "images"> & {
  details: DetailsForm;
  images: ImageForm[];
};

const INITIAL_DETAILS: DetailsForm = {
  hasParking: false,
  parkingSpaces: 0,
  parkingType: null,
  radiationProtection: null,
  radiationProtectionLevel: null,
  shieldingMaterial: null,
  energySource: null,
  energyAutonomyHours: null,
  energyStorageSystem: null,
  oxygenSystem: false,
  atmosphericPressureControl: false,
  waterRecycling: false,
  environmentalControl: false,
};

const INITIAL_VALUES: FormValues = {
  title: "",
  description: "",
  propertyType: "CYLINDRICAL_HABITAT",
  transactionType: "SALE",
  price: 0,
  bedrooms: 0,
  bathrooms: 0,
  habitableArea: 0,
  capacity: 1,
  colonyName: "",
  sectorName: "",
  complexName: "",
  unitCode: "",
  details: { ...INITIAL_DETAILS },
  images: [],
};

const selectCls =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function ApiPropertyForm({
  initial,
  manageImages = true,
  submitLabel = "Publicar imóvel",
  onSubmit,
  onCancel,
  isSubmitting = false,
}: {
  initial?: ApiPropertyRequest;
  /** Set false while editing property data to preserve image records. */
  manageImages?: boolean;
  submitLabel?: string;
  onSubmit: (value: ApiPropertyRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  const [values, setValues] = useState<FormValues>(() => ({
    ...INITIAL_VALUES,
    ...initial,
    details: {
      ...INITIAL_DETAILS,
      ...(initial?.details ?? {}),
    },
    images: (initial?.images ?? []).map((image, index) => ({
      ...image,
      caption: image.caption ?? "",
      displayOrder: image.displayOrder ?? index,
      primary: image.primary ?? index === 0,
    })),
  }));

  const [showDetails, setShowDetails] = useState(Boolean(initial?.details));
  const [imageError, setImageError] = useState("");

  const update = <K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const updateDetails = <K extends keyof DetailsForm>(
    key: K,
    value: DetailsForm[K],
  ) => {
    setValues((current) => ({
      ...current,
      details: { ...current.details, [key]: value },
    }));
  };

  const addImage = () => {
    setValues((current) => ({
      ...current,
      images: [
        ...current.images,
        {
          imageUrl: "",
          caption: "",
          displayOrder: current.images.length,
          primary: current.images.length === 0,
        },
      ],
    }));
    setImageError("");
  };

  const updateImage = (index: number, changes: Partial<ImageForm>) => {
    setValues((current) => ({
      ...current,
      images: current.images.map((image, i) =>
        i === index ? { ...image, ...changes } : image,
      ),
    }));
  };

  const removeImage = (index: number) => {
    setValues((current) => {
      const remaining = current.images.filter((_, i) => i !== index);
      const hasPrimary = remaining.some((image) => image.primary === true);

      return {
        ...current,
        images: remaining.map((image, i) => ({
          ...image,
          displayOrder: i,
          primary: hasPrimary ? image.primary : i === 0,
        })),
      };
    });
  };

  const selectPrimary = (index: number) => {
    setValues((current) => ({
      ...current,
      images: current.images.map((image, i) => ({
        ...image,
        primary: i === index,
      })),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setImageError("");

    let images: ImageForm[] | undefined;

    if (manageImages) {
      const invalidImage = values.images.find(
        (image) =>
          image.imageUrl.trim() !== "" &&
          !isHttpUrl(image.imageUrl.trim()),
      );

      if (invalidImage) {
        setImageError("Informe uma URL de imagem HTTP ou HTTPS válida.");
        return;
      }

      const validImages = values.images.filter(
        (image) => image.imageUrl.trim() !== "",
      );
      const primaryIndex = validImages.findIndex((image) => image.primary);

      images = validImages.map((image, index) => ({
        ...image,
        imageUrl: image.imageUrl.trim(),
        displayOrder: index,
        primary: primaryIndex === -1 ? index === 0 : index === primaryIndex,
      }));
    }

    const payload: ApiPropertyRequest = {
      title: values.title.trim(),
      description: values.description.trim(),
      propertyType: values.propertyType,
      transactionType: values.transactionType,
      price: values.price,
      bedrooms: values.bedrooms,
      bathrooms: values.bathrooms,
      habitableArea: values.habitableArea,
      capacity: values.capacity,
      colonyName: values.colonyName.trim(),
      sectorName: values.sectorName.trim(),
      complexName: values.complexName.trim(),
      unitCode: values.unitCode.trim(),
      // Preserve existing details on edit, even if the section is collapsed.
      ...(showDetails || Boolean(initial?.details)
        ? { details: values.details }
        : {}),
      // Do not send images during edit when image management is disabled.
      ...(manageImages ? { images: images ?? [] } : {}),
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="space-y-5">
          <h2 className="text-lg font-semibold">Informações principais</h2>

          <FormField id="api-title" label="Título do anúncio" required>
            <Input
              id="api-title"
              value={values.title}
              maxLength={150}
              required
              onChange={(event) => update("title", event.target.value)}
              placeholder="Ex.: Habitat Cilíndrico Olympus"
            />
          </FormField>

          <FormField id="api-description" label="Descrição" required>
            <Textarea
              id="api-description"
              rows={5}
              maxLength={5000}
              required
              value={values.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Descreva o imóvel e sua infraestrutura..."
            />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="api-type" label="Tipo de construção" required>
              <select
                id="api-type"
                className={selectCls}
                value={values.propertyType}
                onChange={(event) =>
                  update("propertyType", event.target.value as ApiPropertyType)
                }
              >
                {Object.entries(PROPERTY_TYPE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="api-transaction" label="Finalidade" required>
              <select
                id="api-transaction"
                className={selectCls}
                value={values.transactionType}
                onChange={(event) =>
                  update("transactionType", event.target.value as ApiTransactionType)
                }
              >
                <option value="SALE">Venda</option>
                <option value="RENT">Aluguel</option>
              </select>
            </FormField>

            <FormField id="api-price" label="Preço (R$)" required>
              <Input
                id="api-price"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={values.price || ""}
                onChange={(event) => update("price", Number(event.target.value))}
              />
            </FormField>

            <FormField id="api-area" label="Área habitável (m²)" required>
              <Input
                id="api-area"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={values.habitableArea || ""}
                onChange={(event) => update("habitableArea", Number(event.target.value))}
              />
            </FormField>

            <FormField id="api-bedrooms" label="Dormitórios" required>
              <Input
                id="api-bedrooms"
                type="number"
                min="0"
                max="100"
                required
                value={values.bedrooms}
                onChange={(event) => update("bedrooms", Number(event.target.value))}
              />
            </FormField>

            <FormField id="api-bathrooms" label="Banheiros" required>
              <Input
                id="api-bathrooms"
                type="number"
                min="0"
                max="100"
                required
                value={values.bathrooms}
                onChange={(event) => update("bathrooms", Number(event.target.value))}
              />
            </FormField>

            <FormField id="api-capacity" label="Capacidade de habitantes" required>
              <Input
                id="api-capacity"
                type="number"
                min="1"
                max="10000"
                required
                value={values.capacity}
                onChange={(event) => update("capacity", Number(event.target.value))}
              />
            </FormField>
          </div>
        </section>

        <section className="space-y-5 border-t border-border/60 pt-6">
          <h2 className="text-lg font-semibold">Localização marciana</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="api-colony" label="Cidade ou colônia" required>
              <Input
                id="api-colony"
                maxLength={120}
                required
                value={values.colonyName}
                onChange={(event) => update("colonyName", event.target.value)}
                placeholder="Ex.: Olympus City"
              />
            </FormField>

            <FormField id="api-sector" label="Setor ou região" required>
              <Input
                id="api-sector"
                maxLength={120}
                required
                value={values.sectorName}
                onChange={(event) => update("sectorName", event.target.value)}
                placeholder="Ex.: Setor Norte"
              />
            </FormField>

            <FormField id="api-complex" label="Complexo habitacional" required>
              <Input
                id="api-complex"
                maxLength={150}
                required
                value={values.complexName}
                onChange={(event) => update("complexName", event.target.value)}
              />
            </FormField>

            <FormField id="api-unit" label="Identificação da unidade" required>
              <Input
                id="api-unit"
                maxLength={50}
                required
                value={values.unitCode}
                onChange={(event) => update("unitCode", event.target.value)}
                placeholder="Ex.: H-204"
              />
            </FormField>
          </div>
        </section>

        <section className="space-y-4 border-t border-border/60 pt-6">
          <div>
            <h2 className="text-lg font-semibold">Infraestrutura e suporte à vida</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Informações opcionais sobre os sistemas do habitat.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDetails((current) => !current)}
          >
            {showDetails
              ? "Ocultar informações adicionais"
              : "Adicionar informações adicionais"}
          </Button>

          {showDetails && (
            <div className="space-y-5 rounded-xl border border-border/60 p-4">
              <h3 className="font-medium">Estacionamento</h3>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={values.details.hasParking ?? false}
                  onChange={(event) => updateDetails("hasParking", event.target.checked)}
                />
                Possui estacionamento?
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="api-parking-spaces" label="Quantidade de vagas">
                  <Input
                    id="api-parking-spaces"
                    type="number"
                    min="0"
                    max="100"
                    value={values.details.parkingSpaces ?? 0}
                    onChange={(event) =>
                      updateDetails("parkingSpaces", Number(event.target.value))
                    }
                  />
                </FormField>

                <FormField id="api-parking-type" label="Tipo de estacionamento">
                  <Input
                    id="api-parking-type"
                    value={values.details.parkingType ?? ""}
                    onChange={(event) =>
                      updateDetails("parkingType", event.target.value || null)
                    }
                  />
                </FormField>
              </div>

              <div className="space-y-4 border-t border-border/60 pt-4">
                <h3 className="font-medium">Proteção contra radiação</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField id="api-radiation" label="Sistema de proteção">
                    <Input
                      id="api-radiation"
                      value={values.details.radiationProtection ?? ""}
                      onChange={(event) =>
                        updateDetails("radiationProtection", event.target.value || null)
                      }
                    />
                  </FormField>

                  <FormField id="api-radiation-level" label="Nível de proteção">
                    <Input
                      id="api-radiation-level"
                      value={values.details.radiationProtectionLevel ?? ""}
                      onChange={(event) =>
                        updateDetails("radiationProtectionLevel", event.target.value || null)
                      }
                    />
                  </FormField>

                  <FormField id="api-shielding" label="Material de blindagem">
                    <Input
                      id="api-shielding"
                      value={values.details.shieldingMaterial ?? ""}
                      onChange={(event) =>
                        updateDetails("shieldingMaterial", event.target.value || null)
                      }
                    />
                  </FormField>
                </div>
              </div>

              <div className="space-y-4 border-t border-border/60 pt-4">
                <h3 className="font-medium">Energia</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField id="api-energy-source" label="Fonte de energia">
                    <Input
                      id="api-energy-source"
                      value={values.details.energySource ?? ""}
                      onChange={(event) =>
                        updateDetails("energySource", event.target.value || null)
                      }
                    />
                  </FormField>

                  <FormField id="api-energy-hours" label="Autonomia (horas)">
                    <Input
                      id="api-energy-hours"
                      type="number"
                      min="0"
                      step="0.01"
                      value={values.details.energyAutonomyHours ?? ""}
                      onChange={(event) =>
                        updateDetails(
                          "energyAutonomyHours",
                          event.target.value === "" ? null : Number(event.target.value),
                        )
                      }
                    />
                  </FormField>

                  <FormField id="api-energy-storage" label="Sistema de armazenamento">
                    <Input
                      id="api-energy-storage"
                      value={values.details.energyStorageSystem ?? ""}
                      onChange={(event) =>
                        updateDetails("energyStorageSystem", event.target.value || null)
                      }
                    />
                  </FormField>
                </div>
              </div>

              <div className="space-y-2 border-t border-border/60 pt-4">
                <h3 className="mb-3 font-medium">Sistemas de suporte à vida</h3>

                {(
                  [
                    ["oxygenSystem", "Sistema de oxigenação"],
                    ["atmosphericPressureControl", "Controle de pressão atmosférica"],
                    ["waterRecycling", "Reciclagem de água"],
                    ["environmentalControl", "Controle ambiental"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={values.details[key] ?? false}
                      onChange={(event) => updateDetails(key, event.target.checked)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-5">
        {manageImages && (
          <section className="space-y-4 rounded-xl border border-border/60 bg-card p-5">
            <div>
              <h2 className="text-lg font-semibold">Fotografias</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Informe URLs de imagens já hospedadas. A primeira imagem será
                definida como principal automaticamente, a menos que escolha outra.
              </p>
            </div>

            {values.images.map((image, index) => (
              <div
                key={index}
                className="space-y-2 rounded-lg border border-border/60 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Imagem {index + 1}</span>
                  {image.primary && (
                    <span className="text-xs text-primary">Principal</span>
                  )}
                </div>

                <Input
                  type="url"
                  placeholder="https://..."
                  value={image.imageUrl}
                  onChange={(event) =>
                    updateImage(index, { imageUrl: event.target.value })
                  }
                />

                <Input
                  placeholder="Legenda da imagem"
                  value={image.caption ?? ""}
                  maxLength={200}
                  onChange={(event) =>
                    updateImage(index, { caption: event.target.value })
                  }
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="radio"
                      name="api-primary-image"
                      checked={image.primary === true}
                      onChange={() => selectPrimary(index)}
                    />
                    Definir como principal
                  </label>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeImage(index)}
                    aria-label={`Excluir imagem ${index + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}

            {imageError && (
              <p className="text-xs text-destructive" role="alert">
                {imageError}
              </p>
            )}

            {values.images.length < 20 && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={addImage}
              >
                <Plus /> Adicionar imagem
              </Button>
            )}
          </section>
        )}

        <div className="flex flex-col gap-3">
          <Button type="submit" variant="hero" disabled={isSubmitting}>
            <Save />
            {isSubmitting ? "Salvando..." : submitLabel}
          </Button>

          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancelar
          </Button>

          {manageImages && (
            <p className="text-xs text-muted-foreground">
              O imóvel será publicado automaticamente após o cadastro.
            </p>
          )}
        </div>
      </aside>
    </form>
  );
}
