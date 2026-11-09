package br.com.marsrealestate.service;

import br.com.marsrealestate.dto.ChatRequest;
import br.com.marsrealestate.dto.PropertyResponse;
import br.com.marsrealestate.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ChatServiceTests {
    private final PropertyService properties = mock(PropertyService.class);
    private final ChatIntentService ai = mock(ChatIntentService.class);
    private final ChatService chat = new ChatService(properties, ai);

    @BeforeEach
    void setup() {
        when(ai.interpret(anyString(), anyList(), anyList())).thenReturn(Optional.empty());
        when(properties.getPublishedProperties()).thenReturn(List.of(
                property(1, "Habitat Olympus Mons", "Tharsis", "1234.56", TransactionType.SALE, PropertyStatus.PUBLISHED),
                property(2, "Domo Norte", "Tharsis", "900", TransactionType.RENT, PropertyStatus.PUBLISHED),
                property(3, "Casa Olympus", "Olympus Mons", "2000", TransactionType.SALE, PropertyStatus.PUBLISHED),
                property(4, "Vendido", "Tharsis", "1", TransactionType.SALE, PropertyStatus.SOLD),
                property(5, "Inativo", "Tharsis", "1", TransactionType.SALE, PropertyStatus.INACTIVE),
                property(6, "Casa Elysium", "Elysium", "5000", TransactionType.SALE, PropertyStatus.PUBLISHED)));
    }

    @Test
    void countsOnlyExplicitPublishedSectorsAndSeparatesSaleFromRent() {
        var reply = chat.answer(new ChatRequest("Quantos imóveis há em Tharsis?", null));
        assertTrue(reply.answer().contains("2 imóvel(is)"));
        assertTrue(reply.answer().contains("Venda: 1 anúncio(s)"));
        assertTrue(reply.answer().contains("Aluguel: 1 anúncio(s)"));
        assertTrue(reply.answer().contains("1.234,56"));
        assertEquals("catalog", reply.mode());
        assertEquals(List.of(1L, 2L), reply.sources().stream().map(s -> s.id()).toList());
    }

    @Test
    void titleDoesNotImplyGeographicMembership() {
        var reply = chat.answer(new ChatRequest("Quantos terrenos em Olympus Mons?", List.of()));
        assertTrue(reply.answer().contains("1 imóvel(is)"));
        assertEquals(3L, reply.sources().getFirst().id());
        assertFalse(ChatService.sameRegion("Tharsis", "Olympus Mons"));
    }

    @Test
    void recognizesCatalogAliasesButNotNearbyLandmarks() {
        var reply = chat.answer(new ChatRequest("Preços em Elysium Planitia?", null));
        assertEquals(6L, reply.sources().getFirst().id());
        assertTrue(ChatService.sameRegion("Hellas", "Hellas Planitia"));
        assertFalse(ChatService.sameRegion("Tharsis", "Noctis Labyrinthus"));
    }

    @Test
    void returnsPropertyDetailsAndKeepsContextForFollowUp() {
        var reply = chat.answer(new ChatRequest("Qual o valor?", List.of("Detalhes do imóvel #1")));
        assertTrue(reply.answer().contains("Habitat Olympus Mons (#1)"));
        assertTrue(reply.answer().contains("1.234,56"));
        assertTrue(reply.answer().contains("80 m²"));
        assertEquals(1, reply.sources().size());
    }

    @Test
    void findsListingByTitleAndRejectsUnknownIds() {
        var reply = chat.answer(new ChatRequest("Fale sobre Domo Norte", null));
        assertTrue(reply.answer().contains("Preço de aluguel"));
        assertEquals(2L, reply.sources().getFirst().id());
        var missing = chat.answer(new ChatRequest("Imóvel #9999", null));
        assertTrue(missing.answer().contains("Não encontrei"));
        assertTrue(missing.sources().isEmpty());
    }

    @Test
    void unknownOrEmptyRegionDoesNotFallBackToWholeCatalog() {
        for (String region : List.of("Arcadia Planitia", "Região inexistente")) {
            var reply = chat.answer(new ChatRequest("Quantos terrenos em " + region + "?", null));
            assertTrue(reply.answer().contains("Não há imóveis publicados"));
            assertTrue(reply.sources().isEmpty());
        }
    }

    @Test
    void refinesTransactionAndClearsPreviousSubjectWhenAskedForAll() {
        var rental = chat.answer(new ChatRequest("E para aluguel?", List.of("Imóveis em Tharsis")));
        assertEquals(1, rental.sources().size());
        assertEquals(2L, rental.sources().getFirst().id());
        var all = chat.answer(new ChatRequest("Todos os imóveis", List.of("Imóvel #1")));
        assertTrue(all.answer().contains("4 imóvel(is)"));
        var regional = chat.answer(new ChatRequest("Todos os imóveis em Tharsis", List.of()));
        assertEquals(2, regional.sources().size());
    }

    @Test
    void modelOnlySelectsIntentAndServerStillComputesRealValues() {
        when(ai.interpret(anyString(), anyList(), anyList())).thenReturn(Optional.of(
                new ChatIntentService.Intent("prices", "Tharsis", null, "SALE")));
        var reply = chat.answer(new ChatRequest("O que cabe no meu bolso por lá?", null));
        assertEquals("ai", reply.mode());
        assertTrue(reply.answer().contains("1.234,56"));
        assertEquals(1L, reply.sources().getFirst().id());
    }

    @Test
    void handlesEmptyCatalogAndUnrelatedQuestions() {
        when(properties.getPublishedProperties()).thenReturn(List.of());
        assertTrue(chat.answer(new ChatRequest("Imóveis disponíveis", null)).answer().contains("Não há imóveis publicados"));
        assertTrue(chat.answer(new ChatRequest("Conte uma piada", null)).answer().contains("Posso consultar preços"));
    }

    @Test
    void countsEntireCatalogWhileBoundingLinksAndDisplayedListings() {
        when(properties.getPublishedProperties()).thenReturn(java.util.stream.LongStream.rangeClosed(1, 8)
                .mapToObj(i -> property(i, "Casa " + i, "Tharsis", "100", TransactionType.SALE, PropertyStatus.PUBLISHED)).toList());
        var reply = chat.answer(new ChatRequest("Quais imóveis estão disponíveis?", null));
        assertTrue(reply.answer().contains("8 imóvel(is)"));
        assertTrue(reply.answer().contains("Mostrando 5 de 8"));
        assertEquals(5, reply.sources().size());
    }

    private static PropertyResponse property(long id, String title, String sector, String price,
                                               TransactionType transaction, PropertyStatus status) {
        return new PropertyResponse(id, title, "Descrição cadastrada.", PropertyType.ICE_HOME, transaction,
                new BigDecimal(price), 2, 1, new BigDecimal("80"), 4, "Colônia", sector, "Complexo", "A1",
                status, null, null, "Proprietário", AccountType.OWNER, null, List.of());
    }
}
