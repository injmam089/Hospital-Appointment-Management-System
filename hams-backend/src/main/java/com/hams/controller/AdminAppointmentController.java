package com.hams.controller;

import com.hams.dto.admin.AdminAppointmentResponse;
import com.hams.enums.AppointmentStatus;
import com.hams.service.AdminAppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/appointments")
@Tag(name = "Admin Appointments", description = "Global appointment administration for hospital administrators")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAppointmentController {

    private final AdminAppointmentService adminAppointmentService;

    public AdminAppointmentController(AdminAppointmentService adminAppointmentService) {
        this.adminAppointmentService = adminAppointmentService;
    }

    @GetMapping
    @Operation(summary = "Search and list all appointments", description = "Returns paginated list of appointments with filters for reference, patient, doctor, department, status, and date range")
    public ResponseEntity<Page<AdminAppointmentResponse>> getAppointments(
            @RequestParam(required = false) String ref,
            @RequestParam(required = false) String patientSearch,
            @RequestParam(required = false) String doctorSearch,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 20, sort = "appointmentDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(adminAppointmentService.getAppointments(
                ref, patientSearch, doctorSearch, departmentId, status, startDate, endDate, pageable
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get appointment details by ID", description = "Returns complete appointment information for administrative audit")
    public ResponseEntity<AdminAppointmentResponse> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(adminAppointmentService.getAppointmentById(id));
    }
}
