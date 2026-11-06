package br.com.marsrealestate;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import br.com.marsrealestate.model.*;
import br.com.marsrealestate.repository.*;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class MarsBackendApplicationTests {

    @Autowired EntityManager entityManager;
    @Autowired UserRepository users;
    @Autowired PropertyRepository properties;
    @Autowired PropertyImageRepository images;

	@Test
	void contextLoads() {
	}

    @Test
    @Transactional
    void persistsPropertyWithOwnerDetailsAndImages() {
        User user = new User();
        user.setFullName("Neon integration test");
        user.setEmail("neon-test-" + java.util.UUID.randomUUID() + "@example.invalid");
        user.setPhone("11999999999");
        user.setAccountType(AccountType.OWNER);
        users.save(user);

        Property property = new Property();
        property.setUser(user);
        property.setTitle("Neon integration test");
        property.setDescription("Temporary property rolled back after verification");
        property.setPropertyType(PropertyType.ICE_HOME);
        property.setTransactionType(TransactionType.SALE);
        property.setPrice(new BigDecimal("123456.78"));
        property.setBedrooms(2);
        property.setBathrooms(1);
        property.setHabitableArea(new BigDecimal("100.50"));
        property.setCapacity(4);
        property.setColonyName("Test colony");
        property.setSectorName("Test sector");
        property.setComplexName("Test complex");
        property.setUnitCode("TEST-1");
        PropertyDetails details = new PropertyDetails();
        details.setOxygenSystem(true);
        property.setDetails(details);
        PropertyImage image = new PropertyImage();
        image.setImageUrl("https://example.invalid/test.jpg");
        image.setPrimary(true);
        property.addImage(image);
        properties.saveAndFlush(property);
        Long id = property.getId();
        entityManager.clear();

        Property stored = properties.findById(id).orElseThrow();
        assertEquals(new BigDecimal("123456.78"), stored.getPrice());
        assertEquals(user.getId(), stored.getUser().getId());
        assertTrue(stored.getDetails().getOxygenSystem());
        assertEquals(1, images.findByPropertyIdOrderByDisplayOrderAsc(id).size());
        assertTrue(images.findByPropertyIdAndPrimaryTrue(id).isPresent());
    }

}
