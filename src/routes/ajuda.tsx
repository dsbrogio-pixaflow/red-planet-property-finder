import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeBuoy } from "lucide-react";
import { PageShell, PageHeading } from "@/components/layout/PageShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [
      { title: "Central de ajuda — Mars Real Estate" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "description", content: "Tire dúvidas sobre compra, anúncio, cadastro e financiamento de terrenos fictícios em Marte." },
      { property: "og:title", content: "Central de ajuda — Mars Real Estate" },
      { property: "og:description", content: "Perguntas frequentes da plataforma demonstrativa." },
    ],
  }),
  component: Help,
});

const TOPICS: { value: string; title: string; body: React.ReactNode }[] = [
  {
    value: "comprar",
    title: "Como comprar um terreno",
    body: (
      <>
        Acesse <Link to="/terrenos" className="text-primary-glow hover:underline">Comprar</Link>,
        use os filtros de preço, área e região e abra o anúncio clicando em qualquer parte do
        cartão. Na página de detalhes você encontra descrição, galeria e pontos de interesse. Como
        esta é uma plataforma demonstrativa, nenhuma compra real é realizada.
      </>
    ),
  },
  {
    value: "anunciar",
    title: "Como anunciar um terreno",
    body: (
      <>
        No menu <strong>Anunciar</strong>, escolha <em>Sou proprietário</em> ou{" "}
        <em>Sou imobiliária</em> e preencha o formulário com título, preço em reais, área, região e
        fotos. O anúncio aparece em{" "}
        <Link to="/meus-anuncios" className="text-primary-glow hover:underline">Meus anúncios</Link>{" "}
        apenas nesta sessão do navegador (modo demonstrativo).
      </>
    ),
  },
  {
    value: "cadastro",
    title: "Como funciona o cadastro",
    body: (
      <>
        As telas de <Link to="/cadastro" className="text-primary-glow hover:underline">Criar conta</Link>{" "}
        e <Link to="/login" className="text-primary-glow hover:underline">Entrar</Link> estão
        disponíveis, mas o acesso é demonstrativo: nenhuma conta real é criada nem sessão
        verdadeira é iniciada nesta versão.
      </>
    ),
  },
  {
    value: "financiamento",
    title: "Como funciona o financiamento",
    body: (
      <>
        Na página <Link to="/financiamento" className="text-primary-glow hover:underline">Financiamento</Link>,
        informe valor do imóvel, entrada, taxa de juros anual e prazo para estimar parcelas pelos
        sistemas Price (parcelas fixas) ou SAC (amortização constante). Os resultados são apenas
        estimativas em reais — não constituem proposta financeira.
      </>
    ),
  },
  {
    value: "faq",
    title: "Dúvidas frequentes",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Os terrenos são reais? Não — todos os anúncios são fictícios e ilustrativos.</li>
        <li>Meus anúncios somem ao recarregar? Sim, o modo demonstrativo não persiste dados.</li>
        <li>O mapa 3D de Marte já funciona? Ainda não; a página Descobrir mostra as regiões disponíveis enquanto o mapa é preparado.</li>
      </ul>
    ),
  },
  {
    value: "contato",
    title: "Como entrar em contato",
    body: (
      <>
        Este é um projeto fictício de demonstração e não possui canal de atendimento real. Para
        dúvidas sobre a plataforma, consulte a página{" "}
        <Link to="/como-funciona" className="text-primary-glow hover:underline">Como funciona</Link>.
      </>
    ),
  },
];

function Help() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
        <PageHeading
          eyebrow="Central de ajuda"
          title="Como podemos ajudar?"
          description="Encontre respostas sobre compra, anúncio, cadastro e financiamento de terrenos demonstrativos em Marte."
        />
        <div className="rounded-xl border border-border/60 bg-card px-6 shadow-card">
          <div className="flex items-center gap-2 pt-6">
            <LifeBuoy className="size-5 text-primary-glow" aria-hidden />
            <h2 className="text-lg font-semibold">Tópicos</h2>
          </div>
          <Accordion type="single" collapsible className="mt-2">
            {TOPICS.map((t) => (
              <AccordionItem key={t.value} value={t.value}>
                <AccordionTrigger>{t.title}</AccordionTrigger>
                <AccordionContent>
                  <div className="text-sm text-muted-foreground">{t.body}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </PageShell>
  );
}
