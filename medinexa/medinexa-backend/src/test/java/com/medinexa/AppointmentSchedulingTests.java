package com.medinexa;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medinexa.dto.AppointmentResponse;
import com.medinexa.dto.BookAppointmentRequest;
import com.medinexa.dto.RescheduleAppointmentRequest;
import com.medinexa.model.Doctor;
import com.medinexa.model.Patient;
import com.medinexa.model.Role;
import com.medinexa.model.User;
import com.medinexa.repository.DoctorRepository;
import com.medinexa.repository.PatientRepository;
import com.medinexa.repository.UserRepository;
import com.medinexa.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AppointmentSchedulingTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private ObjectMapper objectMapper;

    private Patient patient;
    private Doctor doctor;
    private String patientToken;

    @BeforeEach
    void setUp() {
        // Set up Patient User & Profile
        User patientUser = User.builder()
                .email("scheduling_patient@medinexa.com")
                .password("password123")
                .firstName("John")
                .lastName("Doe")
                .role(Role.PATIENT)
                .build();
        userRepository.save(patientUser);

        patient = Patient.builder()
                .user(patientUser)
                .build();
        patientRepository.save(patient);

        // Generate patient JWT token
        patientToken = jwtUtils.generateToken(patientUser.getEmail(), Role.PATIENT.name());

        // Set up Doctor User & Profile
        User doctorUser = User.builder()
                .email("scheduling_doctor@medinexa.com")
                .password("password456")
                .firstName("Sarah")
                .lastName("Smith")
                .role(Role.DOCTOR)
                .build();
        userRepository.save(doctorUser);

        doctor = Doctor.builder()
                .user(doctorUser)
                .specialization("Cardiology")
                .licenseNumber("LICENSE-777")
                .experienceYears(10)
                .consultationFee(new BigDecimal("100.00"))
                .build();
        doctorRepository.save(doctor);
    }

    @Test
    void testBookingSchedulingAndDoubleBookingPreventionFlow() throws Exception {
        LocalDateTime timeSlot = LocalDateTime.now().plusDays(5).withNano(0);

        BookAppointmentRequest request = BookAppointmentRequest.builder()
                .doctorId(doctor.getId())
                .appointmentTime(timeSlot)
                .reason("Cardiovascular screening check")
                .build();

        // 1. Book appointment successfully
        MvcResult result = mockMvc.perform(post("/api/patient/appointments/book")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.doctorId").value(doctor.getId()))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn();

        AppointmentResponse response = objectMapper.readValue(result.getResponse().getContentAsString(), AppointmentResponse.class);
        assertNotNull(response.getId());

        // 2. Attempt double booking at same slot (should trigger validation block - 400 Bad Request)
        mockMvc.perform(post("/api/patient/appointments/book")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("The selected slot is already booked for this doctor. Please pick another time."));

        // 3. Reschedule first appointment to different slot
        LocalDateTime newTimeSlot = timeSlot.plusHours(2);
        RescheduleAppointmentRequest rescheduleRequest = RescheduleAppointmentRequest.builder()
                .appointmentId(response.getId())
                .newAppointmentTime(newTimeSlot)
                .build();

        mockMvc.perform(put("/api/patient/appointments/reschedule")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rescheduleRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.appointmentTime").isNotEmpty())
                .andExpect(jsonPath("$.status").value("PENDING"));

        // 4. Try booking the original slot again (which should now be free since we rescheduled)
        mockMvc.perform(post("/api/patient/appointments/book")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // 5. Cancel the rescheduled appointment
        mockMvc.perform(put("/api/patient/appointments/cancel/" + response.getId())
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }
}
