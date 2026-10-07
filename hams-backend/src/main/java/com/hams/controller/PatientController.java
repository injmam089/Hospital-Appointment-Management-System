package com.hams.controller;

import com.hams.dto.patient.PatientProfileResponse;
import com.hams.dto.patient.UpdatePatientProfileRequest;
import com.hams.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patient")
@Tag(name = "Patient", description = "Endpoints restricted to registered patients")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get Patient Profile", description = "Returns personal and medical profile details for the authenticated patient")
    public ResponseEntity<PatientProfileResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(patientService.getPatientProfileByEmail(userDetails.getUsername()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update Patient Profile", description = "Updates personal contact, demographic, and emergency details")
    public ResponseEntity<PatientProfileResponse> updateProfilePut(
            @Valid @RequestBody UpdatePatientProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(patientService.updatePatientProfileByEmail(
                userDetails.getUsername(), request, servletRequest.getRemoteAddr()));
    }

    @PatchMapping("/profile")
    @Operation(summary = "Update Patient Profile (Patch)", description = "Partial update for patient profile")
    public ResponseEntity<PatientProfileResponse> updateProfilePatch(
            @Valid @RequestBody UpdatePatientProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(patientService.updatePatientProfileByEmail(
                userDetails.getUsername(), request, servletRequest.getRemoteAddr()));
    }
}
