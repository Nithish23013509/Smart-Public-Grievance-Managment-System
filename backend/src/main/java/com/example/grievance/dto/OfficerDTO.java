package com.example.grievance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficerDTO {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private Long departmentId;
    private String departmentName;
}
