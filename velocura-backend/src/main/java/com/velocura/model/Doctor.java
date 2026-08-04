package com.velocura.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "user")
@EqualsAndHashCode(exclude = "user")
public class Doctor {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    @NotNull(message = "Associated user is required")
    private User user;

    @NotBlank(message = "Specialization is required")
    @Column(nullable = false)
    private String specialization;

    @NotBlank(message = "License number is required")
    @Column(name = "license_number", unique = true, nullable = false)
    private String licenseNumber;

    @NotNull(message = "Experience years is required")
    @Column(name = "experience_years", nullable = false)
    private Integer experienceYears;

    @Column(columnDefinition = "TEXT")
    private String biography;

    @NotNull(message = "Consultation fee is required")
    @Column(name = "consultation_fee", nullable = false)
    private BigDecimal consultationFee;

    @Builder.Default
    @Column(name = "is_verified", nullable = false)
    private boolean isVerified = false;
}
