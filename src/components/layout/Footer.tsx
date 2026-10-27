import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Logo } from "./Logo";

export function Footer() {
  const soon = () => toast.info("Documento ilustrativo — será publicado em uma etapa posterior.");
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Compre já seu terreno em Marte com os melhores preços e tenha um pedaço do planeta
            vermelho.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Navegação</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Início</Link></li>
            <li><Link to="/terrenos" className="hover:text-foreground">Explorar terrenos</Link></li>
            <li><Link to="/como-funciona" className="hover:text-foreground">Como funciona</Link></li>
            <li><Link to="/admin" className="hover:text-foreground">Painel administrativo</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Institucional</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Projeto fictício de demonstração</li>
            <li><button onClick={soon} className="hover:text-foreground">Política de privacidade</button></li>
            <li><button onClick={soon} className="hover:text-foreground">Termos de uso</button></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 px-4 py-5 text-center text-xs text-muted-foreground">
        Plataforma de simulação demonstrativa. Todos os anúncios são fictícios — não há venda real de
        propriedades em Marte.
      </div>
    </footer>
  );
}
