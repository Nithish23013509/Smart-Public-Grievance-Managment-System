package com.example.grievance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateComplaintRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 150, message = "Title must be between 5 and 150 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 5000, message = "Description must be between 10 and 5000 characters")
    private String description;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "Department is required")
    private Long departmentId;

    @NotNull(message = "District is required")
    private Long districtId;

    private Long revenueDivisionId;
    private Long talukId;
    private Long localBodyId;

    @NotBlank(message = "Location address is required")
    private String locationAddress;

    private Double latitude;
    private Double longitude;
}
