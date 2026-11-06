
package br.com.marsrealestate.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PropertyImageRequest(

    @NotBlank(message = "O endereço da imagem é obrigatório")
    @Size(max = 1000)
    String imageUrl,

    @Size(max = 200)
    String caption,

    @Min(0)
    Integer displayOrder

) {}
