package com.example.grievance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignComplaintRequest {

    @NotNull(message = "Department is required")
    private Long departmentId;

    @NotNull(message = "Officer is required")
    private Long officerId;
}
