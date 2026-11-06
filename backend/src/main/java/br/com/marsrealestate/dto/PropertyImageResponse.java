
package br.com.marsrealestate.dto;

import java.time.LocalDateTime;

public record PropertyImageResponse(

    Long id,

    String imageUrl,

    String caption,

    Integer displayOrder,

    Boolean primary,

    LocalDateTime createdAt

) {}
