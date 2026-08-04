package com.velocura.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class ConsoleNotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(ConsoleNotificationServiceImpl.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Override
    public void sendWelcomeEmail(String toEmail, String name) {
        logger.info("------------------------------------------------------------");
        logger.info("SMTP EMAIL OUTBOX [Welcome]");
        logger.info("TO: {} ({})", toEmail, name);
        logger.info("SUBJECT: Welcome to VeloCura!");
        logger.info("BODY: Hello {}, thank you for registering with VeloCura Healthcare Platform.", name);
        logger.info("------------------------------------------------------------");
    }

    @Override
    public void sendAppointmentBookingEmail(String toEmail, String name, String doctorName, LocalDateTime time) {
        logger.info("------------------------------------------------------------");
        logger.info("SMTP EMAIL OUTBOX [Booking Alert]");
        logger.info("TO: {} ({})", toEmail, name);
        logger.info("SUBJECT: Appointment Confirmed - VeloCura");
        logger.info("BODY: Hello {}, your appointment with {} is confirmed for {}.", name, doctorName, time.format(formatter));
        logger.info("------------------------------------------------------------");
    }

    @Override
    public void sendDoctorVerificationEmail(String toEmail, String name) {
        logger.info("------------------------------------------------------------");
        logger.info("SMTP EMAIL OUTBOX [Credential Verification]");
        logger.info("TO: {} ({})", toEmail, name);
        logger.info("SUBJECT: Doctor Credentials Verified - VeloCura");
        logger.info("BODY: Hello Dr. {}, your credentials have been verified by the Administrator. Your portal profile is now active.", name);
        logger.info("------------------------------------------------------------");
    }
}
