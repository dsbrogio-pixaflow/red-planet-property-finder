import { describe, expect, it } from "vitest";
import { MARS_REGIONS, listingsForRegion } from "@/data/marsRegions";
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
});