package com.example.grievance.controller;

import com.example.grievance.service.SpeechService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/speech")
@CrossOrigin
public class SpeechController {

    private final SpeechService speechService;

    public SpeechController(SpeechService speechService) {
        this.speechService = speechService;
    }

    @PostMapping("/transcribe")
    public ResponseEntity<?> transcribe(
            @RequestParam("file") MultipartFile file) {

        try {

            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "error", "Audio file is empty"
                        ));
            }

            String text = speechService.transcribe(file);

            return ResponseEntity.ok(
                    Map.of(
                            "text", text
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error", e.getMessage()
                    ));
        }
    }
}
