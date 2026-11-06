
package br.com.marsrealestate.controller;

import br.com.marsrealestate.dto.PropertyRequest;
import br.com.marsrealestate.dto.PropertyResponse;
import br.com.marsrealestate.model.PropertyStatus;
import br.com.marsrealestate.model.TransactionType;
import br.com.marsrealestate.service.PropertyService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PropertyController {

    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    // Consultas públicas

    @GetMapping("/public/properties")
    public List<PropertyResponse> getPublishedProperties() {
        return propertyService.getPublishedProperties();
    }

    @GetMapping("/public/properties/{id}")
    public PropertyResponse getPropertyById(
            @PathVariable Long id) {

        return propertyService.getPropertyById(id);
    }

    @GetMapping("/public/properties/search/colony")
    public List<PropertyResponse> findByColony(
            @RequestParam String name) {

        return propertyService.findByColony(name);
    }

    @GetMapping("/public/properties/search/transaction")
    public List<PropertyResponse> findByTransactionType(
            @RequestParam TransactionType type) {

        return propertyService.findByTransactionType(type);
    }

    // Operações autenticadas

    @PostMapping("/properties")
    @ResponseStatus(HttpStatus.CREATED)
    public PropertyResponse createProperty(
            @Valid @RequestBody PropertyRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        return propertyService.createProperty(request, jwt);
    }

    @GetMapping("/properties/my")
    public List<PropertyResponse> getMyProperties(
            @AuthenticationPrincipal Jwt jwt) {

        return propertyService.getMyProperties(jwt);
    }

    @PutMapping("/properties/{id}")
    public PropertyResponse updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody PropertyRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        return propertyService.updateProperty(id, request, jwt);
    }

    @PatchMapping("/properties/{id}/status")
    public PropertyResponse updatePropertyStatus(
            @PathVariable Long id,
            @RequestParam PropertyStatus status,
            @AuthenticationPrincipal Jwt jwt) {

        return propertyService.updatePropertyStatus(
                id,
                status,
                jwt
        );
    }

    @DeleteMapping("/properties/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProperty(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {

        propertyService.deleteProperty(id, jwt);
    }
}
