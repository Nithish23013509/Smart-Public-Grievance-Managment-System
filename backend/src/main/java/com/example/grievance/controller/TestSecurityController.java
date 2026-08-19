package com.example.grievance.controller;

import com.example.grievance.security.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * TEMPORARY controller for testing authentication and role-based authorization.
 * Remove after Step 4 verification is complete.
 */
@RestController
@RequestMapping("/api/test")
public class TestSecurityController {

    @GetMapping("/public")
    public ResponseEntity<Map<String, String>> publicEndpoint() {
        return ResponseEntity.ok(Map.of("message", "This is a PUBLIC endpoint. No authentication required."));
    }

    @GetMapping("/authenticated")
    public ResponseEntity<Map<String, Object>> authenticatedEndpoint(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(Map.of(
                "message", "You are authenticated!",
                "email", userDetails.getEmail(),
                "role", userDetails.getRoleName().name()
        ));
    }

    @GetMapping("/citizen")
    public ResponseEntity<Map<String, String>> citizenEndpoint() {
        return ResponseEntity.ok(Map.of("message", "Welcome CITIZEN! You have CITIZEN access."));
    }

    @GetMapping("/officer")
    public ResponseEntity<Map<String, String>> officerEndpoint() {
        return ResponseEntity.ok(Map.of("message", "Welcome OFFICER! You have OFFICER access."));
    }

    @GetMapping("/admin")
    public ResponseEntity<Map<String, String>> adminEndpoint() {
        return ResponseEntity.ok(Map.of("message", "Welcome ADMIN! You have ADMIN access."));
    }
}
