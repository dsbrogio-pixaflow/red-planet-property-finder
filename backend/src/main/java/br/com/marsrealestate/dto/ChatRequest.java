package br.com.marsrealestate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ChatRequest(
        @NotBlank @Size(max = 1000) String message,
        @Size(max = 6) List<@NotBlank @Size(max = 1000) String> history) {
}
