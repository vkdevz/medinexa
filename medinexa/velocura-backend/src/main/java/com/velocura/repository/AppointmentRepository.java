package com.velocura.repository;

import com.velocura.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByDoctorId(Long doctorId);
    boolean existsByDoctorIdAndAppointmentTimeAndStatusIn(
            Long doctorId, 
            java.time.LocalDateTime appointmentTime, 
            List<com.velocura.model.AppointmentStatus> statuses
    );
}
