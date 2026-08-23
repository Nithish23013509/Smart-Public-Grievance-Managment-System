package com.example.grievance.controller;

import com.example.grievance.dto.ReferenceItemDTO;
import com.example.grievance.dto.ApiResponse;
import com.example.grievance.entity.*;
import com.example.grievance.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reference")
@RequiredArgsConstructor
public class ReferenceDataController {

    private final DepartmentRepository departmentRepository;
    private final ComplaintCategoryRepository categoryRepository;
    private final DistrictRepository districtRepository;

    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<ReferenceItemDTO>>> getDepartments() {
        List<ReferenceItemDTO> departments = departmentRepository.findAll().stream()
                .map(d -> ReferenceItemDTO.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .code(d.getCode())
                        .type("DEPARTMENT")
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Departments retrieved successfully", departments));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<ReferenceItemDTO>>> getCategories() {
        List<ReferenceItemDTO> categories = categoryRepository.findAll().stream()
                .map(c -> ReferenceItemDTO.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .type("CATEGORY")
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }

    @GetMapping("/districts")
    public ResponseEntity<ApiResponse<List<ReferenceItemDTO>>> getDistricts() {
        List<ReferenceItemDTO> districts = districtRepository.findAll().stream()
                .map(d -> ReferenceItemDTO.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .code(d.getCode())
                        .type("DISTRICT")
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Districts retrieved successfully", districts));
    }
}
