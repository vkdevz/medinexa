package com.medinexa.controller;

import com.medinexa.dto.AppointmentResponse;
import com.medinexa.dto.BookAppointmentRequest;
import com.medinexa.dto.RescheduleAppointmentRequest;
import com.medinexa.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patient/appointments")
public class PatientAppointmentController {

    private final AppointmentService appointmentService;

    @Autowired
    public PatientAppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping("/book")
    public ResponseEntity<AppointmentResponse> book(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BookAppointmentRequest request) {
        AppointmentResponse response = appointmentService.bookAppointment(userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/reschedule")
    public ResponseEntity<AppointmentResponse> reschedule(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RescheduleAppointmentRequest request) {
        AppointmentResponse response = appointmentService.rescheduleAppointment(userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/cancel/{id}")
    public ResponseEntity<AppointmentResponse> cancel(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        AppointmentResponse response = appointmentService.cancelAppointmentByPatient(userDetails.getUsername(), id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<java.util.List<AppointmentResponse>> getAppointments(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(appointmentService.getPatientAppointments(userDetails.getUsername()));
    }
}
