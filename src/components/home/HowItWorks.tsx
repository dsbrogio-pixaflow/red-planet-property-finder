import { Compass, FileSearch, Scale } from "lucide-react";

const STEPS = [
  { icon: Compass, title: "Explore os terrenos", text: "Navegue pelo catálogo e descubra lotes fictícios em vulcões, cânions e planícies marcianas." },
  { icon: Scale, title: "Compare características e valores", text: "Use filtros de preço, área, região e características para encontrar o terreno ideal." },
  { icon: FileSearch, title: "Consulte os detalhes do anúncio", text: "Veja galeria de fotos, pontos de interesse e informações do anunciante." },
];

export function HowItWorks() {
  return (
    <ol className="grid gap-6 md:grid-cols-3">
      {STEPS.map((s, i) => (
        <li key={s.title} className="relative rounded-xl border border-border/60 bg-card p-6">
          <span className="font-display text-5xl font-bold text-primary/20">0{i + 1}</span>
          <s.icon className="mt-2 size-7 text-primary" aria-hidden />
          <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
