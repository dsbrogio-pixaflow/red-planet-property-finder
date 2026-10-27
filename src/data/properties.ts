import olympus from "@/assets/olympus.jpg";
import valles from "@/assets/valles.jpg";
import elysium from "@/assets/elysium.jpg";
import redcanyon from "@/assets/redcanyon.jpg";
import phobos from "@/assets/phobos.jpg";
import crater from "@/assets/crater.jpg";
import utopia from "@/assets/utopia.jpg";
import ares from "@/assets/ares.jpg";
import heroImg from "@/assets/hero-mars.jpg";
import type { Advertiser, MarsRegion, Property } from "@/types/property";

export const ADMIN_ADVERTISER: Advertiser = {
  id: "admin-mre",
  name: "Equipe Mars Real Estate (demonstração)",
  role: "admin",
};

export const REGIONS: MarsRegion[] = [
  "Tharsis",
  "Valles Marineris",
  "Elysium",
  "Arabia Terra",
  "Utopia Planitia",
  "Hellas",
];

export const FEATURE_OPTIONS = [
  "Vista panorâmica",
  "Terreno plano",
  "Próximo a crateras",
  "Solo rico em gelo",
  "Alta exposição solar",
  "Abrigo natural",
  "Acesso a cânions",
  "Céu noturno privilegiado",
];

export const SEED_PROPERTIES: Property[] = [
  {
    id: "olympus-prime",
    title: "Olympus Prime",
    description:
      "Terreno fictício nas planícies de Tharsis, com vista desobstruída para o Monte Olimpo, o maior vulcão conhecido do Sistema Solar. Ideal para quem sonha com um horizonte monumental todas as manhãs marcianas.",
    price: 1_250_000,
    area: 12_000,
    region: "Tharsis",
    location: "Planalto de Tharsis, encosta oeste",
    features: ["Vista panorâmica", "Alta exposição solar", "Terreno plano"],
    highlight: "Vista para o Monte Olimpo",
    pointsOfInterest: [
      { name: "Monte Olimpo", distanceKm: 310 },
      { name: "Arsia Mons", distanceKm: 1200 },
    ],
    publishedAt: "2026-09-02",
    status: "publicado",
    advertiser: ADMIN_ADVERTISER,
    images: [olympus, ares, elysium],
  },
  {
    id: "valles-residence",
    title: "Valles Residence",
    description:
      "Propriedade demonstrativa à beira do sistema de cânions Valles Marineris. Paredões estratificados contam bilhões de anos de história geológica diante do seu lote.",
    price: 980_000,
    area: 8_500,
    region: "Valles Marineris",
    location: "Borda norte de Coprates Chasma",
    features: ["Acesso a cânions", "Vista panorâmica", "Abrigo natural"],
    highlight: "À beira de Valles Marineris",
    pointsOfInterest: [
      { name: "Coprates Chasma", distanceKm: 4 },
      { name: "Melas Chasma", distanceKm: 620 },
    ],
    publishedAt: "2026-09-18",
    status: "publicado",
    advertiser: ADMIN_ADVERTISER,
    images: [valles, redcanyon, crater],
  },
  {
    id: "elysium-horizon",
    title: "Elysium Horizon",
    description:
      "Lote conceitual em uma planície ampla inspirada em Elysium Planitia. Relevo suave, horizonte infinito e excelente área útil para futuras construções.",
    price: 540_000,
    area: 20_000,
    region: "Elysium",
    location: "Elysium Planitia, setor central",
    features: ["Terreno plano", "Alta exposição solar"],
    highlight: "Maior área útil do catálogo",
    pointsOfInterest: [
      { name: "Elysium Mons", distanceKm: 900 },
      { name: "Cratera Gale", distanceKm: 1400 },
    ],
    publishedAt: "2026-08-12",
    status: "publicado",
    advertiser: ADMIN_ADVERTISER,
    images: [elysium, utopia, olympus],
  },
  {
    id: "red-canyon-estate",
    title: "Red Canyon Estate",
    description:
      "Terreno fictício encaixado entre cânions avermelhados, com paredes naturais que oferecem abrigo contra tempestades de poeira. Um refúgio dramático e reservado.",
    price: 760_000,
    area: 6_200,
    region: "Arabia Terra",
    location: "Cânions de Arabia Terra",
    features: ["Abrigo natural", "Acesso a cânions"],
    highlight: "Proteção natural contra tempestades",
    pointsOfInterest: [
      { name: "Leito seco ancestral", distanceKm: 2 },
      { name: "Cratera Becquerel", distanceKm: 480 },
    ],
    publishedAt: "2026-10-01",
    status: "publicado",
    advertiser: ADMIN_ADVERTISER,
    images: [redcanyon, valles, ares],
  },
  {
    id: "phobos-view",
    title: "Phobos View",
    description:
      "Propriedade conceitual em uma colina elevada, com céu noturno privilegiado e vista para a lua Fobos cruzando o firmamento marciano duas vezes por dia.",
    price: 680_000,
    area: 5_000,
    region: "Hellas",
    location: "Colinas da borda de Hellas",
    features: ["Céu noturno privilegiado", "Vista panorâmica"],
    highlight: "Vista para a lua Fobos",
    pointsOfInterest: [
      { name: "Bacia de Hellas", distanceKm: 150 },
      { name: "Observatório fictício Deimos", distanceKm: 35 },
    ],
    publishedAt: "2026-07-25",
    status: "publicado",
    advertiser: ADMIN_ADVERTISER,
    images: [phobos, crater, heroImg],
  },
  {
    id: "sunset-crater",
    title: "Sunset Crater",
    description:
      "Terreno demonstrativo na borda de uma grande cratera de impacto, onde o pôr do sol azulado de Marte cria um espetáculo único no horizonte.",
    price: 890_000,
    area: 9_800,
    region: "Arabia Terra",
    location: "Borda leste de cratera de impacto",
    features: ["Próximo a crateras", "Vista panorâmica", "Céu noturno privilegiado"],
    highlight: "Pôr do sol azul marciano",
    pointsOfInterest: [
      { name: "Centro da cratera", distanceKm: 12 },
      { name: "Cratera Schiaparelli", distanceKm: 700 },
    ],
    publishedAt: "2026-10-10",
    status: "publicado",
    advertiser: ADMIN_ADVERTISER,
    images: [crater, phobos, redcanyon],
  },
  {
    id: "utopia-frontier",
    title: "Utopia Frontier",
    description:
      "Terreno conceitual em Utopia Planitia, planície vasta com indícios de gelo subterrâneo — um recurso estratégico para futuras colônias.",
    price: 420_000,
    area: 15_000,
    region: "Utopia Planitia",
    location: "Utopia Planitia, setor norte",
    features: ["Solo rico em gelo", "Terreno plano"],
    highlight: "Indícios de gelo subterrâneo",
    pointsOfInterest: [
      { name: "Campo de gelo subterrâneo", distanceKm: 8 },
      { name: "Sítio histórico Viking 2", distanceKm: 210 },
    ],
    publishedAt: "2026-06-30",
    status: "publicado",
    advertiser: ADMIN_ADVERTISER,
    images: [utopia, elysium, ares],
  },
  {
    id: "ares-valley",
    title: "Ares Valley",
    description:
      "Propriedade fictícia em um vale marciano entre colinas suaves, com camadas de sedimentos que lembram antigos cursos d'água. Rascunho em revisão pela equipe.",
    price: 610_000,
    area: 7_400,
    region: "Arabia Terra",
    location: "Ares Vallis, trecho médio",
    features: ["Abrigo natural", "Solo rico em gelo"],
    highlight: "Antigo vale fluvial",
    pointsOfInterest: [
      { name: "Leito de Ares Vallis", distanceKm: 1 },
      { name: "Sítio fictício Pathfinder", distanceKm: 95 },
    ],
    publishedAt: "2026-10-20",
    status: "rascunho",
    advertiser: ADMIN_ADVERTISER,
    images: [ares, valles, utopia],
  },
];
