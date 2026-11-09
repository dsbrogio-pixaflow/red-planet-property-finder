package br.com.marsrealestate;

import br.com.marsrealestate.dto.PropertyRequest;
import br.com.marsrealestate.dto.AdminUserUpdateRequest;
import br.com.marsrealestate.model.*;
import br.com.marsrealestate.repository.*;
import br.com.marsrealestate.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

/** Run against a migrated Neon test branch; every data mutation rolls back. */
@SpringBootTest
@Transactional
class AdministratorIntegrationTests {
    @Autowired UserRepository users;
    @Autowired PropertyRepository properties;
    @Autowired AdminUserService administrators;
    @Autowired PropertyService listings;
    @Autowired UserAccessService access;
    @Autowired PropertyImageRepository images;
    @Autowired jakarta.persistence.EntityManager entityManager;

    @Test
    void managesRealPersistenceRolesAndForeignListingsWithoutChangingTheirOwner() {
        User master = users.findByEmailIgnoreCase("Master@master.com").orElseThrow();
        assertEquals(UserRole.ADMIN, master.getRole());
        User ordinary = new User();
        ordinary.setFullName("Admin integration fixture");
        ordinary.setEmail("admin-integration-" + UUID.randomUUID() + "@example.invalid");
        ordinary.setPhone("11999999999");
        ordinary.setAccountType(AccountType.AGENCY);
        ordinary = users.saveAndFlush(ordinary);
        assertEquals(UserRole.USER, ordinary.getRole());

        Jwt userJwt = jwt(ordinary.getEmail());
        Jwt masterJwt = jwt(master.getEmail());
        assertThrows(ResponseStatusException.class, () -> administrators.listUsers(userJwt));
        assertThrows(ResponseStatusException.class, () -> administrators.grantAdministrator(master.getId(), userJwt));

        var request = new PropertyRequest("Admin integration listing", "Fixture rolled back", PropertyType.ICE_HOME,
                TransactionType.SALE, new BigDecimal("1234.56"), 1, 1, new BigDecimal("80"), 2,
                "Colônia", "Tharsis", "Complexo", "T1", null, null);
        Long id = listings.createProperty(request, userJwt).id();
        assertTrue(listings.getMyProperties(masterJwt).stream().anyMatch(item -> item.id().equals(id)));
        listings.updateProperty(id, request, masterJwt);
        listings.updatePropertyStatus(id, PropertyStatus.INACTIVE, masterJwt);
        assertEquals(ordinary.getId(), properties.findById(id).orElseThrow().getUser().getId());
        assertTrue(listings.getMyProperties(masterJwt).stream().anyMatch(item -> item.id().equals(id) && item.status() == PropertyStatus.INACTIVE));
        Long ordinaryId = ordinary.getId();

        assertEquals(UserRole.ADMIN, administrators.grantAdministrator(ordinary.getId(), masterJwt).role());
        assertFalse(administrators.listUsers(userJwt).isEmpty());
        listings.deleteProperty(id, masterJwt);
        properties.flush();
        assertFalse(properties.existsById(id));

        String newEmail = "edited-" + UUID.randomUUID() + "@example.invalid";
        administrators.updateUser(ordinaryId, new AdminUserUpdateRequest("Edited fixture", newEmail, "21999999999"), masterJwt);
        assertEquals(newEmail, access.currentUser(userJwt).getEmail());
        assertFalse(administrators.listUsers(userJwt).isEmpty());
        administrators.deleteUser(ordinaryId, masterJwt);
        assertFalse(users.existsById(ordinaryId));
        assertThrows(ResponseStatusException.class, () -> access.currentUser(userJwt));
    }

    private Jwt jwt(String email) {
        Long id = users.findByEmailIgnoreCase(email).orElseThrow().getId();
        return Jwt.withTokenValue("integration-test").header("alg", "HS256").subject(email).claim("userId", id).build();
    }

    @Test
    void deletesAllOwnersListingsWithImagesAndDetailsButPreservesOtherUsersInventory() {
        User master = users.findByEmailIgnoreCase("Master@master.com").orElseThrow();
        User target = fixtureUser();
        User other = fixtureUser();
        Jwt targetJwt = jwt(target.getEmail());
        var request = new PropertyRequest("Cascade deletion fixture", "Temporary fixture", PropertyType.ICE_HOME,
                TransactionType.SALE, new BigDecimal("1234.56"), 1, 1, new BigDecimal("80"), 2,
                "Colônia", "Tharsis", "Complexo", "T1", null, null);
        var propertyIds = new java.util.ArrayList<Long>();
        var imageIds = new java.util.ArrayList<Long>();
        var detailsIds = new java.util.ArrayList<Long>();
        for (PropertyStatus status : PropertyStatus.values()) {
            Long id = listings.createProperty(request, targetJwt).id();
            Property property = properties.findById(id).orElseThrow();
            property.setStatus(status);
            PropertyDetails details = new PropertyDetails();
            details.setOxygenSystem(true);
            property.setDetails(details);
            PropertyImage image = new PropertyImage();
            image.setImageUrl("https://example.invalid/fixture.jpg");
            image.setDisplayOrder(0);
            image.setPrimary(true);
            property.addImage(image);
            Property saved = properties.saveAndFlush(property);
            propertyIds.add(id);
            Long imageId = images.findByPropertyIdOrderByDisplayOrderAsc(id).getFirst().getId();
            Long detailsId = saved.getDetails().getId();
            assertNotNull(imageId);
            assertNotNull(detailsId);
            imageIds.add(imageId);
            detailsIds.add(detailsId);
        }
        Long otherProperty = listings.createProperty(request, jwt(other.getEmail())).id();
        administrators.deleteUser(target.getId(), jwt(master.getEmail()));
        entityManager.flush();
        entityManager.clear();
        assertFalse(users.existsById(target.getId()));
        for (Long id : propertyIds) assertFalse(properties.existsById(id));
        for (Long id : imageIds) assertFalse(images.existsById(id));
        for (Long id : detailsIds) assertNull(entityManager.find(PropertyDetails.class, id));
        assertTrue(users.existsById(other.getId()));
        assertTrue(properties.existsById(otherProperty));
        assertThrows(ResponseStatusException.class, () -> access.currentUser(targetJwt));
    }

    private User fixtureUser() {
        User user = new User();
        user.setFullName("Cascade integration fixture");
        user.setEmail("cascade-" + UUID.randomUUID() + "@example.invalid");
        user.setPhone("11999999999");
        user.setAccountType(AccountType.OWNER);
        return users.saveAndFlush(user);
    }
}
