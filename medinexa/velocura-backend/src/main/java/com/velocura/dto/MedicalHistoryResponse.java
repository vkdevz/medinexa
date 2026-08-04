package com.velocura.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalHistoryResponse {
    private Long id;
    private String diagnosis;
    private String symptoms;
    private String treatment;
    private LocalDate recordedAt;
}
