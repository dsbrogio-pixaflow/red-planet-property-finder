package br.com.marsrealestate.service;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

class ChatIntentServiceTests {
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void missingCredentialsKeepCatalogModeAvailable() {
        var service = new ChatIntentService("", "", "", mapper);
        assertTrue(service.interpret("Olá", List.of(), List.of()).isEmpty());
    }

    @Test
    void callsCompatibleEndpointWithServerOnlyAuthorizationAndParsesIntent() throws Exception {
        var receivedBody = new AtomicReference<String>();
        var authorization = new AtomicReference<String>();
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/v1/chat/completions", exchange -> {
            receivedBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            authorization.set(exchange.getRequestHeaders().getFirst("Authorization"));
            String intent = "{\"intent\":\"count\",\"region\":\"Tharsis\",\"propertyId\":null,\"transaction\":null}";
            byte[] response = mapper.writeValueAsBytes(Map.of("choices", List.of(Map.of("message", Map.of("content", intent)))));
            exchange.sendResponseHeaders(200, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.start();
        try {
            var service = new ChatIntentService("http://127.0.0.1:" + server.getAddress().getPort() + "/v1/", "test-key", "test-model", mapper);
            var result = service.interpret("Quantos há em Tharsis?", List.of(), List.of());
            assertEquals("count", result.orElseThrow().intent());
            assertEquals("Tharsis", result.orElseThrow().region());
            assertEquals("Bearer test-key", authorization.get());
            assertTrue(receivedBody.get().contains("test-model"));
            assertFalse(receivedBody.get().contains("test-key"));
        } finally { server.stop(0); }
    }

    @Test
    void providerErrorsMalformedOrUnrecognizedIntentsFallBackWithoutExposingResponse() throws Exception {
        for (String content : List.of("not JSON", "{\"intent\":\"delete\"}",
                "{\"intent\":\"list\",\"transaction\":\"FAKE\"}")) {
            var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            server.createContext("/v1/chat/completions", exchange -> {
                byte[] response = mapper.writeValueAsBytes(Map.of("choices", List.of(Map.of("message", Map.of("content", content)))));
                exchange.sendResponseHeaders(200, response.length);
                exchange.getResponseBody().write(response);
                exchange.close();
            });
            server.start();
            try {
                var service = new ChatIntentService("http://127.0.0.1:" + server.getAddress().getPort() + "/v1", "test-key", "test-model", mapper);
                assertTrue(service.interpret("Olá", List.of(), List.of()).isEmpty());
            } finally { server.stop(0); }
        }
    }
}
