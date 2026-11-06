
package br.com.marsrealestate.service;

import br.com.marsrealestate.dto.PropertyRequest;
import br.com.marsrealestate.dto.PropertyResponse;
import br.com.marsrealestate.model.*;
import br.com.marsrealestate.repository.PropertyRepository;
import br.com.marsrealestate.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public PropertyService(
            PropertyRepository propertyRepository,
            UserRepository userRepository) {

        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    // Cadastrar imóvel
    @Transactional
    public PropertyResponse createProperty(
            PropertyRequest request,
            Jwt jwt) {

        User user = getAuthenticatedUser(jwt);

        Property property = new Property();

        applyMainFields(property, request);

        property.setUser(user);
        property.setStatus(PropertyStatus.PUBLISHED);

        if (request.details() != null) {
            PropertyDetails details = new PropertyDetails();

            applyDetails(details, request.details());

            property.setDetails(details);
        }

        replaceImages(property, request.images());

        Property savedProperty = propertyRepository.save(property);

        return toResponse(savedProperty);
    }

    // Listar imóveis publicados
    @Transactional(readOnly = true)
    public List<PropertyResponse> getPublishedProperties() {

        return propertyRepository
                .findByStatus(PropertyStatus.PUBLISHED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Consultar imóvel público por ID
    @Transactional(readOnly = true)
    public PropertyResponse getPropertyById(Long id) {

        Property property = propertyRepository.findById(id)
                .filter(p -> p.getStatus() == PropertyStatus.PUBLISHED)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Imóvel não encontrado."
                    )
                );

        return toResponse(property);
    }

    // Listar imóveis do usuário autenticado
    @Transactional(readOnly = true)
    public List<PropertyResponse> getMyProperties(Jwt jwt) {

        User user = getAuthenticatedUser(jwt);

        return propertyRepository.findByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Editar imóvel
    @Transactional
    public PropertyResponse updateProperty(
            Long id,
            PropertyRequest request,
            Jwt jwt) {

        User user = getAuthenticatedUser(jwt);

        Property property = getOwnedProperty(id, user);

        applyMainFields(property, request);

        // Atualizar detalhes somente se enviados
        if (request.details() != null) {

            PropertyDetails details = property.getDetails();

            if (details == null) {
                details = new PropertyDetails();
                property.setDetails(details);
            }

            applyDetails(details, request.details());
        }

        // Atualizar imagens somente quando enviadas
        if (request.images() != null) {
            replaceImages(property, request.images());
        }

        return toResponse(propertyRepository.save(property));
    }

    // Excluir imóvel
    @Transactional
    public void deleteProperty(Long id, Jwt jwt) {

        User user = getAuthenticatedUser(jwt);

        Property property = getOwnedProperty(id, user);

        propertyRepository.delete(property);
    }

    // Alterar situação do anúncio
    @Transactional
    public PropertyResponse updatePropertyStatus(
            Long id,
            PropertyStatus status,
            Jwt jwt) {

        if (status == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe uma situação válida."
            );
        }

        User user = getAuthenticatedUser(jwt);

        Property property = getOwnedProperty(id, user);

        property.setStatus(status);

        return toResponse(propertyRepository.save(property));
    }

    // Buscar imóveis publicados por colônia
    @Transactional(readOnly = true)
    public List<PropertyResponse> findByColony(String colonyName) {

        return propertyRepository
                .findByColonyNameIgnoreCaseAndStatus(
                    colonyName,
                    PropertyStatus.PUBLISHED
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Buscar imóveis publicados por modalidade
    @Transactional(readOnly = true)
    public List<PropertyResponse> findByTransactionType(
            TransactionType transactionType) {

        return propertyRepository
                .findByTransactionTypeAndStatus(
                    transactionType,
                    PropertyStatus.PUBLISHED
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Preencher informações principais
    private void applyMainFields(
            Property property,
            PropertyRequest request) {

        property.setTitle(request.title().trim());
        property.setDescription(request.description().trim());
        property.setPropertyType(request.propertyType());
        property.setTransactionType(request.transactionType());
        property.setPrice(request.price());

        property.setBedrooms(request.bedrooms());
        property.setBathrooms(request.bathrooms());
        property.setHabitableArea(request.habitableArea());
        property.setCapacity(request.capacity());

        property.setColonyName(request.colonyName().trim());
        property.setSectorName(request.sectorName().trim());
        property.setComplexName(request.complexName().trim());
        property.setUnitCode(request.unitCode().trim());
    }

    // Preencher informações adicionais
    private void applyDetails(
            PropertyDetails details,
            PropertyRequest.DetailsRequest request) {

        details.setHasParking(request.hasParking());
        details.setParkingSpaces(request.parkingSpaces());
        details.setParkingType(request.parkingType());

        details.setRadiationProtection(
                request.radiationProtection()
        );

        details.setRadiationProtectionLevel(
                request.radiationProtectionLevel()
        );

        details.setShieldingMaterial(
                request.shieldingMaterial()
        );

        details.setEnergySource(request.energySource());

        details.setEnergyAutonomyHours(
                request.energyAutonomyHours()
        );

        details.setEnergyStorageSystem(
                request.energyStorageSystem()
        );

        details.setOxygenSystem(request.oxygenSystem());

        details.setAtmosphericPressureControl(
                request.atmosphericPressureControl()
        );

        details.setWaterRecycling(request.waterRecycling());

        details.setEnvironmentalControl(
                request.environmentalControl()
        );
    }

    // Substituir imagens do imóvel
    private void replaceImages(
            Property property,
            List<PropertyRequest.ImageRequest> imageRequests) {

        if (imageRequests == null) {
            return;
        }

        long primaryCount = imageRequests.stream()
                .filter(image -> Boolean.TRUE.equals(image.primary()))
                .count();

        if (primaryCount > 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Somente uma imagem pode ser principal."
            );
        }

        // Remover imagens anteriores
        for (PropertyImage image :
                new ArrayList<>(property.getImages())) {

            property.removeImage(image);
        }

        // Adicionar novas imagens
        for (int i = 0; i < imageRequests.size(); i++) {

            PropertyRequest.ImageRequest request = imageRequests.get(i);

            PropertyImage image = new PropertyImage();

            image.setImageUrl(request.imageUrl().trim());
            image.setCaption(request.caption());

            image.setDisplayOrder(
                    request.displayOrder() != null
                            ? request.displayOrder()
                            : i
            );

            boolean isPrimary =
                    Boolean.TRUE.equals(request.primary())
                    || (primaryCount == 0 && i == 0);

            image.setPrimary(isPrimary);

            property.addImage(image);
        }
    }

    // Recuperar usuário autenticado
    private User getAuthenticatedUser(Jwt jwt) {

        return userRepository.findByEmail(jwt.getSubject())
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Usuário autenticado não encontrado."
                    )
                );
    }

    // Verificar propriedade do imóvel
    private Property getOwnedProperty(Long id, User user) {

        Property property = propertyRepository.findById(id)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Imóvel não encontrado."
                    )
                );

        if (!property.getUser().getId().equals(user.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Você não tem permissão para modificar este imóvel."
            );
        }

        return property;
    }

    // Converter entidade em resposta
    private PropertyResponse toResponse(Property property) {

        PropertyDetails details = property.getDetails();

        PropertyResponse.PropertyDetailsResponse detailsResponse = null;

        if (details != null) {

            detailsResponse =
                    new PropertyResponse.PropertyDetailsResponse(
                        details.getHasParking(),
                        details.getParkingSpaces(),
                        details.getParkingType(),
                        details.getRadiationProtection(),
                        details.getRadiationProtectionLevel(),
                        details.getShieldingMaterial(),
                        details.getEnergySource(),
                        details.getEnergyAutonomyHours(),
                        details.getEnergyStorageSystem(),
                        details.getOxygenSystem(),
                        details.getAtmosphericPressureControl(),
                        details.getWaterRecycling(),
                        details.getEnvironmentalControl()
                    );
        }

        List<PropertyResponse.PropertyImageResponse> imageResponses =
                property.getImages()
                        .stream()
                        .map(image ->
                          new PropertyResponse.PropertyImageResponse(
                            image.getId(),
                            image.getImageUrl(),
                            image.getCaption(),
                            image.getDisplayOrder(),
                            image.getPrimary(),
                            image.getCreatedAt()
                            )
                        )
                        .toList();

        return new PropertyResponse(
                property.getId(),
                property.getTitle(),
                property.getDescription(),
                property.getPropertyType(),
                property.getTransactionType(),
                property.getPrice(),
                property.getBedrooms(),
                property.getBathrooms(),
                property.getHabitableArea(),
                property.getCapacity(),
                property.getColonyName(),
                property.getSectorName(),
                property.getComplexName(),
                property.getUnitCode(),
                property.getStatus(),
                property.getCreatedAt(),
                property.getUpdatedAt(),
                property.getUser().getFullName(),
                property.getUser().getAccountType(),
                detailsResponse,
                imageResponses
        );
    }
}
