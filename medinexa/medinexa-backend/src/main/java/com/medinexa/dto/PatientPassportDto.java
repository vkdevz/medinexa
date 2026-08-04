package com.medinexa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientPassportDto {
    private String allergies;
    private String medicalHistoryTimeline;
}
