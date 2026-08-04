package com.medinexa.controller;

import com.medinexa.dto.*;
import com.medinexa.service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

    private final DoctorService doctorService;

    @Autowired
    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping("/profile")
    public ResponseEntity<DoctorProfileResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(doctorService.getDoctorProfile(userDetails.getUsername()));
    }

    @PutMapping("/profile/update")
    public ResponseEntity<DoctorProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateDoctorProfileRequest request) {
        return ResponseEntity.ok(doctorService.updateDoctorProfile(userDetails.getUsername(), request));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<DoctorAppointmentResponse>> getAppointments(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(doctorService.getDoctorAppointments(userDetails.getUsername()));
    }

    @PostMapping("/prescriptions")
    public ResponseEntity<String> issuePrescription(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreatePrescriptionRequest request) {
        doctorService.issuePrescription(userDetails.getUsername(), request);
        return ResponseEntity.ok("Prescription issued successfully!");
    }

    @PostMapping("/medical-history")
    public ResponseEntity<String> addMedicalHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AddMedicalHistoryRequest request) {
        doctorService.addMedicalHistory(userDetails.getUsername(), request);
        return ResponseEntity.ok("Medical history record added successfully!");
    }
}
