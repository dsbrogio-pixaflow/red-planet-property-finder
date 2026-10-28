import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/FormField";
import { AuthCard, GoogleButton } from "@/components/auth/AuthCard";
import { DEMO_NOTICE } from "@/services/authService";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Mars Real Estate" },
      { name: "description", content: "Acesse sua conta demonstrativa na Mars Real Estate." },
      { property: "og:title", content: "Entrar — Mars Real Estate" },
      { property: "og:description", content: "Login demonstrativo da plataforma." },
    ],
  }),
  component: Login,
});

function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<{ email?: string; pw?: string }>({});
  return (
    <AuthCard
      title="Entrar"
      subtitle="Acesse seus anúncios marcianos."
      footer={<>Não tem conta? <Link to="/cadastro" className="text-primary-glow hover:underline">Criar conta</Link></>}
    >
      <form
        noValidate
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const n: typeof err = {};
          if (!/^\S+@\S+\.\S+$/.test(email)) n.email = "Informe um e-mail válido.";
          if (!pw) n.pw = "Informe a senha.";
          setErr(n);
          if (!Object.keys(n).length) { toast.info(DEMO_NOTICE); setPw(""); }
        }}
      >
        <FormField id="l-email" label="E-mail" error={err.email}>
          <Input id="l-email" type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <FormField id="l-pw" label="Senha" error={err.pw}>
          <Input id="l-pw" type="password" autoComplete="off" value={pw} onChange={(e) => setPw(e.target.value)} />
        </FormField>
        <div className="text-right text-sm"><Link to="/recuperar-senha" className="text-primary-glow hover:underline">Esqueci minha senha</Link></div>
        <Button type="submit" variant="hero" className="w-full">Entrar</Button>
        <GoogleButton label="Continuar com Google" />
      </form>
    </AuthCard>
  );
}
