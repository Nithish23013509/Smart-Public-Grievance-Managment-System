package com.example.grievance.repository;

import com.example.grievance.entity.Complaint;
import com.example.grievance.entity.enums.ComplaintStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    Page<Complaint> findByCitizenId(Long citizenId, Pageable pageable);

    Page<Complaint> findByAssignedOfficerId(Long officerId, Pageable pageable);

    Page<Complaint> findByAssignedOfficerIdAndStatus(Long officerId, ComplaintStatus status, Pageable pageable);

    Optional<Complaint> findByComplaintNumber(String complaintNumber);

    @Query("SELECT COALESCE(MAX(c.id), 0) FROM Complaint c")
    Long findMaxId();

    Page<Complaint> findByAiDecisionIn(java.util.List<String> decisions, Pageable pageable);

    Page<Complaint> findByAiDecisionInAndStatus(java.util.List<String> decisions, ComplaintStatus status, Pageable pageable);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.aiDecision IS NOT NULL")
    long countTotalAiRoutedComplaints();

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.aiDecision = :decision OR c.aiDecision = :decisionReviewed")
    long countByAiDecision(String decision, String decisionReviewed);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.aiReviewAccepted = :accepted")
    long countByAiReviewAccepted(Boolean accepted);

    @Query("SELECT AVG(c.aiConfidence) FROM Complaint c WHERE c.aiConfidence IS NOT NULL")
    Double getAverageAiConfidence();

    @Query("SELECT c.department.name as name, COUNT(c) as total FROM Complaint c WHERE c.aiDecision IS NOT NULL GROUP BY c.department.name")
    java.util.List<Object[]> getDepartmentWiseAiDistribution();

    @Query("SELECT c.category.name as name, COUNT(c) as total FROM Complaint c WHERE c.aiDecision IS NOT NULL GROUP BY c.category.name")
    java.util.List<Object[]> getCategoryWiseAiDistribution();

    java.util.List<Complaint> findByAiDecisionIsNotNull();
}
