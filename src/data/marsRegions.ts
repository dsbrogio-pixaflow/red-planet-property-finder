import type { MarsRegion, Property } from "@/types/property";

export interface GeographicRegion {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  catalogRegion?: MarsRegion;
  catalogNote?: string;
}

/** USGS Gazetteer nominal centers, planetocentric latitude, east-positive longitude.
 * https://planetarynames.wr.usgs.gov/GIS_Downloads
 * Markers are centers, not boundaries. Listing taxonomy remains independent.
 */
export const MARS_REGIONS: GeographicRegion[] = [
  { id: "olympus-mons", name: "Olympus Mons", latitude: 18.65, longitude: 226.20, description: "O maior vulcão do Sistema Solar se eleva sobre o planalto de Tharsis. Seu amplo escudo vulcânico domina o horizonte marciano." },
  { id: "tharsis", name: "Tharsis", latitude: 0, longitude: 260, description: "Um vasto planalto vulcânico que reúne alguns dos maiores vulcões de Marte e registra bilhões de anos de atividade geológica.", catalogRegion: "Tharsis" },
  { id: "valles-marineris", name: "Valles Marineris", latitude: -14.01, longitude: 301.41, description: "Um sistema monumental de cânions que atravessa milhares de quilômetros próximo ao equador marciano.", catalogRegion: "Valles Marineris" },
  { id: "elysium-planitia", name: "Elysium Planitia", latitude: 2.98, longitude: 154.74, description: "Planícies equatoriais com terrenos vulcânicos relativamente jovens, próximas à região de Elysium.", catalogRegion: "Elysium", catalogNote: "O catálogo agrupa os anúncios na região mais ampla de Elysium; não delimita lotes em Elysium Planitia." },
  { id: "utopia-planitia", name: "Utopia Planitia", latitude: 46.74, longitude: 117.52, description: "Uma extensa planície do hemisfério norte, associada a uma antiga bacia de impacto e a evidências de gelo no subsolo.", catalogRegion: "Utopia Planitia" },
  { id: "arabia-terra", name: "Arabia Terra", latitude: 21.25, longitude: 5.72, description: "Terras altas antigas, marcadas por crateras, camadas sedimentares e sinais de uma longa história de erosão.", catalogRegion: "Arabia Terra" },
  { id: "terra-cimmeria", name: "Terra Cimmeria", latitude: -32.68, longitude: 147.75, description: "Terras altas do hemisfério sul com crateras antigas e fortes assinaturas de magnetismo preservadas na crosta." },
  { id: "terra-sirenum", name: "Terra Sirenum", latitude: -39.49, longitude: 205.85, description: "Uma região acidentada das terras altas meridionais, com crateras e depósitos que ajudam a investigar o passado de Marte." },
  { id: "noctis-labyrinthus", name: "Noctis Labyrinthus", latitude: -6.36, longitude: 258.81, description: "Uma rede de vales e depressões entre Tharsis e Valles Marineris, cujo relevo forma um verdadeiro labirinto geológico." },
  { id: "amazonis-planitia", name: "Amazonis Planitia", latitude: 25.75, longitude: 197.09, description: "Planícies de relevo suave entre Tharsis e Elysium, moldadas por processos vulcânicos e pela deposição de sedimentos." },
  { id: "arcadia-planitia", name: "Arcadia Planitia", latitude: 49.02, longitude: 188.15, description: "Uma planície setentrional com superfícies vulcânicas e evidências de gelo próximo à superfície." },
  { id: "hellas-planitia", name: "Hellas Planitia", latitude: -42.43, longitude: 70.50, description: "A planície no interior da enorme bacia de impacto de Hellas, uma das áreas mais profundas da superfície marciana.", catalogRegion: "Hellas", catalogNote: "O catálogo usa a região ampla de Hellas e inclui suas bordas; os anúncios não estão geolocalizados na planície." },
  { id: "isidis-planitia", name: "Isidis Planitia", latitude: 13.94, longitude: 88.38, description: "Planície de uma grande bacia de impacto situada na transição entre as terras altas do sul e as baixas planícies do norte." },
  { id: "chryse-planitia", name: "Chryse Planitia", latitude: 28.43, longitude: 319.69, description: "Uma planície onde desembocam grandes canais de escoamento antigos, explorada pela missão Viking 1." },
  { id: "aonia-terra", name: "Aonia Terra", latitude: -60.20, longitude: 262.95, description: "Terras craterizadas do hemisfério sul, próximas às latitudes polares e marcadas por antigos impactos." },
  { id: "margaritifer-terra", name: "Margaritifer Terra", latitude: -1.85, longitude: 335.08, description: "Uma região equatorial com redes de vales e bacias que preservam indícios de antigos sistemas de drenagem." },
  { id: "gale-crater", name: "Gale Crater", latitude: -5.37, longitude: 137.81, description: "A cratera explorada pelo rover Curiosity abriga o Monte Sharp, cujas camadas registram mudanças ambientais ao longo do tempo." },
  { id: "jezero-crater", name: "Jezero Crater", latitude: 18.41, longitude: 77.69, description: "Explorada pelo rover Perseverance, esta cratera preserva um antigo delta fluvial e vestígios de um lago." },
];

export function listingsForRegion(region: GeographicRegion, properties: Property[]) {
  if (!region.catalogRegion) return [];
  return properties.filter(p => p.status === "publicado" && p.region === region.catalogRegion);
}