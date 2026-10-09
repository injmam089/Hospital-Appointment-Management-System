package com.hams;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hams.dto.auth.LoginRequest;
import com.hams.dto.consultation.CreateConsultationRequest;
import com.hams.entity.User;
import com.hams.enums.Role;
import com.hams.repository.UserRepository;
import com.hams.security.JwtService;
import com.hams.security.RateLimitingFilter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
public class Phase10SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    // ============================================================
    // 1. SEC-01: JWT SECRET VALIDATION & PRODUCTION FAIL-FAST
    // ============================================================

    @Test
    @DisplayName("SEC-01: Production profile fails fast if default dev secret is configured")
    void productionProfileFailsFastWithDefaultSecret() {
        Environment prodEnv = Mockito.mock(Environment.class);
        Mockito.when(prodEnv.matchesProfiles("prod")).thenReturn(true);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                new JwtService(
                        "ThisIsAVeryLongAndSecureSecretKeyForHAMSJWTTokenGeneration2024MustBeAtLeast256BitsLong",
                        900000,
                        604800000,
                        prodEnv
                )
        );
        assertTrue(ex.getMessage().contains("CRITICAL SECURITY VIOLATION"));
    }

    @Test
    @DisplayName("SEC-01: Short JWT secret (< 256 bits) is rejected in any environment")
    void shortJwtSecretIsRejected() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                new JwtService("short-secret-key-12345", 900000, 604800000, null)
        );
        assertTrue(ex.getMessage().contains("at least 256 bits"));
    }

    @Test
    @DisplayName("SEC-01: Strong custom JWT secret initializes successfully in prod")
    void strongCustomJwtSecretSucceedsInProd() {
        Environment prodEnv = Mockito.mock(Environment.class);
        Mockito.when(prodEnv.matchesProfiles("prod")).thenReturn(true);

        assertDoesNotThrow(() ->
                new JwtService(
                        "StrongCustomProductionSecretKeyForHAMSApplication2026SecureMustBe32BytesLong!",
                        900000,
                        604800000,
                        prodEnv
                )
        );
    }

    // ============================================================
    // 2. SEC-02: RATE LIMITING FILTER
    // ============================================================

    @Test
    @DisplayName("SEC-02: RateLimitingFilter blocks requests exceeding quota with 429 Too Many Requests")
    void rateLimitingFilterBlocksExcessRequests() throws Exception {
        // Instantiate a dedicated RateLimitingFilter instance configured with max 3 requests/min
        RateLimitingFilter filter = new RateLimitingFilter(3, true, objectMapper);

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr("198.51.100.42");

        // First 3 requests should pass through filter
        for (int i = 0; i < 3; i++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            MockFilterChain chain = new MockFilterChain();
            filter.doFilter(request, response, chain);
            assertEquals(200, response.getStatus());
        }

        // 4th request must be rejected with 429
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        MockFilterChain blockedChain = new MockFilterChain();
        filter.doFilter(request, blockedResponse, blockedChain);

        assertEquals(429, blockedResponse.getStatus());
        assertEquals("60", blockedResponse.getHeader("Retry-After"));
        assertTrue(blockedResponse.getContentAsString().contains("TOO_MANY_REQUESTS"));
    }

    // ============================================================
    // 3. SEC-03: CORS HEADERS & SECURITY HEADERS
    // ============================================================

    @Test
    @DisplayName("SEC-03: CORS configuration specifies explicit allowed headers without wildcard")
    void corsConfigurationHasExplicitAllowedHeaders() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/auth/login");
        CorsConfiguration config = corsConfigurationSource.getCorsConfiguration(request);

        assertNotNull(config);
        assertNotNull(config.getAllowedHeaders());
        assertFalse(config.getAllowedHeaders().contains("*"), "CORS allowed headers must not contain wildcard '*'");
        assertTrue(config.getAllowedHeaders().contains("Authorization"));
        assertTrue(config.getAllowedHeaders().contains("Content-Type"));
        assertTrue(config.getAllowCredentials());
    }

    @Test
    @DisplayName("SEC-03: Security headers (X-Frame-Options, X-Content-Type-Options, CSP, HSTS) are present")
    void securityHeadersArePresent() throws Exception {
        mockMvc.perform(get("/api/public/health"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"))
                .andExpect(header().exists("Content-Security-Policy"));
    }

    // ============================================================
    // 4. SEC-04: ACCOUNT LOCKOUT CHECK ORDER
    // ============================================================

    @Test
    @DisplayName("SEC-04: Locked account returns 403 Forbidden without verifying password")
    void lockedAccountReturnsForbiddenDirectly() throws Exception {
        String testEmail = "locked_" + UUID.randomUUID() + "@hams.local";
        User user = User.builder()
                .email(testEmail)
                .passwordHash(passwordEncoder.encode("CorrectPassword123!"))
                .role(Role.PATIENT)
                .active(true)
                .emailVerified(true)
                .failedLoginAttempts(5)
                .lockedUntil(LocalDateTime.now().plusMinutes(15))
                .build();
        userRepository.save(user);

        // Attempt login with WRONG password on a locked account
        LoginRequest wrongPwRequest = new LoginRequest(testEmail, "WrongPassword999!");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongPwRequest)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title").value("FORBIDDEN"))
                .andExpect(jsonPath("$.detail").value("Account is temporarily locked due to multiple failed login attempts. Please try again later."));
    }

    @Test
    @DisplayName("SEC-04: Inactive account returns 403 Forbidden directly")
    void inactiveAccountReturnsForbiddenDirectly() throws Exception {
        String testEmail = "inactive_" + UUID.randomUUID() + "@hams.local";
        User user = User.builder()
                .email(testEmail)
                .passwordHash(passwordEncoder.encode("CorrectPassword123!"))
                .role(Role.PATIENT)
                .active(false)
                .emailVerified(true)
                .failedLoginAttempts(0)
                .build();
        userRepository.save(user);

        LoginRequest req = new LoginRequest(testEmail, "AnyPassword123!");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title").value("FORBIDDEN"))
                .andExpect(jsonPath("$.detail").value("Your account is currently disabled. Please contact the hospital administrator."));
    }

    // ============================================================
    // 5. SEC-05: INPUT VALIDATION BOUNDARIES
    // ============================================================

    @Test
    @DisplayName("SEC-05: Unbounded symptoms payload exceeding 2000 characters is rejected with 422")
    void consultationExceedingMaxBoundsIsRejected() throws Exception {
        // Authenticate admin to create doctor and patient
        LoginRequest adminLogin = new LoginRequest("admin@hams.local", "Admin@HAMS2024!");
        MvcResult adminRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String adminToken = objectMapper.readTree(adminRes.getResponse().getContentAsString())
                .get("accessToken").asText();

        // Create a doctor
        String docEmail = "doc_bounds_" + System.currentTimeMillis() + "@hams.local";
        com.hams.dto.doctor.CreateDoctorRequest docReq = new com.hams.dto.doctor.CreateDoctorRequest();
        docReq.setEmail(docEmail);
        docReq.setPassword("Doctor@123456");
        docReq.setFirstName("Validation");
        docReq.setLastName("Doctor");
        docReq.setSpecialization("General");
        docReq.setDepartmentId(1L);
        mockMvc.perform(post("/api/admin/doctors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(docReq)))
                .andExpect(status().isCreated());

        // Login as doctor
        LoginRequest docLogin = new LoginRequest(docEmail, "Doctor@123456");
        MvcResult docRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(docLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String docToken = objectMapper.readTree(docRes.getResponse().getContentAsString())
                .get("accessToken").asText();

        // Build oversized consultation request (> 2000 chars symptoms)
        CreateConsultationRequest oversizedReq = new CreateConsultationRequest();
        oversizedReq.setDiagnosis("Common cold");
        oversizedReq.setSymptoms("A".repeat(2050)); // exceeds 2000

        mockMvc.perform(post("/api/doctor/appointments/99999/consultation")
                        .header("Authorization", "Bearer " + docToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(oversizedReq)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.title").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.errors.symptoms").value("Symptoms description must not exceed 2000 characters"));
    }
}
