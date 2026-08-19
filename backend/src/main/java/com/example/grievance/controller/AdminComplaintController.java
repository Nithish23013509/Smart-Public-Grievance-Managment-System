package com.example.grievance.controller;

import com.example.grievance.dto.ApiResponse;
import com.example.grievance.dto.AssignComplaintRequest;
import com.example.grievance.dto.ComplaintResponse;
import com.example.grievance.security.CustomUserDetails;
import com.example.grievance.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/complaints")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminComplaintController {

    private final ComplaintService complaintService;

    /**
     * Get all complaints (paginated).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getAllComplaints(
            @PageableDefault(size = 10) Pageable pageable) {

        Page<ComplaintResponse> complaints = complaintService.getAllComplaints(pageable);
        return ResponseEntity.ok(ApiResponse.success(complaints));
    }

    /**
     * Assign a complaint to a department and officer.
     */
    @PutMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<ComplaintResponse>> assignComplaint(
            @PathVariable Long id,
            @Valid @RequestBody AssignComplaintRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        ComplaintResponse response = complaintService.assignComplaint(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Complaint assigned successfully", response));
    }
}
