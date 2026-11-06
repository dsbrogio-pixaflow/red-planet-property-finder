
package br.com.marsrealestate.controller;

import br.com.marsrealestate.dto.PropertyImageRequest;
import br.com.marsrealestate.dto.PropertyImageResponse;
import br.com.marsrealestate.service.PropertyImageService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/properties/{propertyId}/images")
public class PropertyImageController {

    private final PropertyImageService imageService;

    public PropertyImageController(
            PropertyImageService imageService) {

        this.imageService = imageService;
    }

    // Cadastrar imagem
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PropertyImageResponse addImage(
            @PathVariable Long propertyId,
            @Valid @RequestBody PropertyImageRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        return imageService.addImage(
                propertyId,
                request,
                jwt
        );
    }

    // Definir imagem principal
    @PatchMapping("/{imageId}/primary")
    public PropertyImageResponse setPrimaryImage(
            @PathVariable Long propertyId,
            @PathVariable Long imageId,
            @AuthenticationPrincipal Jwt jwt) {

        return imageService.setPrimaryImage(
                propertyId,
                imageId,
                jwt
        );
    }

    // Excluir imagem
    @DeleteMapping("/{imageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteImage(
            @PathVariable Long propertyId,
            @PathVariable Long imageId,
            @AuthenticationPrincipal Jwt jwt) {

        imageService.deleteImage(
                propertyId,
                imageId,
                jwt
        );
    }
}
