package com.example.grievance.ai;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiRecommendationController {
    
    private final AiRecommendationService aiRecommendationService;
    
    public AiRecommendationController(AiRecommendationService aiRecommendationService) {
        this.aiRecommendationService = aiRecommendationService;
    }
    
    @PostMapping("/recommend")
    public AiRecommendationResponse recommend(@RequestBody AiRecommendationRequest request) {
        return aiRecommendationService.recommend(request.getComplaint());
    }
}
