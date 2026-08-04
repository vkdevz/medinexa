package com.medinexa.service;

import com.medinexa.dto.AdminDashboardStatsResponse;
import com.medinexa.dto.UserResponse;
import com.medinexa.exception.ResourceNotFoundException;
import com.medinexa.model.Doctor;
import com.medinexa.model.User;
import com.medinexa.repository.AppointmentRepository;
import com.medinexa.repository.DoctorRepository;
import com.medinexa.repository.PatientRepository;
import com.medinexa.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    @Autowired
    public AdminServiceImpl(
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

    @Override
    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(u -> UserResponse.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .role(u.getRole())
                        .isActive(u.isActive())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void verifyDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));
        
        doctor.setVerified(true);
        doctorRepository.save(doctor);

        // Send activation verification email
        notificationService.sendDoctorVerificationEmail(
                doctor.getUser().getEmail(),
                doctor.getUser().getFirstName() + " " + doctor.getUser().getLastName()
        );
    }

    @Override
    public AdminDashboardStatsResponse getDashboardStats() {
        long patientCount = patientRepository.count();
        long doctorCount = doctorRepository.count();
        long appointmentCount = appointmentRepository.count();
        long pendingVerificationsCount = doctorRepository.countByIsVerified(false);

        return AdminDashboardStatsResponse.builder()
                .patientCount(patientCount)
                .doctorCount(doctorCount)
                .appointmentCount(appointmentCount)
                .pendingVerificationsCount(pendingVerificationsCount)
                .build();
    }

    @Override
    public List<com.medinexa.dto.DoctorProfileResponse> getUnverifiedDoctors() {
        return doctorRepository.findByIsVerified(false).stream()
                .map(d -> com.medinexa.dto.DoctorProfileResponse.builder()
                        .id(d.getId())
                        .email(d.getUser().getEmail())
                        .firstName(d.getUser().getFirstName())
                        .lastName(d.getUser().getLastName())
                        .specialization(d.getSpecialization())
                        .licenseNumber(d.getLicenseNumber())
                        .experienceYears(d.getExperienceYears())
                        .biography(d.getBiography())
                        .consultationFee(d.getConsultationFee())
                        .isVerified(d.isVerified())
                        .build())
                .collect(Collectors.toList());
    }
}
