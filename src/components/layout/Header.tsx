import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/terrenos", label: "Explorar Terrenos" },
  { to: "/como-funciona", label: "Como Funciona" },
  { to: "/anuncios/novo", label: "Anunciar terreno" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-5 xl:flex" aria-label="Principal">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: true }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          <Button asChild variant="glass" size="sm">
            <Link to="/login">
              <User /> Entrar
            </Link>
          </Button>
          <Button asChild variant="hero" size="sm">
            <Link to="/cadastro">
              Criar conta
            </Link>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="xl:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <nav className="border-t border-border/60 px-4 pb-4 xl:hidden" aria-label="Menu móvel">
          <ul className="flex flex-col gap-1 pt-3">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-secondary"
                >
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/meus-anuncios"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm hover:bg-secondary"
              >
                Meus anúncios
              </Link>
            </li>
          </ul>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
            <Button asChild variant="glass" onClick={() => setOpen(false)}>
              <Link to="/login"><User /> Entrar</Link>
            </Button>
            <Button asChild variant="hero" onClick={() => setOpen(false)}>
              <Link to="/cadastro">Criar conta</Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
