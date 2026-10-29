const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const num = new Intl.NumberFormat("pt-BR");

export const formatBRL = (value: number) => brl.format(value).replace(/\u00a0/g, " ");
export const formatArea = (m2: number) => `${num.format(m2)} m²`;
export const formatKm = (km: number) => `~${num.format(km)} km`;
export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("pt-BR", { timeZone: "UTC" });

/** Full reais, not the cents-based typing mask used by the listing form. */
export function parsePriceFilter(raw: string): number | null {
  const text = raw.trim().replace(/^R\$\s*/, "").trim();
  if (!text) return null;
  let normalized: string;
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(text)) {
    normalized = text.replace(/\./g, "").replace(",", ".");
  } else if (/^\d+(,\d{1,2})?$/.test(text)) {
    normalized = text.replace(",", ".");
  } else if (/^\d+\.\d{1,2}$/.test(text)) {
    normalized = text;
  } else {
    return NaN;
  }
  const value = Number(normalized);
  return Number.isFinite(value) ? value : NaN;
}

/** Converte o texto digitado ("125.000,50") em número. */
export function parseBRLInput(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  return digits ? Number(digits) / 100 : 0;
}
