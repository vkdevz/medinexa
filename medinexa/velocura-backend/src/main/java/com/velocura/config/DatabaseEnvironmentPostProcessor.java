package com.velocura.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

public class DatabaseEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String dbUrl = environment.getProperty("DB_URL");
        if (dbUrl == null || dbUrl.trim().isEmpty()) {
            dbUrl = environment.getProperty("DATABASE_URL");
        }
        if (dbUrl == null || dbUrl.trim().isEmpty()) {
            dbUrl = System.getenv("DB_URL");
        }

        if (dbUrl != null && !dbUrl.trim().isEmpty()) {
            dbUrl = dbUrl.trim();
            Map<String, Object> targetProps = new HashMap<>();

            if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
                try {
                    String cleanUrl = dbUrl.startsWith("postgres://")
                            ? "http" + dbUrl.substring(8)
                            : "http" + dbUrl.substring(10);
                    URI uri = new URI(cleanUrl);

                    String username = null;
                    String password = null;
                    if (uri.getUserInfo() != null) {
                        String[] userInfo = uri.getUserInfo().split(":");
                        username = userInfo[0];
                        if (userInfo.length > 1) {
                            password = userInfo[1];
                        }
                    }

                    int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                    String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + uri.getPath();

                    targetProps.put("spring.datasource.url", jdbcUrl);
                    if (username != null) targetProps.put("spring.datasource.username", username);
                    if (password != null) targetProps.put("spring.datasource.password", password);
                    targetProps.put("spring.datasource.driver-class-name", "org.postgresql.Driver");
                    targetProps.put("spring.jpa.database-platform", "org.hibernate.dialect.PostgreSQLDialect");

                    environment.getPropertySources().addFirst(new MapPropertySource("renderPostgresConfig", targetProps));
                    System.out.println("--------------------------------------------------");
                    System.out.println("ENVIRONMENT POST-PROCESSOR ACTIVE:");
                    System.out.println("Converted postgres:// URI to JDBC URL: " + jdbcUrl);
                    System.out.println("Username: " + (username != null ? username : "N/A"));
                    System.out.println("--------------------------------------------------");
                } catch (Exception e) {
                    System.err.println("ENVIRONMENT POST-PROCESSOR ERROR: " + e.getMessage());
                }
            } else if (dbUrl.startsWith("jdbc:postgresql:")) {
                targetProps.put("spring.datasource.driver-class-name", "org.postgresql.Driver");
                targetProps.put("spring.jpa.database-platform", "org.hibernate.dialect.PostgreSQLDialect");
                environment.getPropertySources().addFirst(new MapPropertySource("renderPostgresConfig", targetProps));
            }
        }
    }
}
