package com.hams.controller;

import com.hams.dto.schedule.*;
import com.hams.service.ScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/doctors/{doctorId}")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin Doctor Schedule", description = "Admin endpoints for managing doctor schedules and leaves")
public class AdminScheduleController {

    private final ScheduleService scheduleService;

    public AdminScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping("/availability")
    @Operation(summary = "Get doctor schedule", description = "Retrieves weekly schedule for the specified doctor")
    public ResponseEntity<DoctorScheduleResponse> getDoctorSchedule(@PathVariable Long doctorId) {
        return ResponseEntity.ok(scheduleService.getDoctorSchedule(doctorId));
    }

    @PutMapping("/availability")
    @Operation(summary = "Update doctor schedule", description = "Updates weekly schedule for the specified doctor")
    public ResponseEntity<DoctorScheduleResponse> updateDoctorSchedule(
        @PathVariable Long doctorId,
        @Valid @RequestBody List<DayAvailabilityRequest> requests
    ) {
        return ResponseEntity.ok(scheduleService.updateDoctorSchedule(doctorId, requests));
    }

    @GetMapping("/leaves")
    @Operation(summary = "Get doctor leaves", description = "Lists scheduled leaves for the specified doctor")
    public ResponseEntity<List<DoctorLeaveResponse>> getDoctorLeaves(@PathVariable Long doctorId) {
        return ResponseEntity.ok(scheduleService.getDoctorLeaves(doctorId));
    }

    @PostMapping("/leaves")
    @Operation(summary = "Create doctor leave", description = "Records a leave period for the specified doctor")
    public ResponseEntity<DoctorLeaveResponse> createDoctorLeave(
        @PathVariable Long doctorId,
        @Valid @RequestBody DoctorLeaveRequest request
    ) {
        return ResponseEntity.ok(scheduleService.createDoctorLeave(doctorId, request));
    }

    @DeleteMapping("/leaves/{leaveId}")
    @Operation(summary = "Cancel doctor leave", description = "Cancels a scheduled leave for the specified doctor")
    public ResponseEntity<Void> cancelDoctorLeave(
        @PathVariable Long doctorId,
        @PathVariable Long leaveId
    ) {
        scheduleService.cancelDoctorLeave(doctorId, leaveId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/slots")
    @Operation(summary = "Inspect doctor slots", description = "Preview generated slots for a doctor on a specific date")
    public ResponseEntity<DoctorDaySlotsResponse> getDoctorSlots(
        @PathVariable Long doctorId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(scheduleService.getAvailableSlotsForDate(doctorId, date));
    }
}
