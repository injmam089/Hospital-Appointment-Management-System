package com.hams.controller;

import com.hams.dto.schedule.*;
import com.hams.entity.Doctor;
import com.hams.service.ScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctor")
@PreAuthorize("hasRole('DOCTOR')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Doctor Schedule", description = "Doctor availability and schedule management endpoints")
public class DoctorScheduleController {

    private final ScheduleService scheduleService;

    public DoctorScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping("/availability")
    @Operation(summary = "Get own weekly schedule", description = "Returns the weekly availability schedule with breaks for the authenticated doctor")
    public ResponseEntity<DoctorScheduleResponse> getOwnSchedule(Authentication authentication) {
        Doctor doctor = scheduleService.getDoctorByEmail(authentication.getName());
        return ResponseEntity.ok(scheduleService.getDoctorSchedule(doctor.getId()));
    }

    @PutMapping("/availability")
    @Operation(summary = "Update own weekly schedule", description = "Updates working days, hours, slot duration, and breaks for the authenticated doctor")
    public ResponseEntity<DoctorScheduleResponse> updateOwnSchedule(
        @Valid @RequestBody List<DayAvailabilityRequest> requests,
        Authentication authentication
    ) {
        Doctor doctor = scheduleService.getDoctorByEmail(authentication.getName());
        return ResponseEntity.ok(scheduleService.updateDoctorSchedule(doctor.getId(), requests));
    }

    @GetMapping("/leaves")
    @Operation(summary = "Get own leaves", description = "Lists all upcoming and past leaves for the authenticated doctor")
    public ResponseEntity<List<DoctorLeaveResponse>> getOwnLeaves(Authentication authentication) {
        Doctor doctor = scheduleService.getDoctorByEmail(authentication.getName());
        return ResponseEntity.ok(scheduleService.getDoctorLeaves(doctor.getId()));
    }

    @PostMapping("/leaves")
    @Operation(summary = "Submit a leave request", description = "Schedules a leave period during which no appointments will be booked")
    public ResponseEntity<DoctorLeaveResponse> createOwnLeave(
        @Valid @RequestBody DoctorLeaveRequest request,
        Authentication authentication
    ) {
        Doctor doctor = scheduleService.getDoctorByEmail(authentication.getName());
        return ResponseEntity.ok(scheduleService.createDoctorLeave(doctor.getId(), request));
    }

    @DeleteMapping("/leaves/{leaveId}")
    @Operation(summary = "Cancel a leave", description = "Cancels a scheduled leave for the authenticated doctor")
    public ResponseEntity<Void> cancelOwnLeave(
        @PathVariable Long leaveId,
        Authentication authentication
    ) {
        Doctor doctor = scheduleService.getDoctorByEmail(authentication.getName());
        scheduleService.cancelDoctorLeave(doctor.getId(), leaveId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/slots")
    @Operation(summary = "Preview generated slots", description = "Live preview of available time slots for the authenticated doctor on a specific date")
    public ResponseEntity<DoctorDaySlotsResponse> previewOwnSlots(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        Authentication authentication
    ) {
        Doctor doctor = scheduleService.getDoctorByEmail(authentication.getName());
        return ResponseEntity.ok(scheduleService.getAvailableSlotsForDate(doctor.getId(), date));
    }
}
