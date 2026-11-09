import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ArrowUpRight, Bot, Loader2, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { chatApi, type ChatReply } from "@/services/chatApi";

type Message = {
  role: "user" | "assistant";
  text: string;
  sources?: ChatReply["sources"];
};

const SUGGESTIONS = [
  "Quais imóveis estão disponíveis?",
  "Quantos imóveis há em Tharsis?",
  "Quais os preços em Utopia Planitia?",
];

export function PropertyChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<ChatReply["mode"] | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const busy = useRef(false);

  useEffect(
    () => () => {
      const controller = activeRequest.current;
      activeRequest.current = null;
      controller?.abort();
    },
    [],
  );
  useEffect(() => {
    bottom.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
  }, [messages, pending, error, open]);

  function changeOpen(nextOpen: boolean) {
    if (!nextOpen) {
      const controller = activeRequest.current;
      activeRequest.current = null;
      controller?.abort();
      busy.current = false;
      setMessages([]);
      setDraft("");
      setError("");
      setMode(null);
      setPending(false);
    }
    setOpen(nextOpen);
  }

  async function send(value: string) {
    const question = value.trim();
    if (!question || busy.current || question.length > 1000) return;
    busy.current = true;
    const controller = new AbortController();
    activeRequest.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 25000);
    const previous = messages;
    setDraft("");
    setError("");
    setPending(true);
    setMessages([...previous, { role: "user", text: question }]);
    try {
      const reply = await chatApi.ask(
        question,
        previous.filter((message) => message.role === "user").map((message) => message.text),
        controller.signal,
      );
      if (activeRequest.current !== controller) return;
      setMode(reply.mode);
      setMessages([
        ...previous,
        { role: "user", text: question },
        { role: "assistant", text: reply.answer, sources: reply.sources },
      ]);
    } catch (reason) {
      if (activeRequest.current !== controller) return;
      setMessages(previous);
      setDraft(question);
      setError(
        controller.signal.aborted
          ? "A consulta demorou mais que o esperado. Tente enviar novamente."
          : reason instanceof Error && !/fetch|network/i.test(reason.message)
            ? reason.message
            : "Não foi possível consultar o assistente. Tente novamente em instantes.",
      );
    } finally {
      window.clearTimeout(timeout);
      if (activeRequest.current === controller) {
        busy.current = false;
        setPending(false);
        activeRequest.current = null;
        input.current?.focus();
      }
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(draft);
  }

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <Popover open={open} onOpenChange={changeOpen}>
        {!open && (
          <button
            type="button"
            onClick={() => changeOpen(true)}
            className="relative rounded-xl border border-primary/30 bg-card px-4 py-2.5 text-sm font-medium shadow-card transition-colors hover:bg-secondary after:absolute after:-bottom-1.5 after:right-5 after:size-3 after:rotate-45 after:border-b after:border-r after:border-primary/30 after:bg-card"
          >
            Fale Conosco
          </button>
        )}
        <PopoverTrigger asChild>
          <Button
            variant="hero"
            size="icon"
            className="size-14 rounded-full shadow-lg [&_svg]:size-6"
            aria-label={open ? "Fechar assistente de imóveis" : "Abrir assistente de imóveis"}
          >
            {open ? <X aria-hidden /> : <MessageCircle aria-hidden />}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="top"
          sideOffset={12}
          collisionPadding={16}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            input.current?.focus();
          }}
          aria-label="Assistente de imóveis"
          className="flex h-[min(560px,calc(100dvh-116px))] w-[calc(100vw-32px)] max-w-[390px] flex-col overflow-hidden rounded-2xl border-border/80 bg-background p-0 shadow-2xl"
        >
          <div className="flex items-center gap-3 border-b border-border/60 bg-card p-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary-glow">
              <Bot aria-hidden />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold">Assistente Mars</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {mode === "ai" ? "IA conectada ao catálogo" : "Consulta ao catálogo de imóveis"}
              </p>
            </div>
            <PopoverPrimitive.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Fechar conversa">
                <X aria-hidden />
              </Button>
            </PopoverPrimitive.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
            <div className="mb-4 rounded-2xl rounded-tl-sm bg-secondary p-3 text-sm leading-relaxed">
              Olá! Sou o assistente Mars. Posso ajudar com preços, detalhes de um imóvel e
              disponibilidade por região.
              <p className="mt-2 text-xs text-muted-foreground">
                Consulte pelo título ou ID do anúncio. Os imóveis são fictícios.
              </p>
            </div>
            {messages.length === 0 && !pending && (
              <div className="mb-4 flex flex-col items-start gap-2">
                {SUGGESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => void send(question)}
                    className="rounded-xl border border-primary/30 px-3 py-2 text-left text-xs text-primary-glow transition-colors hover:bg-primary/10"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
            <div
              role="log"
              aria-label="Mensagens da conversa"
              aria-live="polite"
              aria-relevant="additions"
              className="space-y-3"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={
                    message.role === "user"
                      ? "ml-6 rounded-2xl rounded-tr-sm bg-primary/15 p-3"
                      : "mr-2 rounded-2xl rounded-tl-sm bg-secondary p-3"
                  }
                >
                  <span className="sr-only">
                    {message.role === "user" ? "Você: " : "Assistente: "}
                  </span>
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {message.text}
                  </p>
                  {!!message.sources?.length && (
                    <ul className="mt-3 space-y-2 border-t border-border/60 pt-3">
                      {message.sources.map((source) => (
                        <li key={source.id}>
                          <Link
                            to="/terrenos/$id"
                            params={{ id: String(source.id) }}
                            className="flex items-center gap-1 text-xs text-primary-glow hover:underline"
                          >
                            {source.title} <ArrowUpRight className="size-3 shrink-0" aria-hidden />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            {pending && (
              <p
                role="status"
                className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"
              >
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Consultando os anúncios publicados...
              </p>
            )}
            {error && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {error} Sua pergunta está no campo abaixo para reenviar.
              </p>
            )}
            <div ref={bottom} />
          </div>
          <div className="border-t border-border/60 p-3">
            <form onSubmit={submit} className="flex gap-2">
              <label htmlFor="chat-question" className="sr-only">
                Sua pergunta
              </label>
              <Input
                ref={input}
                id="chat-question"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Pergunte sobre um imóvel..."
                maxLength={1000}
                autoComplete="off"
                disabled={pending}
                className="min-w-0"
              />
              <Button
                type="submit"
                variant="hero"
                size="icon"
                disabled={pending || !draft.trim()}
                aria-label="Enviar pergunta"
              >
                <Send aria-hidden />
              </Button>
            </form>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Preços e disponibilidade dos anúncios publicados.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
