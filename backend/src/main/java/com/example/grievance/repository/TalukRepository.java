package com.example.grievance.repository;

import com.example.grievance.entity.Taluk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TalukRepository extends JpaRepository<Taluk, Long> {
}
