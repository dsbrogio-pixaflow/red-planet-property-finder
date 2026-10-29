import { describe, expect, it } from "vitest";
import { SEED_PROPERTIES } from "@/data/properties";
import { propertyService } from "@/services/propertyService";
import { DEFAULT_FILTERS, filterProperties, getPriceFilterError, type PropertyFilterState } from "@/utils/filterProperties";
import { parsePriceFilter } from "@/utils/format";

const published = SEED_PROPERTIES.filter((p) => p.status === "publicado");
const ids = (filters: Partial<PropertyFilterState>) => filterProperties(published, { ...DEFAULT_FILTERS, ...filters }).map((p) => p.id).sort();

describe("Price filters in reais", () => {
  it("applies only the minimum, including its limit", () => {
    expect(ids({ minPrice: "760000" })).toEqual(["olympus-prime", "red-canyon-estate", "sunset-crater", "valles-residence"]);
  });
  it("applies only the maximum, including its limit", () => {
    expect(ids({ maxPrice: "540000" })).toEqual(["elysium-horizon", "utopia-frontier"]);
  });
  it("includes both boundaries of a Brazilian currency interval", () => {
    expect(ids({ minPrice: "R$ 760.000,00", maxPrice: "R$ 980.000,00" })).toEqual(["red-canyon-estate", "sunset-crater", "valles-residence"]);
  });
  it("does not restrict prices when both bounds are empty", () => {
    expect(ids({})).toHaveLength(7);
  });
  it("returns no listings for an unmatched interval", () => {
    expect(ids({ minPrice: "150000", maxPrice: "200000" })).toEqual([]);
  });
  it("rejects a minimum higher than the maximum", () => {
    expect(getPriceFilterError({ minPrice: "980000", maxPrice: "760000" })).toBeDefined();
    expect(ids({ minPrice: "980000", maxPrice: "760000" })).toHaveLength(7);
  });
  it("combines prices with region, query, area, features and sort", () => {
    expect(ids({ minPrice: "760000", maxPrice: "980000", region: "Arabia Terra", query: "cânions", minArea: "6000", features: ["Abrigo natural"], sort: "menor-preco" })).toEqual(["red-canyon-estate"]);
  });
  it("parses full reais without applying the listing cents mask", () => {
    expect(parsePriceFilter("R$ 150.000,00")).toBe(150000);
    expect(parsePriceFilter("150000")).toBe(150000);
    expect(parsePriceFilter("150.000")).toBe(150000);
    expect(parsePriceFilter("150000,50")).toBe(150000.5);
    expect(parsePriceFilter("150000.50")).toBe(150000.5);
  });
  it("rejects malformed, negative and nonfinite amounts", () => {
    for (const minPrice of ["abc", "-1", "Infinity", "NaN", "1.2.3", "1,234", "R$"]) {
      expect(getPriceFilterError({ minPrice, maxPrice: "" }), minPrice).toBeDefined();
    }
  });
  it("treats zero as a real maximum", () => {
    expect(ids({ maxPrice: "0" })).toEqual([]);
  });
  it("uses the same price rules for listings created through the existing service", () => {
    const source = SEED_PROPERTIES[0];
    if (!source) throw new Error("Missing test fixture");
    try {
      const created = propertyService.create({ ...source, title: "Teste de intervalo", price: 150000 });
      expect(filterProperties(propertyService.listPublished(), { ...DEFAULT_FILTERS, minPrice: "R$ 150.000,00", maxPrice: "150000" }).map((p) => p.id)).toEqual([created.id]);
    } finally {
      propertyService.reset();
    }
  });
});