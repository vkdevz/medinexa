package com.velocura.service;

import java.time.LocalDateTime;

public interface NotificationService {
    void sendWelcomeEmail(String toEmail, String name);
    void sendAppointmentBookingEmail(String toEmail, String name, String doctorName, LocalDateTime time);
    void sendDoctorVerificationEmail(String toEmail, String name);
    void sendOtpEmail(String toEmail, String code);
}
