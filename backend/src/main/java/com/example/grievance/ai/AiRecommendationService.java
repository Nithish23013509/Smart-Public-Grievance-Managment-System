package com.example.grievance.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import io.micrometer.observation.Observation;
import io.micrometer.observation.ObservationRegistry;
import lombok.extern.slf4j.Slf4j;

import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.web.client.RestClientException;

@Slf4j
@Service
public class AiRecommendationService {
    private final RestClient restClient;
    private final ObservationRegistry observationRegistry;

    public AiRecommendationService(RestClient.Builder restClientBuilder, 
                                   ObservationRegistry observationRegistry,
                                   @Value("${ai.service.url:http://localhost:5000}") String aiServiceUrl) {
        this.restClient = restClientBuilder
                .baseUrl(aiServiceUrl)
                .build();
        this.observationRegistry = observationRegistry;
    }

    @Retryable(
        retryFor = {RestClientException.class, java.net.ConnectException.class, java.io.IOException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public AiRecommendationResponse recommend(String complaint) {
        return Observation.createNotStarted("ai.recommendation", observationRegistry)
                .contextualName("ai-recommendation-call")
                .observe(() -> {
                    log.info("Making AI recommendation request for complaint length: {}", complaint.length());
                    AiRecommendationRequest request = new AiRecommendationRequest();
                    request.setComplaint(complaint);
                    
                    AiRecommendationResponse response = restClient
                            .post()
                            .uri("/recommend")
                            .body(request)
                            .retrieve()
                            .body(AiRecommendationResponse.class);
                            
                    log.info("AI prediction received - Category: {}, Department: {}, Confidence: {}", 
                        response.getCategory(), response.getDepartment(), response.getConfidence());
                        
                    return response;
                });
    }

    @Recover
    public AiRecommendationResponse recover(Exception e, String complaint) {
        log.error("AI Recommendation Service is down or failed after retries. Fallback triggered for complaint: '{}'. Error: {}", 
            complaint, e.getMessage());
            
        // Return null to signify fallback
        return null;
    }
}
