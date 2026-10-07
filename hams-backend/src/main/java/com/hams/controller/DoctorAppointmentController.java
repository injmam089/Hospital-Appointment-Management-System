package com.hams.controller;

import com.hams.dto.appointment.AppointmentResponse;
import com.hams.enums.AppointmentStatus;
import com.hams.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctor/appointments")
@PreAuthorize("hasRole('DOCTOR')")
@Tag(name = "Doctor Appointments", description = "Endpoints for doctor appointment schedules, patient queue, and appointment details")
public class DoctorAppointmentController {

    private final AppointmentService appointmentService;

    public DoctorAppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    @Operation(summary = "List doctor appointments", description = "Retrieves appointments assigned to the authenticated doctor, optionally filtered by date or status")
    public ResponseEntity<List<AppointmentResponse>> getAppointments(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(userDetails.getUsername(), date, status));
    }

    @GetMapping("/today")
    @Operation(summary = "Get today's appointments", description = "Retrieves all appointments scheduled for today for the doctor queue")
    public ResponseEntity<List<AppointmentResponse>> getTodayAppointments(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(appointmentService.getDoctorTodayAppointments(userDetails.getUsername()));
    }

    @GetMapping("/{appointmentId}")
    @Operation(summary = "Get appointment details", description = "Retrieves details of a specific appointment belonging to the doctor")
    public ResponseEntity<AppointmentResponse> getAppointmentById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(appointmentService.getDoctorAppointmentById(userDetails.getUsername(), appointmentId));
    }
}
