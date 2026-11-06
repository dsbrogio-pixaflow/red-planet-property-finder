
package br.com.marsrealestate.repository;

import br.com.marsrealestate.model.PropertyImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PropertyImageRepository
        extends JpaRepository<PropertyImage, Long> {

    // Listar imagens de um imóvel
    List<PropertyImage> findByPropertyIdOrderByDisplayOrderAsc(
            Long propertyId
    );

    // Buscar imagem pertencente a um imóvel
    Optional<PropertyImage> findByIdAndPropertyId(
            Long id,
            Long propertyId
    );

    // Buscar imagem principal de um imóvel
    Optional<PropertyImage> findByPropertyIdAndPrimaryTrue(
            Long propertyId
    );
}
