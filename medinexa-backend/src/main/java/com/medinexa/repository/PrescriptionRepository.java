package com.medinexa.repository;

import com.medinexa.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientIdOrderByIssuedAtDesc(Long patientId);
    List<Prescription> findByDoctorIdOrderByIssuedAtDesc(Long doctorId);
}
