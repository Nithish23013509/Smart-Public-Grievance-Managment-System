package com.example.grievance.service;

import com.example.grievance.dto.*;
import com.example.grievance.entity.*;
import com.example.grievance.entity.enums.ComplaintStatus;
import com.example.grievance.entity.enums.RoleName;
import com.example.grievance.exception.ResourceNotFoundException;
import com.example.grievance.repository.*;
import com.example.grievance.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintStatusHistoryRepository statusHistoryRepository;
    private final ComplaintCategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;
    private final DistrictRepository districtRepository;
    private final RevenueDivisionRepository revenueDivisionRepository;
    private final TalukRepository talukRepository;
    private final LocalBodyRepository localBodyRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    // ======== CITIZEN OPERATIONS ========

    @Transactional
    public ComplaintResponse createComplaint(CreateComplaintRequest request, CustomUserDetails currentUser) {
        User citizen = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ComplaintCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        District district = districtRepository.findById(request.getDistrictId())
                .orElseThrow(() -> new ResourceNotFoundException("District not found with id: " + request.getDistrictId()));

        Complaint complaint = new Complaint();
        complaint.setComplaintNumber(generateComplaintNumber());
        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setCategory(category);
        complaint.setDepartment(department);
        complaint.setCitizen(citizen);
        complaint.setDistrict(district);
        complaint.setLocationAddress(request.getLocationAddress());
        complaint.setLatitude(request.getLatitude());
        complaint.setLongitude(request.getLongitude());
        complaint.setStatus(ComplaintStatus.SUBMITTED);

        // Optional location entities
        if (request.getRevenueDivisionId() != null) {
            complaint.setRevenueDivision(revenueDivisionRepository.findById(request.getRevenueDivisionId())
                    .orElse(null));
        }
        if (request.getTalukId() != null) {
            complaint.setTaluk(talukRepository.findById(request.getTalukId()).orElse(null));
        }
        if (request.getLocalBodyId() != null) {
            complaint.setLocalBody(localBodyRepository.findById(request.getLocalBodyId()).orElse(null));
        }

        complaint = complaintRepository.save(complaint);

        // Create initial status history
        createStatusHistory(complaint, null, ComplaintStatus.SUBMITTED, "Complaint registered", citizen);

        // Notify citizen
        notificationService.notifyComplaintSubmitted(complaint);

        log.info("Complaint created: {} by citizen: {}", complaint.getComplaintNumber(), citizen.getEmail());
        return mapToResponse(complaint);
    }

    @Transactional
    public ComplaintResponse createComplaintWithImage(CreateComplaintRequest request,
                                                      MultipartFile image,
                                                      CustomUserDetails currentUser) {
        ComplaintResponse response = createComplaint(request, currentUser);

        if (image != null && !image.isEmpty()) {
            String imageUrl = fileStorageService.saveComplaintImage(image);
            Complaint complaint = complaintRepository.findById(response.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
            complaint.setImageUrl(imageUrl);
            complaintRepository.save(complaint);
            response.setImageUrl(imageUrl);
        }

        return response;
    }

    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getMyComplaints(CustomUserDetails currentUser, Pageable pageable) {
        return complaintRepository.findByCitizenId(currentUser.getId(), pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintById(Long id, CustomUserDetails currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        // Authorization check: IDOR prevention
        RoleName role = currentUser.getRoleName();
        if (role == RoleName.CITIZEN && !complaint.getCitizen().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only view your own complaints");
        }
        if (role == RoleName.OFFICER) {
            if (complaint.getAssignedOfficer() == null
                    || !complaint.getAssignedOfficer().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("This complaint is not assigned to you");
            }
        }
        // ADMIN can view any complaint

        return mapToResponse(complaint);
    }

    @Transactional
    public ComplaintResponse closeComplaint(Long id, CustomUserDetails currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        // Only the complaint owner can close
        if (!complaint.getCitizen().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only close your own complaints");
        }

        // Must be RESOLVED to close
        if (complaint.getStatus() != ComplaintStatus.RESOLVED) {
            throw new IllegalStateException("Complaint must be RESOLVED before it can be closed. Current: " + complaint.getStatus());
        }

        User citizen = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.CLOSED);
        complaintRepository.save(complaint);

        createStatusHistory(complaint, oldStatus, ComplaintStatus.CLOSED, "Complaint closed by citizen", citizen);
        notificationService.notifyComplaintClosed(complaint);

        log.info("Complaint {} closed by citizen {}", complaint.getComplaintNumber(), citizen.getEmail());
        return mapToResponse(complaint);
    }

    @Transactional(readOnly = true)
    public List<StatusHistoryResponse> getStatusHistory(Long complaintId, CustomUserDetails currentUser) {
        // Verify access first
        getComplaintById(complaintId, currentUser);

        return statusHistoryRepository.findByComplaintIdOrderByChangedAtAsc(complaintId)
                .stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());
    }

    // ======== OFFICER OPERATIONS ========

    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getOfficerComplaints(CustomUserDetails currentUser,
                                                        ComplaintStatus status,
                                                        Pageable pageable) {
        if (status != null) {
            return complaintRepository.findByAssignedOfficerIdAndStatus(
                    currentUser.getId(), status, pageable).map(this::mapToResponse);
        }
        return complaintRepository.findByAssignedOfficerId(currentUser.getId(), pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public ComplaintResponse updateComplaintStatus(Long id,
                                                    UpdateComplaintStatusRequest request,
                                                    CustomUserDetails currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        // Officer can only update their assigned complaints
        if (complaint.getAssignedOfficer() == null
                || !complaint.getAssignedOfficer().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("This complaint is not assigned to you");
        }

        ComplaintStatus newStatus;
        try {
            newStatus = ComplaintStatus.valueOf(request.getStatus());
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("Invalid status: " + request.getStatus());
        }

        ComplaintStatus oldStatus = complaint.getStatus();
        validateStatusTransition(oldStatus, newStatus);

        User officer = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        complaint.setStatus(newStatus);

        // Set resolvedAt when resolving
        if (newStatus == ComplaintStatus.RESOLVED) {
            complaint.setResolvedAt(LocalDateTime.now());
            notificationService.notifyComplaintResolved(complaint);
        } else {
            notificationService.notifyStatusChange(complaint, oldStatus, newStatus);
        }

        complaintRepository.save(complaint);
        createStatusHistory(complaint, oldStatus, newStatus, request.getRemarks(), officer);

        log.info("Complaint {} status changed: {} → {} by officer {}",
                complaint.getComplaintNumber(), oldStatus, newStatus, officer.getEmail());
        return mapToResponse(complaint);
    }

    @Transactional
    public ComplaintResponse uploadResolutionProof(Long id, MultipartFile file, CustomUserDetails currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        if (complaint.getAssignedOfficer() == null
                || !complaint.getAssignedOfficer().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("This complaint is not assigned to you");
        }

        String imageUrl = fileStorageService.saveComplaintImage(file);
        complaint.setImageUrl(imageUrl);
        complaintRepository.save(complaint);

        log.info("Resolution proof uploaded for complaint {}", complaint.getComplaintNumber());
        return mapToResponse(complaint);
    }

    // ======== ADMIN OPERATIONS ========

    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getAllComplaints(Pageable pageable) {
        return complaintRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Transactional
    public ComplaintResponse assignComplaint(Long id, AssignComplaintRequest request, CustomUserDetails currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        User officer = userRepository.findById(request.getOfficerId())
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + request.getOfficerId()));

        // Verify officer role
        if (officer.getRole().getName() != RoleName.OFFICER) {
            throw new IllegalStateException("User " + officer.getEmail() + " is not an OFFICER");
        }

        User admin = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setDepartment(department);
        complaint.setAssignedOfficer(officer);

        // Auto-transition from SUBMITTED to ASSIGNED
        if (oldStatus == ComplaintStatus.SUBMITTED) {
            complaint.setStatus(ComplaintStatus.ASSIGNED);
            createStatusHistory(complaint, oldStatus, ComplaintStatus.ASSIGNED,
                    "Assigned to " + officer.getFullName() + " (" + department.getName() + ")", admin);
        } else {
            createStatusHistory(complaint, oldStatus, oldStatus,
                    "Reassigned to " + officer.getFullName() + " (" + department.getName() + ")", admin);
        }

        complaintRepository.save(complaint);
        notificationService.notifyComplaintAssignment(complaint);

        log.info("Complaint {} assigned to officer {} by admin {}",
                complaint.getComplaintNumber(), officer.getEmail(), currentUser.getEmail());
        return mapToResponse(complaint);
    }

    // ======== HELPERS ========

    private String generateComplaintNumber() {
        Long maxId = complaintRepository.findMaxId();
        long nextNumber = maxId + 1;
        return String.format("GRV-%d-%06d", Year.now().getValue(), nextNumber);
    }

    private void validateStatusTransition(ComplaintStatus current, ComplaintStatus target) {
        boolean valid = switch (current) {
            case SUBMITTED -> target == ComplaintStatus.ASSIGNED;
            case ASSIGNED -> target == ComplaintStatus.IN_PROGRESS;
            case IN_PROGRESS -> target == ComplaintStatus.RESOLVED;
            case RESOLVED -> target == ComplaintStatus.CLOSED;
            case CLOSED -> false;
        };

        if (!valid) {
            throw new IllegalStateException(
                    "Invalid status transition: " + current + " → " + target);
        }
    }

    private void createStatusHistory(Complaint complaint, ComplaintStatus oldStatus,
                                     ComplaintStatus newStatus, String remarks, User changedBy) {
        ComplaintStatusHistory history = new ComplaintStatusHistory();
        history.setComplaint(complaint);
        history.setOldStatus(oldStatus != null ? oldStatus : newStatus);
        history.setNewStatus(newStatus);
        history.setRemarks(remarks);
        history.setChangedBy(changedBy);
        statusHistoryRepository.save(history);
    }

    private ComplaintResponse mapToResponse(Complaint c) {
        ComplaintResponse.ComplaintResponseBuilder builder = ComplaintResponse.builder()
                .id(c.getId())
                .complaintNumber(c.getComplaintNumber())
                .title(c.getTitle())
                .description(c.getDescription())
                .categoryId(c.getCategory().getId())
                .categoryName(c.getCategory().getName())
                .departmentId(c.getDepartment().getId())
                .departmentName(c.getDepartment().getName())
                .citizenId(c.getCitizen().getId())
                .citizenName(c.getCitizen().getFullName())
                .citizenEmail(c.getCitizen().getEmail())
                .districtId(c.getDistrict().getId())
                .districtName(c.getDistrict().getName())
                .locationAddress(c.getLocationAddress())
                .latitude(c.getLatitude())
                .longitude(c.getLongitude())
                .imageUrl(c.getImageUrl())
                .status(c.getStatus().name())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .resolvedAt(c.getResolvedAt());

        if (c.getAssignedOfficer() != null) {
            builder.assignedOfficerId(c.getAssignedOfficer().getId())
                    .assignedOfficerName(c.getAssignedOfficer().getFullName());
        }
        if (c.getRevenueDivision() != null) {
            builder.revenueDivisionId(c.getRevenueDivision().getId())
                    .revenueDivisionName(c.getRevenueDivision().getName());
        }
        if (c.getTaluk() != null) {
            builder.talukId(c.getTaluk().getId())
                    .talukName(c.getTaluk().getName());
        }
        if (c.getLocalBody() != null) {
            builder.localBodyId(c.getLocalBody().getId())
                    .localBodyName(c.getLocalBody().getName());
        }

        return builder.build();
    }

    private StatusHistoryResponse mapToHistoryResponse(ComplaintStatusHistory h) {
        return StatusHistoryResponse.builder()
                .id(h.getId())
                .oldStatus(h.getOldStatus().name())
                .newStatus(h.getNewStatus().name())
                .remarks(h.getRemarks())
                .changedByName(h.getChangedBy().getFullName())
                .changedAt(h.getChangedAt())
                .build();
    }
}
