package com.velocura.service;

import com.velocura.dto.AppointmentResponse;
import com.velocura.dto.BookAppointmentRequest;
import com.velocura.dto.RescheduleAppointmentRequest;
import com.velocura.exception.ResourceNotFoundException;
import com.velocura.model.*;
import com.velocura.repository.AppointmentRepository;
import com.velocura.repository.DoctorRepository;
import com.velocura.repository.PatientRepository;
import com.velocura.repository.UserRepository;
import com.velocura.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    @Autowired
    public AppointmentServiceImpl(
            UserRepository userRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            NotificationService notificationService) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.notificationService = notificationService;
    }

    private Patient fetchPatientByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return patientRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user ID: " + user.getId()));
    }

    private Doctor fetchDoctorByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return doctorRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user ID: " + user.getId()));
    }

    @Override
    public AppointmentResponse bookAppointment(String patientEmail, BookAppointmentRequest request) {
        Patient patient = fetchPatientByEmail(patientEmail);
        
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + request.getDoctorId()));

        // Double Booking Prevention Check
        boolean hasConflict = appointmentRepository.existsByDoctorIdAndAppointmentTimeAndStatusIn(
                doctor.getId(),
                request.getAppointmentTime(),
                List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)
        );

        if (hasConflict) {
            throw new IllegalArgumentException("The selected slot is already booked for this doctor. Please pick another time.");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentTime(request.getAppointmentTime())
                .status(AppointmentStatus.PENDING)
                .reason(request.getReason())
                .build();

        appointmentRepository.save(appointment);

        // Send Booking confirmation email
        notificationService.sendAppointmentBookingEmail(
                patient.getUser().getEmail(),
                patient.getUser().getFirstName() + " " + patient.getUser().getLastName(),
                "Dr. " + doctor.getUser().getFirstName() + " " + doctor.getUser().getLastName(),
                request.getAppointmentTime()
        );

        return mapToResponse(appointment);
    }

    @Override
    public AppointmentResponse rescheduleAppointment(String patientEmail, RescheduleAppointmentRequest request) {
        Patient patient = fetchPatientByEmail(patientEmail);

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + request.getAppointmentId()));

        // Security check: Verify this appointment belongs to the calling patient
        if (!appointment.getPatient().getId().equals(patient.getId())) {
            throw new AccessDeniedException("Unauthorized: You cannot reschedule an appointment that does not belong to your account.");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED || appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new IllegalStateException("Cannot reschedule a cancelled or completed appointment.");
        }

        // Conflict check for new slot
        boolean hasConflict = appointmentRepository.existsByDoctorIdAndAppointmentTimeAndStatusIn(
                appointment.getDoctor().getId(),
                request.getNewAppointmentTime(),
                List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)
        );

        if (hasConflict) {
            throw new IllegalArgumentException("The new selected slot is already booked for this doctor. Please pick another time.");
        }

        appointment.setAppointmentTime(request.getNewAppointmentTime());
        appointment.setStatus(AppointmentStatus.PENDING); // Resets status to PENDING for confirmation

        appointmentRepository.save(appointment);
        return mapToResponse(appointment);
    }

    @Override
    public AppointmentResponse cancelAppointmentByPatient(String patientEmail, Long appointmentId) {
        Patient patient = fetchPatientByEmail(patientEmail);
        
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        if (!appointment.getPatient().getId().equals(patient.getId())) {
            throw new AccessDeniedException("Unauthorized: You cannot cancel an appointment that does not belong to your account.");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
        return mapToResponse(appointment);
    }

    @Override
    public AppointmentResponse cancelAppointmentByDoctor(String doctorEmail, Long appointmentId) {
        Doctor doctor = fetchDoctorByEmail(doctorEmail);

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new AccessDeniedException("Unauthorized: You are not the scheduled doctor for this appointment.");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
        return mapToResponse(appointment);
    }

    @Override
    public AppointmentResponse completeAppointment(String doctorEmail, Long appointmentId) {
        Doctor doctor = fetchDoctorByEmail(doctorEmail);

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new AccessDeniedException("Unauthorized: You are not the scheduled doctor for this appointment.");
        }

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED && appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new IllegalStateException("Cannot complete an appointment that is not active.");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);
        return mapToResponse(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getPatientAppointments(String patientEmail) {
        Patient patient = fetchPatientByEmail(patientEmail);
        List<Appointment> appointments = appointmentRepository.findByPatientId(patient.getId());
        return appointments.stream()
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .doctorId(appointment.getDoctor().getId())
                .doctorName("Dr. " + appointment.getDoctor().getUser().getFirstName() + " " + appointment.getDoctor().getUser().getLastName())
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatient().getUser().getFirstName() + " " + appointment.getPatient().getUser().getLastName())
                .appointmentTime(appointment.getAppointmentTime())
                .status(appointment.getStatus())
                .reason(appointment.getReason())
                .notes(appointment.getNotes())
                .build();
    }
}
