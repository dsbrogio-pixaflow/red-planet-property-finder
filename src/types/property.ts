export type PropertyStatus = "publicado" | "rascunho" | "desativado";

export type MarsRegion =
  | "Tharsis"
  | "Valles Marineris"
  | "Elysium"
  | "Arabia Terra"
  | "Utopia Planitia"
  | "Hellas";

export interface PointOfInterest {
  name: string;
  /** Distância aproximada em km (demonstrativa, não verificada). */
  distanceKm: number;
}

export interface Advertiser {
  id: string;
  name: string;
  role: "admin" | "user";
}

export interface Property {
  id: string;
  title: string;
  description: string;
  /** Preço em reais (BRL). */
  price: number;
  /** Área em m². */
  area: number;
  region: MarsRegion;
  location: string;
  features: string[];
  highlight: string;
  pointsOfInterest: PointOfInterest[];
  publishedAt: string; // ISO date
  status: PropertyStatus;
  advertiser: Advertiser;
  images: string[]; // primeira = principal
}

export type PropertyInput = Omit<Property, "id" | "publishedAt" | "advertiser">;

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}
