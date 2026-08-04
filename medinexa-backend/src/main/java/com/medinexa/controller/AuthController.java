package com.medinexa.controller;

import com.medinexa.dto.AuthResponse;
import com.medinexa.dto.LoginRequest;
import com.medinexa.dto.RegisterRequest;
import com.medinexa.model.Doctor;
import com.medinexa.model.Patient;
import com.medinexa.model.Role;
import com.medinexa.model.User;
import com.medinexa.repository.DoctorRepository;
import com.medinexa.repository.PatientRepository;
import com.medinexa.repository.UserRepository;
import com.medinexa.security.JwtUtils;
import com.medinexa.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final NotificationService notificationService;

    @Autowired
    public AuthController(
            UserRepository userRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtUtils jwtUtils,
            NotificationService notificationService) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.notificationService = notificationService;
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // 1. Create and save base User
        User user = User.builder()
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .role(registerRequest.getRole())
                .isActive(true)
                .build();

        userRepository.save(user);

        // 2. Cascade saving specific profile details based on User Role
        if (registerRequest.getRole() == Role.PATIENT) {
            Patient patient = Patient.builder()
                    .user(user)
                    .dateOfBirth(registerRequest.getDateOfBirth())
                    .gender(registerRequest.getGender())
                    .phoneNumber(registerRequest.getPhoneNumber())
                    .bloodGroup(registerRequest.getBloodGroup())
                    .address(registerRequest.getAddress())
                    .build();
            patientRepository.save(patient);
        } else if (registerRequest.getRole() == Role.DOCTOR) {
            Doctor doctor = Doctor.builder()
                    .user(user)
                    .specialization(registerRequest.getSpecialization())
                    .licenseNumber(registerRequest.getLicenseNumber())
                    .experienceYears(registerRequest.getExperienceYears())
                    .consultationFee(registerRequest.getConsultationFee())
                    .biography(registerRequest.getBiography())
                    .isVerified(false) // Admin approval verification flow
                    .build();
            doctorRepository.save(doctor);
        }

        // Send Welcome email
        notificationService.sendWelcomeEmail(user.getEmail(), user.getFirstName() + " " + user.getLastName());

        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (org.springframework.security.core.AuthenticationException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body("Error: Invalid email or password");
        }

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Error: Authenticated user not found in database."));

        String jwt = jwtUtils.generateToken(user.getEmail(), user.getRole().name());

        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwt)
                .email(user.getEmail())
                .role(user.getRole())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build());
    }
}
