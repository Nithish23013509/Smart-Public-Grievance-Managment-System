package com.example.grievance.component;

import com.example.grievance.entity.ComplaintCategory;
import com.example.grievance.entity.Department;
import com.example.grievance.entity.District;
import com.example.grievance.entity.Role;
import com.example.grievance.entity.User;
import com.example.grievance.entity.enums.RoleName;
import com.example.grievance.repository.ComplaintCategoryRepository;
import com.example.grievance.repository.DepartmentRepository;
import com.example.grievance.repository.DistrictRepository;
import com.example.grievance.repository.RoleRepository;
import com.example.grievance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final ComplaintCategoryRepository categoryRepository;
    private final DistrictRepository districtRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedRoles();
        seedDistrict();
        seedDepartments();
        seedCategories();
        seedTestUsers();
    }

    private void seedRoles() {
        for (RoleName roleName : RoleName.values()) {
            if (!roleRepository.existsByName(roleName)) {
                Role role = new Role();
                role.setName(roleName);
                roleRepository.save(role);
                log.info("Seeded role: {}", roleName);
            }
        }
    }

    private void seedDistrict() {
        if (districtRepository.count() == 0) {
            District district = new District();
            district.setName("Chennai");
            district.setCode("CHN");
            districtRepository.save(district);
            log.info("Seeded district: Chennai");
        }
    }

    private void seedDepartments() {
        if (departmentRepository.count() == 0) {
            String[][] deptData = {
                {"Municipal Administration and Water Supply", "Municipal services, water supply, sanitation and waste management"},
                {"Rural Development and Panchayat Raj", "Rural development and Panchayat services"},
                {"Highways and Minor Ports", "Highways and road infrastructure"},
                {"Public Works Department", "Government buildings and public infrastructure"},
                {"Revenue and Disaster Management", "Revenue, land records and disaster management services"},
                {"Health and Family Welfare", "Government healthcare services"},
                {"School Education", "Government school education services"},
                {"Higher Education", "Higher education services"},
                {"Energy", "Electricity and energy services"},
                {"Transport", "Public transportation services"},
                {"Agriculture and Farmers Welfare", "Agriculture and farmer services"},
                {"Environment, Climate Change and Forests", "Environmental and forest-related services"},
                {"Social Welfare and Women Empowerment", "Social welfare services"},
                {"Animal Husbandry and Fisheries", "Animal husbandry and fisheries services"},
                {"Labour Welfare and Skill Development", "Labour and employment-related services"}
            };
            
            for (String[] data : deptData) {
                Department dept = new Department();
                dept.setName(data[0]);
                dept.setDescription(data[1]);
                dept.setActive(true);
                departmentRepository.save(dept);
            }
            log.info("Seeded {} departments", deptData.length);
        }
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            List<String> categories = List.of(
                    "Roads",
                    "Water Supply",
                    "Street Lights",
                    "Garbage",
                    "Drainage",
                    "Other"
            );
            for (String catName : categories) {
                ComplaintCategory category = new ComplaintCategory();
                category.setName(catName);
                categoryRepository.save(category);
            }
            log.info("Seeded {} complaint categories", categories.size());
        }
    }

    /**
     * DEVELOPMENT TEST USERS ONLY.
     * These accounts are for testing role-based access during development.
     * They must be removed or disabled before production deployment.
     */
    private void seedTestUsers() {
        createTestUserIfNotExists(
                "Test Citizen", "citizen@test.com", "9000000001",
                "Password@123", RoleName.CITIZEN, null);

        // Assign Test Officer to the first department
        Department firstDept = departmentRepository.findAll().stream().findFirst().orElse(null);
        
        createTestUserIfNotExists(
                "Test Officer", "officer@test.com", "9000000002",
                "Password@123", RoleName.OFFICER, firstDept);

        createTestUserIfNotExists(
                "Test Admin", "admin@test.com", "9000000003",
                "Password@123", RoleName.ADMIN, null);
    }

    private void createTestUserIfNotExists(String fullName, String email, String mobile,
                                           String rawPassword, RoleName roleName, Department department) {
        if (!userRepository.existsByEmail(email)) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));

            User user = new User();
            user.setFullName(fullName);
            user.setEmail(email);
            user.setMobileNumber(mobile);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setRole(role);
            user.setEnabled(true);
            user.setDepartment(department);

            userRepository.save(user);
            log.info("[DEV] Seeded test user: {} ({})", email, roleName);
        }
    }
}
