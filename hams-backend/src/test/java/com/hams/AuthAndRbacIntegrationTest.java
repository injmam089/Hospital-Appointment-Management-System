package com.hams;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hams.dto.auth.LoginRequest;
import com.hams.dto.auth.RefreshTokenRequest;
import com.hams.dto.auth.RegisterRequest;
import com.hams.enums.Gender;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class AuthAndRbacIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static String patientAccessToken;
    private static String patientRefreshToken;
    private static String doctorAccessToken;
    private static String adminAccessToken;

    @Test
    @Order(1)
    @DisplayName("1. Register patient successfully and receive JWT")
    void testRegisterPatientSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Jane");
        request.setLastName("Doe");
        request.setEmail("jane.doe@example.com");
        request.setPassword("SecurePass123!");
        request.setPhone("+91 98765 00001");
        request.setGender(Gender.FEMALE);
        request.setDateOfBirth(LocalDate.of(1995, 5, 15));
        request.setBloodGroup("O+");
        request.setAddress("42 Health Street, New Delhi");
        request.setEmergencyContact("+91 98765 00002");

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.user.email", is("jane.doe@example.com")))
                .andExpect(jsonPath("$.user.role", is("PATIENT")))
                .andExpect(jsonPath("$.user.firstName", is("Jane")))
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        patientAccessToken = objectMapper.readTree(responseBody).get("accessToken").asText();
        patientRefreshToken = objectMapper.readTree(responseBody).get("refreshToken").asText();
    }

    @Test
    @Order(2)
    @DisplayName("2. Reject duplicate email registration with 409 Conflict")
    void testDuplicateEmailRejected() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Jane");
        request.setLastName("Duplicate");
        request.setEmail("jane.doe@example.com");
        request.setPassword("SecurePass123!");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title", is("CONFLICT")));
    }

    @Test
    @Order(3)
    @DisplayName("3. Login with correct password succeeds")
    void testLoginSuccess() throws Exception {
        LoginRequest request = new LoginRequest("jane.doe@example.com", "SecurePass123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.user.email", is("jane.doe@example.com")))
                .andExpect(jsonPath("$.user.role", is("PATIENT")));
    }

    @Test
    @Order(4)
    @DisplayName("4. Login with invalid password rejected with 400 Bad Request")
    void testLoginInvalidPassword() throws Exception {
        LoginRequest request = new LoginRequest("jane.doe@example.com", "WrongPassword999!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail", containsString("Invalid email address or password")));
    }

    @Test
    @Order(5)
    @DisplayName("5. Protected patient endpoint without token rejected with 401 Unauthorized")
    void testProtectedWithoutTokenRejected() throws Exception {
        mockMvc.perform(get("/api/patient/profile"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.title", is("UNAUTHORIZED")));
    }

    @Test
    @Order(6)
    @DisplayName("6. Patient can access patient endpoint with valid JWT")
    void testPatientCanAccessPatientEndpoint() throws Exception {
        mockMvc.perform(get("/api/patient/profile")
                        .header("Authorization", "Bearer " + patientAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("jane.doe@example.com")))
                .andExpect(jsonPath("$.role", is("PATIENT")))
                .andExpect(jsonPath("$.firstName", is("Jane")));
    }

    @Test
    @Order(7)
    @DisplayName("7. Patient CANNOT access doctor endpoint (403 Forbidden)")
    void testPatientCannotAccessDoctorEndpoint() throws Exception {
        mockMvc.perform(get("/api/doctor/profile")
                        .header("Authorization", "Bearer " + patientAccessToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title", is("FORBIDDEN")));
    }

    @Test
    @Order(8)
    @DisplayName("8. Patient CANNOT access admin endpoint (403 Forbidden)")
    void testPatientCannotAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + patientAccessToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title", is("FORBIDDEN")));
    }

    @Test
    @Order(9)
    @DisplayName("9. Doctor login succeeds and can access doctor endpoints")
    void testDoctorLoginAndAccess() throws Exception {
        LoginRequest request = new LoginRequest("doctor.smith@hams.local", "Doctor@HAMS2024!");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.role", is("DOCTOR")))
                .andReturn();

        doctorAccessToken = objectMapper.readTree(result.getResponse().getContentAsString()).get("accessToken").asText();

        // Doctor accesses doctor profile -> 200 OK
        mockMvc.perform(get("/api/doctor/profile")
                        .header("Authorization", "Bearer " + doctorAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role", is("DOCTOR")))
                .andExpect(jsonPath("$.specialization", is("Interventional Cardiology")));
    }

    @Test
    @Order(10)
    @DisplayName("10. Doctor CANNOT access admin endpoint (403 Forbidden)")
    void testDoctorCannotAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + doctorAccessToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title", is("FORBIDDEN")));
    }

    @Test
    @Order(11)
    @DisplayName("11. Admin login succeeds and can access admin endpoint (200 OK)")
    void testAdminLoginAndAccess() throws Exception {
        LoginRequest request = new LoginRequest("admin@hams.local", "Admin@HAMS2024!");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.role", is("ADMIN")))
                .andReturn();

        adminAccessToken = objectMapper.readTree(result.getResponse().getContentAsString()).get("accessToken").asText();

        // Admin accesses admin stats -> 200 OK
        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + adminAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAdmins", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.totalDoctors", greaterThanOrEqualTo(1)));
    }

    @Test
    @Order(12)
    @DisplayName("12. Refresh token produces new valid access token")
    void testRefreshToken() throws Exception {
        RefreshTokenRequest request = new RefreshTokenRequest(patientRefreshToken);

        MvcResult result = mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andReturn();

        String newAccessToken = objectMapper.readTree(result.getResponse().getContentAsString()).get("accessToken").asText();

        // Verify newly refreshed token works on protected endpoint
        mockMvc.perform(get("/api/patient/profile")
                        .header("Authorization", "Bearer " + newAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("jane.doe@example.com")));
    }
}
