package com.velocura.service;

import com.velocura.dto.AppointmentResponse;
import com.velocura.dto.BookAppointmentRequest;
import com.velocura.dto.RescheduleAppointmentRequest;

public interface AppointmentService {
    AppointmentResponse bookAppointment(String patientEmail, BookAppointmentRequest request);
    AppointmentResponse rescheduleAppointment(String patientEmail, RescheduleAppointmentRequest request);
    AppointmentResponse cancelAppointmentByPatient(String patientEmail, Long appointmentId);
    AppointmentResponse cancelAppointmentByDoctor(String doctorEmail, Long appointmentId);
    AppointmentResponse completeAppointment(String doctorEmail, Long appointmentId);
    java.util.List<AppointmentResponse> getPatientAppointments(String patientEmail);
}
