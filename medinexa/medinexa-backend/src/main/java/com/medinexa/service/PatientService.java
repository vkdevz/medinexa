package com.medinexa.service;

import com.medinexa.dto.MedicalHistoryResponse;
import com.medinexa.dto.PatientProfileResponse;
import com.medinexa.dto.PrescriptionResponse;
import com.medinexa.dto.UpdatePatientProfileRequest;
import com.medinexa.dto.DoctorProfileResponse;
import com.medinexa.dto.PatientPassportDto;

import java.util.List;

public interface PatientService {
    PatientProfileResponse getPatientProfile(String email);
    PatientProfileResponse updatePatientProfile(String email, UpdatePatientProfileRequest request);
    List<MedicalHistoryResponse> getMedicalHistory(String email);
    List<PrescriptionResponse> getPrescriptions(String email);
    List<DoctorProfileResponse> getVerifiedDoctors();
    PatientPassportDto getPatientPassport(String email);
    PatientPassportDto updatePatientPassport(String email, PatientPassportDto request);
    PatientPassportDto getPatientPassportById(Long patientId);
}
