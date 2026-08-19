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
public class StatusHistoryResponse {
    private Long id;
    private String oldStatus;
    private String newStatus;
    private String remarks;
    private String changedByName;
    private LocalDateTime changedAt;
}
