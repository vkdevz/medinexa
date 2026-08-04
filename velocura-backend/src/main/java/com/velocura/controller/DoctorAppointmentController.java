package com.velocura.controller;

import com.velocura.dto.AppointmentResponse;
import com.velocura.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/doctor/appointments")
public class DoctorAppointmentController {

    private final AppointmentService appointmentService;

    @Autowired
    public DoctorAppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PutMapping("/cancel/{id}")
    public ResponseEntity<AppointmentResponse> cancel(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        AppointmentResponse response = appointmentService.cancelAppointmentByDoctor(userDetails.getUsername(), id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/complete/{id}")
    public ResponseEntity<AppointmentResponse> complete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        AppointmentResponse response = appointmentService.completeAppointment(userDetails.getUsername(), id);
        return ResponseEntity.ok(response);
    }
}
