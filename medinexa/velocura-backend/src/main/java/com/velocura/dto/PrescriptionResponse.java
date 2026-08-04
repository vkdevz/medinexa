package com.velocura.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionResponse {
    private Long id;
    private String doctorName;
    private String doctorSpecialization;
    private String medication;
    private String dosage;
    private String instructions;
    private LocalDateTime issuedAt;
}
