import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/FormField";
import { AuthCard, GoogleButton } from "@/components/auth/AuthCard";
import { authService } from "@/services/authService";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Mars Real Estate" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "description", content: "Acesse sua conta na Mars Real Estate." },
      { property: "og:title", content: "Entrar — Mars Real Estate" },
      { property: "og:description", content: "Login da plataforma." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<{ email?: string; pw?: string }>({});
  return (
    <AuthCard
      title="Entrar"
      subtitle=""
      footer={<>Não tem conta? <Link to="/cadastro" className="text-primary-glow hover:underline">Criar conta</Link></>}
    >
      <form
        noValidate
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const n: typeof err = {};
          if (!/^\S+@\S+\.\S+$/.test(email)) n.email = "Informe um e-mail válido.";
          if (!pw) n.pw = "Informe a senha.";
          setErr(n);
          if (!Object.keys(n).length) {
            try {
              await authService.login(email.trim(), pw);
              setPw("");
              toast.success("Login realizado.");
              navigate({ to: "/" });
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Não foi possível entrar.");
            }
          }
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
