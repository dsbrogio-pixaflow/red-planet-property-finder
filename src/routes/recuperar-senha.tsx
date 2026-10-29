import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/FormField";
import { AuthCard } from "@/components/auth/AuthCard";
import { DEMO_NOTICE } from "@/services/authService";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — Mars Real Estate" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "description", content: "Recuperação de senha demonstrativa." },
      { property: "og:title", content: "Recuperar senha — Mars Real Estate" },
      { property: "og:description", content: "Recuperação de senha demonstrativa." },
    ],
  }),
  component: Recover,
});

function Recover() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | undefined>();
  return (
    <AuthCard title="Recuperar senha" subtitle="Informe seu e-mail para receber instruções." footer={<Link to="/login" className="text-primary-glow hover:underline">Voltar ao login</Link>}>
      <form noValidate className="space-y-4" onSubmit={(e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Informe um e-mail válido.");
        setErr(undefined); toast.info(DEMO_NOTICE);
      }}>
        <FormField id="r-email" label="E-mail" error={err}><Input id="r-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></FormField>
        <Button type="submit" variant="hero" className="w-full">Enviar instruções</Button>
      </form>
    </AuthCard>
  );
}
