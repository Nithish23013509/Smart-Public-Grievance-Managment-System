package com.example.grievance.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AiFeedbackData {
    private Long complaintId;
    private String description;
    private String aiDecision;
    private Double aiConfidence;
    private String aiAlternativesJson;
    private Boolean aiReviewAccepted;
    private String aiOverrideReason;
    private String finalCategory;
    private String finalDepartment;
}
