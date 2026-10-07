package com.hams.controller;

import com.hams.dto.auth.AuthResponse;
import com.hams.dto.auth.LoginRequest;
import com.hams.dto.auth.RefreshTokenRequest;
import com.hams.dto.auth.RegisterRequest;
import com.hams.dto.auth.UserSummaryDto;
import com.hams.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user registration, authentication, and token management")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register Patient", description = "Self-registration endpoint for new hospital patients")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest servletRequest
    ) {
        String clientIp = getClientIp(servletRequest);
        AuthResponse response = authService.registerPatient(request, clientIp);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticates patient, doctor, or administrator credentials and returns JWT")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest
    ) {
        String clientIp = getClientIp(servletRequest);
        AuthResponse response = authService.login(request, clientIp);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh Token", description = "Exchanges a valid refresh token for a new access token")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get Current User Profile", description = "Returns sanitized profile information for the authenticated user")
    public ResponseEntity<UserSummaryDto> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserSummaryDto userSummary = authService.getCurrentUserSummary(userDetails.getUsername());
        return ResponseEntity.ok(userSummary);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || !xfHeader.contains(",")) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
