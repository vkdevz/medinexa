package com.medinexa;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medinexa.dto.AuthResponse;
import com.medinexa.dto.LoginRequest;
import com.medinexa.dto.RegisterRequest;
import com.medinexa.model.Role;
import com.medinexa.repository.PatientRepository;
import com.medinexa.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testAuthenticationAndAuthorizationFlow() throws Exception {
        // 1. Register a new Patient
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email("testpatient@medinexa.com")
                .password("patientpass123")
                .firstName("John")
                .lastName("Doe")
                .role(Role.PATIENT)
                .dateOfBirth(LocalDate.of(1990, 8, 20))
                .gender("Male")
                .phoneNumber("5551234567")
                .bloodGroup("B+")
                .address("789 Pine Ave, Seattle")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        // Verify patient and user were saved (cascade transaction check)
        assertTrue(userRepository.existsByEmail("testpatient@medinexa.com"));
        var userOpt = userRepository.findByEmail("testpatient@medinexa.com");
        assertTrue(userOpt.isPresent());
        assertTrue(patientRepository.existsById(userOpt.get().getId()));

        // 2. Attempt duplicate registration (should return 400 Bad Request)
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest());

        // 3. Login with correct credentials and retrieve JWT
        LoginRequest loginRequest = LoginRequest.builder()
                .email("testpatient@medinexa.com")
                .password("patientpass123")
                .build();

        MvcResult mvcResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = mvcResult.getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(responseBody, AuthResponse.class);
        assertNotNull(authResponse.getToken());
        assertEquals("testpatient@medinexa.com", authResponse.getEmail());
        assertEquals(Role.PATIENT, authResponse.getRole());

        // 4. Try Login with incorrect credentials (should return 401 Unauthorized)
        LoginRequest badLoginRequest = LoginRequest.builder()
                .email("testpatient@medinexa.com")
                .password("wrongpassword")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLoginRequest)))
                .andExpect(status().isUnauthorized());

        // 5. Query secured endpoint without JWT token (should return 401 Unauthorized)
        mockMvc.perform(get("/api/patient/test"))
                .andExpect(status().isUnauthorized());

        // 6. Query patient secured endpoint with JWT token (should succeed)
        mockMvc.perform(get("/api/patient/test")
                        .header("Authorization", "Bearer " + authResponse.getToken()))
                .andExpect(status().isOk());

        // 7. Query doctor secured endpoint with patient JWT token (should return 403 Forbidden due to role check)
        mockMvc.perform(get("/api/doctor/test")
                        .header("Authorization", "Bearer " + authResponse.getToken()))
                .andExpect(status().isForbidden());
    }
}
