package com.hams.controller;

import com.hams.dto.appointment.AppointmentResponse;
import com.hams.dto.consultation.ConsultationResponse;
import com.hams.dto.consultation.CreateConsultationRequest;
import com.hams.dto.consultation.CreatePrescriptionRequest;
import com.hams.dto.consultation.PrescriptionResponse;
import com.hams.service.ConsultationService;
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
@RequestMapping("/api/doctor")
@PreAuthorize("hasRole('DOCTOR')")
@Tag(name = "Doctor Consultation", description = "Endpoints for doctor consultation workflow, diagnosis, notes, and digital prescriptions")
public class DoctorConsultationController {

    private final ConsultationService consultationService;

    public DoctorConsultationController(ConsultationService consultationService) {
        this.consultationService = consultationService;
    }

    // ============================================================
    // STATUS WORKFLOW
    // ============================================================

    @PostMapping("/appointments/{appointmentId}/check-in")
    @Operation(summary = "Check in appointment", description = "Marks a confirmed appointment as CHECKED_IN for consultation queue")
    public ResponseEntity<AppointmentResponse> checkInAppointment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(consultationService.checkInAppointment(userDetails.getUsername(), appointmentId));
    }

    @PostMapping("/appointments/{appointmentId}/start-consultation")
    @Operation(summary = "Start consultation", description = "Transitions a checked-in appointment to IN_CONSULTATION")
    public ResponseEntity<AppointmentResponse> startConsultation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(consultationService.startConsultation(userDetails.getUsername(), appointmentId));
    }

    @PostMapping("/appointments/{appointmentId}/complete")
    @Operation(summary = "Complete appointment", description = "Completes an appointment that is currently in consultation")
    public ResponseEntity<AppointmentResponse> completeAppointment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(consultationService.completeAppointment(userDetails.getUsername(), appointmentId));
    }

    // ============================================================
    // CONSULTATION CREATION & HISTORY
    // ============================================================

    @PostMapping("/appointments/{appointmentId}/consultation")
    @Operation(summary = "Create consultation", description = "Records clinical symptoms, diagnosis, notes, advice, and optional medicines for an appointment")
    public ResponseEntity<ConsultationResponse> createConsultation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long appointmentId,
            @Valid @RequestBody CreateConsultationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(consultationService.createConsultation(userDetails.getUsername(), appointmentId, request));
    }

    @GetMapping("/consultations")
    @Operation(summary = "List doctor consultations", description = "Retrieves all consultation records conducted by the authenticated doctor")
    public ResponseEntity<List<ConsultationResponse>> getConsultations(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(consultationService.getDoctorConsultations(userDetails.getUsername()));
    }

    @GetMapping("/consultations/{id}")
    @Operation(summary = "Get consultation details", description = "Retrieves clinical details of a specific consultation belonging to the doctor")
    public ResponseEntity<ConsultationResponse> getConsultationById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(consultationService.getDoctorConsultationById(userDetails.getUsername(), id));
    }

    // ============================================================
    // PRESCRIPTION CREATION & DETAILS
    // ============================================================

    @PostMapping("/consultations/{consultationId}/prescription")
    @Operation(summary = "Create prescription", description = "Attaches a digital prescription with medicines to a consultation")
    public ResponseEntity<PrescriptionResponse> createPrescription(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long consultationId,
            @Valid @RequestBody CreatePrescriptionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(consultationService.createPrescription(userDetails.getUsername(), consultationId, request));
    }

    @GetMapping("/consultations/{consultationId}/prescription")
    @Operation(summary = "Get consultation prescription", description = "Retrieves the prescription attached to a consultation")
    public ResponseEntity<PrescriptionResponse> getConsultationPrescription(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long consultationId) {
        return ResponseEntity.ok(consultationService.getConsultationPrescription(userDetails.getUsername(), consultationId));
    }
}
