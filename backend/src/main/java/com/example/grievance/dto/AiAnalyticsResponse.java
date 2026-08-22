package com.example.grievance.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class AiAnalyticsResponse {
    private long totalAiRoutedComplaints;
    private long autoRecommendedCount;
    private long reviewRequiredCount;
    private long lowConfidenceCount;
    
    private long manualOverridesCount;
    private long aiAcceptedCount;
    
    private double averageConfidence;
    
    private Map<String, Long> departmentWiseDistribution;
    private Map<String, Long> categoryWiseDistribution;
}
