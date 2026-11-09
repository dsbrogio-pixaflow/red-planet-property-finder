package br.com.marsrealestate.dto;

import java.util.List;

public record ChatResponse(String answer, String mode, List<Source> sources) {
    public record Source(Long id, String title) {}
}
