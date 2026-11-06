import { describe, expect, it } from "vitest";
import { MARS_REGIONS, listingsForRegion, apiListingsForRegion } from "@/data/marsRegions";
import type { ApiProperty } from "@/types/api";
import { SEED_PROPERTIES } from "@/data/properties";
import { marsPosition } from "@/utils/marsCoordinates";

describe("Mars discovery", () => {
  it("includes all eighteen requested features", () => {
    expect(MARS_REGIONS.map(r => r.name)).toEqual(["Olympus Mons", "Tharsis", "Valles Marineris", "Elysium Planitia", "Utopia Planitia", "Arabia Terra", "Terra Cimmeria", "Terra Sirenum", "Noctis Labyrinthus", "Amazonis Planitia", "Arcadia Planitia", "Hellas Planitia", "Isidis Planitia", "Chryse Planitia", "Aonia Terra", "Margaritifer Terra", "Gale Crater", "Jezero Crater"]);
    expect(new Set(MARS_REGIONS.map(r => r.id)).size).toBe(18);
  });
  it.each([["tharsis", 1], ["valles-marineris", 1], ["elysium-planitia", 1], ["utopia-planitia", 1], ["arabia-terra", 2], ["hellas-planitia", 1], ["olympus-mons", 0], ["gale-crater", 0], ["jezero-crater", 0]])("counts only published inventory for %s", (id, expected) => {
    const r = MARS_REGIONS.find(r => r.id === id);
    if (!r) throw new Error("Missing region");
    expect(listingsForRegion(r, SEED_PROPERTIES)).toHaveLength(expected);
  });
  it("does not manufacture inventory in any unassociated feature", () => {
    for (const r of MARS_REGIONS.filter(r => !r.catalogRegion)) expect(listingsForRegion(r, SEED_PROPERTIES)).toEqual([]);
  });
  it("matches the documented Olympus and Jezero centers", () => {
    expect(MARS_REGIONS[0]).toMatchObject({ latitude: 18.65, longitude: 226.2 });
    expect(MARS_REGIONS.at(-1)).toMatchObject({ latitude: 18.41, longitude: 77.69 });
  });
  it("maps east-positive longitude consistently with the -180 to 180 texture", () => {
    expect(marsPosition(0, 0)).toEqual([1, 0, -0]);
    expect(marsPosition(90, 0)[1]).toBeCloseTo(1);
    expect(marsPosition(0, 90)[2]).toBeCloseTo(-1);
    expect(marsPosition(0, 180)[0]).toBeCloseTo(-1);
    for (const r of MARS_REGIONS) expect(Math.hypot(...marsPosition(r.latitude, r.longitude))).toBeCloseTo(1);
  });
  it("excludes draft listings from a region's count", () => {
    const r = MARS_REGIONS.find(r => r.id === "arabia-terra");
    if (!r) throw new Error("Missing region");
    const drafts = SEED_PROPERTIES.filter(p => p.region === r.catalogRegion && p.status !== "publicado");
    expect(drafts.map(p => p.id)).toContain("ares-valley");
    expect(listingsForRegion(r, SEED_PROPERTIES).map(p => p.id)).not.toContain("ares-valley");
  });
});

const apiListing = (sectorName: string, overrides: Partial<ApiProperty> = {}): ApiProperty => ({
  id: 101, title: "Habitat", description: "Anúncio publicado pelo formulário",
  propertyType: "ICE_HOME", transactionType: "SALE", price: 123456.78,
  bedrooms: 2, bathrooms: 1, habitableArea: 100, capacity: 4,
  colonyName: "Colônia independente", sectorName, complexName: "Complexo", unitCode: "A1",
  status: "PUBLISHED", createdAt: "2026-11-06T12:00:00", updatedAt: null,
  ownerName: "Anunciante", ownerAccountType: "OWNER", details: null, images: [],
  ...overrides,
});

describe("Discovery inventory from the backend", () => {
  it.each(MARS_REGIONS)("counts an explicit sector for $name, including regions outside demo taxonomy", region => {
    const property = apiListing(region.name);
    expect(apiListingsForRegion(region, [property])).toEqual([property]);
  });

  it("ignores case, accent and spacing differences in the sector field", () => {
    const region = MARS_REGIONS.find(r => r.id === "olympus-mons")!;
    const property = apiListing("  ÓLYMPUS   mons  ");
    expect(apiListingsForRegion(region, [property])).toEqual([property]);
  });

  it("does not infer membership from a colony, title, description, or a nearby landmark", () => {
    const tharsis = MARS_REGIONS.find(r => r.id === "tharsis")!;
    const olympus = apiListing("Olympus Mons", {
      colonyName: "Tharsis", title: "Tharsis", description: "Tharsis",
    });
    expect(apiListingsForRegion(tharsis, [olympus])).toEqual([]);
    expect(apiListingsForRegion(tharsis, [apiListing("Perto de Tharsis")])).toEqual([]);
  });

  it("excludes sold and inactive announcements", () => {
    const region = MARS_REGIONS.find(r => r.id === "jezero-crater")!;
    expect(apiListingsForRegion(region, [
      apiListing(region.name, { status: "SOLD" }),
      apiListing(region.name, { status: "INACTIVE" }),
    ])).toEqual([]);
  });

  it("retains the explicitly documented broad catalog associations", () => {
    const region = MARS_REGIONS.find(r => r.id === "hellas-planitia")!;
    expect(apiListingsForRegion(region, [apiListing("Hellas")])).toHaveLength(1);
  });
});
