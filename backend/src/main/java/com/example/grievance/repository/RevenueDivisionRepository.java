package com.example.grievance.repository;

import com.example.grievance.entity.RevenueDivision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RevenueDivisionRepository extends JpaRepository<RevenueDivision, Long> {
}
