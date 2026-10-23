package com.example.grievance.service;

import com.example.grievance.dto.CheckDuplicateRequest;
import com.example.grievance.dto.CheckDuplicateResponse;
import com.example.grievance.entity.Complaint;
import com.example.grievance.entity.ComplaintCategory;
import com.example.grievance.entity.Department;
import com.example.grievance.entity.District;
import com.example.grievance.entity.enums.ComplaintStatus;
import com.example.grievance.repository.ComplaintDuplicateCandidateRepository;
import com.example.grievance.repository.ComplaintRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DuplicateDetectionServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private ComplaintDuplicateCandidateRepository candidateRepository;

    private DuplicateDetectionService duplicateDetectionService;

    @BeforeEach
    void setUp() {
        RestClient.Builder restClientBuilder = RestClient.builder();
        duplicateDetectionService = new DuplicateDetectionService(
                complaintRepository,
                candidateRepository,
                restClientBuilder,
                "http://localhost:5000"
        );
    }

    @Test
    @DisplayName("Cosine similarity should return 1.0 for identical vectors")
    void testCosineSimilarityIdentical() {
        List<Double> v1 = List.of(0.5, 0.5, 0.5, 0.5);
        List<Double> v2 = List.of(0.5, 0.5, 0.5, 0.5);

        double similarity = DuplicateDetectionService.computeCosineSimilarity(v1, v2);
        assertThat(similarity).isCloseTo(1.0, within(0.0001));
    }

    @Test
    @DisplayName("Cosine similarity should return 0.0 for orthogonal vectors")
    void testCosineSimilarityOrthogonal() {
        List<Double> v1 = List.of(1.0, 0.0);
        List<Double> v2 = List.of(0.0, 1.0);

        double similarity = DuplicateDetectionService.computeCosineSimilarity(v1, v2);
        assertThat(similarity).isCloseTo(0.0, within(0.0001));
    }

    @Test
    @DisplayName("Cosine similarity should safely handle empty or null vectors")
    void testCosineSimilarityNullOrEmpty() {
        assertThat(DuplicateDetectionService.computeCosineSimilarity(null, List.of(1.0))).isEqualTo(0.0);
        assertThat(DuplicateDetectionService.computeCosineSimilarity(Collections.emptyList(), List.of(1.0))).isEqualTo(0.0);
        assertThat(DuplicateDetectionService.computeCosineSimilarity(List.of(1.0), null)).isEqualTo(0.0);
    }

    @Test
    @DisplayName("Haversine distance should calculate accurate distance between GPS coordinates")
    void testHaversineDistance() {
        // Point A: Chennai Central (13.0827, 80.2707)
        // Point B: Chennai Airport (12.9941, 80.1709)
        // Distance is ~14.4 km
        double distance = DuplicateDetectionService.computeHaversineDistanceKm(
                13.0827, 80.2707,
                12.9941, 80.1709
        );

        assertThat(distance).isCloseTo(14.4, within(1.0));

        // Same location should be 0.0 km
        double samePoint = DuplicateDetectionService.computeHaversineDistanceKm(
                13.0827, 80.2707,
                13.0827, 80.2707
        );
        assertThat(samePoint).isCloseTo(0.0, within(0.0001));
    }

    @Test
    @DisplayName("evaluateMatchTier correctly classifies HIGH_CONFIDENCE, POSSIBLE_DUPLICATE, and NO_MATCH")
    void testEvaluateMatchTier() {
        // 1. High confidence semantic when nearby or location unknown
        assertThat(duplicateDetectionService.evaluateMatchTier(0.85, false, 0.5))
                .isEqualTo("HIGH_CONFIDENCE");
        assertThat(duplicateDetectionService.evaluateMatchTier(0.85, false, null))
                .isEqualTo("HIGH_CONFIDENCE");

        // 2. High confidence multi-evidence (0.76 >= 0.74, category match, distance 1.2 <= 1.5)
        assertThat(duplicateDetectionService.evaluateMatchTier(0.76, true, 1.2))
                .isEqualTo("HIGH_CONFIDENCE");

        // 3. Possible duplicate (0.75 without category match, within 5.0 km)
        assertThat(duplicateDetectionService.evaluateMatchTier(0.75, false, 4.0))
                .isEqualTo("POSSIBLE_DUPLICATE");

        // 4. Possible duplicate multi-evidence (0.60 >= 0.58, category match, distance 3.0 <= 5.0)
        assertThat(duplicateDetectionService.evaluateMatchTier(0.60, true, 3.0))
                .isEqualTo("POSSIBLE_DUPLICATE");

        // 5. Far location (> 10 km) returns NO_MATCH even if wording is identical
        assertThat(duplicateDetectionService.evaluateMatchTier(0.95, true, 25.0))
                .isEqualTo("NO_MATCH");

        // 6. Low similarity returns NO_MATCH
        assertThat(duplicateDetectionService.evaluateMatchTier(0.40, false, 1.0))
                .isEqualTo("NO_MATCH");
    }

    @Test
    @DisplayName("checkDuplicates returns NO_MATCH if description is empty or blank")
    void testCheckDuplicatesBlankDescription() {
        CheckDuplicateRequest request = CheckDuplicateRequest.builder()
                .description("   ")
                .build();

        CheckDuplicateResponse response = duplicateDetectionService.checkDuplicates(request, null);
        assertThat(response.isHasDuplicates()).isFalse();
        assertThat(response.getTopMatchTier()).isEqualTo("NO_MATCH");
        assertThat(response.getCandidates()).isEmpty();
    }

    @Test
    @DisplayName("getOrGenerateEmbedding reuses cached JSON embedding without calling external ML service")
    void testGetOrGenerateEmbeddingCached() {
        Complaint complaint = new Complaint();
        complaint.setId(101L);
        complaint.setDescription("Street light not working");
        complaint.setEmbeddingJson("[0.123, 0.456, 0.789]");

        List<Double> embedding = duplicateDetectionService.getOrGenerateEmbedding(complaint);

        assertThat(embedding).hasSize(3);
        assertThat(embedding.get(0)).isCloseTo(0.123, within(0.001));
        assertThat(embedding.get(1)).isCloseTo(0.456, within(0.001));
        assertThat(embedding.get(2)).isCloseTo(0.789, within(0.001));

        // Verify repository was not updated since cache was valid
        verify(complaintRepository, never()).save(any());
    }
}
