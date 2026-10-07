package com.hams;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hams.dto.admin.UpdateUserStatusRequest;
import com.hams.dto.appointment.BookAppointmentRequest;
import com.hams.dto.appointment.CancelAppointmentRequest;
import com.hams.dto.auth.LoginRequest;
import com.hams.dto.auth.RegisterRequest;
import com.hams.dto.consultation.CreateConsultationRequest;
import com.hams.dto.consultation.PrescriptionItemRequest;
import com.hams.dto.doctor.CreateDoctorRequest;
import com.hams.dto.schedule.DayAvailabilityRequest;
import com.hams.enums.DayOfWeek;
import com.hams.repository.UserRepository;
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
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class Phase7AdminNotificationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private static String adminToken;
    private static Long adminUserId;

    private static String doctorToken;
    private static Long doctorId;
    private static Long doctorUserId;

    private static String patient1Token;
    private static Long patient1UserId;

    private static String patient2Token;
    private static Long patient2UserId;

    private static Long appointmentId;
    private static Long patient1NotificationId;

    @BeforeAll
    static void setupTestData(@Autowired MockMvc mockMvc,
                              @Autowired ObjectMapper objectMapper,
                              @Autowired UserRepository userRepository) throws Exception {
        // 1. Login default Admin
        LoginRequest adminLogin = new LoginRequest("admin@hams.local", "Admin@HAMS2024!");
        MvcResult adminRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        adminToken = objectMapper.readTree(adminRes.getResponse().getContentAsString())
                .get("accessToken").asText();
        adminUserId = userRepository.findByEmail("admin@hams.local").orElseThrow().getId();

        // 2. Register & Verify Doctor
        String docEmail = "doc7_" + System.currentTimeMillis() + "@hams.local";
        CreateDoctorRequest docReq = new CreateDoctorRequest();
        docReq.setEmail(docEmail);
        docReq.setPassword("Doctor@123456");
        docReq.setFirstName("Gregory");
        docReq.setLastName("House");
        docReq.setSpecialization("Diagnostic Medicine");
        docReq.setDepartmentId(1L);
        docReq.setConsultationFee(new BigDecimal("750.00"));
        docReq.setExperienceYears(15);
        docReq.setQualification("MD");
        docReq.setRegistrationNumber("REG-HOUSE-777");

        MvcResult docRes = mockMvc.perform(post("/api/admin/doctors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(docReq)))
                .andExpect(status().isCreated())
                .andReturn();
        doctorId = objectMapper.readTree(docRes.getResponse().getContentAsString()).get("id").asLong();

        // Verify doctor
        mockMvc.perform(patch("/api/admin/doctors/" + doctorId + "/verify")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // Login Doctor
        LoginRequest docLogin = new LoginRequest(docEmail, "Doctor@123456");
        MvcResult docLogRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(docLogin)))
                .andExpect(status().isOk())
                .andReturn();
        doctorToken = objectMapper.readTree(docLogRes.getResponse().getContentAsString()).get("accessToken").asText();
        doctorUserId = userRepository.findByEmail(docEmail).orElseThrow().getId();

        // Configure doctor schedule
        List<DayAvailabilityRequest> schedule = new ArrayList<>();
        for (DayOfWeek day : DayOfWeek.values()) {
            DayAvailabilityRequest dar = new DayAvailabilityRequest();
            dar.setDayOfWeek(day);
            dar.setStartTime(LocalTime.of(9, 0));
            dar.setEndTime(LocalTime.of(17, 0));
            dar.setSlotDurationMins(30);
            dar.setActive(true);
            schedule.add(dar);
        }
        mockMvc.perform(put("/api/doctor/availability")
                        .header("Authorization", "Bearer " + doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(schedule)))
                .andExpect(status().isOk());

        // 3. Register Patient 1
        String p1Email = "patient7_1_" + System.currentTimeMillis() + "@hams.local";
        RegisterRequest p1Req = new RegisterRequest();
        p1Req.setEmail(p1Email);
        p1Req.setPassword("Patient@123456");
        p1Req.setFirstName("Alice");
        p1Req.setLastName("Smith");
        MvcResult p1Res = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(p1Req)))
                .andExpect(status().isCreated())
                .andReturn();
        patient1Token = objectMapper.readTree(p1Res.getResponse().getContentAsString()).get("accessToken").asText();
        patient1UserId = userRepository.findByEmail(p1Email).orElseThrow().getId();

        // 4. Register Patient 2
        String p2Email = "patient7_2_" + System.currentTimeMillis() + "@hams.local";
        RegisterRequest p2Req = new RegisterRequest();
        p2Req.setEmail(p2Email);
        p2Req.setPassword("Patient@123456");
        p2Req.setFirstName("Bob");
        p2Req.setLastName("Jones");
        MvcResult p2Res = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(p2Req)))
                .andExpect(status().isCreated())
                .andReturn();
        patient2Token = objectMapper.readTree(p2Res.getResponse().getContentAsString()).get("accessToken").asText();
        patient2UserId = userRepository.findByEmail(p2Email).orElseThrow().getId();
    }

    // ============================================================
    // 1-9: ADMIN TESTS
    // ============================================================

    @Test
    @Order(1)
    void admin_dashboard_stats_success() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard/stats")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPatients", greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.totalDoctors", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.activeDoctors", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.totalDepartments", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.statusDistribution").isMap())
                .andExpect(jsonPath("$.appointmentsOverTime").isArray())
                .andExpect(jsonPath("$.departmentActivity").isArray())
                .andExpect(jsonPath("$.doctorActivity").isArray());
    }

    @Test
    @Order(2)
    void admin_get_users_search_and_filter() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .param("role", "PATIENT")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[0].passwordHash").doesNotExist())
                .andExpect(jsonPath("$.content[0].role", is("PATIENT")));

        // Search by email prefix
        mockMvc.perform(get("/api/admin/users")
                        .param("search", "patient7_1")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.content[0].email", containsString("patient7_1")));
    }

    @Test
    @Order(3)
    void admin_toggle_user_status() throws Exception {
        // Deactivate patient 2
        UpdateUserStatusRequest deact = new UpdateUserStatusRequest(false);
        mockMvc.perform(patch("/api/admin/users/" + patient2UserId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deact)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active", is(false)));

        // Reactivate patient 2
        UpdateUserStatusRequest react = new UpdateUserStatusRequest(true);
        mockMvc.perform(patch("/api/admin/users/" + patient2UserId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(react)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active", is(true)));
    }

    @Test
    @Order(4)
    void admin_cannot_deactivate_self() throws Exception {
        UpdateUserStatusRequest deactSelf = new UpdateUserStatusRequest(false);
        mockMvc.perform(patch("/api/admin/users/" + adminUserId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deactSelf)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail", containsString("cannot deactivate your own")));
    }

    @Test
    @Order(5)
    void admin_cannot_deactivate_last_active_admin() throws Exception {
        // Even if calling on an admin ID, last admin deactivation is blocked
        UpdateUserStatusRequest deact = new UpdateUserStatusRequest(false);
        mockMvc.perform(patch("/api/admin/users/" + adminUserId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deact)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(6)
    void admin_get_appointments_filtered() throws Exception {
        // Book an appointment first
        LocalDate apptDate = LocalDate.now().plusDays(2);
        BookAppointmentRequest bookReq = new BookAppointmentRequest(doctorId, apptDate, LocalTime.of(10, 0), "Admin filter check");
        MvcResult bookRes = mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookReq)))
                .andExpect(status().isCreated())
                .andReturn();
        appointmentId = objectMapper.readTree(bookRes.getResponse().getContentAsString()).get("id").asLong();

        // Filter appointments in admin
        mockMvc.perform(get("/api/admin/appointments")
                        .param("status", "CONFIRMED")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[0].appointmentRef", notNullValue()))
                .andExpect(jsonPath("$.content[0].patientName", notNullValue()))
                .andExpect(jsonPath("$.content[0].doctorName", notNullValue()));
    }

    @Test
    @Order(7)
    void admin_get_reports_summary() throws Exception {
        mockMvc.perform(get("/api/admin/reports/summary")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAppointments", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.statusCounts").isMap())
                .andExpect(jsonPath("$.departmentStats").isArray())
                .andExpect(jsonPath("$.doctorStats").isArray());
    }

    @Test
    @Order(8)
    void admin_get_audit_logs_filtered() throws Exception {
        mockMvc.perform(get("/api/admin/audit-logs")
                        .param("action", "APPOINTMENT")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[0].action", notNullValue()))
                .andExpect(jsonPath("$.content[0].createdAt", notNullValue()));
    }

    @Test
    @Order(9)
    void non_admin_cannot_access_admin_endpoints() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard/stats")
                        .header("Authorization", "Bearer " + patient1Token))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/reports/summary")
                        .header("Authorization", "Bearer " + patient1Token))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/audit-logs")
                        .header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isForbidden());
    }

    // ============================================================
    // 10-17: NOTIFICATION TESTS
    // ============================================================

    @Test
    @Order(10)
    void user_get_notifications_and_unread_count() throws Exception {
        // Patient 1 booked an appointment, so should have received notification
        MvcResult notifRes = mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + patient1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[0].title", containsString("Appointment")))
                .andReturn();

        patient1NotificationId = objectMapper.readTree(notifRes.getResponse().getContentAsString())
                .get("content").get(0).get("id").asLong();

        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("Authorization", "Bearer " + patient1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount", greaterThanOrEqualTo(1)));
    }

    @Test
    @Order(11)
    void user_mark_notification_read() throws Exception {
        mockMvc.perform(patch("/api/notifications/" + patient1NotificationId + "/read")
                        .header("Authorization", "Bearer " + patient1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.read", is(true)));
    }

    @Test
    @Order(12)
    void user_mark_all_notifications_read() throws Exception {
        mockMvc.perform(patch("/api/notifications/read-all")
                        .header("Authorization", "Bearer " + patient1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("marked as read")));
    }

    @Test
    @Order(13)
    void user_cannot_access_other_user_notification() throws Exception {
        // Patient 2 attempts to mark Patient 1's notification as read -> 403 Forbidden
        mockMvc.perform(patch("/api/notifications/" + patient1NotificationId + "/read")
                        .header("Authorization", "Bearer " + patient2Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(14)
    void notification_unread_count_correct() throws Exception {
        // After mark-all-as-read, Patient 1 unread count should be 0
        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("Authorization", "Bearer " + patient1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount", is(0)));
    }

    @Test
    @Order(15)
    void notifications_triggered_on_appointment_events() throws Exception {
        // Cancel appointment -> triggers APPOINTMENT_CANCELLED notification
        CancelAppointmentRequest cancelReq = new CancelAppointmentRequest("Schedule conflict test");
        mockMvc.perform(patch("/api/patient/appointments/" + appointmentId + "/cancel")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cancelReq)))
                .andExpect(status().isOk());

        // Verify patient received cancel notification
        mockMvc.perform(get("/api/notifications")
                        .param("unreadOnly", "true")
                        .header("Authorization", "Bearer " + patient1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].type", is("APPOINTMENT_CANCELLED")));
    }

    @Test
    @Order(16)
    void notifications_triggered_on_consultation_completion() throws Exception {
        // Book a new appointment to take through consultation workflow
        LocalDate apptDate = LocalDate.now().plusDays(3);
        BookAppointmentRequest bookReq = new BookAppointmentRequest(doctorId, apptDate, LocalTime.of(11, 0), "Clinical check");
        MvcResult bookRes = mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookReq)))
                .andExpect(status().isCreated())
                .andReturn();
        Long newApptId = objectMapper.readTree(bookRes.getResponse().getContentAsString()).get("id").asLong();

        // Doctor Check-in
        mockMvc.perform(post("/api/doctor/appointments/" + newApptId + "/check-in")
                        .header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isOk());

        // Doctor Start Consultation
        mockMvc.perform(post("/api/doctor/appointments/" + newApptId + "/start-consultation")
                        .header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isOk());

        // Doctor Complete Appointment
        mockMvc.perform(post("/api/doctor/appointments/" + newApptId + "/complete")
                        .header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isOk());

        // Patient should have received CONSULTATION_COMPLETED notification
        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + patient1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.type == 'CONSULTATION_COMPLETED')]").isNotEmpty());
    }

    @Test
    @Order(17)
    void prescription_notification_created() throws Exception {
        // Book appointment and create consultation with prescription
        LocalDate apptDate = LocalDate.now().plusDays(4);
        BookAppointmentRequest bookReq = new BookAppointmentRequest(doctorId, apptDate, LocalTime.of(14, 0), "Prescription check");
        MvcResult bookRes = mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookReq)))
                .andExpect(status().isCreated())
                .andReturn();
        Long rxApptId = objectMapper.readTree(bookRes.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/doctor/appointments/" + rxApptId + "/check-in")
                        .header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/doctor/appointments/" + rxApptId + "/start-consultation")
                        .header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isOk());

        CreateConsultationRequest ccReq = new CreateConsultationRequest();
        ccReq.setDiagnosis("Seasonal Allergies");
        ccReq.setMedicines(List.of(new PrescriptionItemRequest("Cetirizine 10mg", "10mg", "Once daily", "5 days", "At night")));

        mockMvc.perform(post("/api/doctor/appointments/" + rxApptId + "/consultation")
                        .header("Authorization", "Bearer " + doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ccReq)))
                .andExpect(status().isCreated());

        // Patient should have PRESCRIPTION_READY notification
        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + patient1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.type == 'PRESCRIPTION_READY')]").isNotEmpty());
    }

    // ============================================================
    // 18: AUDIT PRIVACY
    // ============================================================

    @Test
    @Order(18)
    void audit_sensitive_data_not_exposed() throws Exception {
        MvcResult auditRes = mockMvc.perform(get("/api/admin/audit-logs")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();

        String content = auditRes.getResponse().getContentAsString();
        assertTrue(!content.contains("passwordHash"));
        assertTrue(!content.contains("password_hash"));
        assertTrue(!content.contains("Doctor@123456"));
        assertTrue(!content.contains("Admin@HAMS2024!"));
    }

    // ============================================================
    // 19-21: REPORT FILTERING & PAGINATION
    // ============================================================

    @Test
    @Order(19)
    void report_date_filter_correct() throws Exception {
        LocalDate start = LocalDate.now().minusDays(1);
        LocalDate end = LocalDate.now().plusDays(30);

        mockMvc.perform(get("/api/admin/reports/summary")
                        .param("startDate", start.toString())
                        .param("endDate", end.toString())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAppointments", greaterThanOrEqualTo(1)));
    }

    @Test
    @Order(20)
    void report_department_filter_correct() throws Exception {
        mockMvc.perform(get("/api/admin/reports/summary")
                        .param("departmentId", "1")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.departmentStats", not(empty())));
    }

    @Test
    @Order(21)
    void report_pagination_correct() throws Exception {
        mockMvc.perform(get("/api/admin/appointments")
                        .param("page", "0")
                        .param("size", "2")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size", is(2)))
                .andExpect(jsonPath("$.number", is(0)));
    }
}
