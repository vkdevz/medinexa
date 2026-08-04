package com.velocura.controller;

import com.velocura.dto.AuthResponse;
import com.velocura.dto.LoginRequest;
import com.velocura.dto.RegisterRequest;
import com.velocura.model.Doctor;
import com.velocura.model.Patient;
import com.velocura.model.Role;
import com.velocura.model.User;
import com.velocura.repository.DoctorRepository;
import com.velocura.repository.PatientRepository;
import com.velocura.repository.UserRepository;
import com.velocura.security.JwtUtils;
import com.velocura.service.NotificationService;
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

    @PostMapping("/triage")
    public ResponseEntity<com.velocura.dto.TriageResponse> anonymousTriage(@RequestBody com.velocura.dto.TriageRequest request) {
        String query = request.getSymptoms() != null ? request.getSymptoms().toLowerCase() : "";
        
        String triageLevel = "Mild";
        String clinicalSummary = "Based on your symptoms, we suggest home care and monitoring. Consult a general physician if symptoms persist.";
        String recommendedSpecialty = "General Medicine";
        java.util.List<String> differentialDiagnoses = java.util.List.of("Mild Viral infection", "Common Cold");
        java.util.List<String> immediatePrecautions = java.util.List.of("Monitor temperature", "Keep hydrated");
        java.util.List<String> homeRemedies = java.util.List.of("Warm saline gargles", "Adequate bed rest", "Steam inhalation");
        java.util.List<String> suggestedOtc = java.util.List.of("Paracetamol 650mg (for fever/pain)", "Vitamin C supplements");

        if (query.contains("chest") || query.contains("heart") || query.contains("palpitation") || query.contains("breathless") || query.contains("cardiac")) {
            triageLevel = "Critical";
            clinicalSummary = "Your symptoms suggest potential cardiovascular strain or acute distress. Please restrict physical activities and seek immediate expert consultation.";
            recommendedSpecialty = "Cardiology";
            differentialDiagnoses = java.util.List.of("Angina Pectoris", "Arrhythmia", "Myocardial Infarction");
            immediatePrecautions = java.util.List.of("Avoid physical exertion", "Sit upright", "Seek emergency clinical help if chest pressure worsens");
            homeRemedies = java.util.List.of("Sit in a well-ventilated quiet area", "Practice slow diaphragmatic breathing");
            suggestedOtc = java.util.List.of("Aspirin 325mg (consult emergency services before taking)");
        } else if (query.contains("headache") || query.contains("migraine") || query.contains("dizzy") || query.contains("neck pain") || query.contains("seizure")) {
            triageLevel = "Moderate";
            clinicalSummary = "Described headache or sensory dizziness symptoms indicate potential migraine trigger or localized neurological stress.";
            recommendedSpecialty = "Neurology";
            differentialDiagnoses = java.util.List.of("Migraine Episode", "Tension Headache", "Vestibular Neuritis");
            immediatePrecautions = java.util.List.of("Rest in a dark quiet room", "Avoid laptop/mobile screens", "Ensure adequate hydration");
            homeRemedies = java.util.List.of("Cold compress on forehead", "Peppermint oil temple massage");
            suggestedOtc = java.util.List.of("Ibuprofen 400mg (for pain)", "Acetaminophen 500mg");
        } else if (query.contains("skin") || query.contains("rash") || query.contains("itch") || query.contains("spots") || query.contains("acne")) {
            triageLevel = "Mild";
            clinicalSummary = "Presents localized dermatological irritation or hypersensitivity response.";
            recommendedSpecialty = "Dermatology";
            differentialDiagnoses = java.util.List.of("Contact Dermatitis", "Urticaria (Hives)", "Eczema flare-up");
            immediatePrecautions = java.util.List.of("Do not scratch or rub the affected skin", "Avoid harsh chemical soaps or lotions");
            homeRemedies = java.util.List.of("Apply aloe vera gel", "Cool oat water baths");
            suggestedOtc = java.util.List.of("Cetirizine 10mg (for itching)", "Calamine lotion topical application");
        } else if (query.contains("fracture") || query.contains("bone") || query.contains("joint") || query.contains("sprain") || query.contains("fall")) {
            triageLevel = "Moderate";
            clinicalSummary = "Joint or bone impact indicates potential sprain, ligament strain, or minor bone fracture.";
            recommendedSpecialty = "Orthopedics";
            differentialDiagnoses = java.util.List.of("Bone Fracture", "Joint Sprain", "Ligament Strain");
            immediatePrecautions = java.util.List.of("Immobilize the affected limb", "Apply ice packs wrapped in cloth", "Elevate the limb above heart level");
            homeRemedies = java.util.List.of("Follow the R.I.C.E protocol (Rest, Ice, Compression, Elevation)");
            suggestedOtc = java.util.List.of("Ibuprofen 400mg (to reduce swelling and pain)");
        }

        com.velocura.dto.TriageResponse response = com.velocura.dto.TriageResponse.builder()
                .triageLevel(triageLevel)
                .clinicalSummary(clinicalSummary)
                .recommendedSpecialty(recommendedSpecialty)
                .differentialDiagnoses(differentialDiagnoses)
                .immediatePrecautions(immediatePrecautions)
                .homeRemedies(homeRemedies)
                .suggestedOtc(suggestedOtc)
                .build();

        return ResponseEntity.ok(response);
    }
}
