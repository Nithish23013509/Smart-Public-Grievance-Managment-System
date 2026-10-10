package com.example.grievance.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SpeechService {

    private static final Logger log = LoggerFactory.getLogger(SpeechService.class);
    private static final String GROK_STT_URL = "https://api.x.ai/v1/stt";

    private final String apiKey;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public SpeechService(@Value("${xai.api-key:}") String apiKey) {
        this.apiKey = apiKey;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public String transcribe(MultipartFile file) throws Exception {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("XAI_API_KEY is not configured");
        }

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Audio file is empty");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.setBearerAuth(apiKey);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        
        ByteArrayResource fileAsResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                // Must provide a filename so RestTemplate knows it's a file
                String originalName = file.getOriginalFilename();
                return (originalName != null && !originalName.isBlank()) ? originalName : "audio.wav";
            }
        };

        body.add("file", fileAsResource);
        body.add("model", "grok-voice-transcribe-2.0");

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    GROK_STT_URL,
                    requestEntity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                if (root.has("text")) {
                    return root.get("text").asText();
                } else {
                    log.error("Grok API response missing 'text' field");
                    throw new RuntimeException("Unexpected API response format");
                }
            } else {
                log.error("Grok API error: {}", response.getStatusCode());
                throw new RuntimeException("Speech-to-text API failed");
            }
        } catch (HttpClientErrorException e) {
            log.error("Grok API client error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Speech-to-text service error: " + e.getStatusCode());
        } catch (Exception e) {
            log.error("Failed to call Grok API: {}", e.getMessage());
            throw new RuntimeException("Failed to transcribe audio");
        }
    }
}
