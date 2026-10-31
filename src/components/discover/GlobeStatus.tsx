import { LoaderCircle, Orbit } from "lucide-react";

export function GlobeStatus({ failed = false }: { failed?: boolean }) {
  return <div className="flex min-h-[420px] items-center justify-center bg-background px-6 text-center" role="status">
    <div className="max-w-md space-y-3">
      {failed ? <Orbit className="mx-auto size-8 text-primary" /> : <LoaderCircle className="mx-auto size-8 animate-spin text-primary" />}
      <p className="font-display text-lg">{failed ? "O globo 3D não pôde ser iniciado" : "Preparando a exploração de Marte…"}</p>
      {failed && <p className="text-sm text-muted-foreground">Os recursos gráficos necessários não estão disponíveis. Tente outro navegador ou ative a aceleração gráfica. As regiões e os anúncios continuam acessíveis acima e abaixo.</p>}
    </div>
  </div>;
}