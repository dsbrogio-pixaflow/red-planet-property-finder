import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, User, ChevronDown, Building2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "./Logo";

const NAV = [
  { to: "/terrenos", label: "Comprar" },
  { to: "/descobrir", label: "Descobrir" },
  { to: "/financiamento", label: "Financiamento" },
  { to: "/ajuda", label: "Ajuda" },
] as const;

const ADVERTISE_OPTIONS = [
  { tipo: "proprietario", label: "Sou proprietário", icon: KeyRound },
  { tipo: "imobiliaria", label: "Sou imobiliária", icon: Building2 },
] as const;

const linkClass = "text-sm text-muted-foreground transition-colors hover:text-foreground";

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Principal">
          <Link to="/terrenos" className={linkClass} activeProps={{ className: "text-foreground" }} activeOptions={{ exact: true }}>
            Comprar
          </Link>
          <Link to="/descobrir" className={linkClass} activeProps={{ className: "text-foreground" }} activeOptions={{ exact: true }}>
            Descobrir
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className={`inline-flex items-center gap-1 ${linkClass}`}>
              Anunciar <ChevronDown className="size-3.5" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {ADVERTISE_OPTIONS.map((opt) => (
                <DropdownMenuItem key={opt.tipo} asChild>
                  <Link to="/anuncios/novo" search={{ tipo: opt.tipo }} className="cursor-pointer">
                    <opt.icon aria-hidden /> {opt.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/financiamento" className={linkClass} activeProps={{ className: "text-foreground" }} activeOptions={{ exact: true }}>
            Financiamento
          </Link>
          <Link to="/ajuda" className={linkClass} activeProps={{ className: "text-foreground" }} activeOptions={{ exact: true }}>
            Ajuda
          </Link>
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
          className="lg:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <nav className="border-t border-border/60 px-4 pb-4 lg:hidden" aria-label="Menu móvel">
          <ul className="flex flex-col gap-1 pt-3">
            {NAV.slice(0, 2).map((n) => (
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
              <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Anunciar
              </p>
              <ul className="flex flex-col gap-1 pl-2">
                {ADVERTISE_OPTIONS.map((opt) => (
                  <li key={opt.tipo}>
                    <Link
                      to="/anuncios/novo"
                      search={{ tipo: opt.tipo }}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary"
                    >
                      <opt.icon className="size-4" aria-hidden /> {opt.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            {NAV.slice(2).map((n) => (
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
