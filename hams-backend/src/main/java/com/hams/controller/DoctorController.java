package com.hams.controller;

import com.hams.dto.doctor.DoctorProfileResponse;
import com.hams.dto.doctor.UpdateDoctorProfileRequest;
import com.hams.service.DoctorService;
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
@RequestMapping("/api/doctor")
@Tag(name = "Doctor", description = "Endpoints restricted to registered medical doctors")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get Doctor Professional Profile", description = "Returns clinical credentials and consultation settings for the authenticated doctor")
    public ResponseEntity<DoctorProfileResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(doctorService.getDoctorProfileByEmail(userDetails.getUsername()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update Doctor Profile", description = "Allows a doctor to update bio, phone, qualifications, consultation fee, and photo")
    public ResponseEntity<DoctorProfileResponse> updateProfilePut(
            @Valid @RequestBody UpdateDoctorProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(doctorService.updateDoctorProfileByEmail(
                userDetails.getUsername(), request, servletRequest.getRemoteAddr()));
    }

    @PatchMapping("/profile")
    @Operation(summary = "Update Doctor Profile (Patch)", description = "Partial update for doctor profile")
    public ResponseEntity<DoctorProfileResponse> updateProfilePatch(
            @Valid @RequestBody UpdateDoctorProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(doctorService.updateDoctorProfileByEmail(
                userDetails.getUsername(), request, servletRequest.getRemoteAddr()));
    }
}
