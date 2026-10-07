package com.hams.controller;

import com.hams.dto.doctor.AdminUpdateDoctorRequest;
import com.hams.dto.doctor.CreateDoctorRequest;
import com.hams.dto.doctor.DoctorProfileResponse;
import com.hams.enums.VerificationStatus;
import com.hams.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/doctors")
@Tag(name = "Admin - Doctors", description = "Endpoints for hospital administrator doctor management, onboarding, and credential verification")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDoctorController {

    private final DoctorService doctorService;

    public AdminDoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping
    @Operation(summary = "Search & Filter Doctors (Admin)", description = "Search doctors with filters for verification status, department, and active status")
    public ResponseEntity<Page<DoctorProfileResponse>> getDoctors(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) VerificationStatus verificationStatus,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortField));

        return ResponseEntity.ok(doctorService.adminSearchDoctors(search, departmentId, verificationStatus, active, pageRequest));
    }

    @PostMapping
    @Operation(summary = "Create Doctor Account", description = "Onboards a new medical doctor account with department assignment and credentials")
    public ResponseEntity<DoctorProfileResponse> createDoctor(
            @Valid @RequestBody CreateDoctorRequest request,
            HttpServletRequest servletRequest
    ) {
        DoctorProfileResponse response = doctorService.createDoctor(request, servletRequest.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Doctor Details", description = "Retrieves complete clinical and verification profile of a doctor by ID")
    public ResponseEntity<DoctorProfileResponse> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Doctor Information", description = "Updates doctor profile, department, active flag, or credentialing status")
    public ResponseEntity<DoctorProfileResponse> updateDoctorPut(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateDoctorRequest request,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(doctorService.adminUpdateDoctor(id, request, servletRequest.getRemoteAddr()));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update Doctor Information (Patch)", description = "Partial update of doctor profile by admin")
    public ResponseEntity<DoctorProfileResponse> updateDoctorPatch(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateDoctorRequest request,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(doctorService.adminUpdateDoctor(id, request, servletRequest.getRemoteAddr()));
    }

    @PatchMapping("/{id}/verify")
    @Operation(summary = "Approve / Verify Doctor", description = "Transitions doctor verification status to APPROVED")
    public ResponseEntity<DoctorProfileResponse> verifyDoctor(
            @PathVariable Long id,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(doctorService.verifyDoctor(id, servletRequest.getRemoteAddr()));
    }

    @PatchMapping("/{id}/reject")
    @Operation(summary = "Reject Doctor Verification", description = "Transitions doctor verification status to REJECTED")
    public ResponseEntity<DoctorProfileResponse> rejectDoctor(
            @PathVariable Long id,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(doctorService.rejectDoctor(id, servletRequest.getRemoteAddr()));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate Doctor", description = "Deactivates a doctor account, preventing login and public appointment bookings")
    public ResponseEntity<DoctorProfileResponse> deactivateDoctor(
            @PathVariable Long id,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(doctorService.setDoctorActiveStatus(id, false, servletRequest.getRemoteAddr()));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Reactivate Doctor", description = "Reactivates a doctor account")
    public ResponseEntity<DoctorProfileResponse> activateDoctor(
            @PathVariable Long id,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(doctorService.setDoctorActiveStatus(id, true, servletRequest.getRemoteAddr()));
    }
}
