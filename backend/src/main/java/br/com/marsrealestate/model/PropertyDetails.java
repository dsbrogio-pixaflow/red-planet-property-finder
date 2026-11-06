
package br.com.marsrealestate.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "property_details")
public class PropertyDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relacionamento com imóvel
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "property_id",
        nullable = false,
        unique = true
    )
    private Property property;

    // Estacionamento
    private Boolean hasParking;

    @Min(0)
    @Max(100)
    private Integer parkingSpaces;

    @Size(max = 100)
    private String parkingType;

    // Proteção contra radiação
    @Size(max = 150)
    private String radiationProtection;

    @Size(max = 100)
    private String radiationProtectionLevel;

    @Size(max = 150)
    private String shieldingMaterial;

    // Energia
    @Size(max = 100)
    private String energySource;

    @DecimalMin("0.0")
    @Digits(integer = 10, fraction = 2)
    private java.math.BigDecimal energyAutonomyHours;

    @Size(max = 150)
    private String energyStorageSystem;

    // Suporte à vida
    private Boolean oxygenSystem;

    private Boolean atmosphericPressureControl;

    private Boolean waterRecycling;

    private Boolean environmentalControl;

    // Construtor
    public PropertyDetails() {
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

    public Boolean getHasParking() {
        return hasParking;
    }

    public void setHasParking(Boolean hasParking) {
        this.hasParking = hasParking;
    }

    public Integer getParkingSpaces() {
        return parkingSpaces;
    }

    public void setParkingSpaces(Integer parkingSpaces) {
        this.parkingSpaces = parkingSpaces;
    }

    public String getParkingType() {
        return parkingType;
    }

    public void setParkingType(String parkingType) {
        this.parkingType = parkingType;
    }

    public String getRadiationProtection() {
        return radiationProtection;
    }

    public void setRadiationProtection(String radiationProtection) {
        this.radiationProtection = radiationProtection;
    }

    public String getRadiationProtectionLevel() {
        return radiationProtectionLevel;
    }

    public void setRadiationProtectionLevel(String radiationProtectionLevel) {
        this.radiationProtectionLevel = radiationProtectionLevel;
    }

    public String getShieldingMaterial() {
        return shieldingMaterial;
    }

    public void setShieldingMaterial(String shieldingMaterial) {
        this.shieldingMaterial = shieldingMaterial;
    }

    public String getEnergySource() {
        return energySource;
    }

    public void setEnergySource(String energySource) {
        this.energySource = energySource;
    }

    public java.math.BigDecimal getEnergyAutonomyHours() {
        return energyAutonomyHours;
    }

    public void setEnergyAutonomyHours(
        java.math.BigDecimal energyAutonomyHours
    ) {
        this.energyAutonomyHours = energyAutonomyHours;
    }

    public String getEnergyStorageSystem() {
        return energyStorageSystem;
    }

    public void setEnergyStorageSystem(String energyStorageSystem) {
        this.energyStorageSystem = energyStorageSystem;
    }

    public Boolean getOxygenSystem() {
        return oxygenSystem;
    }

    public void setOxygenSystem(Boolean oxygenSystem) {
        this.oxygenSystem = oxygenSystem;
    }

    public Boolean getAtmosphericPressureControl() {
        return atmosphericPressureControl;
    }

    public void setAtmosphericPressureControl(
        Boolean atmosphericPressureControl
    ) {
        this.atmosphericPressureControl = atmosphericPressureControl;
    }

    public Boolean getWaterRecycling() {
        return waterRecycling;
    }

    public void setWaterRecycling(Boolean waterRecycling) {
        this.waterRecycling = waterRecycling;
    }

    public Boolean getEnvironmentalControl() {
        return environmentalControl;
    }

    public void setEnvironmentalControl(Boolean environmentalControl) {
        this.environmentalControl = environmentalControl;
    }
}
