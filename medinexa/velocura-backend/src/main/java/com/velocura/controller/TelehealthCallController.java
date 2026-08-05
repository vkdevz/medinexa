package com.velocura.controller;

import com.velocura.model.User;
import com.velocura.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/consultations")
public class TelehealthCallController {

    private final UserRepository userRepository;

    // Key: patientId (Long), Value: CallSession
    private static final Map<Long, CallSession> activeCalls = new ConcurrentHashMap<>();

    @Autowired
    public TelehealthCallController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public static class CallSession {
        public Long appointmentId;
        public String roomName;
        public String doctorName;
        public Long patientId;

        public CallSession(Long appointmentId, String roomName, String doctorName, Long patientId) {
            this.appointmentId = appointmentId;
            this.roomName = roomName;
            this.doctorName = doctorName;
            this.patientId = patientId;
        }
    }

    @PostMapping("/ring")
    public ResponseEntity<?> ring(
            @RequestParam("appointmentId") Long appointmentId,
            @RequestParam("roomName") String roomName,
            @RequestParam("doctorName") String doctorName,
            @RequestParam("patientId") Long patientId) {
        
        CallSession session = new CallSession(appointmentId, roomName, doctorName, patientId);
        activeCalls.put(patientId, session);
        return ResponseEntity.ok(Map.of("message", "Ringing patient...", "status", "ringing"));
    }

    @PostMapping("/hangup")
    public ResponseEntity<?> hangup(@RequestParam("patientId") Long patientId) {
        activeCalls.remove(patientId);
        return ResponseEntity.ok(Map.of("message", "Call ended.", "status", "disconnected"));
    }

    @GetMapping("/active")
    public ResponseEntity<?> checkActiveCall(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
        if (userOpt.isPresent()) {
            Long patientId = userOpt.get().getId();
            CallSession session = activeCalls.get(patientId);
            if (session != null) {
                return ResponseEntity.ok(session);
            }
        }
        return ResponseEntity.ok(Map.of("status", "idle"));
    }
}
