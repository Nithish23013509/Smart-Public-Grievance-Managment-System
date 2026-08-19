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
public class ComplaintResponse {
    private Long id;
    private String complaintNumber;
    private String title;
    private String description;

    // Category
    private Long categoryId;
    private String categoryName;

    // Department
    private Long departmentId;
    private String departmentName;

    // Citizen (no password)
    private Long citizenId;
    private String citizenName;
    private String citizenEmail;

    // Assigned Officer (no password)
    private Long assignedOfficerId;
    private String assignedOfficerName;

    // Location
    private Long districtId;
    private String districtName;
    private Long revenueDivisionId;
    private String revenueDivisionName;
    private Long talukId;
    private String talukName;
    private Long localBodyId;
    private String localBodyName;
    private String locationAddress;
    private Double latitude;
    private Double longitude;

    // Image
    private String imageUrl;

    // Status
    private String status;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
}
