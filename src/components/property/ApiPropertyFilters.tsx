
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type {
  ApiPropertyType,
  ApiTransactionType,
} from "@/types/api";

import { cn } from "@/lib/utils";

export type ApiSortOption =
  | "menor-preco"
  | "maior-preco"
  | "recentes";

export interface ApiPropertyFilterState {
  query: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  colony: string;
  propertyType: ApiPropertyType | "todas";
  transactionType: ApiTransactionType | "todas";
  sort: ApiSortOption;
}

export const DEFAULT_API_FILTERS: ApiPropertyFilterState = {
  query: "",
  minPrice: "",
  maxPrice: "",
  minArea: "",
  colony: "todas",
  propertyType: "todas",
  transactionType: "todas",
  sort: "recentes",
};

export const PROPERTY_TYPE_LABEL: Record<ApiPropertyType, string> = {
  CYLINDRICAL_HABITAT: "Habitat Cilíndrico Vertical",
  ICE_HOME: "Casa de Gelo",
  UNDERGROUND_MANSION: "Mansão Subterrânea",
  CONNECTED_MODULAR_COMPLEX: "Módulo Modulare Conectado",
  GEODESIC_SUPERADOBE_DOME: "Domo Geodésico de SuperAdobe",
};

const selectCls =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function ApiPropertyFilters({
  value,
  onChange,
  colonies,
}: {
  value: ApiPropertyFilterState;
  onChange: (value: ApiPropertyFilterState) => void;
  colonies: string[];
}) {
  const set = <K extends keyof ApiPropertyFilterState>(
    key: K,
    newValue: ApiPropertyFilterState[K],
  ) => {
    onChange({ ...value, [key]: newValue });
  };

  return (
    <aside
      className="space-y-5 rounded-xl border border-border/60 bg-card p-5"
      aria-label="Filtros de imóveis"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Filtros</h2>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ ...DEFAULT_API_FILTERS })}
        >
          <RotateCcw /> Limpar
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="api-min-price">Preço mínimo (R$)</Label>
          <Input
            id="api-min-price"
            type="number"
            min="0"
            value={value.minPrice}
            onChange={(e) => set("minPrice", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="api-max-price">Preço máximo (R$)</Label>
          <Input
            id="api-max-price"
            type="number"
            min="0"
            value={value.maxPrice}
            onChange={(e) => set("maxPrice", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="api-min-area">Área mínima (m²)</Label>
        <Input
          id="api-min-area"
          type="number"
          min="0"
          value={value.minArea}
          onChange={(e) => set("minArea", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="api-colony">Cidade ou colônia</Label>

        <select
          id="api-colony"
          className={selectCls}
          value={value.colony}
          onChange={(e) => set("colony", e.target.value)}
        >
          <option value="todas">Todas as colônias</option>

          {colonies.map((colony) => (
            <option key={colony} value={colony}>
              {colony}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="api-property-type">Tipo de construção</Label>

        <select
          id="api-property-type"
          className={selectCls}
          value={value.propertyType}
          onChange={(e) =>
            set(
              "propertyType",
              e.target.value as ApiPropertyType | "todas",
            )
          }
        >
          <option value="todas">Todos os tipos</option>

          {Object.entries(PROPERTY_TYPE_LABEL).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="api-transaction-type">Finalidade</Label>

        <select
          id="api-transaction-type"
          className={selectCls}
          value={value.transactionType}
          onChange={(e) =>
            set(
              "transactionType",
              e.target.value as ApiTransactionType | "todas",
            )
          }
        >
          <option value="todas">Venda e aluguel</option>
          <option value="SALE">Venda</option>
          <option value="RENT">Aluguel</option>
        </select>
      </div>
    </aside>
  );
}

export function ApiSortSelect({
  value,
  onChange,
}: {
  value: ApiSortOption;
  onChange: (value: ApiSortOption) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label
        htmlFor="api-sort"
        className="whitespace-nowrap text-sm text-muted-foreground"
      >
        Ordenar por
      </Label>

      <select
        id="api-sort"
        className={cn(selectCls, "w-auto")}
        value={value}
        onChange={(e) => onChange(e.target.value as ApiSortOption)}
      >
        <option value="recentes">Mais recentes</option>
        <option value="menor-preco">Menor preço</option>
        <option value="maior-preco">Maior preço</option>
      </select>
    </div>
  );
}
