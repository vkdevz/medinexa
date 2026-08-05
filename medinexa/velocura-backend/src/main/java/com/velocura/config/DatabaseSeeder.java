package com.velocura.config;

import com.velocura.model.Role;
import com.velocura.model.User;
import com.velocura.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${velocura.admin.email}")
    private String adminEmail;

    @Value("${velocura.admin.password}")
    private String adminPassword;

    @Autowired
    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        String email = adminEmail != null ? adminEmail.trim() : "admin@velocura.com";
        String password = adminPassword != null ? adminPassword : "VeloCuraAdmin_#2026_SecureKey";

        if (userRepository.findByEmail(email).isEmpty()) {
            User admin = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .firstName("System")
                    .lastName("Administrator")
                    .role(Role.ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            System.out.println("--------------------------------------------------");
            System.out.println("DATABASE SEEDER: Seeded default Admin user successfully!");
            System.out.println("Email: " + email);
            System.out.println("Password: " + password);
            System.out.println("--------------------------------------------------");
        }
    }
}
