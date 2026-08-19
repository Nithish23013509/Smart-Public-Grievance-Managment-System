package com.example.grievance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateComplaintStatusRequest {

    @NotNull(message = "Status is required")
    private String status;

    @NotBlank(message = "Remarks are required")
    private String remarks;
}
