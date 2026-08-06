package com.velocura.controller;

import com.velocura.dto.AdminDashboardStatsResponse;
import com.velocura.dto.UserResponse;
import com.velocura.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    @Autowired
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/doctors/{id}/verify")
    public ResponseEntity<String> verifyDoctor(@PathVariable Long id) {
        adminService.verifyDoctor(id);
        return ResponseEntity.ok("Doctor verified successfully!");
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<AdminDashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/doctors/unverified")
    public ResponseEntity<List<com.velocura.dto.DoctorProfileResponse>> getUnverifiedDoctors() {
        return ResponseEntity.ok(adminService.getUnverifiedDoctors());
    }

    @PutMapping("/users/{id}/toggle-active")
    public ResponseEntity<String> toggleUserActive(@PathVariable Long id) {
        adminService.toggleUserActive(id);
        return ResponseEntity.ok("User active status updated successfully!");
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully!");
    }

    @GetMapping("/otps")
    public ResponseEntity<List<com.velocura.dto.OtpDetailResponse>> getActiveOtps() {
        return ResponseEntity.ok(adminService.getActiveOtps());
    }
}
