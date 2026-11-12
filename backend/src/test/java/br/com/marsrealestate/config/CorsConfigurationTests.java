package br.com.marsrealestate.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.*;

class CorsConfigurationTests {
    @Test
    void allowsConfiguredFrontendAndRejectsOtherDeployments() {
        var source = new SecurityConfig(" https://red-planet-property-finder.vercel.app, http://localhost:8080 ")
                .corsConfigurationSource();
        var request = new MockHttpServletRequest("OPTIONS", "/api/public/properties");
        var cors = source.getCorsConfiguration(request);
        assertNotNull(cors);
        assertEquals("https://red-planet-property-finder.vercel.app",
                cors.checkOrigin("https://red-planet-property-finder.vercel.app"));
        assertEquals("http://localhost:8080", cors.checkOrigin("http://localhost:8080"));
        assertNull(cors.checkOrigin("https://another-project.vercel.app"));
        assertTrue(cors.getAllowedMethods().contains("DELETE"));
        assertTrue(cors.getAllowedHeaders().contains("Authorization"));
    }
}
