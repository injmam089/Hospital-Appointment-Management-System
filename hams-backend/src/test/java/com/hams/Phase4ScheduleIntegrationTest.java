package com.hams;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hams.dto.auth.LoginRequest;
import com.hams.dto.auth.RegisterRequest;
import com.hams.dto.doctor.CreateDoctorRequest;
import com.hams.dto.schedule.*;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class Phase4ScheduleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static String doctorToken;
    private static String adminToken;
    private static String patientToken;
    private static Long doctorId;

    @BeforeAll
    static void setupTestData(
            @Autowired MockMvc mvc,
            @Autowired ObjectMapper mapper
    ) throws Exception {
        // 1. Login Admin
        LoginRequest adminLogin = new LoginRequest("admin@hams.local", "Admin@HAMS2024!");
        MvcResult adminRes = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        adminToken = mapper.readTree(adminRes.getResponse().getContentAsString())
                .get("accessToken").asText();

        // 2. Create Doctor via Admin
        CreateDoctorRequest createDoc = new CreateDoctorRequest();
        createDoc.setEmail("dr.sch@hams.local");
        createDoc.setPassword("Doctor123!");
        createDoc.setFirstName("Stephen");
        createDoc.setLastName("Strange");
        createDoc.setDepartmentId(1L);
        createDoc.setSpecialization("Neurosurgeon");
        createDoc.setQualification("MD, PhD");
        createDoc.setExperienceYears(15);
        createDoc.setConsultationFee(new BigDecimal("1200.00"));
        createDoc.setPhone("+91 99999 12345");
        createDoc.setRegistrationNumber("MCI-SCHEDULE-99");
        createDoc.setVerified(true);

        MvcResult docCreateRes = mvc.perform(post("/api/admin/doctors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(createDoc)))
                .andExpect(status().isCreated())
                .andReturn();
        doctorId = mapper.readTree(docCreateRes.getResponse().getContentAsString()).get("id").asLong();

        // 3. Login as Doctor
        LoginRequest docLogin = new LoginRequest("dr.sch@hams.local", "Doctor123!");
        MvcResult docLoginRes = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(docLogin)))
                .andExpect(status().isOk())
                .andReturn();
        doctorToken = mapper.readTree(docLoginRes.getResponse().getContentAsString())
                .get("accessToken").asText();

        // 4. Register & Login Patient
        RegisterRequest patientReg = new RegisterRequest();
        patientReg.setFirstName("Peter");
        patientReg.setLastName("Parker");
        patientReg.setEmail("peter.p4@example.com");
        patientReg.setPassword("Patient123!");
        patientReg.setPhone("+91 98888 77777");

        MvcResult patientRegRes = mvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(patientReg)))
                .andExpect(status().isCreated())
                .andReturn();
        patientToken = mapper.readTree(patientRegRes.getResponse().getContentAsString())
                .get("accessToken").asText();
    }

    // ============================================================
    // 1. Doctor can create availability
    // ============================================================
    @Test
    @Order(1)
    void doctorCanCreateAvailability() throws Exception {
        List<DayAvailabilityRequest> schedule = new ArrayList<>();
        DayAvailabilityRequest monday = new DayAvailabilityRequest(
                DayOfWeek.MONDAY,
                LocalTime.of(9, 0),
                LocalTime.of(13, 0),
                30,
                true,
                List.of(new BreakDto(LocalTime.of(11, 0), LocalTime.of(11, 30)))
        );
        schedule.add(monday);

        mockMvc.perform(put("/api/doctor/availability")
                        .header("Authorization", "Bearer " + doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(schedule)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.doctorId").value(doctorId))
                .andExpect(jsonPath("$.schedule[?(@.dayOfWeek == 'MONDAY')].active").value(true))
                .andExpect(jsonPath("$.schedule[?(@.dayOfWeek == 'MONDAY')].slotDurationMins").value(30))
                .andExpect(jsonPath("$.schedule[?(@.dayOfWeek == 'MONDAY')].breaks", hasSize(1)));
    }

    // ============================================================
    // 2. Doctor can update availability
    // ============================================================
    @Test
    @Order(2)
    void doctorCanUpdateAvailability() throws Exception {
        List<DayAvailabilityRequest> schedule = new ArrayList<>();
        DayAvailabilityRequest mondayUpdated = new DayAvailabilityRequest(
                DayOfWeek.MONDAY,
                LocalTime.of(9, 0),
                LocalTime.of(17, 0),
                30,
                true,
                List.of(new BreakDto(LocalTime.of(13, 0), LocalTime.of(14, 0)))
        );
        schedule.add(mondayUpdated);

        mockMvc.perform(put("/api/doctor/availability")
                        .header("Authorization", "Bearer " + doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(schedule)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.schedule[?(@.dayOfWeek == 'MONDAY')].endTime").value("17:00"));
    }

    // ============================================================
    // 3. Doctor cannot modify another doctor's availability
    // ============================================================
    @Test
    @Order(3)
    void doctorCannotModifyAnotherDoctorAvailability() throws Exception {
        List<DayAvailabilityRequest> schedule = List.of(
                new DayAvailabilityRequest(DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(17, 0), 30, true, List.of())
        );

        // Doctor tries to access admin endpoint for another doctor ID
        mockMvc.perform(put("/api/admin/doctors/999/availability")
                        .header("Authorization", "Bearer " + doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(schedule)))
                .andExpect(status().isForbidden());
    }

    // ============================================================
    // 4. Admin can manage doctor availability
    // ============================================================
    @Test
    @Order(4)
    void adminCanManageDoctorAvailability() throws Exception {
        List<DayAvailabilityRequest> schedule = List.of(
                new DayAvailabilityRequest(DayOfWeek.WEDNESDAY, LocalTime.of(10, 0), LocalTime.of(16, 0), 30, true, List.of())
        );

        mockMvc.perform(put("/api/admin/doctors/" + doctorId + "/availability")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(schedule)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.schedule[?(@.dayOfWeek == 'WEDNESDAY')].active").value(true));
    }

    // ============================================================
    // 5. Patient can view public availability
    // ============================================================
    @Test
    @Order(5)
    void patientCanViewPublicAvailability() throws Exception {
        mockMvc.perform(get("/api/public/doctors/" + doctorId + "/availability")
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.doctorId").value(doctorId))
                .andExpect(jsonPath("$.schedule", notNullValue()));
    }

    // ============================================================
    // 6. Working slots generated correctly (without breaks)
    // ============================================================
    @Test
    @Order(6)
    void workingSlotsGeneratedCorrectly() throws Exception {
        // Set Thursday: 09:00 to 11:00 with 30-min slots = 4 slots (09:00, 09:30, 10:00, 10:30)
        List<DayAvailabilityRequest> schedule = List.of(
                new DayAvailabilityRequest(DayOfWeek.THURSDAY, LocalTime.of(9, 0), LocalTime.of(11, 0), 30, true, List.of())
        );

        mockMvc.perform(put("/api/doctor/availability")
                        .header("Authorization", "Bearer " + doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(schedule)))
                .andExpect(status().isOk());

        // Find a future Thursday
        LocalDate futureThursday = LocalDate.now();
        while (futureThursday.getDayOfWeek() != java.time.DayOfWeek.THURSDAY) {
            futureThursday = futureThursday.plusDays(1);
        }

        mockMvc.perform(get("/api/public/doctors/" + doctorId + "/slots")
                        .param("date", futureThursday.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.workingDay").value(true))
                .andExpect(jsonPath("$.onLeave").value(false))
                .andExpect(jsonPath("$.slots", hasSize(4)))
                .andExpect(jsonPath("$.slots[0].formattedTime").value("09:00"))
                .andExpect(jsonPath("$.slots[1].formattedTime").value("09:30"))
                .andExpect(jsonPath("$.slots[2].formattedTime").value("10:00"))
                .andExpect(jsonPath("$.slots[3].formattedTime").value("10:30"));
    }

    // ============================================================
    // 7. Breaks excluded correctly
    // ============================================================
    @Test
    @Order(7)
    void breaksExcludedCorrectly() throws Exception {
        // Set Friday: 09:00 to 12:00 (6 potential 30-min slots: 09:00, 09:30, 10:00, 10:30, 11:00, 11:30)
        // Break from 10:00 to 11:00 -> removes 10:00 and 10:30 slots!
        // Remaining slots = 4 (09:00, 09:30, 11:00, 11:30)
        List<DayAvailabilityRequest> schedule = List.of(
                new DayAvailabilityRequest(
                        DayOfWeek.FRIDAY,
                        LocalTime.of(9, 0),
                        LocalTime.of(12, 0),
                        30,
                        true,
                        List.of(new BreakDto(LocalTime.of(10, 0), LocalTime.of(11, 0)))
                )
        );

        mockMvc.perform(put("/api/doctor/availability")
                        .header("Authorization", "Bearer " + doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(schedule)))
                .andExpect(status().isOk());

        LocalDate futureFriday = LocalDate.now();
        while (futureFriday.getDayOfWeek() != java.time.DayOfWeek.FRIDAY) {
            futureFriday = futureFriday.plusDays(1);
        }

        mockMvc.perform(get("/api/public/doctors/" + doctorId + "/slots")
                        .param("date", futureFriday.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slots", hasSize(4)))
                .andExpect(jsonPath("$.slots[0].formattedTime").value("09:00"))
                .andExpect(jsonPath("$.slots[1].formattedTime").value("09:30"))
                .andExpect(jsonPath("$.slots[2].formattedTime").value("11:00"))
                .andExpect(jsonPath("$.slots[3].formattedTime").value("11:30"));
    }

    // ============================================================
    // 8. Leave excludes all slots
    // ============================================================
    @Test
    @Order(8)
    void leaveExcludesAllSlots() throws Exception {
        LocalDate leaveDate = LocalDate.now().plusMonths(2);
        while (leaveDate.getDayOfWeek() != java.time.DayOfWeek.THURSDAY) {
            leaveDate = leaveDate.plusDays(1);
        }

        // Apply for leave on that Thursday
        DoctorLeaveRequest leaveReq = new DoctorLeaveRequest(leaveDate, leaveDate, "Attending medical symposium");
        mockMvc.perform(post("/api/doctor/leaves")
                        .header("Authorization", "Bearer " + doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(leaveReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reason").value("Attending medical symposium"));

        // Slot preview on that leave date should return onLeave = true and 0 slots
        mockMvc.perform(get("/api/public/doctors/" + doctorId + "/slots")
                        .param("date", leaveDate.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.onLeave").value(true))
                .andExpect(jsonPath("$.slots", hasSize(0)));
    }

    // ============================================================
    // 9. Invalid working hours rejected
    // ============================================================
    @Test
    @Order(9)
    void invalidWorkingHoursRejected() throws Exception {
        // End time (08:00) before start time (09:00)
        List<DayAvailabilityRequest> schedule = List.of(
                new DayAvailabilityRequest(DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(8, 0), 30, true, List.of())
        );

        mockMvc.perform(put("/api/doctor/availability")
                        .header("Authorization", "Bearer " + doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(schedule)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("BAD_REQUEST"));
    }

    // ============================================================
    // 10. Invalid break rejected
    // ============================================================
    @Test
    @Order(10)
    void invalidBreakRejected() throws Exception {
        // Break (18:00 to 19:00) outside working hours (09:00 to 17:00)
        List<DayAvailabilityRequest> schedule = List.of(
                new DayAvailabilityRequest(
                        DayOfWeek.MONDAY,
                        LocalTime.of(9, 0),
                        LocalTime.of(17, 0),
                        30,
                        true,
                        List.of(new BreakDto(LocalTime.of(18, 0), LocalTime.of(19, 0)))
                )
        );

        mockMvc.perform(put("/api/doctor/availability")
                        .header("Authorization", "Bearer " + doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(schedule)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("BAD_REQUEST"));
    }

    // ============================================================
    // 11. Invalid leave rejected
    // ============================================================
    @Test
    @Order(11)
    void invalidLeaveRejected() throws Exception {
        // End date before start date
        DoctorLeaveRequest invalidLeave = new DoctorLeaveRequest(
                LocalDate.now().plusDays(10),
                LocalDate.now().plusDays(5),
                "Invalid dates"
        );

        mockMvc.perform(post("/api/doctor/leaves")
                        .header("Authorization", "Bearer " + doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidLeave)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("BAD_REQUEST"));
    }

    // ============================================================
    // 12. Multiple schedule days work correctly
    // ============================================================
    @Test
    @Order(12)
    void multipleScheduleDaysWorkCorrectly() throws Exception {
        List<DayAvailabilityRequest> multiDays = List.of(
                new DayAvailabilityRequest(DayOfWeek.TUESDAY, LocalTime.of(14, 0), LocalTime.of(18, 0), 60, true, List.of()),
                new DayAvailabilityRequest(DayOfWeek.SATURDAY, LocalTime.of(9, 0), LocalTime.of(13, 0), 45, true, List.of())
        );

        mockMvc.perform(put("/api/doctor/availability")
                        .header("Authorization", "Bearer " + doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(multiDays)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.schedule[?(@.dayOfWeek == 'TUESDAY')].slotDurationMins").value(60))
                .andExpect(jsonPath("$.schedule[?(@.dayOfWeek == 'SATURDAY')].slotDurationMins").value(45));
    }

    // ============================================================
    // 13. Unauthorized access returns 401
    // ============================================================
    @Test
    @Order(13)
    void unauthorizedAccessReturns401() throws Exception {
        mockMvc.perform(get("/api/doctor/availability"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================
    // 14. Forbidden access returns 403
    // ============================================================
    @Test
    @Order(14)
    void forbiddenAccessReturns403() throws Exception {
        // Patient role trying to access doctor availability management endpoint
        mockMvc.perform(get("/api/doctor/availability")
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isForbidden());
    }
}
