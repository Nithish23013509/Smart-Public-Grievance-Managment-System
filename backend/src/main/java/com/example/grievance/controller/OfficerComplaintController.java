package com.example.grievance.controller;

import com.example.grievance.dto.*;
import com.example.grievance.entity.enums.ComplaintStatus;
import com.example.grievance.security.CustomUserDetails;
import com.example.grievance.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/officer/complaints")
@PreAuthorize("hasRole('OFFICER')")
@RequiredArgsConstructor
public class OfficerComplaintController {

    private final ComplaintService complaintService;

    /**
     * Get complaints assigned to the authenticated officer (with optional status filter).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getOfficerComplaints(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10) Pageable pageable) {

        ComplaintStatus statusFilter = null;
        if (status != null && !status.isBlank()) {
            try {
                statusFilter = ComplaintStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid status: " + status));
            }
        }

        Page<ComplaintResponse> complaints = complaintService.getOfficerComplaints(
                currentUser, statusFilter, pageable);
        return ResponseEntity.ok(ApiResponse.success(complaints));
    }

    /**
     * Update complaint status (with transition validation).
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateComplaintStatusRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        ComplaintResponse response = complaintService.updateComplaintStatus(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Complaint status updated successfully", response));
    }

    /**
     * Upload resolution proof image for a complaint.
     */
    @PostMapping(value = "/{id}/resolution-proof", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ComplaintResponse>> uploadResolutionProof(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        ComplaintResponse response = complaintService.uploadResolutionProof(id, file, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Resolution proof uploaded successfully", response));
    }
}
