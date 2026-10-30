import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/40">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-10 sm:px-6">
        <Logo />
        <p className="max-w-md text-sm text-muted-foreground">
          Compre já seu terreno em Marte com os melhores preços e tenha um pedaço do planeta
          vermelho.
        </p>
      </div>
      <div className="border-t border-border/60 px-4 py-5 text-center text-xs text-muted-foreground">
        Plataforma de simulação demonstrativa. Todos os anúncios são fictícios — não há venda real de
        propriedades em Marte.
      </div>
    </footer>
  );
}
