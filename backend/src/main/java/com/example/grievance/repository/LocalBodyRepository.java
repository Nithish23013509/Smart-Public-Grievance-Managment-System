package com.example.grievance.repository;

import com.example.grievance.entity.LocalBody;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocalBodyRepository extends JpaRepository<LocalBody, Long> {
}
