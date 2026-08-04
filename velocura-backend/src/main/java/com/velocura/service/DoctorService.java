package com.velocura.service;

import com.velocura.dto.*;

import java.util.List;

public interface DoctorService {
    DoctorProfileResponse getDoctorProfile(String email);
    DoctorProfileResponse updateDoctorProfile(String email, UpdateDoctorProfileRequest request);
    List<DoctorAppointmentResponse> getDoctorAppointments(String email);
    void issuePrescription(String email, CreatePrescriptionRequest request);
    void addMedicalHistory(String email, AddMedicalHistoryRequest request);
}
