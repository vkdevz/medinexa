package com.velocura.controller;

import com.velocura.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/auth/otp")
public class OtpController {

    @Autowired
    private NotificationService notificationService;

    // Simple thread-safe in-memory cache for OTP tracking (Email -> OtpEntry)
    private static final Map<String, OtpEntry> otpCache = new ConcurrentHashMap<>();
    private final Random random = new Random();

    private static class OtpEntry {
        String code;
        long expiryTime;

        OtpEntry(String code, long expiryTime) {
            this.code = code;
            this.expiryTime = expiryTime;
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expiryTime;
        }
    }

    public static void generateAndSendOtp(String email, NotificationService notificationService) {
        Random rand = new Random();
        String otpCode = String.format("%06d", rand.nextInt(1000000));
        long expiry = System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(5);
        otpCache.put(email.toLowerCase().trim(), new OtpEntry(otpCode, expiry));

        System.out.println("\n--------------------------------------------------");
        System.out.println("📩 VELOCURA OTP NOTIFICATION SENT TO: " + email);
        System.out.println("🔑 CODE: " + otpCode + " (Expires in 5 minutes)");
        System.out.println("--------------------------------------------------\n");

        notificationService.sendOtpEmail(email, otpCode);
    }

    public static boolean verifyAndRemoveOtp(String email, String code) {
        if (email == null || code == null) return false;
        String cleanedEmail = email.toLowerCase().trim();
        OtpEntry entry = otpCache.get(cleanedEmail);
        if (entry == null || entry.isExpired() || !entry.code.equals(code.trim())) {
            return false;
        }
        otpCache.remove(cleanedEmail);
        return true;
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Email is required.");
        }

        // Generate a clean 6-digit random code
        String otpCode = String.format("%06d", random.nextInt(1000000));
        long expiry = System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(5); // 5 minutes validity
        otpCache.put(email.toLowerCase().trim(), new OtpEntry(otpCode, expiry));

        // Output to server logs for 100% free testing
        System.out.println("\n--------------------------------------------------");
        System.out.println("📩 VELOCURA OTP NOTIFICATION SENT TO: " + email);
        System.out.println("🔑 CODE: " + otpCode + " (Expires in 5 minutes)");
        System.out.println("--------------------------------------------------\n");

        // Trigger the Notification outbox logging service
        notificationService.sendOtpEmail(email, otpCode);

        return ResponseEntity.ok().body(Map.of(
            "message", "Verification code sent successfully to " + email,
            "demoNote", "For local developer testing, retrieve the OTP code directly from your Spring Boot terminal/console output."
        ));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        if (email == null || code == null || email.trim().isEmpty() || code.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email and code are required."));
        }

        String cleanedEmail = email.toLowerCase().trim();
        OtpEntry entry = otpCache.get(cleanedEmail);

        if (entry == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No verification session found for this email."));
        }

        if (entry.isExpired()) {
            otpCache.remove(cleanedEmail);
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Verification code has expired. Please request a new one."));
        }

        if (!entry.code.equals(code.trim())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid verification code. Please check and try again."));
        }

        // Clean cache on successful match
        otpCache.remove(cleanedEmail);
        return ResponseEntity.ok().body(Map.of("success", true, "message", "OTP verified successfully!"));
    }
}
