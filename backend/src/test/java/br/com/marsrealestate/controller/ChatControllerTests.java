package br.com.marsrealestate.controller;

import br.com.marsrealestate.dto.ChatResponse;
import br.com.marsrealestate.service.ChatService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ChatControllerTests {
    private final ChatService service = mock(ChatService.class);
    private MockMvc mvc;

    @BeforeEach
    void setup() {
        mvc = MockMvcBuilders.standaloneSetup(new ChatController(service)).build();
        when(service.answer(any())).thenReturn(new ChatResponse("Resposta", "catalog", List.of()));
    }

    @Test
    void acceptsPublicQuestionAndReturnsUncachedJson() throws Exception {
        mvc.perform(post("/api/public/chat").contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\":\"Quantos terrenos?\",\"history\":[]}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.answer").value("Resposta"))
                .andExpect(header().string("Cache-Control", "no-store"));
    }

    @Test
    void rejectsEmptyOversizedQuestionsAndOversizedHistory() throws Exception {
        for (String body : List.of("{\"message\":\" \"}", "{\"message\":\"" + "a".repeat(1001) + "\"}",
                "{\"message\":\"Oi\",\"history\":[\"1\",\"2\",\"3\",\"4\",\"5\",\"6\",\"7\"]}")) {
            mvc.perform(post("/api/public/chat").contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isBadRequest());
        }
        verifyNoInteractions(service);
    }

    @Test
    void databaseFailureReturnsSafeRetryableMessage() throws Exception {
        when(service.answer(any())).thenThrow(new DataAccessResourceFailureException("private database host"));
        mvc.perform(post("/api/public/chat").contentType(MediaType.APPLICATION_JSON).content("{\"message\":\"Imóveis\"}"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.message").value("Não foi possível consultar o catálogo agora. Tente novamente em instantes."));
    }

    @Test
    void limitsPublicRequestBudget() throws Exception {
        for (int i = 0; i < 60; i++) mvc.perform(post("/api/public/chat")
                .contentType(MediaType.APPLICATION_JSON).content("{\"message\":\"Olá\"}")).andExpect(status().isOk());
        mvc.perform(post("/api/public/chat").contentType(MediaType.APPLICATION_JSON).content("{\"message\":\"Olá\"}"))
                .andExpect(status().isTooManyRequests()).andExpect(header().string("Retry-After", "60"));
        verify(service, times(60)).answer(any());
    }
}
