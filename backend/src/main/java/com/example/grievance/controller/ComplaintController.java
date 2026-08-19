package com.example.grievance.controller;

import com.example.grievance.dto.*;
import com.example.grievance.security.CustomUserDetails;
import com.example.grievance.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    /**
     * Create a new complaint (JSON only, no image).
     */
    @PostMapping
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaint(
            @Valid @RequestBody CreateComplaintRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        ComplaintResponse response = complaintService.createComplaint(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint created successfully", response));
    }

    /**
     * Create a complaint with an optional image (multipart/form-data).
     */
    @PostMapping(value = "/with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaintWithImage(
            @Valid @RequestPart("complaint") CreateComplaintRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        ComplaintResponse response = complaintService.createComplaintWithImage(request, image, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint created successfully", response));
    }

    /**
     * Get the authenticated citizen's complaints (paginated).
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getMyComplaints(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<ComplaintResponse> complaints = complaintService.getMyComplaints(currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.success(complaints));
    }

    /**
     * Get complaint by ID (with IDOR prevention).
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaintById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        ComplaintResponse response = complaintService.getComplaintById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get complaint status history (timeline).
     */
    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<StatusHistoryResponse>>> getStatusHistory(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        List<StatusHistoryResponse> history = complaintService.getStatusHistory(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    /**
     * Citizen closes a RESOLVED complaint.
     */
    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> closeComplaint(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        ComplaintResponse response = complaintService.closeComplaint(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Complaint closed successfully", response));
    }
}
