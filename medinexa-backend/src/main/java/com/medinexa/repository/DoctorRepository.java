package com.medinexa.repository;

import com.medinexa.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findBySpecializationIgnoreCase(String specialization);
    List<Doctor> findByIsVerified(boolean isVerified);
    long countByIsVerified(boolean isVerified);
}
