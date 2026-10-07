package com.hams.controller;

import com.hams.dto.admin.AdminUserResponse;
import com.hams.dto.admin.UpdateUserStatusRequest;
import com.hams.enums.Role;
import com.hams.service.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/admin/users")
@Tag(name = "Admin Users", description = "User administration endpoints for hospital administrators")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    @Operation(summary = "Search and list users", description = "Returns paginated list of users with search, role, and active status filters")
    public ResponseEntity<Page<AdminUserResponse>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(adminUserService.getUsers(search, role, active, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user details by ID", description = "Returns safe user details without credentials")
    public ResponseEntity<AdminUserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminUserService.getUserById(id));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update user active status", description = "Activates or deactivates a user account. Safeguards prevent self-deactivation and deactivating the last active admin.")
    public ResponseEntity<AdminUserResponse> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request,
            Principal principal
    ) {
        return ResponseEntity.ok(adminUserService.updateUserStatus(principal.getName(), id, request.getActive()));
    }
}
