package com.hams;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hams.dto.appointment.BookAppointmentRequest;
import com.hams.dto.appointment.CancelAppointmentRequest;
import com.hams.dto.auth.LoginRequest;
import com.hams.dto.auth.RefreshTokenRequest;
import com.hams.dto.auth.RegisterRequest;
import com.hams.dto.consultation.CreateConsultationRequest;
import com.hams.dto.consultation.CreatePrescriptionRequest;
import com.hams.dto.consultation.PrescriptionItemRequest;
import com.hams.dto.doctor.CreateDoctorRequest;
import com.hams.dto.schedule.DayAvailabilityRequest;
import com.hams.enums.DayOfWeek;
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
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class Phase8SecurityHardeningIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static String adminToken;

    private static String doctorAToken;
    private static Long doctorAId;
    private static String doctorBToken;
    private static Long doctorBId;

    private static Long unverifiedDoctorId;
    private static Long inactiveDoctorId;

    private static String patientAToken;
    private static String patientARefreshToken;
    private static Long patientAUserId;

    private static String patientBToken;
    private static Long patientBUserId;

    private static LocalDate targetMonday;

    private static Long appt1Id;
    private static Long appt2Id;

    private static Long apptBId;
    private static Long consultationBId;
    private static Long prescriptionBId;

    @BeforeAll
    static void setupTestData(@Autowired MockMvc mockMvc, @Autowired ObjectMapper objectMapper) throws Exception {
        // 1. Admin login
        LoginRequest adminLogin = new LoginRequest("admin@hams.local", "Admin@HAMS2024!");
        MvcResult adminRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        adminToken = objectMapper.readTree(adminRes.getResponse().getContentAsString())
                .get("accessToken").asText();

        // 2. Doctor A Setup
        String docAEmail = "doc8_a_" + System.currentTimeMillis() + "@hams.local";
        CreateDoctorRequest docAReq = new CreateDoctorRequest();
        docAReq.setEmail(docAEmail);
        docAReq.setPassword("Doctor@123456");
        docAReq.setFirstName("Doctor");
        docAReq.setLastName("Alpha");
        docAReq.setSpecialization("Cardiology");
        docAReq.setDepartmentId(1L);
        docAReq.setConsultationFee(new BigDecimal("600.00"));
        docAReq.setExperienceYears(8);
        MvcResult docARes = mockMvc.perform(post("/api/admin/doctors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(docAReq)))
                .andExpect(status().isCreated())
                .andReturn();
        doctorAId = objectMapper.readTree(docARes.getResponse().getContentAsString()).path("id").asLong();

        mockMvc.perform(patch("/api/admin/doctors/" + doctorAId + "/verify")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        MvcResult docALogRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(docAEmail, "Doctor@123456"))))
                .andExpect(status().isOk())
                .andReturn();
        doctorAToken = objectMapper.readTree(docALogRes.getResponse().getContentAsString()).get("accessToken").asText();

        // Doctor A availability on Monday
        List<DayAvailabilityRequest> schedA = new ArrayList<>();
        schedA.add(new DayAvailabilityRequest(DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(17, 0), 30, true, new ArrayList<>()));
        mockMvc.perform(put("/api/doctor/availability")
                        .header("Authorization", "Bearer " + doctorAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(schedA)))
                .andExpect(status().isOk());

        // 3. Doctor B Setup
        String docBEmail = "doc8_b_" + System.currentTimeMillis() + "@hams.local";
        CreateDoctorRequest docBReq = new CreateDoctorRequest();
        docBReq.setEmail(docBEmail);
        docBReq.setPassword("Doctor@123456");
        docBReq.setFirstName("Doctor");
        docBReq.setLastName("Beta");
        docBReq.setSpecialization("Neurology");
        docBReq.setDepartmentId(1L);
        docBReq.setConsultationFee(new BigDecimal("700.00"));
        docBReq.setExperienceYears(12);
        MvcResult docBRes = mockMvc.perform(post("/api/admin/doctors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(docBReq)))
                .andExpect(status().isCreated())
                .andReturn();
        doctorBId = objectMapper.readTree(docBRes.getResponse().getContentAsString()).path("id").asLong();

        mockMvc.perform(patch("/api/admin/doctors/" + doctorBId + "/verify")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        MvcResult docBLogRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(docBEmail, "Doctor@123456"))))
                .andExpect(status().isOk())
                .andReturn();
        doctorBToken = objectMapper.readTree(docBLogRes.getResponse().getContentAsString()).get("accessToken").asText();

        List<DayAvailabilityRequest> schedB = new ArrayList<>();
        schedB.add(new DayAvailabilityRequest(DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(17, 0), 30, true, new ArrayList<>()));
        mockMvc.perform(put("/api/doctor/availability")
                        .header("Authorization", "Bearer " + doctorBToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(schedB)))
                .andExpect(status().isOk());

        // 4. Unverified Doctor Setup
        String unverifiedEmail = "doc8_unver_" + System.currentTimeMillis() + "@hams.local";
        CreateDoctorRequest unverifiedReq = new CreateDoctorRequest();
        unverifiedReq.setEmail(unverifiedEmail);
        unverifiedReq.setPassword("Doctor@123456");
        unverifiedReq.setFirstName("Unverified");
        unverifiedReq.setLastName("Doctor");
        unverifiedReq.setSpecialization("Dermatology");
        unverifiedReq.setDepartmentId(1L);
        unverifiedReq.setConsultationFee(new BigDecimal("400.00"));
        unverifiedReq.setExperienceYears(2);
        MvcResult unverRes = mockMvc.perform(post("/api/admin/doctors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(unverifiedReq)))
                .andExpect(status().isCreated())
                .andReturn();
        unverifiedDoctorId = objectMapper.readTree(unverRes.getResponse().getContentAsString()).path("id").asLong();

        // 5. Inactive Doctor Setup
        String inactiveEmail = "doc8_inact_" + System.currentTimeMillis() + "@hams.local";
        CreateDoctorRequest inactReq = new CreateDoctorRequest();
        inactReq.setEmail(inactiveEmail);
        inactReq.setPassword("Doctor@123456");
        inactReq.setFirstName("Inactive");
        inactReq.setLastName("Doctor");
        inactReq.setSpecialization("Orthopedics");
        inactReq.setDepartmentId(1L);
        inactReq.setConsultationFee(new BigDecimal("550.00"));
        inactReq.setExperienceYears(6);
        MvcResult inactRes = mockMvc.perform(post("/api/admin/doctors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inactReq)))
                .andExpect(status().isCreated())
                .andReturn();
        inactiveDoctorId = objectMapper.readTree(inactRes.getResponse().getContentAsString()).path("id").asLong();
        // Verify then deactivate
        mockMvc.perform(patch("/api/admin/doctors/" + inactiveDoctorId + "/verify")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
        mockMvc.perform(patch("/api/admin/doctors/" + inactiveDoctorId + "/deactivate")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // 6. Patient A Setup
        String patAEmail = "pat8_a_" + System.currentTimeMillis() + "@hams.local";
        RegisterRequest patAReq = new RegisterRequest();
        patAReq.setEmail(patAEmail);
        patAReq.setPassword("Patient@123456");
        patAReq.setFirstName("Alice");
        patAReq.setLastName("Anderson");
        MvcResult patARes = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patAReq)))
                .andExpect(status().isCreated())
                .andReturn();
        patientAToken = objectMapper.readTree(patARes.getResponse().getContentAsString()).get("accessToken").asText();
        patientARefreshToken = objectMapper.readTree(patARes.getResponse().getContentAsString()).get("refreshToken").asText();
        patientAUserId = objectMapper.readTree(patARes.getResponse().getContentAsString()).path("user").path("id").asLong();

        // 7. Patient B Setup
        String patBEmail = "pat8_b_" + System.currentTimeMillis() + "@hams.local";
        RegisterRequest patBReq = new RegisterRequest();
        patBReq.setEmail(patBEmail);
        patBReq.setPassword("Patient@123456");
        patBReq.setFirstName("Bob");
        patBReq.setLastName("Baker");
        MvcResult patBRes = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patBReq)))
                .andExpect(status().isCreated())
                .andReturn();
        patientBToken = objectMapper.readTree(patBRes.getResponse().getContentAsString()).get("accessToken").asText();
        patientBUserId = objectMapper.readTree(patBRes.getResponse().getContentAsString()).path("user").path("id").asLong();

        // Calculate next Monday
        LocalDate today = LocalDate.now();
        int daysUntilMonday = ((java.time.DayOfWeek.MONDAY.getValue() - today.getDayOfWeek().getValue() + 7) % 7);
        if (daysUntilMonday == 0) daysUntilMonday = 7;
        targetMonday = today.plusDays(daysUntilMonday);

        // Pre-create Consultation and Prescription for Doctor B + Patient B
        BookAppointmentRequest apptBReq = new BookAppointmentRequest(
                doctorBId,
                targetMonday,
                LocalTime.of(10, 0),
                "Consultation for Patient B"
        );
        MvcResult apptBRes = mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patientBToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(apptBReq)))
                .andExpect(status().isCreated())
                .andReturn();
        apptBId = objectMapper.readTree(apptBRes.getResponse().getContentAsString()).path("id").asLong();

        // Doctor B moves apptB through workflow
        mockMvc.perform(post("/api/doctor/appointments/" + apptBId + "/check-in")
                        .header("Authorization", "Bearer " + doctorBToken))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/doctor/appointments/" + apptBId + "/start-consultation")
                        .header("Authorization", "Bearer " + doctorBToken))
                .andExpect(status().isOk());

        // Doctor B creates consultation
        CreateConsultationRequest consultBReq = new CreateConsultationRequest();
        consultBReq.setDiagnosis("Migraine headache");
        consultBReq.setClinicalNotes("Patient reports severe throbbing headache.");
        consultBReq.setGeneralInstructions("Take medications with food.");
        List<PrescriptionItemRequest> meds = new ArrayList<>();
        meds.add(new PrescriptionItemRequest("Sumatriptan", "50mg", "Once daily", "5 days", "Take at onset"));
        consultBReq.setMedicines(meds);

        MvcResult consultBRes = mockMvc.perform(post("/api/doctor/appointments/" + apptBId + "/consultation")
                        .header("Authorization", "Bearer " + doctorBToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(consultBReq)))
                .andExpect(status().isCreated())
                .andReturn();
        consultationBId = objectMapper.readTree(consultBRes.getResponse().getContentAsString()).path("id").asLong();
        prescriptionBId = objectMapper.readTree(consultBRes.getResponse().getContentAsString()).path("prescription").path("id").asLong();
    }

    // ============================================================
    // 1. SEC-01: JWT Token Hardening (Reject REFRESH Tokens in Auth Filter)
    // ============================================================

    @Test
    @Order(1)
    void refreshTokenCannotAuthenticateApiRequests() throws Exception {
        // Supplying a REFRESH token as Bearer token must be rejected with 401 Unauthorized
        mockMvc.perform(get("/api/patient/profile")
                        .header("Authorization", "Bearer " + patientARefreshToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.title").value("UNAUTHORIZED"));
    }

    @Test
    @Order(2)
    void accessTokenCanAuthenticateApiRequests() throws Exception {
        // Valid ACCESS token must succeed
        mockMvc.perform(get("/api/patient/profile")
                        .header("Authorization", "Bearer " + patientAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Alice"));
    }

    @Test
    @Order(3)
    void refreshTokenMechanismItselfContinuesToFunction() throws Exception {
        // Legitimate token refresh via /api/auth/refresh must still succeed
        RefreshTokenRequest refreshReq = new RefreshTokenRequest(patientARefreshToken);
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").value(patientARefreshToken));
    }

    // ============================================================
    // 2. SEC-03: RFC-7807 Standard Error ProblemDetail Responses
    // ============================================================

    @Test
    @Order(4)
    void unauthenticatedRequestReturnsRfc7807ProblemDetail401() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard/stats"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.title").value("UNAUTHORIZED"))
                .andExpect(jsonPath("$.detail").isNotEmpty());
    }

    @Test
    @Order(5)
    void unauthorizedRoleReturnsRfc7807ProblemDetail403() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard/stats")
                        .header("Authorization", "Bearer " + patientAToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.title").value("FORBIDDEN"))
                .andExpect(jsonPath("$.detail").isNotEmpty());
    }

    // ============================================================
    // 3. SEC-05: Public Doctor Discovery Restricted to Active & Verified
    // ============================================================

    @Test
    @Order(6)
    void unverifiedDoctorReturnsNotFoundOnPublicProfile() throws Exception {
        mockMvc.perform(get("/api/public/doctors/" + unverifiedDoctorId))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(7)
    void unverifiedDoctorReturnsNotFoundOnPublicSlots() throws Exception {
        mockMvc.perform(get("/api/public/doctors/" + unverifiedDoctorId + "/slots")
                        .param("date", targetMonday.toString()))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(8)
    void unverifiedDoctorReturnsNotFoundOnPublicAvailability() throws Exception {
        mockMvc.perform(get("/api/public/doctors/" + unverifiedDoctorId + "/availability"))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(9)
    void inactiveDoctorReturnsNotFoundOnPublicProfile() throws Exception {
        mockMvc.perform(get("/api/public/doctors/" + inactiveDoctorId))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(10)
    void inactiveDoctorReturnsNotFoundOnPublicSlots() throws Exception {
        mockMvc.perform(get("/api/public/doctors/" + inactiveDoctorId + "/slots")
                        .param("date", targetMonday.toString()))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(11)
    void verifiedActiveDoctorReturnsOkOnPublicEndpoints() throws Exception {
        mockMvc.perform(get("/api/public/doctors/" + doctorAId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(doctorAId))
                .andExpect(jsonPath("$.verified").value(true))
                .andExpect(jsonPath("$.active").value(true));

        mockMvc.perform(get("/api/public/doctors/" + doctorAId + "/availability"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.doctorId").value(doctorAId));

        mockMvc.perform(get("/api/public/doctors/" + doctorAId + "/slots")
                        .param("date", targetMonday.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.doctorId").value(doctorAId))
                .andExpect(jsonPath("$.workingDay").value(true))
                .andExpect(jsonPath("$.slots").isArray());
    }

    // ============================================================
    // 4. CLN-01: Exhaustive Invalid Clinical Status Transitions
    // ============================================================

    @Test
    @Order(12)
    void setupAppointment1ForTransitionTests() throws Exception {
        BookAppointmentRequest req = new BookAppointmentRequest(
                doctorAId,
                targetMonday,
                LocalTime.of(11, 0),
                "Clinical transition test appointment"
        );
        MvcResult res = mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patientAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andReturn();
        appt1Id = objectMapper.readTree(res.getResponse().getContentAsString()).path("id").asLong();
        assertNotNull(appt1Id);
    }

    @Test
    @Order(13)
    void transitionConfirmedToCompletedIsRejected400() throws Exception {
        // Direct jump from CONFIRMED -> COMPLETED must be rejected with 400
        mockMvc.perform(post("/api/doctor/appointments/" + appt1Id + "/complete")
                        .header("Authorization", "Bearer " + doctorAToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("BAD_REQUEST"));
    }

    @Test
    @Order(14)
    void transitionConfirmedToInConsultationIsRejected400() throws Exception {
        // Skipping CHECKED_IN: CONFIRMED -> IN_CONSULTATION must be rejected with 400
        mockMvc.perform(post("/api/doctor/appointments/" + appt1Id + "/start-consultation")
                        .header("Authorization", "Bearer " + doctorAToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("BAD_REQUEST"));
    }

    @Test
    @Order(15)
    void transitionConfirmedToCheckedInSucceeds() throws Exception {
        // Valid transition: CONFIRMED -> CHECKED_IN succeeds
        mockMvc.perform(post("/api/doctor/appointments/" + appt1Id + "/check-in")
                        .header("Authorization", "Bearer " + doctorAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CHECKED_IN"));
    }

    @Test
    @Order(16)
    void transitionCheckedInToCompletedIsRejected400() throws Exception {
        // Skipping IN_CONSULTATION: CHECKED_IN -> COMPLETED must be rejected with 400
        mockMvc.perform(post("/api/doctor/appointments/" + appt1Id + "/complete")
                        .header("Authorization", "Bearer " + doctorAToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("BAD_REQUEST"));
    }

    @Test
    @Order(17)
    void transitionCheckedInToInConsultationAndThenCompletedSucceeds() throws Exception {
        // Valid step: CHECKED_IN -> IN_CONSULTATION
        mockMvc.perform(post("/api/doctor/appointments/" + appt1Id + "/start-consultation")
                        .header("Authorization", "Bearer " + doctorAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_CONSULTATION"));

        // Valid step: IN_CONSULTATION -> COMPLETED
        mockMvc.perform(post("/api/doctor/appointments/" + appt1Id + "/complete")
                        .header("Authorization", "Bearer " + doctorAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    @Order(18)
    void transitionCompletedToCheckedInIsRejected400() throws Exception {
        // Already COMPLETED: COMPLETED -> CHECKED_IN must be rejected with 400
        mockMvc.perform(post("/api/doctor/appointments/" + appt1Id + "/check-in")
                        .header("Authorization", "Bearer " + doctorAToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("BAD_REQUEST"));
    }

    @Test
    @Order(19)
    void transitionCompletedToInConsultationIsRejected400() throws Exception {
        // Already COMPLETED: COMPLETED -> IN_CONSULTATION must be rejected with 400
        mockMvc.perform(post("/api/doctor/appointments/" + appt1Id + "/start-consultation")
                        .header("Authorization", "Bearer " + doctorAToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("BAD_REQUEST"));
    }

    @Test
    @Order(20)
    void transitionCancelledToCheckedInAndCompletedIsRejected400() throws Exception {
        // Book appointment 2
        BookAppointmentRequest req = new BookAppointmentRequest(
                doctorAId,
                targetMonday,
                LocalTime.of(11, 30),
                "Appointment to be cancelled"
        );
        MvcResult res = mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patientAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        appt2Id = objectMapper.readTree(res.getResponse().getContentAsString()).path("id").asLong();

        // Cancel appointment 2
        CancelAppointmentRequest cancelReq = new CancelAppointmentRequest("Patient changed plans");
        mockMvc.perform(patch("/api/patient/appointments/" + appt2Id + "/cancel")
                        .header("Authorization", "Bearer " + patientAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cancelReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        // CANCELLED -> CHECKED_IN must fail
        mockMvc.perform(post("/api/doctor/appointments/" + appt2Id + "/check-in")
                        .header("Authorization", "Bearer " + doctorAToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("BAD_REQUEST"));

        // CANCELLED -> COMPLETED must fail
        mockMvc.perform(post("/api/doctor/appointments/" + appt2Id + "/complete")
                        .header("Authorization", "Bearer " + doctorAToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("BAD_REQUEST"));
    }

    // ============================================================
    // 5. CLN-02: Horizontal IDOR Isolation (Doctor & Patient Boundaries)
    // ============================================================

    @Test
    @Order(21)
    void doctorACannotAccessDoctorBConsultation() throws Exception {
        // Doctor A tries to access Doctor B's consultation -> 403 Forbidden
        mockMvc.perform(get("/api/doctor/consultations/" + consultationBId)
                        .header("Authorization", "Bearer " + doctorAToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title").value("FORBIDDEN"));
    }

    @Test
    @Order(22)
    void doctorACannotAccessDoctorBPrescription() throws Exception {
        // Doctor A tries to access Doctor B's prescription -> 403 Forbidden
        mockMvc.perform(get("/api/doctor/consultations/" + consultationBId + "/prescription")
                        .header("Authorization", "Bearer " + doctorAToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title").value("FORBIDDEN"));
    }

    @Test
    @Order(23)
    void patientACannotAccessPatientBPrescription() throws Exception {
        // Patient A tries to access Patient B's prescription -> 403 Forbidden
        mockMvc.perform(get("/api/patient/prescriptions/" + prescriptionBId)
                        .header("Authorization", "Bearer " + patientAToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title").value("FORBIDDEN"));
    }

    @Test
    @Order(24)
    void patientACannotAccessPatientBConsultation() throws Exception {
        // Patient A tries to access Patient B's consultation via appointment -> 403 Forbidden
        mockMvc.perform(get("/api/patient/appointments/" + apptBId + "/consultation")
                        .header("Authorization", "Bearer " + patientAToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title").value("FORBIDDEN"));
    }

    @Test
    @Order(25)
    void patientBCanAccessOwnPrescriptionAndConsultation() throws Exception {
        // Patient B can access own prescription and consultation
        mockMvc.perform(get("/api/patient/prescriptions/" + prescriptionBId)
                        .header("Authorization", "Bearer " + patientBToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(prescriptionBId))
                .andExpect(jsonPath("$.items", hasSize(1)));

        mockMvc.perform(get("/api/patient/appointments/" + apptBId + "/consultation")
                        .header("Authorization", "Bearer " + patientBToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.diagnosis").value("Migraine headache"));
    }
}
