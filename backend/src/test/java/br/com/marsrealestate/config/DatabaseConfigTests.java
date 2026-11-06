package br.com.marsrealestate.config;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DatabaseConfigTests {
    @Test
    void convertsQuotedNeonUrlAndDecodesCredentialsWithoutTurningPlusIntoSpace() {
        var settings = DatabaseConfig.connectionSettings(
                "'postgresql://owner:p%40ss+word@db.example/neondb?sslmode=require&channel_binding=require'");
        assertEquals("jdbc:postgresql://db.example/neondb?sslmode=require&channelBinding=require", settings.jdbcUrl());
        assertEquals("owner", settings.username());
        assertEquals("p@ss+word", settings.password());
        assertFalse(settings.jdbcUrl().contains("p@ss"));
    }

    @Test
    void requiresTlsByDefaultAndKeepsPortAndTimeout() {
        var settings = DatabaseConfig.connectionSettings(
                "postgres://owner:password@db.example:5432/neondb?connect_timeout=15");
        assertEquals("jdbc:postgresql://db.example:5432/neondb?connectTimeout=15&sslmode=require", settings.jdbcUrl());
    }

    @Test
    void invalidConfigurationDoesNotExposeSecrets() {
        for (String value : new String[]{"", "postgresql://owner:private-password@/database", "https://example.com"}) {
            var error = assertThrows(IllegalArgumentException.class,
                    () -> DatabaseConfig.connectionSettings(value));
            assertFalse(error.getMessage().contains("private-password"));
            assertNull(error.getCause());
        }
    }
}
