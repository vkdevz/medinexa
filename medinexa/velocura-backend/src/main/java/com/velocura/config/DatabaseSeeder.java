package com.velocura.config;

import com.velocura.model.Role;
import com.velocura.model.User;
import com.velocura.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByEmail("admin@velocura.com").isEmpty()) {
            User admin = User.builder()
                    .email("admin@velocura.com")
                    .password(passwordEncoder.encode("admin_password"))
                    .firstName("System")
                    .lastName("Administrator")
                    .role(Role.ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            System.out.println("--------------------------------------------------");
            System.out.println("DATABASE SEEDER: Seeded default Admin user (VeloCura) successfully!");
            System.out.println("Email: admin@velocura.com");
            System.out.println("Password: admin_password");
            System.out.println("--------------------------------------------------");
        }
        
        if (userRepository.findByEmail("admin@medinexa.com").isEmpty()) {
            User admin = User.builder()
                    .email("admin@medinexa.com")
                    .password(passwordEncoder.encode("admin_password"))
                    .firstName("System")
                    .lastName("Administrator")
                    .role(Role.ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            System.out.println("--------------------------------------------------");
            System.out.println("DATABASE SEEDER: Seeded default Admin user (MediNexa) successfully!");
            System.out.println("Email: admin@medinexa.com");
            System.out.println("Password: admin_password");
            System.out.println("--------------------------------------------------");
        }
    }
}
