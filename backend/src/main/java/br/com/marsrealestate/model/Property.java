
package br.com.marsrealestate.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "properties",
    indexes = {
        @Index(name = "idx_property_status", columnList = "status"),
        @Index(name = "idx_property_type", columnList = "property_type"),
        @Index(name = "idx_property_transaction", columnList = "transaction_type"),
        @Index(name = "idx_property_colony", columnList = "colony_name"),
        @Index(name = "idx_property_user", columnList = "user_id")
    }
)
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Informações principais

    @NotBlank
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String title;

    @NotBlank
    @Size(max = 5000)
    @Column(nullable = false, length = 5000)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "property_type", nullable = false, length = 40)
    private PropertyType propertyType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 10)
    private TransactionType transactionType;

    @NotNull
    @DecimalMin(value = "0.01")
    @Digits(integer = 15, fraction = 2)
    @Column(nullable = false, precision = 17, scale = 2)
    private BigDecimal price;

    // Características do imóvel

    @NotNull
    @Min(0)
    @Max(100)
    @Column(nullable = false)
    private Integer bedrooms;

    @NotNull
    @Min(0)
    @Max(100)
    @Column(nullable = false)
    private Integer bathrooms;

    @NotNull
    @DecimalMin(value = "0.01")
    @Digits(integer = 10, fraction = 2)
    @Column(name = "habitable_area", nullable = false, precision = 12, scale = 2)
    private BigDecimal habitableArea;

    @NotNull
    @Min(1)
    @Max(10000)
    @Column(nullable = false)
    private Integer capacity;

    // Localização marciana

    @NotBlank
    @Size(max = 120)
    @Column(name = "colony_name", nullable = false, length = 120)
    private String colonyName;

    @NotBlank
    @Size(max = 120)
    @Column(name = "sector_name", nullable = false, length = 120)
    private String sectorName;

    @NotBlank
    @Size(max = 150)
    @Column(name = "complex_name", nullable = false, length = 150)
    private String complexName;

    @NotBlank
    @Size(max = 50)
    @Column(name = "unit_code", nullable = false, length = 50)
    private String unitCode;

    // Publicação

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PropertyStatus status = PropertyStatus.PUBLISHED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relacionamento com usuário

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // Relacionamento com informações adicionais

    @OneToOne(
    mappedBy = "property",
    cascade = CascadeType.ALL,
    orphanRemoval = true,
    fetch = FetchType.LAZY
)
private PropertyDetails details;

public PropertyDetails getDetails() {
    return details;
}

    public void setDetails(PropertyDetails details) {
    this.details = details;

    if (details != null) {
        details.setProperty(this);
    }
}


// Relacionamento com PropertyImage

    @OneToMany(
    mappedBy = "property",
    cascade = CascadeType.ALL,
    orphanRemoval = true
)
    @OrderBy("displayOrder ASC")
    private List<PropertyImage> images = new ArrayList<>();

    public List<PropertyImage> getImages() {
    return images;
}

    public void addImage(PropertyImage image) {
    images.add(image);
    image.setProperty(this);
}

    public void removeImage(PropertyImage image) {
    if (images.remove(image)) {
        image.setProperty(null);
    }
}



    // Construtor

    public Property() {
    }

    // Controle de datas

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = PropertyStatus.PUBLISHED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters e Setters

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public PropertyType getPropertyType() {
        return propertyType;
    }

    public void setPropertyType(PropertyType propertyType) {
        this.propertyType = propertyType;
    }

    public TransactionType getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(TransactionType transactionType) {
        this.transactionType = transactionType;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getBedrooms() {
        return bedrooms;
    }

    public void setBedrooms(Integer bedrooms) {
        this.bedrooms = bedrooms;
    }

    public Integer getBathrooms() {
        return bathrooms;
    }

    public void setBathrooms(Integer bathrooms) {
        this.bathrooms = bathrooms;
    }

    public BigDecimal getHabitableArea() {
        return habitableArea;
    }

    public void setHabitableArea(BigDecimal habitableArea) {
        this.habitableArea = habitableArea;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getColonyName() {
        return colonyName;
    }

    public void setColonyName(String colonyName) {
        this.colonyName = colonyName;
    }

    public String getSectorName() {
        return sectorName;
    }

    public void setSectorName(String sectorName) {
        this.sectorName = sectorName;
    }

    public String getComplexName() {
        return complexName;
    }

    public void setComplexName(String complexName) {
        this.complexName = complexName;
    }

    public String getUnitCode() {
        return unitCode;
    }

    public void setUnitCode(String unitCode) {
        this.unitCode = unitCode;
    }

    public PropertyStatus getStatus() {
        return status;
    }

    public void setStatus(PropertyStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
