package br.com.marsrealestate.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.jdbc.autoconfigure.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(DataSourceProperties.class)
public class DatabaseConfig {

    @Bean
    @ConfigurationProperties("spring.datasource.hikari")
    HikariDataSource dataSource(DataSourceProperties properties,
            @Value("${mars.database.url:}") String databaseUrl) {
        // Standard Spring datasource settings remain available for deployments.
        if (properties.getUrl() == null || properties.getUrl().isBlank()) {
            ConnectionSettings settings = connectionSettings(databaseUrl);
            properties.setUrl(settings.jdbcUrl());
            properties.setUsername(settings.username());
            properties.setPassword(settings.password());
        }
        return properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class).build();
    }

    static ConnectionSettings connectionSettings(String value) {
        try {
            String raw = value.strip();
            // Neon dotenv exports can quote their values; Java properties keeps quotes.
            if (raw.length() >= 2 && ((raw.startsWith("\"") && raw.endsWith("\""))
                    || (raw.startsWith("'") && raw.endsWith("'")))) {
                raw = raw.substring(1, raw.length() - 1);
            }
            URI uri = URI.create(raw);
            if (!("postgresql".equals(uri.getScheme()) || "postgres".equals(uri.getScheme()))
                    || uri.getHost() == null || uri.getRawUserInfo() == null
                    || uri.getRawPath() == null || uri.getRawPath().length() < 2) {
                throw new IllegalArgumentException();
            }
            String[] credentials = uri.getRawUserInfo().split(":", 2);
            if (credentials.length != 2) throw new IllegalArgumentException();
            String query = uri.getRawQuery() == null ? "" : uri.getRawQuery();
            // libpq and pgJDBC use different names for these connection options.
            query = query.replace("channel_binding=", "channelBinding=")
                    .replace("connect_timeout=", "connectTimeout=");
            if (!query.matches("(^|.*&)sslmode=[^&]+(&.*|$)")) {
                query += (query.isEmpty() ? "" : "&") + "sslmode=require";
            }
            String jdbcUrl = "jdbc:postgresql://" + uri.getHost()
                    + (uri.getPort() < 0 ? "" : ":" + uri.getPort())
                    + uri.getRawPath() + "?" + query;
            return new ConnectionSettings(jdbcUrl, decode(credentials[0]), decode(credentials[1]));
        } catch (IllegalArgumentException exception) {
            // Never include a connection string (or its parsing exception) in logs.
            throw new IllegalArgumentException(
                    "Configure DATABASE_URL with a PostgreSQL URL, or SPRING_DATASOURCE_URL/USERNAME/PASSWORD.");
        }
    }

    private static String decode(String value) {
        return URLDecoder.decode(value.replace("+", "%2B"), StandardCharsets.UTF_8);
    }

    // Avoid a record's generated toString exposing database credentials.
    static final class ConnectionSettings {
        private final String jdbcUrl;
        private final String username;
        private final String password;

        ConnectionSettings(String jdbcUrl, String username, String password) {
            this.jdbcUrl = jdbcUrl;
            this.username = username;
            this.password = password;
        }

        String jdbcUrl() { return jdbcUrl; }
        String username() { return username; }
        String password() { return password; }
    }
}
