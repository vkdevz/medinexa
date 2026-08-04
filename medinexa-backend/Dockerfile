# ==============================================================================
# STAGE 1: BUILD STAGE
# ==============================================================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache dependencies by downloading them beforehand
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source directory and compile the application jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==============================================================================
# STAGE 2: RUNTIME RUN STAGE
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a secure non-root system group and user
RUN addgroup -S medinexa && adduser -S medinexa -G medinexa

# Copy the compiled executable jar from builder stage
COPY --from=builder /app/target/medinexa-backend-*.jar app.jar

# Adjust file ownership to the non-root execution user
RUN chown -R medinexa:medinexa /app
USER medinexa

# Expose HTTP REST API port
EXPOSE 8080

# Configure execution entrypoint
ENTRYPOINT ["java", "-jar", "app.jar"]
