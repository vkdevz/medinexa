# MediNexa Backend - Spring Boot Service

This is the backend service of the **MediNexa Next-Generation Digital Healthcare Platform**, built with Spring Boot 3, Spring Security, Spring Data JPA, and MySQL.

---

## 🛠️ Technology Stack
- **Language:** Java 21
- **Framework:** Spring Boot 3.3.2
- **Security:** Spring Security & JWT (JSON Web Tokens)
- **Database Access:** Spring Data JPA / Hibernate
- **Database:** MySQL
- **Build Tool:** Maven

---

## 📂 Project Structure
```
medinexa-backend/
├── src/
│   ├── main/
│   │   ├── java/com/medinexa/
│   │   │   ├── config/       # Spring Configuration Beans
│   │   │   ├── controller/   # Rest Controllers (API Endpoints)
│   │   │   ├── dto/          # Data Transfer Objects
│   │   │   ├── entity/       # JPA Entities / Models
│   │   │   ├── exception/    # Exception Handling & Global handlers
│   │   │   ├── repository/   # Spring Data Repository interfaces
│   │   │   ├── security/     # JWT, Filters & Custom User Details
│   │   │   ├── service/      # Business Logic Layers
│   │   │   └── MediNexaApplication.java # Spring Boot entry point
│   │   └── resources/
│   │       ├── application.yml # Base Configuration
│   │       └── db/             # Optional database migrations
│   └── test/                 # JUnit & Mockito Unit/Integration tests
└── pom.xml                   # Maven dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- **Java JDK 21** installed and configured.
- **MySQL Database Server** running.
- **Maven 3.x** installed.

### Database Setup
Ensure you have a database named `medinexa` created in your MySQL server:
```sql
CREATE DATABASE medinexa;
```

Configure database credentials using environment variables:
```bash
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/medinexa?useSSL=false&serverTimezone=UTC
export SPRING_DATASOURCE_USERNAME=your_username
export SPRING_DATASOURCE_PASSWORD=your_password
```
*(If environment variables are not set, Spring Boot defaults to: `jdbc:mysql://localhost:3306/medinexa` with username `root` and no password.)*

### Run the Application
Compile and run the Spring Boot application using Maven:
```bash
# Clean and compile the project
mvn clean compile

# Run the Spring Boot app
mvn spring-boot:run
```

The server will start at `http://localhost:8080/api/v1`. You can check server health at `http://localhost:8080/api/v1/actuator/health` (once actuator dependencies are included).
