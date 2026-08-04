package com.medinexa.service;

import com.medinexa.dto.AdminDashboardStatsResponse;
import com.medinexa.dto.UserResponse;

import java.util.List;

public interface AdminService {
    List<UserResponse> getAllUsers();
    void verifyDoctor(Long doctorId);
    AdminDashboardStatsResponse getDashboardStats();
    List<com.medinexa.dto.DoctorProfileResponse> getUnverifiedDoctors();
}
