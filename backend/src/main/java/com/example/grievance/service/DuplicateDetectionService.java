package com.example.grievance.service;

import com.example.grievance.dto.CheckDuplicateRequest;
import com.example.grievance.dto.CheckDuplicateResponse;
import com.example.grievance.dto.DuplicateCandidateResponse;
import com.example.grievance.entity.Complaint;
import com.example.grievance.entity.ComplaintDuplicateCandidate;
import com.example.grievance.entity.enums.CandidateStatus;
import com.example.grievance.entity.enums.ComplaintStatus;
import com.example.grievance.entity.enums.DuplicateStatus;
import com.example.grievance.repository.ComplaintDuplicateCandidateRepository;
import com.example.grievance.repository.ComplaintRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.*;

@Slf4j
@Service
public class DuplicateDetectionService {

    private static final double HIGH_CONFIDENCE_THRESHOLD = 0.82;
    private static final double POSSIBLE_DUPLICATE_THRESHOLD = 0.65;
    private static final double CLOSE_DISTANCE_KM = 1.5;

    private final ComplaintRepository complaintRepository;
    private final ComplaintDuplicateCandidateRepository candidateRepository;
    private final RestClient mlRestClient;
    private final ObjectMapper objectMapper;

    public DuplicateDetectionService(
            ComplaintRepository complaintRepository,
            ComplaintDuplicateCandidateRepository candidateRepository,
            RestClient.Builder restClientBuilder,
            @Value("${ai.service.url:http://localhost:5000}") String aiServiceUrl) {
        this.complaintRepository = complaintRepository;
        this.candidateRepository = candidateRepository;
        this.mlRestClient = restClientBuilder
                .baseUrl(aiServiceUrl)
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Checks for semantic duplicates of a proposed complaint.
     */
    @Transactional
    public CheckDuplicateResponse checkDuplicates(CheckDuplicateRequest request, Long excludeComplaintId) {
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            return CheckDuplicateResponse.builder()
                    .hasDuplicates(false)
                    .topMatchTier("NO_MATCH")
                    .topSimilarityScore(0.0)
                    .topSimilarityPercentage(0)
                    .candidates(Collections.emptyList())
                    .build();
        }

        // 1. Generate embedding for incoming complaint description via ML service
        List<Double> incomingEmbedding = fetchEmbedding(request.getDescription());
        if (incomingEmbedding == null || incomingEmbedding.isEmpty()) {
            log.warn("ML embedding service unavailable or returned empty vector for duplicate check.");
            return CheckDuplicateResponse.builder()
                    .hasDuplicates(false)
                    .topMatchTier("NO_MATCH")
                    .topSimilarityScore(0.0)
                    .topSimilarityPercentage(0)
                    .candidates(Collections.emptyList())
                    .build();
        }

        // 2. Fetch candidate complaints (prioritize active/unresolved in same district or overall)
        List<ComplaintStatus> activeStatuses = List.of(
                ComplaintStatus.SUBMITTED,
                ComplaintStatus.ASSIGNED,
                ComplaintStatus.IN_PROGRESS
        );

        List<Complaint> candidates = new ArrayList<>();
        if (request.getDistrictId() != null) {
            candidates.addAll(complaintRepository.findCandidatesByDistrictAndStatuses(request.getDistrictId(), activeStatuses));
        }

        // If district has very few candidates or coordinates are provided, include general active candidates
        if (candidates.size() < 10) {
            List<Complaint> additional = complaintRepository.findCandidatesByStatuses(activeStatuses);
            Set<Long> existingIds = new HashSet<>();
            for (Complaint c : candidates) existingIds.add(c.getId());
            for (Complaint c : additional) {
                if (!existingIds.contains(c.getId())) {
                    candidates.add(c);
                }
            }
        }

        // 3. Score and rank candidates
        List<DuplicateCandidateResponse> scoredCandidates = new ArrayList<>();

        for (Complaint candidate : candidates) {
            if (excludeComplaintId != null && candidate.getId().equals(excludeComplaintId)) {
                continue;
            }

            List<Double> candidateEmbedding = getOrGenerateEmbedding(candidate);
            if (candidateEmbedding == null || candidateEmbedding.isEmpty()) {
                continue;
            }

            double similarity = computeCosineSimilarity(incomingEmbedding, candidateEmbedding);

            // Compute distance if coordinates exist on both
            Double distanceKm = null;
            if (request.getLatitude() != null && request.getLongitude() != null
                    && candidate.getLatitude() != null && candidate.getLongitude() != null) {
                distanceKm = computeHaversineDistanceKm(
                        request.getLatitude(), request.getLongitude(),
                        candidate.getLatitude(), candidate.getLongitude()
                );
            }

            boolean categoryMatch = false;
            if (request.getCategoryId() != null && candidate.getCategory() != null) {
                categoryMatch = request.getCategoryId().equals(candidate.getCategory().getId());
            }

            // Determine Match Tier based on multi-evidence
            String matchTier = evaluateMatchTier(similarity, categoryMatch, distanceKm);

            if (!"NO_MATCH".equals(matchTier) || similarity >= 0.50) {
                scoredCandidates.add(DuplicateCandidateResponse.builder()
                        .complaintId(candidate.getId())
                        .complaintNumber(candidate.getComplaintNumber())
                        .title(candidate.getTitle())
                        .description(candidate.getDescription())
                        .categoryName(candidate.getCategory() != null ? candidate.getCategory().getName() : "General")
                        .departmentName(candidate.getDepartment() != null ? candidate.getDepartment().getName() : "General")
                        .status(candidate.getStatus().name())
                        .similarityScore(Math.round(similarity * 1000.0) / 1000.0)
                        .similarityPercentage((int) Math.round(similarity * 100.0))
                        .distanceKm(distanceKm != null ? Math.round(distanceKm * 10.0) / 10.0 : null)
                        .categoryMatch(categoryMatch)
                        .matchTier(matchTier)
                        .locationAddress(candidate.getLocationAddress())
                        .createdAt(candidate.getCreatedAt())
                        .build());
            }
        }

        // Sort descending by similarity
        scoredCandidates.sort((a, b) -> Double.compare(b.getSimilarityScore(), a.getSimilarityScore()));

        // Limit to top 5
        if (scoredCandidates.size() > 5) {
            scoredCandidates = scoredCandidates.subList(0, 5);
        }

        boolean hasDuplicates = !scoredCandidates.isEmpty() &&
                scoredCandidates.stream().anyMatch(c -> !"NO_MATCH".equals(c.getMatchTier()));

        String topTier = "NO_MATCH";
        Double topScore = 0.0;
        int topPercentage = 0;

        if (!scoredCandidates.isEmpty()) {
            topScore = scoredCandidates.get(0).getSimilarityScore();
            topPercentage = scoredCandidates.get(0).getSimilarityPercentage();
            topTier = scoredCandidates.get(0).getMatchTier();
        }

        return CheckDuplicateResponse.builder()
                .hasDuplicates(hasDuplicates)
                .topMatchTier(topTier)
                .topSimilarityScore(topScore)
                .topSimilarityPercentage(topPercentage)
                .candidates(scoredCandidates)
                .build();
    }

    /**
     * Determines match tier using cosine similarity, category, and geographical distance evidence.
     * Incorporates distance gating: distant complaints (> 10 km) cannot be duplicates of the same physical issue.
     */
    public String evaluateMatchTier(double similarity, boolean categoryMatch, Double distanceKm) {
        // If distance is known and far (> 10 km), cannot be the same physical civic issue
        if (distanceKm != null && distanceKm > 10.0) {
            return "NO_MATCH";
        }

        // High confidence: very high semantic similarity OR high similarity + close location & category
        if (similarity >= HIGH_CONFIDENCE_THRESHOLD && (distanceKm == null || distanceKm <= CLOSE_DISTANCE_KM)) {
            return "HIGH_CONFIDENCE";
        }
        if (similarity >= 0.74 && categoryMatch && distanceKm != null && distanceKm <= CLOSE_DISTANCE_KM) {
            return "HIGH_CONFIDENCE";
        }

        // Possible duplicate: moderate semantic similarity within reasonable distance
        if (similarity >= POSSIBLE_DUPLICATE_THRESHOLD && (distanceKm == null || distanceKm <= 5.0)) {
            return "POSSIBLE_DUPLICATE";
        }
        if (similarity >= 0.58 && categoryMatch && distanceKm != null && distanceKm <= 5.0) {
            return "POSSIBLE_DUPLICATE";
        }

        return "NO_MATCH";
    }

    /**
     * Records duplicate candidate relationships in the DB upon complaint creation.
     */
    @Transactional
    public void recordDuplicateCandidates(Complaint newComplaint, CheckDuplicateResponse duplicateCheck) {
        if (duplicateCheck == null || duplicateCheck.getCandidates() == null || duplicateCheck.getCandidates().isEmpty()) {
            return;
        }

        for (DuplicateCandidateResponse candidateDto : duplicateCheck.getCandidates()) {
            if ("NO_MATCH".equals(candidateDto.getMatchTier())) {
                continue;
            }

            complaintRepository.findById(candidateDto.getComplaintId()).ifPresent(candidateComplaint -> {
                ComplaintDuplicateCandidate cdc = new ComplaintDuplicateCandidate();
                cdc.setComplaint(newComplaint);
                cdc.setCandidateComplaint(candidateComplaint);
                cdc.setSimilarityScore(candidateDto.getSimilarityScore());
                cdc.setDistanceKm(candidateDto.getDistanceKm());
                cdc.setCategoryMatch(candidateDto.getCategoryMatch());
                cdc.setStatus(CandidateStatus.PENDING_REVIEW);
                candidateRepository.save(cdc);
            });
        }

        // Update complaint's duplicate status if high/possible match
        if (duplicateCheck.isHasDuplicates()) {
            DuplicateCandidateResponse top = duplicateCheck.getCandidates().get(0);
            newComplaint.setDuplicateStatus("HIGH_CONFIDENCE".equals(top.getMatchTier())
                    ? DuplicateStatus.POSSIBLE_DUPLICATE
                    : DuplicateStatus.POSSIBLE_DUPLICATE);
            newComplaint.setDuplicateSimilarityScore(top.getSimilarityScore());
            complaintRepository.save(newComplaint);
        }
    }

    /**
     * Fetches embedding vector from the Python ML service.
     */
    public List<Double> fetchEmbedding(String text) {
        try {
            Map<String, String> body = Map.of("text", text);
            String responseStr = mlRestClient.post()
                    .uri("/embed")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            if (responseStr != null) {
                JsonNode root = objectMapper.readTree(responseStr);
                if (root.has("embedding")) {
                    return objectMapper.convertValue(root.get("embedding"), new TypeReference<List<Double>>() {});
                }
            }
        } catch (Exception e) {
            log.error("Failed to generate embedding from ML service: {}", e.getMessage());
        }
        return Collections.emptyList();
    }

    /**
     * Gets cached embedding from complaint or generates and caches it lazily.
     */
    @Transactional
    public List<Double> getOrGenerateEmbedding(Complaint complaint) {
        if (complaint.getEmbeddingJson() != null && !complaint.getEmbeddingJson().trim().isEmpty()) {
            try {
                return objectMapper.readValue(complaint.getEmbeddingJson(), new TypeReference<List<Double>>() {});
            } catch (Exception e) {
                log.warn("Corrupted cached embedding for complaint {}: {}", complaint.getId(), e.getMessage());
            }
        }

        // Lazy generation for backward compatibility with existing complaints
        List<Double> embedding = fetchEmbedding(complaint.getDescription());
        if (embedding != null && !embedding.isEmpty()) {
            try {
                complaint.setEmbeddingJson(objectMapper.writeValueAsString(embedding));
                complaintRepository.save(complaint);
            } catch (Exception e) {
                log.warn("Failed to cache embedding for complaint {}", complaint.getId());
            }
        }
        return embedding;
    }

    /**
     * Computes cosine similarity between two normalized vectors.
     */
    public static double computeCosineSimilarity(List<Double> v1, List<Double> v2) {
        if (v1 == null || v2 == null || v1.isEmpty() || v2.isEmpty()) return 0.0;
        int n = Math.min(v1.size(), v2.size());
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < n; i++) {
            double a = v1.get(i);
            double b = v2.get(i);
            dotProduct += a * b;
            normA += a * a;
            normB += b * b;
        }
        if (normA == 0.0 || normB == 0.0) return 0.0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Computes great-circle distance between two GPS coordinates using Haversine formula in kilometers.
     */
    public static double computeHaversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0; // Earth radius in kilometers
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
