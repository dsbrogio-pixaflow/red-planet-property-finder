const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const num = new Intl.NumberFormat("pt-BR");

export const formatBRL = (value: number) => brl.format(value).replace(/\u00a0/g, " ");
export const formatArea = (m2: number) => `${num.format(m2)} m²`;
export const formatKm = (km: number) => `~${num.format(km)} km`;
export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("pt-BR", { timeZone: "UTC" });

/** Converte o texto digitado ("125.000,50") em número. */
export function parseBRLInput(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  return digits ? Number(digits) / 100 : 0;
}
