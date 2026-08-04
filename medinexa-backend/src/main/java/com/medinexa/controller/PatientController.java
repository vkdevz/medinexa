package com.medinexa.controller;

import com.medinexa.dto.MedicalHistoryResponse;
import com.medinexa.dto.PatientProfileResponse;
import com.medinexa.dto.PrescriptionResponse;
import com.medinexa.dto.UpdatePatientProfileRequest;
import com.medinexa.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient")
public class PatientController {

    private final PatientService patientService;

    @Autowired
    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping("/profile")
    public ResponseEntity<PatientProfileResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        PatientProfileResponse response = patientService.getPatientProfile(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile/update")
    public ResponseEntity<PatientProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdatePatientProfileRequest request) {
        PatientProfileResponse response = patientService.updatePatientProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/medical-history")
    public ResponseEntity<List<MedicalHistoryResponse>> getMedicalHistory(@AuthenticationPrincipal UserDetails userDetails) {
        List<MedicalHistoryResponse> response = patientService.getMedicalHistory(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<List<PrescriptionResponse>> getPrescriptions(@AuthenticationPrincipal UserDetails userDetails) {
        List<PrescriptionResponse> response = patientService.getPrescriptions(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<com.medinexa.dto.DoctorProfileResponse>> getDoctors() {
        return ResponseEntity.ok(patientService.getVerifiedDoctors());
    }
}
