import { describe, expect, it } from "vitest";
import { annualToMonthlyRate, simulateFinancing } from "@/utils/financing";

describe("simulateFinancing", () => {
  it("Price: parcela constante de R$ 100.000 a 12% a.a. em 1 ano", () => {
    const result = simulateFinancing({
      propertyValue: 100_000,
      downPayment: 0,
      annualRatePercent: 12,
      termYears: 1,
      system: "price",
    });
    expect(result).not.toBeNull();
    expect(result!.months).toBe(12);
    const i = annualToMonthlyRate(12);
    const expected = (100_000 * i) / (1 - Math.pow(1 + i, -12));
    expect(result!.firstInstallment).toBeCloseTo(expected, 2);
    expect(result!.lastInstallment).toBe(result!.firstInstallment);
    expect(result!.totalPaid).toBeCloseTo(expected * 12, 2);
    expect(result!.totalInterest).toBeCloseTo(expected * 12 - 100_000, 2);
  });

  it("SAC: primeira parcela = amortização + juros do saldo", () => {
    const result = simulateFinancing({
      propertyValue: 120_000,
      downPayment: 20_000,
      annualRatePercent: 12,
      termYears: 1,
      system: "sac",
    });
    expect(result).not.toBeNull();
    const i = annualToMonthlyRate(12);
    const amortization = 100_000 / 12;
    expect(result!.firstInstallment).toBeCloseTo(amortization + 100_000 * i, 2);
    expect(result!.lastInstallment).toBeCloseTo(amortization + amortization * i, 2);
    expect(result!.lastInstallment).toBeLessThan(result!.firstInstallment);
    expect(result!.totalPaid).toBeCloseTo(100_000 + result!.totalInterest, 2);
  });

  it("taxa zero: parcela é o principal dividido pelo prazo", () => {
    const result = simulateFinancing({
      propertyValue: 96_000,
      downPayment: 0,
      annualRatePercent: 0,
      termYears: 8,
      system: "price",
    });
    expect(result!.firstInstallment).toBeCloseTo(1000, 2);
    expect(result!.totalInterest).toBe(0);
  });

  it("rejeita entrada maior que o imóvel e prazo inválido", () => {
    expect(
      simulateFinancing({
        propertyValue: 100_000,
        downPayment: 150_000,
        annualRatePercent: 10,
        termYears: 30,
        system: "price",
      }),
    ).toBeNull();
    expect(
      simulateFinancing({
        propertyValue: 100_000,
        downPayment: 0,
        annualRatePercent: 10,
        termYears: 0,
        system: "price",
      }),
    ).toBeNull();
  });
});
