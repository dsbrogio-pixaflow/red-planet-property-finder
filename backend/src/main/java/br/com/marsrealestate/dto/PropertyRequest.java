
package br.com.marsrealestate.dto;

import br.com.marsrealestate.model.PropertyType;
import br.com.marsrealestate.model.TransactionType;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record PropertyRequest(

    // Informações principais

    @NotBlank(message = "O título é obrigatório")
    @Size(max = 150)
    String title,

    @NotBlank(message = "A descrição é obrigatória")
    @Size(max = 5000)
    String description,

    @NotNull
    PropertyType propertyType,

    @NotNull
    TransactionType transactionType,

    @NotNull
    @DecimalMin("0.01")
    @Digits(integer = 15, fraction = 2)
    BigDecimal price,

    // Características

    @NotNull
    @Min(0)
    @Max(100)
    Integer bedrooms,

    @NotNull
    @Min(0)
    @Max(100)
    Integer bathrooms,

    @NotNull
    @DecimalMin("0.01")
    @Digits(integer = 10, fraction = 2)
    BigDecimal habitableArea,

    @NotNull
    @Min(1)
    @Max(10000)
    Integer capacity,

    // Localização

    @NotBlank
    @Size(max = 120)
    String colonyName,

    @NotBlank
    @Size(max = 120)
    String sectorName,

    @NotBlank
    @Size(max = 150)
    String complexName,

    @NotBlank
    @Size(max = 50)
    String unitCode,

    // Informações adicionais

    @Valid
    DetailsRequest details,

    // Fotografias

    @Valid
    @Size(max = 20)
    List<ImageRequest> images

) {

    public record DetailsRequest(

        Boolean hasParking,

        @Min(0)
        @Max(100)
        Integer parkingSpaces,

        @Size(max = 100)
        String parkingType,

        @Size(max = 150)
        String radiationProtection,

        @Size(max = 100)
        String radiationProtectionLevel,

        @Size(max = 150)
        String shieldingMaterial,

        @Size(max = 100)
        String energySource,

        @DecimalMin("0.0")
        @Digits(integer = 10, fraction = 2)
        BigDecimal energyAutonomyHours,

        @Size(max = 150)
        String energyStorageSystem,

        Boolean oxygenSystem,

        Boolean atmosphericPressureControl,

        Boolean waterRecycling,

        Boolean environmentalControl
    ) {}

    public record ImageRequest(

        @NotBlank
        @Size(max = 1000)
        String imageUrl,

        @Size(max = 200)
        String caption,

        @Min(0)
        Integer displayOrder,

        Boolean primary
    ) {}
}
