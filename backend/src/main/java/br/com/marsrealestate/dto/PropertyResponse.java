package br.com.marsrealestate.dto;

import br.com.marsrealestate.model.AccountType;
import br.com.marsrealestate.model.PropertyStatus;
import br.com.marsrealestate.model.PropertyType;
import br.com.marsrealestate.model.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PropertyResponse(
        Long id,
        String title,
        String description,
        PropertyType propertyType,
        TransactionType transactionType,
        BigDecimal price,
        Integer bedrooms,
        Integer bathrooms,
        BigDecimal habitableArea,
        Integer capacity,

        String colonyName,
        String sectorName,
        String complexName,
        String unitCode,

        PropertyStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,

        String ownerName,
        AccountType ownerAccountType,

        PropertyDetailsResponse details,
        List<PropertyImageResponse> images
) {

    public record PropertyDetailsResponse(
            Boolean hasParking,
            Integer parkingSpaces,
            String parkingType,

            String radiationProtection,
            String radiationProtectionLevel,
            String shieldingMaterial,

            String energySource,
            BigDecimal energyAutonomyHours,
            String energyStorageSystem,

            Boolean oxygenSystem,
            Boolean atmosphericPressureControl,
            Boolean waterRecycling,
            Boolean environmentalControl
    ) {
    }

public record PropertyImageResponse(
        Long id,
        String imageUrl,
        String caption,
        Integer displayOrder,
        Boolean primary,
        LocalDateTime createdAt
    ) {
    }
}