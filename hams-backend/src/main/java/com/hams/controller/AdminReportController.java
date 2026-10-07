package com.hams.controller;

import com.hams.dto.admin.AdminReportResponse;
import com.hams.enums.AppointmentStatus;
import com.hams.service.AdminReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/reports")
@Tag(name = "Admin Reports", description = "Reports and operational analytics for hospital administrators")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportController {

    private final AdminReportService adminReportService;

    public AdminReportController(AdminReportService adminReportService) {
        this.adminReportService = adminReportService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get aggregated reports summary", description = "Returns database-aggregated appointment summary, department breakdown, and doctor statistics filtered by date and status")
    public ResponseEntity<AdminReportResponse> getReportsSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) AppointmentStatus status
    ) {
        return ResponseEntity.ok(adminReportService.getReportsSummary(startDate, endDate, departmentId, doctorId, status));
    }
}
