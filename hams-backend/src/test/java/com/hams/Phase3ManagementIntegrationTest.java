package com.hams;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hams.dto.auth.LoginRequest;
import com.hams.dto.auth.RegisterRequest;
import com.hams.dto.department.DepartmentRequest;
import com.hams.dto.doctor.AdminUpdateDoctorRequest;
import com.hams.dto.doctor.CreateDoctorRequest;
import com.hams.dto.doctor.UpdateDoctorProfileRequest;
import com.hams.dto.patient.UpdatePatientProfileRequest;
import com.hams.enums.Gender;
import com.hams.enums.VerificationStatus;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class Phase3ManagementIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static String patientTokenA;
    private static String patientTokenB;
    private static String doctorToken;
    private static String adminToken;
    private static Long createdDoctorId;
    private static Long createdDepartmentId;

    @BeforeAll
    static void setupTokens(
            @Autowired MockMvc mvc,
            @Autowired ObjectMapper mapper
    ) throws Exception {
        // 1. Patient A
        RegisterRequest regA = new RegisterRequest();
        regA.setFirstName("Alice");
        regA.setLastName("Wonder");
        regA.setEmail("alice.p3@example.com");
        regA.setPassword("Password123!");
        regA.setPhone("+91 91111 00001");
        regA.setBloodGroup("A+");
        regA.setGender(Gender.FEMALE);
        MvcResult resA = mvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(regA))).andReturn();
        patientTokenA = mapper.readTree(resA.getResponse().getContentAsString()).get("accessToken").asText();

        // 2. Patient B
        RegisterRequest regB = new RegisterRequest();
        regB.setFirstName("Bob");
        regB.setLastName("Builder");
        regB.setEmail("bob.p3@example.com");
        regB.setPassword("Password123!");
        MvcResult resB = mvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(regB))).andReturn();
        patientTokenB = mapper.readTree(resB.getResponse().getContentAsString()).get("accessToken").asText();

        // 3. Doctor Login
        LoginRequest docLogin = new LoginRequest("doctor.smith@hams.local", "Doctor@HAMS2024!");
        MvcResult resDoc = mvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(docLogin))).andReturn();
        doctorToken = mapper.readTree(resDoc.getResponse().getContentAsString()).get("accessToken").asText();

        // 4. Admin Login
        LoginRequest adminLogin = new LoginRequest("admin@hams.local", "Admin@HAMS2024!");
        MvcResult resAdmin = mvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(adminLogin))).andReturn();
        adminToken = mapper.readTree(resAdmin.getResponse().getContentAsString()).get("accessToken").asText();
    }

    @Test
    @Order(1)
    @DisplayName("1. Patient can view own profile")
    void testPatientCanViewOwnProfile() throws Exception {
        mockMvc.perform(get("/api/patient/profile")
                        .header("Authorization", "Bearer " + patientTokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("alice.p3@example.com")))
                .andExpect(jsonPath("$.firstName", is("Alice")))
                .andExpect(jsonPath("$.bloodGroup", is("A+")));
    }

    @Test
    @Order(2)
    @DisplayName("2. Patient can update own profile (contact, address, emergency contact)")
    void testPatientCanUpdateOwnProfile() throws Exception {
        UpdatePatientProfileRequest update = new UpdatePatientProfileRequest(
                "Alice", "Updated", "+91 99999 88888", Gender.FEMALE,
                LocalDate.of(1996, 6, 20), "100 New Street, Mumbai", "A-", "+91 98888 77777"
        );

        mockMvc.perform(put("/api/patient/profile")
                        .header("Authorization", "Bearer " + patientTokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastName", is("Updated")))
                .andExpect(jsonPath("$.bloodGroup", is("A-")))
                .andExpect(jsonPath("$.address", is("100 New Street, Mumbai")));
    }

    @Test
    @Order(3)
    @DisplayName("3. Patient B only sees Bob's data, strictly isolated from Patient A")
    void testPatientIsolation() throws Exception {
        mockMvc.perform(get("/api/patient/profile")
                        .header("Authorization", "Bearer " + patientTokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("bob.p3@example.com")))
                .andExpect(jsonPath("$.firstName", is("Bob")))
                .andExpect(jsonPath("$.email", not("alice.p3@example.com")));
    }

    @Test
    @Order(4)
    @DisplayName("4. Doctor can view own professional profile")
    void testDoctorCanViewOwnProfile() throws Exception {
        mockMvc.perform(get("/api/doctor/profile")
                        .header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("doctor.smith@hams.local")))
                .andExpect(jsonPath("$.specialization", is("Interventional Cardiology")))
                .andExpect(jsonPath("$.verified", is(true)));
    }

    @Test
    @Order(5)
    @DisplayName("5. Doctor can update permitted profile fields (bio, fee, phone)")
    void testDoctorCanUpdatePermittedFields() throws Exception {
        UpdateDoctorProfileRequest update = new UpdateDoctorProfileRequest(
                "Sarah", "Smith", "+91 98765 99999", "Updated cardiologist bio",
                "MD, FACC, PhD", BigDecimal.valueOf(950.00), null
        );

        mockMvc.perform(put("/api/doctor/profile")
                        .header("Authorization", "Bearer " + doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phone", is("+91 98765 99999")))
                .andExpect(jsonPath("$.consultationFee", is(950.0)));
    }

    @Test
    @Order(6)
    @DisplayName("6. Doctor CANNOT access admin doctor endpoints (403 Forbidden)")
    void testDoctorCannotAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/doctors")
                        .header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title", is("FORBIDDEN")));
    }

    @Test
    @Order(7)
    @DisplayName("7. Admin can create new doctor")
    void testAdminCanCreateDoctor() throws Exception {
        CreateDoctorRequest req = new CreateDoctorRequest();
        req.setEmail("doctor.neurology@hams.local");
        req.setPassword("DocNeu@2024!");
        req.setFirstName("Marcus");
        req.setLastName("Vance");
        req.setDepartmentId(1L); // Default department
        req.setSpecialization("Pediatric Neurology");
        req.setQualification("MD, DM Neurology");
        req.setExperienceYears(9);
        req.setConsultationFee(BigDecimal.valueOf(750.00));
        req.setPhone("+91 94444 33333");
        req.setRegistrationNumber("MED-NEU-55441");
        req.setVerified(false);

        MvcResult result = mockMvc.perform(post("/api/admin/doctors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email", is("doctor.neurology@hams.local")))
                .andExpect(jsonPath("$.specialization", is("Pediatric Neurology")))
                .andExpect(jsonPath("$.verificationStatus", is("PENDING")))
                .andReturn();

        createdDoctorId = objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    @Test
    @Order(8)
    @DisplayName("8. Admin can update doctor information")
    void testAdminCanUpdateDoctor() throws Exception {
        AdminUpdateDoctorRequest update = new AdminUpdateDoctorRequest();
        update.setFirstName("Marcus");
        update.setLastName("Vance-Senior");
        update.setSpecialization("Chief Pediatric Neurologist");
        update.setConsultationFee(BigDecimal.valueOf(850.00));
        update.setExperienceYears(10);

        mockMvc.perform(patch("/api/admin/doctors/" + createdDoctorId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastName", is("Vance-Senior")))
                .andExpect(jsonPath("$.consultationFee", is(850.0)));
    }

    @Test
    @Order(9)
    @DisplayName("9. Admin can verify doctor (sets status to APPROVED)")
    void testAdminCanVerifyDoctor() throws Exception {
        mockMvc.perform(patch("/api/admin/doctors/" + createdDoctorId + "/verify")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationStatus", is("APPROVED")))
                .andExpect(jsonPath("$.verified", is(true)));
    }

    @Test
    @Order(10)
    @DisplayName("10. Admin can reject doctor (sets status to REJECTED)")
    void testAdminCanRejectDoctor() throws Exception {
        mockMvc.perform(patch("/api/admin/doctors/" + createdDoctorId + "/reject")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationStatus", is("REJECTED")))
                .andExpect(jsonPath("$.verified", is(false)));
    }

    @Test
    @Order(11)
    @DisplayName("11. Admin can deactivate and reactivate doctor")
    void testAdminCanDeactivateAndReactivateDoctor() throws Exception {
        // Deactivate
        mockMvc.perform(patch("/api/admin/doctors/" + createdDoctorId + "/deactivate")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active", is(false)));

        // Reactivate
        mockMvc.perform(patch("/api/admin/doctors/" + createdDoctorId + "/activate")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active", is(true)));
    }

    @Test
    @Order(12)
    @DisplayName("12. Admin can create medical department")
    void testAdminCanCreateDepartment() throws Exception {
        DepartmentRequest dept = new DepartmentRequest("Oncology", "Cancer diagnosis and comprehensive care", "shield");

        MvcResult result = mockMvc.perform(post("/api/admin/departments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dept)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Oncology")))
                .andExpect(jsonPath("$.active", is(true)))
                .andReturn();

        createdDepartmentId = objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    @Test
    @Order(13)
    @DisplayName("13. Duplicate department name rejected with 409 Conflict")
    void testDuplicateDepartmentRejected() throws Exception {
        DepartmentRequest dup = new DepartmentRequest("Oncology", "Duplicate cancer care", "shield");

        mockMvc.perform(post("/api/admin/departments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dup)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title", is("CONFLICT")));
    }

    @Test
    @Order(14)
    @DisplayName("14. Admin can update department and toggle active status")
    void testAdminCanUpdateDepartment() throws Exception {
        DepartmentRequest update = new DepartmentRequest("Medical Oncology", "Specialized chemotherapy & immunotherapy", "activity");

        mockMvc.perform(put("/api/admin/departments/" + createdDepartmentId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Medical Oncology")));

        // Toggle status
        mockMvc.perform(patch("/api/admin/departments/" + createdDepartmentId + "/status?active=false")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active", is(false)));
    }

    @Test
    @Order(15)
    @DisplayName("15. Public doctor search returns verified active doctors without authentication")
    void testPublicDoctorSearch() throws Exception {
        mockMvc.perform(get("/api/public/doctors")
                        .param("search", "Cardiology"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", notNullValue()));
    }

    @Test
    @Order(16)
    @DisplayName("16. Public departments endpoint returns active departments without auth")
    void testPublicDepartmentsList() throws Exception {
        mockMvc.perform(get("/api/public/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())));
    }

    @Test
    @Order(17)
    @DisplayName("17. Non-admin patient cannot access admin department endpoints (403 Forbidden)")
    void testPatientCannotAccessDepartmentManagement() throws Exception {
        mockMvc.perform(get("/api/admin/departments")
                        .header("Authorization", "Bearer " + patientTokenA))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title", is("FORBIDDEN")));
    }
}
