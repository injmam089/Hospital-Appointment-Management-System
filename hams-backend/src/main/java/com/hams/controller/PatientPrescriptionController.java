package com.hams.controller;

import com.hams.dto.consultation.ConsultationResponse;
import com.hams.dto.consultation.PrescriptionResponse;
import com.hams.service.ConsultationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient")
@PreAuthorize("hasRole('PATIENT')")
@Tag(name = "Patient Prescriptions", description = "Endpoints for patient access to their own medical prescriptions and consultation records")
public class PatientPrescriptionController {

    private final ConsultationService consultationService;

    public PatientPrescriptionController(ConsultationService consultationService) {
        this.consultationService = consultationService;
    }

    @GetMapping("/prescriptions")
    @Operation(summary = "List patient prescriptions", description = "Retrieves all digital prescriptions issued to the authenticated patient")
    public ResponseEntity<List<PrescriptionResponse>> getPrescriptions(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(consultationService.getPatientPrescriptions(userDetails.getUsername()));
    }

    @GetMapping("/prescriptions/{id}")
    @Operation(summary = "Get prescription details", description = "Retrieves details of a specific prescription belonging to the patient")
    public ResponseEntity<PrescriptionResponse> getPrescriptionById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(consultationService.getPatientPrescriptionById(userDetails.getUsername(), id));
    }

    @GetMapping("/appointments/{appointmentId}/consultation")
    @Operation(summary = "Get appointment consultation", description = "Retrieves clinical consultation details and notes for the patient's appointment")
    public ResponseEntity<ConsultationResponse> getConsultationByAppointment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(consultationService.getPatientConsultationByAppointmentId(userDetails.getUsername(), appointmentId));
    }
}
