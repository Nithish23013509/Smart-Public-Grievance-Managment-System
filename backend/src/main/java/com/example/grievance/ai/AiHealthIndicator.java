package com.example.grievance.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component("pythonAiService")
public class AiHealthIndicator implements HealthIndicator {

    private final RestClient restClient;
    private final String aiServiceUrl;

    public AiHealthIndicator(RestClient.Builder restClientBuilder,
                             @Value("${ai.service.url:http://localhost:5000}") String aiServiceUrl) {
        this.restClient = restClientBuilder.build();
        this.aiServiceUrl = aiServiceUrl;
    }

    @Override
    public Health health() {
        try {
            // Assume the Python service has a GET /health endpoint
            var response = restClient.get()
                    .uri(aiServiceUrl + "/health")
                    .retrieve()
                    .toBodilessEntity();
            
            if (response.getStatusCode().is2xxSuccessful()) {
                return Health.up().withDetail("service", "Python ML API").withDetail("url", aiServiceUrl).build();
            } else {
                return Health.down().withDetail("status", response.getStatusCode()).build();
            }
        } catch (Exception e) {
            return Health.down(e).withDetail("url", aiServiceUrl).build();
        }
    }
}
