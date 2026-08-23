package com.example.grievance.controller;

import com.example.grievance.dto.ApiResponse;
import com.example.grievance.dto.OfficerDTO;
import com.example.grievance.entity.User;
import com.example.grievance.entity.enums.RoleName;
import com.example.grievance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/officers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OfficerDTO>>> getOfficersByDepartment(
            @RequestParam(required = false) Long departmentId) {
        
        List<User> officers;
        if (departmentId != null) {
            officers = userRepository.findByRole_NameAndDepartmentId(RoleName.OFFICER, departmentId);
        } else {
            // For now, if no department, return all officers or an empty list. 
            // Let's just return all officers.
            // Wait, we need a custom query or just filter in memory for simplicity since it's a small app.
            officers = userRepository.findAll().stream()
                    .filter(u -> u.getRole().getName() == RoleName.OFFICER)
                    .collect(Collectors.toList());
        }

        List<OfficerDTO> officerDTOs = officers.stream()
                .map(u -> OfficerDTO.builder()
                        .id(u.getId())
                        .fullName(u.getFullName())
                        .email(u.getEmail())
                        .role(u.getRole().getName().name())
                        .departmentId(u.getDepartment() != null ? u.getDepartment().getId() : null)
                        .departmentName(u.getDepartment() != null ? u.getDepartment().getName() : null)
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Officers retrieved successfully", officerDTOs));
    }
}
