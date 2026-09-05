package com.example.grievance.repository;

import com.example.grievance.entity.LocalBody;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocalBodyRepository extends JpaRepository<LocalBody, Long> {

    List<LocalBody> findByTalukId(Long talukId);

    List<LocalBody> findByDistrictId(Long districtId);

}