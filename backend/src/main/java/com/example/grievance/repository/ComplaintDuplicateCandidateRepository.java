package com.example.grievance.repository;

import com.example.grievance.entity.ComplaintDuplicateCandidate;
import com.example.grievance.entity.enums.CandidateStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintDuplicateCandidateRepository extends JpaRepository<ComplaintDuplicateCandidate, Long> {

    List<ComplaintDuplicateCandidate> findByComplaintIdOrderBySimilarityScoreDesc(Long complaintId);

    Page<ComplaintDuplicateCandidate> findByStatus(CandidateStatus status, Pageable pageable);

    List<ComplaintDuplicateCandidate> findByCandidateComplaintId(Long candidateComplaintId);

    @Query("SELECT cdc FROM ComplaintDuplicateCandidate cdc " +
           "JOIN FETCH cdc.complaint " +
           "JOIN FETCH cdc.candidateComplaint " +
           "WHERE cdc.complaint.id = :complaintId " +
           "ORDER BY cdc.similarityScore DESC")
    List<ComplaintDuplicateCandidate> findWithDetailsByComplaintId(Long complaintId);
}
