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
    private static final String GROQ_STT_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

    private final String apiKey;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public SpeechService(@Value("${xai.api-key:${groq.api-key:}}") String apiKey) {
        this.apiKey = apiKey;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public String transcribe(MultipartFile file) throws Exception {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Speech-to-text API key is not configured");
        }

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Audio file is empty");
        }

        boolean isGroq = apiKey.startsWith("gsk_");
        String endpoint = isGroq ? GROQ_STT_URL : GROK_STT_URL;
        String model = isGroq ? "whisper-large-v3-turbo" : "grok-voice-transcribe-2.0";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.setBearerAuth(apiKey);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        
        ByteArrayResource fileAsResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                String originalName = file.getOriginalFilename();
                return (originalName != null && !originalName.isBlank()) ? originalName : "recording.webm";
            }
        };

        body.add("file", fileAsResource);
        body.add("model", model);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    endpoint,
                    requestEntity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                if (root.has("text")) {
                    return root.get("text").asText();
                } else {
                    log.error("Speech API response missing 'text' field: {}", response.getBody());
                    throw new RuntimeException("Unexpected API response format");
                }
            } else {
                log.error("Speech API error: {}", response.getStatusCode());
                throw new RuntimeException("Speech-to-text API failed");
            }
        } catch (HttpClientErrorException e) {
            log.error("Speech API client error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Speech-to-text service error: " + e.getStatusCode());
        } catch (Exception e) {
            log.error("Failed to call Speech API: {}", e.getMessage());
            throw new RuntimeException("Failed to transcribe audio");
        }
    }
}
