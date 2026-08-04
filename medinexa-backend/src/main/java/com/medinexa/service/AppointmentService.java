package com.medinexa.service;

import com.medinexa.dto.AppointmentResponse;
import com.medinexa.dto.BookAppointmentRequest;
import com.medinexa.dto.RescheduleAppointmentRequest;

public interface AppointmentService {
    AppointmentResponse bookAppointment(String patientEmail, BookAppointmentRequest request);
    AppointmentResponse rescheduleAppointment(String patientEmail, RescheduleAppointmentRequest request);
    AppointmentResponse cancelAppointmentByPatient(String patientEmail, Long appointmentId);
    AppointmentResponse cancelAppointmentByDoctor(String doctorEmail, Long appointmentId);
    AppointmentResponse completeAppointment(String doctorEmail, Long appointmentId);
    java.util.List<AppointmentResponse> getPatientAppointments(String patientEmail);
}
