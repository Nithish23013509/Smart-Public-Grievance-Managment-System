package com.example.grievance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DuplicateCandidateResponse {
    private Long complaintId;
    private String complaintNumber;
    private String title;
    private String description;
    private String categoryName;
    private String departmentName;
    private String status;
    private Double similarityScore;
    private Integer similarityPercentage;
    private Double distanceKm;
    private Boolean categoryMatch;
    private String matchTier; // HIGH_CONFIDENCE, POSSIBLE_DUPLICATE, NO_MATCH
    private String locationAddress;
    private LocalDateTime createdAt;
}
