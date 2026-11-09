package br.com.marsrealestate.service;

import br.com.marsrealestate.dto.ChatRequest;
import br.com.marsrealestate.dto.ChatResponse;
import br.com.marsrealestate.dto.PropertyResponse;
import br.com.marsrealestate.model.PropertyStatus;
import br.com.marsrealestate.model.TransactionType;
import br.com.marsrealestate.service.ChatIntentService.Intent;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.text.NumberFormat;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ChatService {
    private static final List<String> REGIONS = List.of("Olympus Mons", "Tharsis", "Valles Marineris",
            "Elysium Planitia", "Utopia Planitia", "Arabia Terra", "Terra Cimmeria", "Terra Sirenum",
            "Noctis Labyrinthus", "Amazonis Planitia", "Arcadia Planitia", "Hellas Planitia",
            "Isidis Planitia", "Chryse Planitia", "Aonia Terra", "Margaritifer Terra", "Gale Crater", "Jezero Crater");
    private static final Pattern ID = Pattern.compile("(?:#|(?:imovel|terreno|anuncio|id)\\s*(?:n[ºo.]?\\s*)?)(\\d+)\\b");
    private final PropertyService properties;
    private final ChatIntentService ai;

    public ChatService(PropertyService properties, ChatIntentService ai) {
        this.properties = properties;
        this.ai = ai;
    }

    public ChatResponse answer(ChatRequest request) {
        // Requery on every turn. Never count drafts, inactive/sold inventory or demo fixtures.
        List<PropertyResponse> catalog = properties.getPublishedProperties().stream()
                .filter(p -> p.status() == PropertyStatus.PUBLISHED)
                .sorted(Comparator.comparing(PropertyResponse::id)).toList();
        List<String> history = request.history() == null ? List.of() : request.history();
        Intent local = null;
        for (String previous : history) local = interpretLocal(previous, catalog, local);
        local = interpretLocal(request.message(), catalog, local);
        // Bound model context; oversized catalogs still work in direct catalog mode.
        var classified = catalog.size() <= 200 ? ai.interpret(request.message(), history, catalog.stream()
                .map(p -> Map.<String, Object>of("id", p.id(), "title", p.title(), "sector", p.sectorName())).toList())
                : Optional.<Intent>empty();
        Intent query = classified.orElse(local);
        String mode = classified.isPresent() ? "ai" : "catalog";
        if (query.intent().equals("help")) return new ChatResponse(
                "Posso consultar preços, detalhes e quantidades de imóveis publicados. Pergunte, por exemplo: "
                        + "‘Quantos imóveis há em Tharsis?’, ‘Quais os preços em Utopia Planitia?’ ou informe o título/ID de um anúncio. "
                        + "Os imóveis desta plataforma são fictícios.", mode, List.of());

        var matches = catalog.stream()
                .filter(p -> query.propertyId() == null || p.id().equals(query.propertyId()))
                .filter(p -> query.propertyId() != null || query.region() == null || sameRegion(p.sectorName(), query.region()))
                .filter(p -> query.transaction() == null || p.transactionType().name().equals(query.transaction())).toList();
        String scope = query.region() == null || query.propertyId() != null ? "no catálogo" : "na região " + query.region();
        if (matches.isEmpty()) return new ChatResponse(query.propertyId() != null
                ? "Não encontrei um anúncio publicado com esse ID. Informe outro título ou ID."
                : "Não há imóveis publicados " + scope + transactionLabel(query.transaction()) + ". "
                    + "A consulta considera o setor cadastrado; regiões próximas não entram na contagem.", mode, List.of());

        if (query.propertyId() != null) {
            var p = matches.getFirst();
            return new ChatResponse(p.title() + " (#" + p.id() + ")\n"
                    + p.description() + "\n\n"
                    + "Preço de " + (p.transactionType() == TransactionType.RENT ? "aluguel" : "venda") + ": " + currency(p.price())
                    + ".\nÁrea habitável: " + number(p.habitableArea()) + " m²; dormitórios: " + p.bedrooms()
                    + "; banheiros: " + p.bathrooms() + "; capacidade: " + p.capacity() + " pessoas.\n"
                    + "Localização cadastrada: " + p.colonyName() + ", setor " + p.sectorName()
                    + ", " + p.complexName() + ", unidade " + p.unitCode() + ".\n"
                    + "Veja o anúncio para consultar fotos e infraestrutura.", mode, sources(matches));
        }

        String answer = "Encontrei " + matches.size() + " imóvel(is) publicado(s) " + scope + transactionLabel(query.transaction()) + ".";
        // Separate sale/rent ranges: a rental quote is never presented as a purchase price.
        for (TransactionType type : TransactionType.values()) {
            var prices = matches.stream().filter(p -> p.transactionType() == type).map(PropertyResponse::price).toList();
            if (!prices.isEmpty()) answer += "\n" + (type == TransactionType.RENT ? "Aluguel" : "Venda")
                    + ": " + prices.size() + " anúncio(s), de " + currency(Collections.min(prices))
                    + " a " + currency(Collections.max(prices)) + ".";
        }
        if (!query.intent().equals("count")) {
            answer += "\n\n" + matches.stream().limit(5).map(p -> "• " + p.title() + " (#" + p.id() + "): "
                    + currency(p.price()) + " — " + (p.transactionType() == TransactionType.RENT ? "aluguel" : "venda")
                    + ", setor " + p.sectorName() + ".").collect(Collectors.joining("\n"));
            if (matches.size() > 5) answer += "\nMostrando 5 de " + matches.size() + ". Informe uma região para refinar.";
        }
        answer += "\nInforme o título ou ID para saber mais sobre um imóvel.";
        return new ChatResponse(answer, mode, sources(matches));
    }

    private Intent interpretLocal(String message, List<PropertyResponse> catalog, Intent previous) {
        String text = normalize(message);
        String region = null;
        var names = new ArrayList<>(REGIONS);
        catalog.forEach(p -> names.add(p.sectorName()));
        names.addAll(List.of("Elysium", "Hellas"));
        region = names.stream().distinct().filter(name -> !name.isBlank() && contains(text, normalize(name)))
                .max(Comparator.comparingInt(String::length)).orElse(null);
        Long id = null;
        var idMatch = ID.matcher(text);
        if (idMatch.find()) {
            try { id = Long.valueOf(idMatch.group(1)); } catch (NumberFormatException ignored) { id = -1L; }
        }
        var titles = catalog.stream().filter(p -> contains(text, normalize(p.title()))).toList();
        if (id == null && titles.size() == 1) id = titles.getFirst().id();
        if (region == null && id == null) {
            var unknown = Pattern.compile("(?:\\bem|na regiao(?: de)?|no setor)\\s+(.+?)[?.!]*$").matcher(text);
            if (unknown.find()) region = unknown.group(1).replaceAll("[?.!]+$", "").trim();
        }
        String transaction = text.matches(".*\\b(aluguel|alugar|locacao)\\b.*") ? "RENT"
                : text.matches(".*\\b(venda|comprar|compra)\\b.*") ? "SALE" : null;
        boolean all = text.matches(".*\\b(todos|todas|geral|todo o catalogo)\\b.*");
        boolean followUp = text.matches("^(e\\b|qual (o )?(preco|valor)|quanto custa|mais detalhes|e?\\s*(esse|este|dele|dela)\\b).*");
        if (!all && followUp && region == null && id == null && previous != null) {
            region = previous.region();
            id = previous.propertyId();
            if (transaction == null) transaction = previous.transaction();
        }
        String intent = text.matches(".*\\b(quantos|quantas|quantidade|total)\\b.*") ? "count"
                : text.matches(".*\\b(preco|precos|valor|valores|custa|custam)\\b.*") ? "prices"
                : id != null ? "details"
                : region != null || text.matches(".*\\b(imovel|imoveis|terreno|terrenos|disponiveis|catalogo|anuncios|opcoes)\\b.*") ? "list" : "help";
        return new Intent(intent, region, id, transaction);
    }

    static boolean sameRegion(String sector, String region) {
        // Only exact registered sectors and the existing explicit catalog aliases count.
        return canonicalRegion(sector).equals(canonicalRegion(region));
    }

    private static String canonicalRegion(String region) {
        String name = normalize(region);
        return switch (name) {
            case "elysium planitia" -> "elysium";
            case "hellas planitia" -> "hellas";
            default -> name;
        };
    }

    private static boolean contains(String text, String phrase) {
        return Pattern.compile("(?<![\\p{L}\\p{N}])" + Pattern.quote(phrase) + "(?![\\p{L}\\p{N}])").matcher(text).find();
    }

    private static String normalize(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT).trim().replaceAll("\\s+", " ");
    }

    private static String transactionLabel(String transaction) {
        return transaction == null ? "" : transaction.equals("RENT") ? " para aluguel" : " para venda";
    }

    private static String currency(BigDecimal value) {
        return NumberFormat.getCurrencyInstance(Locale.forLanguageTag("pt-BR")).format(value);
    }

    private static String number(BigDecimal value) {
        return NumberFormat.getNumberInstance(Locale.forLanguageTag("pt-BR")).format(value);
    }

    private static List<ChatResponse.Source> sources(List<PropertyResponse> properties) {
        return properties.stream().limit(5).map(p -> new ChatResponse.Source(p.id(), p.title())).toList();
    }
}
