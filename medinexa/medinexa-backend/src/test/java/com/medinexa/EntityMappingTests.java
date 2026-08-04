package com.medinexa;

import com.medinexa.model.*;
import com.medinexa.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class EntityMappingTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private MedicalHistoryRepository medicalHistoryRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Test
    void testEntityRelationshipsAndAuditing() {
        // 1. Create and persist User for Patient
        User patientUser = User.builder()
                .email("patient@medinexa.com")
                .password("hashed_password_123")
                .firstName("John")
                .lastName("Doe")
                .role(Role.PATIENT)
                .build();
        userRepository.save(patientUser);
        assertNotNull(patientUser.getId());
        assertNotNull(patientUser.getCreatedAt()); // Testing JPA Auditing

        // 2. Create and persist Patient profile mapping to User
        Patient patient = Patient.builder()
                .user(patientUser)
                .dateOfBirth(LocalDate.of(1995, 5, 15))
                .gender("Male")
                .bloodGroup("O+")
                .phoneNumber("1234567890")
                .address("123 Main St, New York")
                .build();
        patientRepository.save(patient);
        assertEquals(patientUser.getId(), patient.getId()); // MapsId verification

        // 3. Create and persist User for Doctor
        User doctorUser = User.builder()
                .email("doctor@medinexa.com")
                .password("hashed_password_456")
                .firstName("Sarah")
                .lastName("Smith")
                .role(Role.DOCTOR)
                .build();
        userRepository.save(doctorUser);

        // 4. Create and persist Doctor profile mapping to User
        Doctor doctor = Doctor.builder()
                .user(doctorUser)
                .specialization("Cardiology")
                .licenseNumber("MED-123456")
                .experienceYears(12)
                .consultationFee(new BigDecimal("150.00"))
                .biography("Senior Cardiologist with 12 years of experience.")
                .build();
        doctorRepository.save(doctor);
        assertEquals(doctorUser.getId(), doctor.getId());

        // 5. Create and persist Appointment
        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentTime(LocalDateTime.now().plusDays(2))
                .status(AppointmentStatus.PENDING)
                .reason("Routine cardiovascular checkup")
                .notes("Patient has mild history of high blood pressure")
                .build();
        appointmentRepository.save(appointment);
        assertNotNull(appointment.getId());
        assertNotNull(appointment.getCreatedAt());

        // 6. Create and persist Medical History
        MedicalHistory history = MedicalHistory.builder()
                .patient(patient)
                .diagnosis("Stage 1 Hypertension")
                .symptoms("Mild headaches, dizziness")
                .treatment("Prescribed lifestyle changes and monitoring")
                .recordedAt(LocalDate.now())
                .build();
        medicalHistoryRepository.save(history);
        assertNotNull(history.getId());

        // 7. Create and persist Prescription
        Prescription prescription = Prescription.builder()
                .appointment(appointment)
                .patient(patient)
                .doctor(doctor)
                .medication("Lisinopril 10mg")
                .dosage("Once daily in the morning")
                .instructions("Take with water, monitor blood pressure weekly")
                .build();
        prescriptionRepository.save(prescription);
        assertNotNull(prescription.getId());
        assertNotNull(prescription.getIssuedAt());

        // 8. Assert DB retrieval and custom queries
        Optional<User> fetchedUser = userRepository.findByEmail("patient@medinexa.com");
        assertTrue(fetchedUser.isPresent());
        assertEquals("John", fetchedUser.get().getFirstName());

        List<Doctor> cardiologists = doctorRepository.findBySpecializationIgnoreCase("cardiology");
        assertFalse(cardiologists.isEmpty());
        assertEquals("Sarah", cardiologists.get(0).getUser().getFirstName());

        List<Appointment> patientAppointments = appointmentRepository.findByPatientId(patient.getId());
        assertEquals(1, patientAppointments.size());
        assertEquals(doctor.getId(), patientAppointments.get(0).getDoctor().getId());

        List<Prescription> patientPrescriptions = prescriptionRepository.findByPatientIdOrderByIssuedAtDesc(patient.getId());
        assertEquals(1, patientPrescriptions.size());
        assertEquals("Lisinopril 10mg", patientPrescriptions.get(0).getMedication());
    }
}
