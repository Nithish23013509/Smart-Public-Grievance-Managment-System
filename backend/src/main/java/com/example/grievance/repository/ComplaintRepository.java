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
}
