package com.hams;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hams.dto.appointment.BookAppointmentRequest;
import com.hams.dto.appointment.CancelAppointmentRequest;
import com.hams.dto.appointment.RescheduleAppointmentRequest;
import com.hams.dto.auth.LoginRequest;
import com.hams.dto.auth.RegisterRequest;
import com.hams.dto.doctor.CreateDoctorRequest;
import com.hams.dto.schedule.BreakDto;
import com.hams.dto.schedule.DayAvailabilityRequest;
import com.hams.dto.schedule.DoctorLeaveRequest;
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
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class Phase5AppointmentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static String adminToken;
    private static String doctor1Token;
    private static Long doctor1Id;
    private static String doctor2Token;
    private static Long doctor2Id;
    private static Long unverifiedDoctorId;
    private static Long inactiveDoctorId;

    private static String patient1Token;
    private static String patient2Token;

    private static LocalDate targetMonday;
    private static LocalDate targetTuesday;
    private static LocalDate targetThursday;

    private static Long createdAppt1Id;
    private static Long createdAppt2Id;

    @BeforeAll
    static void setupTestData(
            @Autowired MockMvc mvc,
            @Autowired ObjectMapper mapper
    ) throws Exception {
        // Calculate dynamic dates
        targetMonday = LocalDate.now().plusWeeks(2);
        while (targetMonday.getDayOfWeek() != java.time.DayOfWeek.MONDAY) {
            targetMonday = targetMonday.plusDays(1);
        }
        targetTuesday = targetMonday.plusDays(1);
        targetThursday = targetMonday.plusDays(3);

        // 1. Login Admin
        LoginRequest adminLogin = new LoginRequest("admin@hams.local", "Admin@HAMS2024!");
        MvcResult adminRes = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        adminToken = mapper.readTree(adminRes.getResponse().getContentAsString())
                .get("accessToken").asText();

        // 2. Create Doctor 1 (Verified, Active)
        CreateDoctorRequest doc1 = new CreateDoctorRequest();
        doc1.setEmail("dr.appt1@hams.local");
        doc1.setPassword("Doctor123!");
        doc1.setFirstName("Gregory");
        doc1.setLastName("House");
        doc1.setDepartmentId(1L);
        doc1.setSpecialization("Diagnostic Medicine");
        doc1.setQualification("MD");
        doc1.setExperienceYears(20);
        doc1.setConsultationFee(new BigDecimal("1500.00"));
        doc1.setPhone("+91 98888 11111");
        doc1.setRegistrationNumber("MCI-APPT-01");
        doc1.setVerified(true);

        MvcResult doc1Res = mvc.perform(post("/api/admin/doctors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(doc1)))
                .andExpect(status().isCreated())
                .andReturn();
        doctor1Id = mapper.readTree(doc1Res.getResponse().getContentAsString()).get("id").asLong();

        // Login Doctor 1
        LoginRequest doc1Login = new LoginRequest("dr.appt1@hams.local", "Doctor123!");
        MvcResult doc1LoginRes = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(doc1Login)))
                .andExpect(status().isOk())
                .andReturn();
        doctor1Token = mapper.readTree(doc1LoginRes.getResponse().getContentAsString())
                .get("accessToken").asText();

        // Set Doctor 1 Schedule:
        // Monday: 09:00 - 13:00, 30m slots, Break 11:00 - 11:30
        // Tuesday: 09:00 - 13:00, 30m slots, No breaks
        List<DayAvailabilityRequest> doc1Schedule = List.of(
                new DayAvailabilityRequest(
                        DayOfWeek.MONDAY,
                        LocalTime.of(9, 0),
                        LocalTime.of(13, 0),
                        30,
                        true,
                        List.of(new BreakDto(LocalTime.of(11, 0), LocalTime.of(11, 30)))
                ),
                new DayAvailabilityRequest(
                        DayOfWeek.TUESDAY,
                        LocalTime.of(9, 0),
                        LocalTime.of(13, 0),
                        30,
                        true,
                        new ArrayList<>()
                )
        );
        mvc.perform(put("/api/doctor/availability")
                        .header("Authorization", "Bearer " + doctor1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(doc1Schedule)))
                .andExpect(status().isOk());

        // Set Doctor 1 Leave on targetThursday
        DoctorLeaveRequest leaveReq = new DoctorLeaveRequest(targetThursday, targetThursday, "Medical Conference");
        mvc.perform(post("/api/doctor/leaves")
                        .header("Authorization", "Bearer " + doctor1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(leaveReq)))
                .andExpect(status().isOk());

        // 3. Create Doctor 2 (Verified, Active - for ownership testing)
        CreateDoctorRequest doc2 = new CreateDoctorRequest();
        doc2.setEmail("dr.appt2@hams.local");
        doc2.setPassword("Doctor123!");
        doc2.setFirstName("James");
        doc2.setLastName("Wilson");
        doc2.setDepartmentId(1L);
        doc2.setSpecialization("Oncology");
        doc2.setQualification("MD");
        doc2.setExperienceYears(18);
        doc2.setConsultationFee(new BigDecimal("1400.00"));
        doc2.setPhone("+91 98888 22222");
        doc2.setRegistrationNumber("MCI-APPT-02");
        doc2.setVerified(true);

        MvcResult doc2Res = mvc.perform(post("/api/admin/doctors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(doc2)))
                .andExpect(status().isCreated())
                .andReturn();
        doctor2Id = mapper.readTree(doc2Res.getResponse().getContentAsString()).get("id").asLong();

        LoginRequest doc2Login = new LoginRequest("dr.appt2@hams.local", "Doctor123!");
        MvcResult doc2LoginRes = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(doc2Login)))
                .andExpect(status().isOk())
                .andReturn();
        doctor2Token = mapper.readTree(doc2LoginRes.getResponse().getContentAsString())
                .get("accessToken").asText();

        // 4. Create Unverified Doctor
        CreateDoctorRequest unverifiedDoc = new CreateDoctorRequest();
        unverifiedDoc.setEmail("dr.unverified@hams.local");
        unverifiedDoc.setPassword("Doctor123!");
        unverifiedDoc.setFirstName("Robert");
        unverifiedDoc.setLastName("Chase");
        unverifiedDoc.setDepartmentId(1L);
        unverifiedDoc.setSpecialization("Surgeon");
        unverifiedDoc.setQualification("MBBS");
        unverifiedDoc.setVerified(false);

        MvcResult unverRes = mvc.perform(post("/api/admin/doctors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(unverifiedDoc)))
                .andExpect(status().isCreated())
                .andReturn();
        unverifiedDoctorId = mapper.readTree(unverRes.getResponse().getContentAsString()).get("id").asLong();

        // 5. Create Inactive Doctor
        CreateDoctorRequest inactDoc = new CreateDoctorRequest();
        inactDoc.setEmail("dr.inactive@hams.local");
        inactDoc.setPassword("Doctor123!");
        inactDoc.setFirstName("Allison");
        inactDoc.setLastName("Cameron");
        inactDoc.setDepartmentId(1L);
        inactDoc.setSpecialization("Immunology");
        inactDoc.setQualification("MBBS");
        inactDoc.setVerified(true);

        MvcResult inactRes = mvc.perform(post("/api/admin/doctors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(inactDoc)))
                .andExpect(status().isCreated())
                .andReturn();
        inactiveDoctorId = mapper.readTree(inactRes.getResponse().getContentAsString()).get("id").asLong();

        // Deactivate Cameron via Admin
        mvc.perform(patch("/api/admin/doctors/" + inactiveDoctorId + "/deactivate")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // 6. Register Patient 1
        RegisterRequest pat1 = new RegisterRequest();
        pat1.setFirstName("Bruce");
        pat1.setLastName("Wayne");
        pat1.setEmail("bruce.wayne.p5@example.com");
        pat1.setPassword("Patient123!");
        pat1.setPhone("+91 97777 11111");

        MvcResult pat1Res = mvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(pat1)))
                .andExpect(status().isCreated())
                .andReturn();
        patient1Token = mapper.readTree(pat1Res.getResponse().getContentAsString())
                .get("accessToken").asText();

        // 7. Register Patient 2
        RegisterRequest pat2 = new RegisterRequest();
        pat2.setFirstName("Clark");
        pat2.setLastName("Kent");
        pat2.setEmail("clark.kent.p5@example.com");
        pat2.setPassword("Patient123!");
        pat2.setPhone("+91 97777 22222");

        MvcResult pat2Res = mvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(pat2)))
                .andExpect(status().isCreated())
                .andReturn();
        patient2Token = mapper.readTree(pat2Res.getResponse().getContentAsString())
                .get("accessToken").asText();
    }

    // ============================================================
    // 1. Patient can book valid slot
    // ============================================================
    @Test
    @Order(1)
    void patientCanBookValidSlot() throws Exception {
        BookAppointmentRequest req = new BookAppointmentRequest(
                doctor1Id,
                targetMonday,
                LocalTime.of(9, 0),
                "Routine neurological consultation"
        );

        MvcResult result = mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.appointmentRef", notNullValue()))
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.doctorId").value(doctor1Id))
                .andExpect(jsonPath("$.doctorName").value("Gregory House"))
                .andExpect(jsonPath("$.patientName").value("Bruce Wayne"))
                .andExpect(jsonPath("$.appointmentDate").value(targetMonday.toString()))
                .andExpect(jsonPath("$.appointmentTime").value("09:00"))
                .andExpect(jsonPath("$.endTime").value("09:30"))
                .andReturn();

        createdAppt1Id = objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
        assertNotNull(createdAppt1Id);
    }

    // ============================================================
    // 2. Patient cannot book invalid slot (outside working hours / unaligned)
    // ============================================================
    @Test
    @Order(2)
    void patientCannotBookInvalidSlot() throws Exception {
        // Outside working hours (14:00 is past 13:00)
        BookAppointmentRequest outsideHours = new BookAppointmentRequest(
                doctor1Id,
                targetMonday,
                LocalTime.of(14, 0),
                "Should fail"
        );
        mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(outsideHours)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("BAD_REQUEST"));

        // Unaligned with 30m slot duration (09:15)
        BookAppointmentRequest unaligned = new BookAppointmentRequest(
                doctor1Id,
                targetMonday,
                LocalTime.of(9, 15),
                "Should fail"
        );
        mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(unaligned)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("BAD_REQUEST"));
    }

    // ============================================================
    // 3. Patient cannot book during doctor break
    // ============================================================
    @Test
    @Order(3)
    void patientCannotBookDuringDoctorBreak() throws Exception {
        // Doctor 1 has break from 11:00 to 11:30 on Monday
        BookAppointmentRequest breakSlot = new BookAppointmentRequest(
                doctor1Id,
                targetMonday,
                LocalTime.of(11, 0),
                "Should fail during break"
        );
        mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(breakSlot)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.detail", containsString("break")));
    }

    // ============================================================
    // 4. Patient cannot book on doctor leave
    // ============================================================
    @Test
    @Order(4)
    void patientCannotBookOnDoctorLeave() throws Exception {
        // Doctor 1 has leave on targetThursday
        BookAppointmentRequest leaveSlot = new BookAppointmentRequest(
                doctor1Id,
                targetThursday,
                LocalTime.of(9, 0),
                "Should fail on leave"
        );
        mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(leaveSlot)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.detail", containsString("leave")));
    }

    // ============================================================
    // 5. Patient cannot book on non-working day
    // ============================================================
    @Test
    @Order(5)
    void patientCannotBookOnNonWorkingDay() throws Exception {
        // Sunday is non-working
        LocalDate sunday = targetMonday.plusDays(6);
        BookAppointmentRequest sundaySlot = new BookAppointmentRequest(
                doctor1Id,
                sunday,
                LocalTime.of(9, 0),
                "Should fail on Sunday"
        );
        mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sundaySlot)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("BAD_REQUEST"));
    }

    // ============================================================
    // 6. Patient cannot book inactive doctor
    // ============================================================
    @Test
    @Order(6)
    void patientCannotBookInactiveDoctor() throws Exception {
        BookAppointmentRequest inactiveDoc = new BookAppointmentRequest(
                inactiveDoctorId,
                targetMonday,
                LocalTime.of(9, 0),
                "Should fail for inactive doctor"
        );
        mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inactiveDoc)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail", containsString("inactive")));
    }

    // ============================================================
    // 7. Patient cannot book unverified doctor
    // ============================================================
    @Test
    @Order(7)
    void patientCannotBookUnverifiedDoctor() throws Exception {
        BookAppointmentRequest unverDoc = new BookAppointmentRequest(
                unverifiedDoctorId,
                targetMonday,
                LocalTime.of(9, 0),
                "Should fail for unverified doctor"
        );
        mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(unverDoc)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail", containsString("verified")));
    }

    // ============================================================
    // 8. Patient cannot access another patient's appointment
    // ============================================================
    @Test
    @Order(8)
    void patientCannotAccessAnotherPatientAppointment() throws Exception {
        // Patient 2 attempts to view Patient 1's appointment
        mockMvc.perform(get("/api/patient/appointments/" + createdAppt1Id)
                        .header("Authorization", "Bearer " + patient2Token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title").value("FORBIDDEN"));
    }

    // ============================================================
    // 9. Patient can view own appointments
    // ============================================================
    @Test
    @Order(9)
    void patientCanViewOwnAppointments() throws Exception {
        mockMvc.perform(get("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].doctorName").value("Gregory House"))
                .andExpect(jsonPath("$[0].status").value("CONFIRMED"));

        // Upcoming convenience endpoint
        mockMvc.perform(get("/api/patient/appointments/upcoming")
                        .header("Authorization", "Bearer " + patient1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(createdAppt1Id));
    }

    // ============================================================
    // 10. Duplicate booking returns 409 CONFLICT
    // ============================================================
    @Test
    @Order(10)
    void duplicateBookingReturns409() throws Exception {
        // Slot 09:00 on targetMonday is already booked by Patient 1!
        // Patient 2 attempts to book the same slot
        BookAppointmentRequest duplicate = new BookAppointmentRequest(
                doctor1Id,
                targetMonday,
                LocalTime.of(9, 0),
                "Patient 2 tries same slot"
        );

        mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title").value("CONFLICT"))
                .andExpect(jsonPath("$.detail", containsString("already been booked")));
    }

    // ============================================================
    // 11. Patient can cancel own appointment
    // ============================================================
    @Test
    @Order(11)
    void patientCanCancelOwnAppointment() throws Exception {
        CancelAppointmentRequest cancelReq = new CancelAppointmentRequest("Scheduling conflict with work");

        mockMvc.perform(patch("/api/patient/appointments/" + createdAppt1Id + "/cancel")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cancelReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(createdAppt1Id))
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.cancellationReason").value("Scheduling conflict with work"));
    }

    // ============================================================
    // 12. Cancelled slot becomes available for another patient
    // ============================================================
    @Test
    @Order(12)
    void cancelledSlotBecomesAvailable() throws Exception {
        // Now that Patient 1 cancelled 09:00 on targetMonday,
        // Patient 2 must be able to book 09:00 on targetMonday!
        BookAppointmentRequest req = new BookAppointmentRequest(
                doctor1Id,
                targetMonday,
                LocalTime.of(9, 0),
                "Patient 2 books the now-freed slot"
        );

        MvcResult result = mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.appointmentTime").value("09:00"))
                .andExpect(jsonPath("$.patientName").value("Clark Kent"))
                .andReturn();

        createdAppt2Id = objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
        assertNotNull(createdAppt2Id);
    }

    // ============================================================
    // 13. Patient can reschedule to valid slot
    // ============================================================
    @Test
    @Order(13)
    void patientCanRescheduleToValidSlot() throws Exception {
        // Patient 2 reschedules from 09:00 to 09:30 on targetMonday
        RescheduleAppointmentRequest resched = new RescheduleAppointmentRequest(
                targetMonday,
                LocalTime.of(9, 30),
                "Need 30 minutes later"
        );

        mockMvc.perform(patch("/api/patient/appointments/" + createdAppt2Id + "/reschedule")
                        .header("Authorization", "Bearer " + patient2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resched)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(createdAppt2Id))
                .andExpect(jsonPath("$.appointmentDate").value(targetMonday.toString()))
                .andExpect(jsonPath("$.appointmentTime").value("09:30"))
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    // ============================================================
    // 14. Rescheduling to occupied slot fails (returns 409)
    // ============================================================
    @Test
    @Order(14)
    void reschedulingToOccupiedSlotFails() throws Exception {
        // First, Patient 1 books 10:00 on targetMonday
        BookAppointmentRequest book10 = new BookAppointmentRequest(
                doctor1Id,
                targetMonday,
                LocalTime.of(10, 0),
                "Patient 1 at 10:00"
        );
        mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(book10)))
                .andExpect(status().isCreated());

        // Now Patient 2 attempts to reschedule to 10:00 (which is occupied)
        RescheduleAppointmentRequest reschedConflict = new RescheduleAppointmentRequest(
                targetMonday,
                LocalTime.of(10, 0),
                "Should fail because 10:00 is occupied"
        );
        mockMvc.perform(patch("/api/patient/appointments/" + createdAppt2Id + "/reschedule")
                        .header("Authorization", "Bearer " + patient2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reschedConflict)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title").value("CONFLICT"));
    }

    // ============================================================
    // 15. Doctor can view own appointments
    // ============================================================
    @Test
    @Order(15)
    void doctorCanViewOwnAppointments() throws Exception {
        mockMvc.perform(get("/api/doctor/appointments")
                        .header("Authorization", "Bearer " + doctor1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));

        // Date-filtered doctor appointments
        mockMvc.perform(get("/api/doctor/appointments")
                        .header("Authorization", "Bearer " + doctor1Token)
                        .param("date", targetMonday.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));
    }

    // ============================================================
    // 16. Doctor cannot view another doctor's appointments
    // ============================================================
    @Test
    @Order(16)
    void doctorCannotViewAnotherDoctorAppointments() throws Exception {
        // Doctor 2 attempts to view Doctor 1's appointment
        mockMvc.perform(get("/api/doctor/appointments/" + createdAppt2Id)
                        .header("Authorization", "Bearer " + doctor2Token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title").value("FORBIDDEN"));
    }

    // ============================================================
    // 17. Unauthorized appointment access returns 401
    // ============================================================
    @Test
    @Order(17)
    void unauthorizedAppointmentAccessReturns401() throws Exception {
        mockMvc.perform(get("/api/patient/appointments"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/doctor/appointments"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================
    // 18. Forbidden appointment access returns 403
    // ============================================================
    @Test
    @Order(18)
    void forbiddenAppointmentAccessReturns403() throws Exception {
        // Doctor token calling patient endpoint
        mockMvc.perform(get("/api/patient/appointments")
                        .header("Authorization", "Bearer " + doctor1Token))
                .andExpect(status().isForbidden());

        // Patient token calling doctor endpoint
        mockMvc.perform(get("/api/doctor/appointments")
                        .header("Authorization", "Bearer " + patient1Token))
                .andExpect(status().isForbidden());
    }

    // ============================================================
    // 19. CRITICAL CONCURRENT BOOKING TEST
    // Two patients attempt to book the exact same slot concurrently.
    // Exactly ONE must succeed (201 Created) and ONE must fail (409 Conflict).
    // ============================================================
    @Test
    @Order(19)
    void concurrentBookingAttemptsCannotBothSucceed() throws Exception {
        LocalTime raceSlot = LocalTime.of(12, 0); // Open slot on targetMonday
        BookAppointmentRequest req = new BookAppointmentRequest(
                doctor1Id,
                targetMonday,
                raceSlot,
                "Concurrent booking race test"
        );

        String jsonBody = objectMapper.writeValueAsString(req);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch startLatch = new CountDownLatch(1);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);
        AtomicInteger otherCount = new AtomicInteger(0);

        Callable<Void> task1 = () -> {
            startLatch.await();
            try {
                MvcResult res = mockMvc.perform(post("/api/patient/appointments")
                                .header("Authorization", "Bearer " + patient1Token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(jsonBody))
                        .andReturn();
                int sc = res.getResponse().getStatus();
                if (sc == 201) successCount.incrementAndGet();
                else if (sc == 409) conflictCount.incrementAndGet();
                else otherCount.incrementAndGet();
            } catch (Exception e) {
                // If database exception caught
                conflictCount.incrementAndGet();
            }
            return null;
        };

        Callable<Void> task2 = () -> {
            startLatch.await();
            try {
                MvcResult res = mockMvc.perform(post("/api/patient/appointments")
                                .header("Authorization", "Bearer " + patient2Token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(jsonBody))
                        .andReturn();
                int sc = res.getResponse().getStatus();
                if (sc == 201) successCount.incrementAndGet();
                else if (sc == 409) conflictCount.incrementAndGet();
                else otherCount.incrementAndGet();
            } catch (Exception e) {
                conflictCount.incrementAndGet();
            }
            return null;
        };

        Future<Void> f1 = executor.submit(task1);
        Future<Void> f2 = executor.submit(task2);

        // Fire both requests concurrently
        startLatch.countDown();

        f1.get(10, TimeUnit.SECONDS);
        f2.get(10, TimeUnit.SECONDS);
        executor.shutdown();

        // Verification: Exactly ONE succeeds and ONE fails with 409!
        assertEquals(1, successCount.get(), "Exactly one booking must succeed in a concurrent race condition");
        assertEquals(1, conflictCount.get(), "Exactly one booking must receive 409 Conflict in a concurrent race condition");
        assertEquals(0, otherCount.get(), "No unexpected status codes occurred during race");
    }

    // ============================================================
    // 20. Rescheduled slot becomes reusable
    // ============================================================
    @Test
    @Order(20)
    void rescheduledSlotBecomesReusable() throws Exception {
        // Patient 2 is currently booked at 09:30 on targetMonday (from Test 13).
        // Patient 2 now reschedules to targetTuesday 09:00.
        RescheduleAppointmentRequest moveReq = new RescheduleAppointmentRequest(
                targetTuesday,
                LocalTime.of(9, 0),
                "Move to Tuesday"
        );
        mockMvc.perform(patch("/api/patient/appointments/" + createdAppt2Id + "/reschedule")
                        .header("Authorization", "Bearer " + patient2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(moveReq)))
                .andExpect(status().isOk());

        // Slot 09:30 on targetMonday must now be free!
        // Patient 1 books 09:30 on targetMonday
        BookAppointmentRequest bookOldSlot = new BookAppointmentRequest(
                doctor1Id,
                targetMonday,
                LocalTime.of(9, 30),
                "Patient 1 takes previously rescheduled slot"
        );
        mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookOldSlot)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.appointmentTime").value("09:30"));
    }
}
