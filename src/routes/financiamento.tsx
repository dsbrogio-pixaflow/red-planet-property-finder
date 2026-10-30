import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "lucide-react";
import { PageShell, PageHeading, DemoBadge } from "@/components/layout/PageShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatBRL, parsePriceFilter } from "@/utils/format";
import { simulateFinancing, type AmortizationSystem } from "@/utils/financing";

export const Route = createFileRoute("/financiamento")({
  head: () => ({
    meta: [
      { title: "Simulação de financiamento — Mars Real Estate" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "description", content: "Simule parcelas de um financiamento imobiliário fictício em reais, pelos sistemas Price e SAC." },
      { property: "og:title", content: "Simulação de financiamento — Mars Real Estate" },
      { property: "og:description", content: "Estime parcelas e juros de um financiamento demonstrativo." },
    ],
  }),
  component: Financing,
});

function PriceField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        inputMode="numeric"
        placeholder="Ex.: 450.000"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Financing() {
  const [propertyValue, setPropertyValue] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [rate, setRate] = useState("10");
  const [term, setTerm] = useState("30");
  const [system, setSystem] = useState<AmortizationSystem>("price");

  const result = useMemo(() => {
    const pv = parsePriceFilter(propertyValue);
    const dp = parsePriceFilter(downPayment);
    const r = parsePriceFilter(rate);
    const t = parsePriceFilter(term);
    if (pv === null || Number.isNaN(pv)) return null;
    return simulateFinancing({
      propertyValue: pv,
      downPayment: dp === null || Number.isNaN(dp) ? 0 : dp,
      annualRatePercent: r === null || Number.isNaN(r) ? 0 : r,
      termYears: t === null || Number.isNaN(t) ? 0 : t,
      system,
    });
  }, [propertyValue, downPayment, rate, term, system]);

  const invalid =
    propertyValue.trim() !== "" &&
    (parsePriceFilter(propertyValue) === null ||
      Number.isNaN(parsePriceFilter(propertyValue) ?? NaN));

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-12 sm:px-6">
        <PageHeading
          eyebrow="Financiamento"
          title="Simule seu financiamento"
          description="Estime as parcelas de um terreno em Marte pelos sistemas Price e SAC, em reais (R$)."
        />
        <DemoBadge>
          Simulação apenas ilustrativa: os valores são estimativas e não representam uma proposta
          financeira real.
        </DemoBadge>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <form
            className="grid gap-5 rounded-xl border border-border/60 bg-card p-6 shadow-card sm:grid-cols-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-2 sm:col-span-2">
              <Calculator className="size-5 text-primary-glow" aria-hidden />
              <h2 className="text-lg font-semibold">Dados da simulação</h2>
            </div>
            <PriceField id="valor-imovel" label="Valor do imóvel (R$)" value={propertyValue} onChange={setPropertyValue} />
            <PriceField id="entrada" label="Entrada (R$)" value={downPayment} onChange={setDownPayment} />
            <div className="space-y-2">
              <Label htmlFor="taxa">Taxa de juros (% ao ano)</Label>
              <Input id="taxa" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prazo">Prazo (anos)</Label>
              <Input id="prazo" inputMode="numeric" value={term} onChange={(e) => setTerm(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="sistema">Sistema de amortização</Label>
              <Select value={system} onValueChange={(v) => setSystem(v as AmortizationSystem)}>
                <SelectTrigger id="sistema">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price — parcelas fixas</SelectItem>
                  <SelectItem value="sac">SAC — amortização constante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {invalid && (
              <p role="alert" className="text-sm text-destructive sm:col-span-2">
                Informe o valor do imóvel em reais, como 450.000.
              </p>
            )}
          </form>

          <aside
            aria-live="polite"
            className="h-fit space-y-4 rounded-xl border border-border/60 bg-card p-6 shadow-card"
          >
            <h2 className="text-lg font-semibold">Resultado da simulação</h2>
            {result ? (
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Valor financiado</dt>
                  <dd className="font-medium">{formatBRL(result.principal)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Parcelas</dt>
                  <dd className="font-medium">{result.months}× mensais</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-border/60 pt-3">
                  <dt className="text-muted-foreground">
                    {system === "price" ? "Parcela mensal" : "Primeira parcela"}
                  </dt>
                  <dd className="text-lg font-semibold text-primary-glow">
                    {formatBRL(result.firstInstallment)}
                  </dd>
                </div>
                {system === "sac" && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Última parcela</dt>
                    <dd className="font-medium">{formatBRL(result.lastInstallment)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Total de juros</dt>
                  <dd className="font-medium">{formatBRL(result.totalInterest)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-border/60 pt-3">
                  <dt className="text-muted-foreground">Total pago</dt>
                  <dd className="font-medium">{formatBRL(result.totalPaid)}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                Preencha o valor do imóvel para ver a estimativa das parcelas.
              </p>
            )}
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
