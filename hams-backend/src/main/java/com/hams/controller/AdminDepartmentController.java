package com.hams.controller;

import com.hams.dto.department.DepartmentRequest;
import com.hams.dto.department.DepartmentResponse;
import com.hams.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/departments")
@Tag(name = "Admin - Departments", description = "Endpoints for managing hospital medical departments")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDepartmentController {

    private final DepartmentService departmentService;

    public AdminDepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    @Operation(summary = "List All Departments", description = "Returns all medical departments including active and inactive with doctor counts")
    public ResponseEntity<List<DepartmentResponse>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @PostMapping
    @Operation(summary = "Create Department", description = "Creates a new medical specialty department")
    public ResponseEntity<DepartmentResponse> createDepartment(
            @Valid @RequestBody DepartmentRequest request,
            HttpServletRequest servletRequest
    ) {
        DepartmentResponse response = departmentService.createDepartment(request, servletRequest.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Department by ID", description = "Returns details of a specific medical department")
    public ResponseEntity<DepartmentResponse> getDepartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getDepartmentById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Department", description = "Updates department name, description, and icon")
    public ResponseEntity<DepartmentResponse> updateDepartmentPut(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentRequest request,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(departmentService.updateDepartment(id, request, servletRequest.getRemoteAddr()));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update Department (Patch)", description = "Partial update of department")
    public ResponseEntity<DepartmentResponse> updateDepartmentPatch(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentRequest request,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(departmentService.updateDepartment(id, request, servletRequest.getRemoteAddr()));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Toggle Department Active Status", description = "Activates or deactivates a medical department")
    public ResponseEntity<DepartmentResponse> toggleStatus(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean active,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(departmentService.toggleDepartmentStatus(id, active, servletRequest.getRemoteAddr()));
    }
}
