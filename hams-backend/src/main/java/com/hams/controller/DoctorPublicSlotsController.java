package com.hams.controller;

import com.hams.dto.schedule.DoctorDaySlotsResponse;
import com.hams.dto.schedule.DoctorScheduleResponse;
import com.hams.service.ScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/doctors")
@Tag(name = "Doctor Availability Public", description = "Public endpoints for doctor slots and schedule")
public class DoctorPublicSlotsController {

    private final ScheduleService scheduleService;

    public DoctorPublicSlotsController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping("/{id}/slots")
    @Operation(summary = "Get available slots for doctor and date", description = "Calculates available consultation slots considering doctor schedule, slot duration, breaks, and leaves")
    public ResponseEntity<DoctorDaySlotsResponse> getSlots(
        @PathVariable Long id,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(scheduleService.getPublicAvailableSlotsForDate(id, date));
    }

    @GetMapping("/{id}/availability")
    @Operation(summary = "Get weekly schedule for doctor", description = "Retrieves public weekly working schedule")
    public ResponseEntity<DoctorScheduleResponse> getAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.getPublicDoctorSchedule(id));
    }
}
