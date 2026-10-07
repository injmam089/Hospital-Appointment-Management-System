package com.hams.controller;

import com.hams.dto.appointment.AppointmentResponse;
import com.hams.dto.appointment.BookAppointmentRequest;
import com.hams.dto.appointment.CancelAppointmentRequest;
import com.hams.dto.appointment.RescheduleAppointmentRequest;
import com.hams.enums.AppointmentStatus;
import com.hams.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient/appointments")
@PreAuthorize("hasRole('PATIENT')")
@Tag(name = "Patient Appointments", description = "Endpoints for patient appointment booking, rescheduling, and cancellation")
public class PatientAppointmentController {

    private final AppointmentService appointmentService;

    public PatientAppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    @Operation(summary = "Book an appointment", description = "Books a doctor slot with backend re-validation and double-booking protection")
    public ResponseEntity<AppointmentResponse> bookAppointment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BookAppointmentRequest request) {
        AppointmentResponse response = appointmentService.bookAppointment(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "List patient appointments", description = "Retrieves all appointments for the authenticated patient, optionally filtered by status")
    public ResponseEntity<List<AppointmentResponse>> getAppointments(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.getPatientAppointments(userDetails.getUsername(), status));
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming appointment", description = "Retrieves the next upcoming active appointment for the patient dashboard")
    public ResponseEntity<AppointmentResponse> getUpcomingAppointment(
            @AuthenticationPrincipal UserDetails userDetails) {
        AppointmentResponse upcoming = appointmentService.getPatientUpcomingAppointment(userDetails.getUsername());
        return ResponseEntity.ok(upcoming);
    }

    @GetMapping("/{appointmentId}")
    @Operation(summary = "Get appointment details", description = "Retrieves full details of a specific appointment owned by the patient")
    public ResponseEntity<AppointmentResponse> getAppointmentById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(appointmentService.getPatientAppointmentById(userDetails.getUsername(), appointmentId));
    }

    @PatchMapping("/{appointmentId}/cancel")
    @Operation(summary = "Cancel appointment", description = "Cancels an active appointment, releasing the slot for reuse")
    public ResponseEntity<AppointmentResponse> cancelAppointmentPatch(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long appointmentId,
            @RequestBody(required = false) CancelAppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(userDetails.getUsername(), appointmentId, request));
    }

    @DeleteMapping("/{appointmentId}")
    @Operation(summary = "Cancel appointment (DELETE)", description = "REST DELETE mapping to cancel an appointment, releasing the slot")
    public ResponseEntity<AppointmentResponse> cancelAppointmentDelete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long appointmentId,
            @RequestBody(required = false) CancelAppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(userDetails.getUsername(), appointmentId, request));
    }

    @PatchMapping("/{appointmentId}/reschedule")
    @Operation(summary = "Reschedule appointment (PATCH)", description = "Reschedules an appointment to a new date and time with full re-validation")
    public ResponseEntity<AppointmentResponse> rescheduleAppointmentPatch(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long appointmentId,
            @Valid @RequestBody RescheduleAppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.rescheduleAppointment(userDetails.getUsername(), appointmentId, request));
    }

    @PutMapping("/{appointmentId}/reschedule")
    @Operation(summary = "Reschedule appointment (PUT)", description = "REST PUT mapping to reschedule an appointment")
    public ResponseEntity<AppointmentResponse> rescheduleAppointmentPut(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long appointmentId,
            @Valid @RequestBody RescheduleAppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.rescheduleAppointment(userDetails.getUsername(), appointmentId, request));
    }
}
