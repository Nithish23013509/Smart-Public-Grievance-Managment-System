package com.example.grievance.repository;

import com.example.grievance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByMobileNumber(String mobileNumber);
    java.util.List<User> findByRole_NameAndDepartmentId(com.example.grievance.entity.enums.RoleName roleName, Long departmentId);
    java.util.List<User> findByRole_Name(com.example.grievance.entity.enums.RoleName roleName);
}
