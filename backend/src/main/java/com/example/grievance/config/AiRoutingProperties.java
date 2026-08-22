package com.example.grievance.config;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

@Data
@Validated
@Configuration
@ConfigurationProperties(prefix = "ai.routing")
public class AiRoutingProperties {
    
    @NotNull
    private Threshold threshold = new Threshold();

    @NotBlank
    private String defaultReviewDepartment = "Review Board";

    @Data
    public static class Threshold {
        @Min(value = 0, message = "Auto threshold must be >= 0")
        @Max(value = 1, message = "Auto threshold must be <= 1")
        private double auto = 0.70;

        @Min(value = 0, message = "Review threshold must be >= 0")
        @Max(value = 1, message = "Review threshold must be <= 1")
        private double review = 0.40;
    }
}
