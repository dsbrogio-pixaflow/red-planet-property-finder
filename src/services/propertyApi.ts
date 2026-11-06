
import { apiRequest } from "@/services/apiClient";

import type {
  ApiProperty,
  ApiPropertyStatus,
} from "@/types/api";

// Resposta de uma fotografia cadastrada
export interface ApiPropertyImage {
  id: number;
  imageUrl: string;
  caption: string | null;
  displayOrder: number;
  primary: boolean;
  createdAt: string;
}

// Dados enviados para cadastrar uma fotografia
export interface ApiPropertyImageRequest {
  imageUrl: string;
  caption?: string | null;
  displayOrder?: number;
}

// Dados principais do imóvel
export interface ApiPropertyRequest {
  title: string;
  description: string;

  propertyType:
    | "CYLINDRICAL_HABITAT"
    | "ICE_HOME"
    | "UNDERGROUND_MANSION"
    | "CONNECTED_MODULAR_COMPLEX"
    | "GEODESIC_SUPERADOBE_DOME";

  transactionType: "SALE" | "RENT";

  price: number;

  bedrooms: number;
  bathrooms: number;
  habitableArea: number;
  capacity: number;

  colonyName: string;
  sectorName: string;
  complexName: string;
  unitCode: string;

  details?: {
    hasParking?: boolean | null;
    parkingSpaces?: number | null;
    parkingType?: string | null;

    radiationProtection?: string | null;
    radiationProtectionLevel?: string | null;
    shieldingMaterial?: string | null;

    energySource?: string | null;
    energyAutonomyHours?: number | null;
    energyStorageSystem?: string | null;

    oxygenSystem?: boolean | null;
    atmosphericPressureControl?: boolean | null;
    waterRecycling?: boolean | null;
    environmentalControl?: boolean | null;
  };

  images?: {
    imageUrl: string;
    caption?: string | null;
    displayOrder?: number;
    primary?: boolean;
  }[];
}

export const propertyApi = {

  // ==========================================
  // CONSULTAS PÚBLICAS
  // ==========================================

  // Listar imóveis publicados
  listPublished: () =>
    apiRequest<ApiProperty[]>(
      "/api/public/properties"
    ),

  // Consultar imóvel publicado por ID
  getById: (id: number) =>
    apiRequest<ApiProperty>(
      `/api/public/properties/${id}`
    ),

  // ==========================================
  // OPERAÇÕES DO USUÁRIO AUTENTICADO
  // ==========================================

  // Cadastrar imóvel
  create: (data: ApiPropertyRequest) =>
    apiRequest<ApiProperty>(
      "/api/properties",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),

  // Listar imóveis do usuário autenticado
  listMine: () =>
    apiRequest<ApiProperty[]>(
      "/api/properties/my"
    ),

  // Atualizar imóvel
  update: (
    id: number,
    data: ApiPropertyRequest
  ) =>
    apiRequest<ApiProperty>(
      `/api/properties/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    ),

  // Alterar situação do anúncio
  updateStatus: (
    id: number,
    status: ApiPropertyStatus
  ) =>
    apiRequest<ApiProperty>(
      `/api/properties/${id}/status?status=${status}`,
      {
        method: "PATCH",
      }
    ),

  // Excluir imóvel
  remove: (id: number) =>
    apiRequest<void>(
      `/api/properties/${id}`,
      {
        method: "DELETE",
      }
    ),

  // ==========================================
  // GERENCIAMENTO DE FOTOGRAFIAS
  // ==========================================

  // Adicionar fotografia
  addImage: (
    propertyId: number,
    data: ApiPropertyImageRequest
  ) =>
    apiRequest<ApiPropertyImage>(
      `/api/properties/${propertyId}/images`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),

  // Definir fotografia principal
  setPrimaryImage: (
    propertyId: number,
    imageId: number
  ) =>
    apiRequest<ApiPropertyImage>(
      `/api/properties/${propertyId}/images/${imageId}/primary`,
      {
        method: "PATCH",
      }
    ),

  // Excluir fotografia
  deleteImage: (
    propertyId: number,
    imageId: number
  ) =>
    apiRequest<void>(
      `/api/properties/${propertyId}/images/${imageId}`,
      {
        method: "DELETE",
      }
    ),
};
