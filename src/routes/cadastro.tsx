import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/FormField";
import { AuthCard, GoogleButton } from "@/components/auth/AuthCard";
import { DEMO_NOTICE } from "@/services/authService";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta — Mars Real Estate" },
      { name: "description", content: "Cadastro demonstrativo na Mars Real Estate." },
      { property: "og:title", content: "Criar conta — Mars Real Estate" },
      { property: "og:description", content: "Crie sua conta demonstrativa." },
    ],
  }),
  component: Signup,
});

type Errs = Partial<Record<"name" | "email" | "pw" | "pw2" | "terms", string>>;

function Signup() {
  const [f, setF] = useState({ name: "", email: "", pw: "", pw2: "", terms: false });
  const [err, setErr] = useState<Errs>({});
  return (
    <AuthCard title="Criar conta" subtitle="Comece a explorar o planeta vermelho." footer={<>Já tem conta? <Link to="/login" className="text-primary-glow hover:underline">Entrar</Link></>}>
      <form
        noValidate
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const n: Errs = {};
          if (!f.name.trim()) n.name = "Informe seu nome.";
          if (!/^\S+@\S+\.\S+$/.test(f.email)) n.email = "Informe um e-mail válido.";
          if (f.pw.length < 8) n.pw = "A senha deve ter ao menos 8 caracteres.";
          if (f.pw !== f.pw2) n.pw2 = "As senhas não coincidem.";
          if (!f.terms) n.terms = "Aceite os termos demonstrativos.";
          setErr(n);
          if (!Object.keys(n).length) { toast.info(DEMO_NOTICE); setF({ ...f, pw: "", pw2: "" }); }
        }}
      >
        <FormField id="c-name" label="Nome completo" error={err.name}><Input id="c-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></FormField>
        <FormField id="c-email" label="E-mail" error={err.email}><Input id="c-email" type="email" autoComplete="off" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></FormField>
        <FormField id="c-pw" label="Senha" error={err.pw}><Input id="c-pw" type="password" autoComplete="off" value={f.pw} onChange={(e) => setF({ ...f, pw: e.target.value })} /></FormField>
        <FormField id="c-pw2" label="Confirmar senha" error={err.pw2}><Input id="c-pw2" type="password" autoComplete="off" value={f.pw2} onChange={(e) => setF({ ...f, pw2: e.target.value })} /></FormField>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1 accent-primary" checked={f.terms} onChange={(e) => setF({ ...f, terms: e.target.checked })} />
          Aceito os termos de uso demonstrativos.
        </label>
        {err.terms && <p role="alert" className="text-xs text-destructive">{err.terms}</p>}
        <Button type="submit" variant="hero" className="w-full">Criar conta</Button>
        <GoogleButton label="Cadastrar com Google" />
      </form>
    </AuthCard>
  );
}
