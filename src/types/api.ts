
export type ApiPropertyType =
  | "CYLINDRICAL_HABITAT"
  | "ICE_HOME"
  | "UNDERGROUND_MANSION"
  | "CONNECTED_MODULAR_COMPLEX"
  | "GEODESIC_SUPERADOBE_DOME";

export type ApiTransactionType = "SALE" | "RENT";

export type ApiPropertyStatus =
  | "PUBLISHED"
  | "INACTIVE"
  | "SOLD";

export interface ApiPropertyImage {
  id: number;
  imageUrl: string;
  caption: string | null;
  displayOrder: number;
  primary: boolean;
  createdAt: string;
}

export interface ApiPropertyDetails {
  hasParking: boolean | null;
  parkingSpaces: number | null;
  parkingType: string | null;

  radiationProtection: string | null;
  radiationProtectionLevel: string | null;
  shieldingMaterial: string | null;

  energySource: string | null;
  energyAutonomyHours: number | null;
  energyStorageSystem: string | null;

  oxygenSystem: boolean | null;
  atmosphericPressureControl: boolean | null;
  waterRecycling: boolean | null;
  environmentalControl: boolean | null;
}

export interface ApiProperty {
  id: number;
  title: string;
  description: string;

  propertyType: ApiPropertyType;
  transactionType: ApiTransactionType;
  price: number;

  bedrooms: number;
  bathrooms: number;
  habitableArea: number;
  capacity: number;

  colonyName: string;
  sectorName: string;
  complexName: string;
  unitCode: string;

  status: ApiPropertyStatus;
  createdAt: string;
  updatedAt: string | null;

  ownerName: string;
  ownerAccountType: "OWNER" | "AGENCY";

  details: ApiPropertyDetails | null;
  images: ApiPropertyImage[];
}
