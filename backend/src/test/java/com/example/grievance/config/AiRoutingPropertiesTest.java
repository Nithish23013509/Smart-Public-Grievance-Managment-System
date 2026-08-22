package com.example.grievance.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
    "ai.routing.threshold.auto=0.85",
    "ai.routing.threshold.review=0.55",
    "ai.routing.default-review-department=Custom Review Board"
})
class AiRoutingPropertiesTest {

    @Autowired
    private AiRoutingProperties properties;

    @Test
    void shouldBindPropertiesSuccessfully() {
        assertThat(properties).isNotNull();
        assertThat(properties.getThreshold().getAuto()).isEqualTo(0.85);
        assertThat(properties.getThreshold().getReview()).isEqualTo(0.55);
        assertThat(properties.getDefaultReviewDepartment()).isEqualTo("Custom Review Board");
    }
}
