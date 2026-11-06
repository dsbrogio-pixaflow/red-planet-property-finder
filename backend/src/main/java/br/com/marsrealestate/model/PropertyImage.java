
package br.com.marsrealestate.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "property_images",
    indexes = {
        @Index(
            name = "idx_property_image_property",
            columnList = "property_id"
        ),
        @Index(
            name = "idx_property_image_primary",
            columnList = "property_id,is_primary"
        )
    }
)
public class PropertyImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Imóvel relacionado

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    // Endereço da imagem

    @NotBlank
    @Size(max = 1000)
    @Column(name = "image_url", nullable = false, length = 1000)
    private String imageUrl;

    // Legenda

    @Size(max = 200)
    @Column(length = 200)
    private String caption;

    // Ordem de exibição

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    // Imagem principal

    @Column(name = "is_primary", nullable = false)
    private Boolean primary = false;

    // Data de cadastro

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public PropertyImage() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();

        if (displayOrder == null) {
            displayOrder = 0;
        }

        if (primary == null) {
            primary = false;
        }
    }

    // Getters e Setters

    public Long getId() {
        return id;
    }

    public Property getProperty() {
        return property;
    }

    public void setProperty(Property property) {
        this.property = property;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Boolean getPrimary() {
        return primary;
    }

    public void setPrimary(Boolean primary) {
        this.primary = primary;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
