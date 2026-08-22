package com.example.grievance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AiReviewOverrideRequest {
    
    @NotNull(message = "acceptAiRecommendation must be provided")
    private Boolean acceptAiRecommendation;

    private Long categoryId;
    private Long departmentId;
    
    private String overrideReason;
}
