package br.com.marsrealestate.controller;

import br.com.marsrealestate.dto.ChatRequest;
import br.com.marsrealestate.dto.ChatResponse;
import br.com.marsrealestate.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Map;
import java.util.concurrent.Semaphore;

@RestController
@RequestMapping("/api/public/chat")
public class ChatController {
    private final ChatService chat;
    private final Semaphore concurrent = new Semaphore(4);
    private final ArrayDeque<Instant> requests = new ArrayDeque<>();

    public ChatController(ChatService chat) { this.chat = chat; }

    @PostMapping
    public ResponseEntity<?> answer(@Valid @RequestBody ChatRequest request) {
        if (!allowRequest()) return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header("Retry-After", "60").body(Map.of("message", "Muitas consultas no momento. Aguarde um minuto e tente novamente."));
        if (!concurrent.tryAcquire()) return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header("Retry-After", "5").body(Map.of("message", "O assistente está ocupado. Tente novamente em alguns segundos."));
        try {
            ChatResponse response = chat.answer(request);
            return ResponseEntity.ok().header("Cache-Control", "no-store").body(response);
        } catch (org.springframework.dao.DataAccessException exception) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("message",
                    "Não foi possível consultar o catálogo agora. Tente novamente em instantes."));
        } finally {
            concurrent.release();
        }
    }

    // Small single-instance public demo budget; use a shared gateway limit when scaling.
    private synchronized boolean allowRequest() {
        Instant now = Instant.now();
        while (!requests.isEmpty() && requests.getFirst().isBefore(now.minusSeconds(60))) requests.removeFirst();
        if (requests.size() >= 60) return false;
        requests.addLast(now);
        return true;
    }
}
