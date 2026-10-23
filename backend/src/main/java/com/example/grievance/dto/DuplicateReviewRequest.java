package com.example.grievance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DuplicateReviewRequest {

    @NotBlank(message = "Action is required: CONFIRM or REJECT")
    private String action;

    private String notes;
}
