package com.example.grievance.repository;

import com.example.grievance.entity.Taluk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TalukRepository extends JpaRepository<Taluk, Long> {

    List<Taluk> findByRevenueDivision_Id(Long revenueDivisionId);

    List<Taluk> findByDistrict_Id(Long districtId);
}