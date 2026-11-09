import { apiRequest } from "@/services/apiClient";

export interface ChatReply {
  answer: string;
  mode: "ai" | "catalog";
  sources: { id: number; title: string }[];
}

export const chatApi = {
  ask: (message: string, history: string[], signal?: AbortSignal) =>
    apiRequest<ChatReply>("/api/public/chat", {
      method: "POST",
      body: JSON.stringify({ message, history: history.slice(-6) }),
      ...(signal ? { signal } : {}),
    }),
};
