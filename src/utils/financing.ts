export type AmortizationSystem = "price" | "sac";

export interface FinancingInput {
  /** Valor do imóvel em reais. */
  propertyValue: number;
  /** Entrada em reais. */
  downPayment: number;
  /** Taxa de juros efetiva ao ano, em percentual (ex.: 10 = 10% a.a.). */
  annualRatePercent: number;
  /** Prazo em anos. */
  termYears: number;
  system: AmortizationSystem;
}

export interface FinancingResult {
  /** Valor financiado (imóvel - entrada). */
  principal: number;
  /** Taxa efetiva mensal (decimal). */
  monthlyRate: number;
  /** Número de parcelas mensais. */
  months: number;
  /** Parcela constante (Price) ou primeira parcela (SAC). */
  firstInstallment: number;
  /** Última parcela (igual à primeira no Price). */
  lastInstallment: number;
  /** Soma de todas as parcelas. */
  totalPaid: number;
  /** Total de juros pagos. */
  totalInterest: number;
}

/** Converte taxa efetiva anual (%) em taxa efetiva mensal (decimal). */
export function annualToMonthlyRate(annualRatePercent: number): number {
  return Math.pow(1 + annualRatePercent / 100, 1 / 12) - 1;
}

/**
 * Simula um financiamento pelo sistema Price (parcelas constantes) ou SAC
 * (amortização constante). Retorna null quando os dados não formam uma
 * simulação válida.
 */
export function simulateFinancing(input: FinancingInput): FinancingResult | null {
  const { propertyValue, downPayment, annualRatePercent, termYears, system } = input;
  if (
    !Number.isFinite(propertyValue) ||
    !Number.isFinite(downPayment) ||
    !Number.isFinite(annualRatePercent) ||
    !Number.isFinite(termYears)
  ) {
    return null;
  }
  const principal = propertyValue - downPayment;
  const months = Math.round(termYears * 12);
  if (principal <= 0 || months <= 0 || downPayment < 0 || annualRatePercent < 0) return null;

  const i = annualToMonthlyRate(annualRatePercent);

  if (system === "price") {
    const installment =
      i === 0 ? principal / months : (principal * i) / (1 - Math.pow(1 + i, -months));
    const totalPaid = installment * months;
    return {
      principal,
      monthlyRate: i,
      months,
      firstInstallment: installment,
      lastInstallment: installment,
      totalPaid,
      totalInterest: totalPaid - principal,
    };
  }

  // SAC: amortização constante, juros sobre o saldo devedor.
  const amortization = principal / months;
  const firstInstallment = amortization + principal * i;
  const lastInstallment = amortization + amortization * i;
  // Soma dos juros: i * (saldo de cada mês) = i * amortização * (n + (n-1) + ... + 1)
  const totalInterest = i * amortization * ((months * (months + 1)) / 2);
  return {
    principal,
    monthlyRate: i,
    months,
    firstInstallment,
    lastInstallment,
    totalPaid: principal + totalInterest,
    totalInterest,
  };
}
