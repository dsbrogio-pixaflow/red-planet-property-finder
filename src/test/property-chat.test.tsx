import type { ReactNode } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PropertyChat } from "@/components/chat/PropertyChat";
import { chatApi, type ChatReply } from "@/services/chatApi";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ params, children }: { params: { id: string }; children: ReactNode }) => (
    <a href={`/terrenos/${params.id}`}>{children}</a>
  ),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function openChat() {
  render(<PropertyChat />);
  fireEvent.click(screen.getByRole("button", { name: "Fale Conosco" }));
}

describe("Property chat", () => {
  it.each(["close button", "trigger", "Escape"])(
    "clears messages, draft and context when closed with %s",
    async (method) => {
      const ask = vi.spyOn(chatApi, "ask").mockResolvedValue({
        answer: "Resposta anterior",
        mode: "ai",
        sources: [],
      });
      openChat();
      fireEvent.click(screen.getByRole("button", { name: "Quantos imóveis há em Tharsis?" }));
      await screen.findByText("Resposta anterior");
      fireEvent.change(screen.getByRole("textbox"), { target: { value: "Rascunho anterior" } });
      if (method === "Escape") fireEvent.keyDown(document, { key: "Escape" });
      else
        fireEvent.click(
          screen.getByRole("button", {
            name: method === "trigger" ? "Fechar assistente de imóveis" : "Fechar conversa",
          }),
        );
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      fireEvent.click(screen.getByRole("button", { name: "Fale Conosco" }));
      expect(screen.getByRole("log")).toBeEmptyDOMElement();
      expect(screen.getByRole("textbox")).toHaveValue("");
      expect(screen.getByText("Consulta ao catálogo de imóveis")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Quais imóveis estão disponíveis?" }));
      await screen.findByText("Resposta anterior");
      expect(ask).toHaveBeenLastCalledWith(
        "Quais imóveis estão disponíveis?",
        [],
        expect.any(AbortSignal),
      );
    },
  );

  it("aborts a pending request and ignores its late result after reopening", async () => {
    let resolveOld!: (reply: ChatReply) => void;
    let resolveNew!: (reply: ChatReply) => void;
    const ask = vi
      .spyOn(chatApi, "ask")
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOld = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveNew = resolve;
          }),
      );
    openChat();
    fireEvent.click(screen.getByRole("button", { name: "Quantos imóveis há em Tharsis?" }));
    const oldSignal = ask.mock.calls[0]![2]!;
    fireEvent.click(screen.getByRole("button", { name: "Fechar conversa" }));
    expect(oldSignal.aborted).toBe(true);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Fale Conosco" }));
    fireEvent.click(screen.getByRole("button", { name: "Quais imóveis estão disponíveis?" }));
    await act(async () => {
      resolveOld({ answer: "Resposta antiga", mode: "catalog", sources: [] });
    });
    expect(screen.queryByText("Resposta antiga")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("status")).toBeInTheDocument();
    await act(async () => {
      resolveNew({ answer: "Resposta nova", mode: "catalog", sources: [] });
    });
    expect(screen.getByText("Resposta nova")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeEnabled();
    expect(ask).toHaveBeenLastCalledWith(
      "Quais imóveis estão disponíveis?",
      [],
      expect.any(AbortSignal),
    );
  });

  it("clears the error and retry draft when closing", async () => {
    vi.spyOn(chatApi, "ask").mockRejectedValue(new Error("Erro de teste"));
    openChat();
    fireEvent.click(screen.getByRole("button", { name: "Quantos imóveis há em Tharsis?" }));
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Fechar conversa" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Fale Conosco" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("opens from the greeting bubble and closes with Escape", async () => {
    openChat();
    expect(screen.getByRole("dialog", { name: "Assistente de imóveis" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Sua pergunta" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Fale Conosco" })).toBeInTheDocument();
  });

  it("sends suggestions, renders actual answers and links to listing details", async () => {
    const ask = vi.spyOn(chatApi, "ask").mockResolvedValue({
      answer: "Encontrei 2 imóveis publicados em Tharsis.",
      mode: "catalog",
      sources: [{ id: 12, title: "Habitat Norte" }],
    });
    openChat();
    fireEvent.click(screen.getByRole("button", { name: "Quantos imóveis há em Tharsis?" }));
    expect(
      await screen.findByText("Encontrei 2 imóveis publicados em Tharsis."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Habitat Norte/ })).toHaveAttribute(
      "href",
      "/terrenos/12",
    );
    expect(ask).toHaveBeenCalledWith("Quantos imóveis há em Tharsis?", [], expect.any(AbortSignal));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "E os preços?" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar pergunta" }));
    await waitFor(() =>
      expect(ask).toHaveBeenLastCalledWith(
        "E os preços?",
        ["Quantos imóveis há em Tharsis?"],
        expect.any(AbortSignal),
      ),
    );
  });

  it("keeps the question available for retry after an error", async () => {
    const ask = vi
      .spyOn(chatApi, "ask")
      .mockRejectedValueOnce(new Error("Catálogo indisponível"))
      .mockResolvedValue({ answer: "Nenhum imóvel publicado.", mode: "catalog", sources: [] });
    openChat();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Imóveis disponíveis" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar pergunta" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Catálogo indisponível");
    expect(screen.getByRole("textbox")).toHaveValue("Imóveis disponíveis");
    fireEvent.click(screen.getByRole("button", { name: "Enviar pergunta" }));
    expect(await screen.findByText("Nenhum imóvel publicado.")).toBeInTheDocument();
    expect(ask).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
