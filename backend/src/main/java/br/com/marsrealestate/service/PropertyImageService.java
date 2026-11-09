
package br.com.marsrealestate.service;

import br.com.marsrealestate.dto.PropertyImageRequest;
import br.com.marsrealestate.dto.PropertyImageResponse;
import br.com.marsrealestate.model.Property;
import br.com.marsrealestate.model.PropertyImage;
import br.com.marsrealestate.repository.PropertyImageRepository;
import br.com.marsrealestate.repository.PropertyRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@Service
public class PropertyImageService {

    private static final int MAX_IMAGES_PER_PROPERTY = 20;

    private final PropertyImageRepository imageRepository;
    private final PropertyRepository propertyRepository;
    private final UserAccessService access;

    public PropertyImageService(
            PropertyImageRepository imageRepository,
            PropertyRepository propertyRepository,
            UserAccessService access) {

        this.imageRepository = imageRepository;
        this.propertyRepository = propertyRepository;
        this.access = access;
    }

    // Cadastrar imagem
    @Transactional
    public PropertyImageResponse addImage(
            Long propertyId,
            PropertyImageRequest request,
            Jwt jwt) {

        Property property = getOwnedProperty(propertyId, jwt);

        List<PropertyImage> images = property.getImages();

        if (images.size() >= MAX_IMAGES_PER_PROPERTY) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O imóvel permite no máximo 20 imagens."
            );
        }

        PropertyImage image = new PropertyImage();

        image.setImageUrl(request.imageUrl().trim());
        image.setCaption(request.caption());

        int nextOrder = images.stream()
                .map(PropertyImage::getDisplayOrder)
                .filter(order -> order != null)
                .max(Integer::compareTo)
                .orElse(-1) + 1;

        image.setDisplayOrder(
                request.displayOrder() != null
                        ? request.displayOrder()
                        : nextOrder
        );

        boolean hasPrimary = images.stream()
                .anyMatch(existing ->
                        Boolean.TRUE.equals(existing.getPrimary())
                );

        // A primeira imagem será a principal
        image.setPrimary(!hasPrimary);

        property.addImage(image);

        PropertyImage savedImage =
        imageRepository.saveAndFlush(image);

        return toResponse(savedImage);
    }

    // Definir imagem principal
    @Transactional
    public PropertyImageResponse setPrimaryImage(
            Long propertyId,
            Long imageId,
            Jwt jwt) {

        Property property = getOwnedProperty(propertyId, jwt);

        PropertyImage selectedImage = imageRepository
                .findByIdAndPropertyId(imageId, propertyId)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Imagem não encontrada neste imóvel."
                    )
                );

        for (PropertyImage image : property.getImages()) {
            image.setPrimary(
                    image.getId().equals(selectedImage.getId())
            );
        }

        imageRepository.saveAll(property.getImages());

        return toResponse(selectedImage);
    }

    // Excluir imagem
    @Transactional
    public void deleteImage(
            Long propertyId,
            Long imageId,
            Jwt jwt) {

        Property property = getOwnedProperty(propertyId, jwt);

        PropertyImage image = imageRepository
                .findByIdAndPropertyId(imageId, propertyId)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Imagem não encontrada neste imóvel."
                    )
                );

        boolean wasPrimary = Boolean.TRUE.equals(image.getPrimary());

        property.removeImage(image);

        // Se a imagem principal foi excluída,
        // a próxima imagem será promovida a principal.
        if (wasPrimary && !property.getImages().isEmpty()) {

            PropertyImage nextPrimary = property.getImages()
                    .stream()
                    .min(
                        Comparator.comparing(
                            PropertyImage::getDisplayOrder,
                            Comparator.nullsLast(Integer::compareTo)
                        )
                    )
                    .orElseThrow();

            nextPrimary.setPrimary(true);
        }

        propertyRepository.save(property);
    }

    // Verificar propriedade do imóvel
    private Property getOwnedProperty(Long propertyId, Jwt jwt) {

        var user = access.currentUser(jwt);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Imóvel não encontrado."
                    )
                );

        if (!user.isAdministrator() && !property.getUser().getId().equals(user.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Você não tem permissão para administrar estas imagens."
            );
        }

        return property;
    }

    // Converter entidade em DTO
    private PropertyImageResponse toResponse(PropertyImage image) {

        return new PropertyImageResponse(
                image.getId(),
                image.getImageUrl(),
                image.getCaption(),
                image.getDisplayOrder(),
                image.getPrimary(),
                image.getCreatedAt()
        );
    }
}
