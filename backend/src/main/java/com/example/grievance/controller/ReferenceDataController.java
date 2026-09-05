package com.example.grievance.controller;

import com.example.grievance.dto.ReferenceItemDTO;
import com.example.grievance.dto.ApiResponse;
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
        private final RevenueDivisionRepository revenueDivisionRepository;
        private final TalukRepository talukRepository;
        private final LocalBodyRepository localBodyRepository;

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

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Departments retrieved successfully",
                                                departments));
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

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Categories retrieved successfully",
                                                categories));
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

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Districts retrieved successfully",
                                                districts));
        }

        @GetMapping("/revenue-divisions/{districtId}")
        public ResponseEntity<ApiResponse<List<ReferenceItemDTO>>> getRevenueDivisions(
                        @PathVariable Long districtId) {

                List<ReferenceItemDTO> divisions = revenueDivisionRepository
                                .findByDistrictId(districtId)
                                .stream()
                                .map(r -> ReferenceItemDTO.builder()
                                                .id(r.getId())
                                                .name(r.getName())
                                                .type("REVENUE_DIVISION")
                                                .build())
                                .collect(Collectors.toList());

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Revenue divisions retrieved successfully",
                                                divisions));
        }

        @GetMapping("/taluks/{revenueDivisionId}")
        public ResponseEntity<ApiResponse<List<ReferenceItemDTO>>> getTaluks(
                        @PathVariable Long revenueDivisionId) {

                List<ReferenceItemDTO> taluks = talukRepository.findByRevenueDivision_Id(revenueDivisionId)
                                .stream()
                                .map(t -> ReferenceItemDTO.builder()
                                                .id(t.getId())
                                                .name(t.getName())
                                                .type("TALUK")
                                                .build())
                                .collect(Collectors.toList());

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Taluks retrieved successfully",
                                                taluks));
        }

        @GetMapping("/local-bodies/{talukId}")
        public ResponseEntity<ApiResponse<List<ReferenceItemDTO>>> getLocalBodies(
                        @PathVariable Long talukId) {

                List<ReferenceItemDTO> localBodies = localBodyRepository
                                .findByTalukId(talukId)
                                .stream()
                                .map(l -> ReferenceItemDTO.builder()
                                                .id(l.getId())
                                                .name(l.getName())
                                                .type("LOCAL_BODY")
                                                .build())
                                .collect(Collectors.toList());

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Local bodies retrieved successfully",
                                                localBodies));
        }

@GetMapping("/districts/by-name")
public ResponseEntity<ApiResponse<ReferenceItemDTO>> getDistrictByName(
        @RequestParam String name) {

    return districtRepository.findByNameIgnoreCase(name)
            .map(district -> ResponseEntity.ok(
                    ApiResponse.success(
                            "District found",
                            ReferenceItemDTO.builder()
                                    .id(district.getId())
                                    .name(district.getName())
                                    .code(district.getCode())
                                    .type("DISTRICT")
                                    .build()
                    )
            ))
            .orElseGet(() -> ResponseEntity.notFound().build());
}
}