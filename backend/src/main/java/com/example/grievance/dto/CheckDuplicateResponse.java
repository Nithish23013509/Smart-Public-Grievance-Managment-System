package com.example.grievance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckDuplicateResponse {
    private boolean hasDuplicates;
    private String topMatchTier; // HIGH_CONFIDENCE, POSSIBLE_DUPLICATE, NO_MATCH
    private Double topSimilarityScore;
    private Integer topSimilarityPercentage;
    private List<DuplicateCandidateResponse> candidates;
}
