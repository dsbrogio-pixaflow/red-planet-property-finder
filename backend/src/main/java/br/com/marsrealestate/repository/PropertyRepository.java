package br.com.marsrealestate.repository;

import br.com.marsrealestate.model.Property;
import br.com.marsrealestate.model.PropertyStatus;
import br.com.marsrealestate.model.TransactionType;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PropertyRepository
        extends JpaRepository<Property, Long> {

    // Imóveis de um anunciante
    List<Property> findByUserId(Long userId);

    // Imóveis publicados
    List<Property> findByStatus(PropertyStatus status);

    // Imóveis por colônia
    List<Property> findByColonyNameIgnoreCase(String colonyName);

    // Imóveis por modalidade
    List<Property> findByTransactionTypeAndStatus(
            TransactionType transactionType,
            PropertyStatus status
    );

    // Imóveis de um anunciante por status
    List<Property> findByUserIdAndStatus(
            Long userId,
            PropertyStatus status
    );

    // Buscar somente imóveis publicados de uma colônia
        List<Property> findByColonyNameIgnoreCaseAndStatus(
        String colonyName,
        PropertyStatus status
);
}
