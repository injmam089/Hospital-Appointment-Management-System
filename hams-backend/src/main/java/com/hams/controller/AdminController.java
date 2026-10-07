package com.hams.controller;

import com.hams.dto.admin.AdminDashboardStatsResponse;
import com.hams.enums.Role;
import com.hams.repository.DepartmentRepository;
import com.hams.repository.DoctorRepository;
import com.hams.repository.PatientRepository;
import com.hams.repository.UserRepository;
import com.hams.service.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Endpoints restricted to hospital administrators")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DepartmentRepository departmentRepository;
    private final AdminDashboardService adminDashboardService;

    public AdminController(
            UserRepository userRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            DepartmentRepository departmentRepository,
            AdminDashboardService adminDashboardService
    ) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.departmentRepository = departmentRepository;
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get Hospital Statistics", description = "Returns high-level statistics for hospital administrators")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(Map.of(
                "totalPatients", patientRepository.count(),
                "totalDoctors", doctorRepository.count(),
                "verifiedDoctors", doctorRepository.countByVerifiedTrue(),
                "totalDepartments", departmentRepository.count(),
                "totalUsers", userRepository.count(),
                "totalAdmins", userRepository.countByRole(Role.ADMIN)
        ));
    }

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get Real DB-Backed Admin Dashboard Stats", description = "Returns full operational metrics, status breakdown, and charts data")
    public ResponseEntity<AdminDashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminDashboardService.getDashboardStats());
    }
}

