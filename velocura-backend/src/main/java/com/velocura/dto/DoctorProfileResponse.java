package com.velocura.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorProfileResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String specialization;
    private String licenseNumber;
    private Integer experienceYears;
    private String biography;
    private BigDecimal consultationFee;
    private boolean isVerified;
}
