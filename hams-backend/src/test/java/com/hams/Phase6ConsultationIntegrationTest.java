package com.hams;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hams.dto.appointment.BookAppointmentRequest;
import com.hams.dto.auth.LoginRequest;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class Phase6ConsultationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static String adminToken;
    private static String doctor1Token;
    private static Long doctor1Id;
    private static String doctor2Token;
    private static Long doctor2Id;

    private static String patient1Token;
    private static String patient2Token;

    private static LocalDate targetDate;
    private static Long appointmentId1;
    private static Long appointmentId2;
    private static Long consultationId1;
    private static Long prescriptionId1;

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

        // 2. Register Doctor 1
        String doc1Email = "doc6_1_" + System.currentTimeMillis() + "@hams.local";
        CreateDoctorRequest doc1Req = new CreateDoctorRequest();
        doc1Req.setEmail(doc1Email);
        doc1Req.setPassword("Doctor@123456");
        doc1Req.setFirstName("Sarah");
        doc1Req.setLastName("Connor");
        doc1Req.setSpecialization("General Medicine");
        doc1Req.setDepartmentId(1L);
        doc1Req.setConsultationFee(new BigDecimal("500.00"));
        doc1Req.setExperienceYears(10);
        MvcResult d1Res = mockMvc.perform(post("/api/admin/doctors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(doc1Req)))
                .andExpect(status().isCreated())
                .andReturn();
        doctor1Id = objectMapper.readTree(d1Res.getResponse().getContentAsString()).path("id").asLong();

        // Verify Doctor 1
        mockMvc.perform(patch("/api/admin/doctors/" + doctor1Id + "/verify")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // Doctor 1 Login
        LoginRequest doc1Login = new LoginRequest(doc1Email, "Doctor@123456");
        MvcResult doc1LogRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(doc1Login)))
                .andExpect(status().isOk())
                .andReturn();
        doctor1Token = objectMapper.readTree(doc1LogRes.getResponse().getContentAsString())
                .get("accessToken").asText();

        // Configure Schedule for Doctor 1: Monday-Sunday 09:00 - 17:00
        List<DayAvailabilityRequest> sched1 = new ArrayList<>();
        for (DayOfWeek day : DayOfWeek.values()) {
            DayAvailabilityRequest dar = new DayAvailabilityRequest();
            dar.setDayOfWeek(day);
            dar.setStartTime(LocalTime.of(9, 0));
            dar.setEndTime(LocalTime.of(17, 0));
            dar.setSlotDurationMins(30);
            dar.setActive(true);
            sched1.add(dar);
        }
        mockMvc.perform(put("/api/doctor/availability")
                        .header("Authorization", "Bearer " + doctor1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sched1)))
                .andExpect(status().isOk());

        // 3. Register Doctor 2
        String doc2Email = "doc6_2_" + System.currentTimeMillis() + "@hams.local";
        CreateDoctorRequest doc2Req = new CreateDoctorRequest();
        doc2Req.setEmail(doc2Email);
        doc2Req.setPassword("Doctor@123456");
        doc2Req.setFirstName("Marcus");
        doc2Req.setLastName("Wright");
        doc2Req.setSpecialization("Cardiology");
        doc2Req.setDepartmentId(1L);
        doc2Req.setConsultationFee(new BigDecimal("750.00"));
        doc2Req.setExperienceYears(8);
        MvcResult d2Res = mockMvc.perform(post("/api/admin/doctors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(doc2Req)))
                .andExpect(status().isCreated())
                .andReturn();
        doctor2Id = objectMapper.readTree(d2Res.getResponse().getContentAsString()).path("id").asLong();

        mockMvc.perform(patch("/api/admin/doctors/" + doctor2Id + "/verify")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        LoginRequest doc2Login = new LoginRequest(doc2Email, "Doctor@123456");
        MvcResult doc2LogRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(doc2Login)))
                .andExpect(status().isOk())
                .andReturn();
        doctor2Token = objectMapper.readTree(doc2LogRes.getResponse().getContentAsString())
                .get("accessToken").asText();

        // 4. Register Patient 1
        String pat1Email = "pat6_1_" + System.currentTimeMillis() + "@hams.local";
        RegisterRequest p1Req = new RegisterRequest();
        p1Req.setEmail(pat1Email);
        p1Req.setPassword("Patient@123456");
        p1Req.setFirstName("Kyle");
        p1Req.setLastName("Reese");
        MvcResult p1Res = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(p1Req)))
                .andExpect(status().isCreated())
                .andReturn();
        patient1Token = objectMapper.readTree(p1Res.getResponse().getContentAsString())
                .get("accessToken").asText();

        // 5. Register Patient 2
        String pat2Email = "pat6_2_" + System.currentTimeMillis() + "@hams.local";
        RegisterRequest p2Req = new RegisterRequest();
        p2Req.setEmail(pat2Email);
        p2Req.setPassword("Patient@123456");
        p2Req.setFirstName("John");
        p2Req.setLastName("Connor");
        MvcResult p2Res = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(p2Req)))
                .andExpect(status().isCreated())
                .andReturn();
        patient2Token = objectMapper.readTree(p2Res.getResponse().getContentAsString())
                .get("accessToken").asText();

        // 6. Target date (tomorrow)
        targetDate = LocalDate.now().plusDays(1);

        // 7. Patient 1 books Appointment 1 with Doctor 1 at 09:00
        BookAppointmentRequest b1 = new BookAppointmentRequest();
        b1.setDoctorId(doctor1Id);
        b1.setAppointmentDate(targetDate);
        b1.setAppointmentTime(LocalTime.of(9, 0));
        b1.setReason("Chest congestion and cough");
        MvcResult appt1Res = mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(b1)))
                .andExpect(status().isCreated())
                .andReturn();
        appointmentId1 = objectMapper.readTree(appt1Res.getResponse().getContentAsString()).path("id").asLong();

        // 8. Patient 1 books Appointment 2 with Doctor 1 at 09:30
        BookAppointmentRequest b2 = new BookAppointmentRequest();
        b2.setDoctorId(doctor1Id);
        b2.setAppointmentDate(targetDate);
        b2.setAppointmentTime(LocalTime.of(9, 30));
        b2.setReason("Routine blood pressure follow-up");
        MvcResult appt2Res = mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(b2)))
                .andExpect(status().isCreated())
                .andReturn();
        appointmentId2 = objectMapper.readTree(appt2Res.getResponse().getContentAsString()).path("id").asLong();
    }

    @Test
    @Order(1)
    @DisplayName("1. Doctor can check in eligible appointment (CONFIRMED -> CHECKED_IN)")
    void test1_checkInAppointment_success() throws Exception {
        mockMvc.perform(post("/api/doctor/appointments/" + appointmentId1 + "/check-in")
                        .header("Authorization", "Bearer " + doctor1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(appointmentId1))
                .andExpect(jsonPath("$.status").value("CHECKED_IN"));
    }

    @Test
    @Order(2)
    @DisplayName("2. Doctor can start consultation (CHECKED_IN -> IN_CONSULTATION)")
    void test2_startConsultation_success() throws Exception {
        mockMvc.perform(post("/api/doctor/appointments/" + appointmentId1 + "/start-consultation")
                        .header("Authorization", "Bearer " + doctor1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(appointmentId1))
                .andExpect(jsonPath("$.status").value("IN_CONSULTATION"));
    }

    @Test
    @Order(3)
    @DisplayName("3. Doctor can create consultation with diagnosis and clinical notes")
    void test3_createConsultation_success() throws Exception {
        CreateConsultationRequest req = new CreateConsultationRequest();
        req.setSymptoms("Productive cough, mild fever 100F, chest tightness for 3 days");
        req.setDiagnosis("Acute Bronchitis");
        req.setClinicalNotes("Bilateral wheezing audible. Oxygen saturation 98% on room air.");
        req.setTreatmentNotes("Increase warm fluid intake, steam inhalation twice daily, rest.");
        req.setFollowUpDate(targetDate.plusDays(7));

        MvcResult res = mockMvc.perform(post("/api/doctor/appointments/" + appointmentId1 + "/consultation")
                        .header("Authorization", "Bearer " + doctor1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.appointmentId").value(appointmentId1))
                .andExpect(jsonPath("$.diagnosis").value("Acute Bronchitis"))
                .andExpect(jsonPath("$.symptoms", containsString("chest tightness")))
                .andReturn();

        consultationId1 = objectMapper.readTree(res.getResponse().getContentAsString()).path("id").asLong();
        assertNotNull(consultationId1);
    }

    @Test
    @Order(4)
    @DisplayName("4. Doctor can add prescription to existing consultation")
    void test4_createPrescription_success() throws Exception {
        CreatePrescriptionRequest rxReq = new CreatePrescriptionRequest();
        rxReq.setGeneralInstructions("Take all medicines after meals. Drink adequate fluids.");

        List<PrescriptionItemRequest> items = new ArrayList<>();
        items.add(new PrescriptionItemRequest("Amoxicillin 500mg", "500 mg", "3 times a day", "5 days", "Take with plenty of water"));
        rxReq.setItems(items);

        MvcResult res = mockMvc.perform(post("/api/doctor/consultations/" + consultationId1 + "/prescription")
                        .header("Authorization", "Bearer " + doctor1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rxReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.consultationId").value(consultationId1))
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].medicineName").value("Amoxicillin 500mg"))
                .andReturn();

        prescriptionId1 = objectMapper.readTree(res.getResponse().getContentAsString()).path("id").asLong();
        assertNotNull(prescriptionId1);
    }

    @Test
    @Order(5)
    @DisplayName("5. Doctor can create consultation with multiple prescription items in one request")
    void test5_createConsultationWithMultipleMedicines_success() throws Exception {
        // Prepare appointment 2: Check in -> Start Consultation
        mockMvc.perform(post("/api/doctor/appointments/" + appointmentId2 + "/check-in")
                        .header("Authorization", "Bearer " + doctor1Token))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/doctor/appointments/" + appointmentId2 + "/start-consultation")
                        .header("Authorization", "Bearer " + doctor1Token))
                .andExpect(status().isOk());

        CreateConsultationRequest req = new CreateConsultationRequest();
        req.setSymptoms("High blood pressure check, morning headache");
        req.setDiagnosis("Stage 1 Essential Hypertension");
        req.setClinicalNotes("BP reading 142/90 mmHg. Heart sounds normal.");
        req.setTreatmentNotes("Low sodium diet, 30 min daily walking.");
        req.setFollowUpDate(targetDate.plusDays(14));
        req.setGeneralInstructions("Maintain a daily BP log.");

        List<PrescriptionItemRequest> meds = new ArrayList<>();
        meds.add(new PrescriptionItemRequest("Amlodipine 5mg", "5 mg", "Once daily", "30 days", "Every morning"));
        meds.add(new PrescriptionItemRequest("Telmisartan 40mg", "40 mg", "Once daily", "30 days", "Every evening"));
        meds.add(new PrescriptionItemRequest("Vitamin D3 60k", "60,000 IU", "Once a week", "8 weeks", "After heavy breakfast"));
        req.setMedicines(meds);

        mockMvc.perform(post("/api/doctor/appointments/" + appointmentId2 + "/consultation")
                        .header("Authorization", "Bearer " + doctor1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.diagnosis").value("Stage 1 Essential Hypertension"))
                .andExpect(jsonPath("$.prescription").isMap())
                .andExpect(jsonPath("$.prescription.items", hasSize(3)))
                .andExpect(jsonPath("$.prescription.items[0].medicineName").value("Amlodipine 5mg"))
                .andExpect(jsonPath("$.prescription.items[1].medicineName").value("Telmisartan 40mg"))
                .andExpect(jsonPath("$.prescription.items[2].medicineName").value("Vitamin D3 60k"));
    }

    @Test
    @Order(6)
    @DisplayName("6. Doctor can complete appointment (IN_CONSULTATION -> COMPLETED)")
    void test6_completeAppointment_success() throws Exception {
        mockMvc.perform(post("/api/doctor/appointments/" + appointmentId1 + "/complete")
                        .header("Authorization", "Bearer " + doctor1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(appointmentId1))
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    @Order(7)
    @DisplayName("7. Patient can view own prescription")
    void test7_patientViewOwnPrescription_success() throws Exception {
        mockMvc.perform(get("/api/patient/prescriptions/" + prescriptionId1)
                        .header("Authorization", "Bearer " + patient1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(prescriptionId1))
                .andExpect(jsonPath("$.doctorName", containsString("Sarah Connor")))
                .andExpect(jsonPath("$.items[0].medicineName").value("Amoxicillin 500mg"));

        // List patient prescriptions
        mockMvc.perform(get("/api/patient/prescriptions")
                        .header("Authorization", "Bearer " + patient1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @Order(8)
    @DisplayName("8. Patient cannot view another patient's prescription (403 Forbidden)")
    void test8_patientCannotViewOtherPatientPrescription_forbidden() throws Exception {
        mockMvc.perform(get("/api/patient/prescriptions/" + prescriptionId1)
                        .header("Authorization", "Bearer " + patient2Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(9)
    @DisplayName("9. Doctor cannot access another doctor's consultation (403 Forbidden)")
    void test9_doctorCannotAccessOtherDoctorConsultation_forbidden() throws Exception {
        mockMvc.perform(get("/api/doctor/consultations/" + consultationId1)
                        .header("Authorization", "Bearer " + doctor2Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(10)
    @DisplayName("10. Patient cannot create consultation (403 Forbidden)")
    void test10_patientCannotCreateConsultation_forbidden() throws Exception {
        CreateConsultationRequest req = new CreateConsultationRequest();
        req.setDiagnosis("Self diagnosis");

        mockMvc.perform(post("/api/doctor/appointments/" + appointmentId1 + "/consultation")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(11)
    @DisplayName("11. Invalid appointment state cannot start consultation (CONFIRMED without check-in)")
    void test11_invalidStateCannotStartConsultation_badRequest() throws Exception {
        // Book appointment 3
        BookAppointmentRequest b3 = new BookAppointmentRequest();
        b3.setDoctorId(doctor1Id);
        b3.setAppointmentDate(targetDate);
        b3.setAppointmentTime(LocalTime.of(10, 0));
        b3.setReason("Test invalid state jump");
        MvcResult res = mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(b3)))
                .andExpect(status().isCreated())
                .andReturn();
        Long appt3Id = objectMapper.readTree(res.getResponse().getContentAsString()).path("id").asLong();

        // Directly trying to start consultation without check-in must fail (400)
        mockMvc.perform(post("/api/doctor/appointments/" + appt3Id + "/start-consultation")
                        .header("Authorization", "Bearer " + doctor1Token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(12)
    @DisplayName("12. Cancelled appointment cannot start consultation")
    void test12_cancelledAppointmentCannotStartConsultation_badRequest() throws Exception {
        // Book appointment 4 and cancel it
        BookAppointmentRequest b4 = new BookAppointmentRequest();
        b4.setDoctorId(doctor1Id);
        b4.setAppointmentDate(targetDate);
        b4.setAppointmentTime(LocalTime.of(10, 30));
        b4.setReason("To be cancelled");
        MvcResult res = mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(b4)))
                .andExpect(status().isCreated())
                .andReturn();
        Long appt4Id = objectMapper.readTree(res.getResponse().getContentAsString()).path("id").asLong();

        mockMvc.perform(patch("/api/patient/appointments/" + appt4Id + "/cancel")
                        .header("Authorization", "Bearer " + patient1Token))
                .andExpect(status().isOk());

        // Attempting to check-in or start consultation on cancelled appointment must fail
        mockMvc.perform(post("/api/doctor/appointments/" + appt4Id + "/check-in")
                        .header("Authorization", "Bearer " + doctor1Token))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/doctor/appointments/" + appt4Id + "/start-consultation")
                        .header("Authorization", "Bearer " + doctor1Token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(13)
    @DisplayName("13. Completed appointment cannot start another consultation")
    void test13_completedAppointmentCannotStartConsultation_badRequest() throws Exception {
        // appointmentId1 is completed
        mockMvc.perform(post("/api/doctor/appointments/" + appointmentId1 + "/start-consultation")
                        .header("Authorization", "Bearer " + doctor1Token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(14)
    @DisplayName("14. Duplicate consultation returns 409 Conflict")
    void test14_duplicateConsultation_conflict() throws Exception {
        CreateConsultationRequest req = new CreateConsultationRequest();
        req.setDiagnosis("Second diagnosis attempt");

        // appointmentId1 already has consultationId1
        mockMvc.perform(post("/api/doctor/appointments/" + appointmentId1 + "/consultation")
                        .header("Authorization", "Bearer " + doctor1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict());
    }

    @Test
    @Order(15)
    @DisplayName("15. Duplicate prescription creation is prevented (409 Conflict)")
    void test15_duplicatePrescription_conflict() throws Exception {
        CreatePrescriptionRequest rxReq = new CreatePrescriptionRequest();
        List<PrescriptionItemRequest> items = new ArrayList<>();
        items.add(new PrescriptionItemRequest("Ibuprofen 400mg", "400 mg", "Twice daily", "3 days", "After meals"));
        rxReq.setItems(items);

        // consultationId1 already has a prescription
        mockMvc.perform(post("/api/doctor/consultations/" + consultationId1 + "/prescription")
                        .header("Authorization", "Bearer " + doctor1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rxReq)))
                .andExpect(status().isConflict());
    }

    @Test
    @Order(16)
    @DisplayName("16. Invalid prescription item rejected (missing required fields)")
    void test16_invalidPrescriptionItem_rejected() throws Exception {
        // Book, check-in, start consultation for new appointment 5
        BookAppointmentRequest b5 = new BookAppointmentRequest();
        b5.setDoctorId(doctor1Id);
        b5.setAppointmentDate(targetDate);
        b5.setAppointmentTime(LocalTime.of(11, 0));
        MvcResult res = mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(b5)))
                .andExpect(status().isCreated())
                .andReturn();
        Long appt5Id = objectMapper.readTree(res.getResponse().getContentAsString()).path("id").asLong();

        mockMvc.perform(post("/api/doctor/appointments/" + appt5Id + "/check-in")
                        .header("Authorization", "Bearer " + doctor1Token))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/doctor/appointments/" + appt5Id + "/start-consultation")
                        .header("Authorization", "Bearer " + doctor1Token))
                .andExpect(status().isOk());

        // Create consultation without prescription
        CreateConsultationRequest req = new CreateConsultationRequest();
        req.setDiagnosis("Viral Pharyngitis");
        MvcResult cRes = mockMvc.perform(post("/api/doctor/appointments/" + appt5Id + "/consultation")
                        .header("Authorization", "Bearer " + doctor1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        Long c5Id = objectMapper.readTree(cRes.getResponse().getContentAsString()).path("id").asLong();

        // Attempt prescription with blank medicine name
        CreatePrescriptionRequest badRx = new CreatePrescriptionRequest();
        List<PrescriptionItemRequest> badItems = new ArrayList<>();
        badItems.add(new PrescriptionItemRequest("", "500mg", "Twice daily", "5 days", ""));
        badRx.setItems(badItems);

        mockMvc.perform(post("/api/doctor/consultations/" + c5Id + "/prescription")
                        .header("Authorization", "Bearer " + doctor1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRx)))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @Order(17)
    @DisplayName("17. Unauthorized request returns 401")
    void test17_unauthorizedRequest_returns401() throws Exception {
        mockMvc.perform(get("/api/doctor/consultations"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/patient/prescriptions"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(18)
    @DisplayName("18. Forbidden request returns 403 (Doctor accessing patient endpoint)")
    void test18_forbiddenRoleAccess_returns403() throws Exception {
        mockMvc.perform(get("/api/patient/prescriptions")
                        .header("Authorization", "Bearer " + doctor1Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(19)
    @DisplayName("19. Missing consultation returns 404")
    void test19_missingConsultation_returns404() throws Exception {
        mockMvc.perform(get("/api/doctor/consultations/999999")
                        .header("Authorization", "Bearer " + doctor1Token))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(20)
    @DisplayName("20. Complete consultation and prescription workflow verified end-to-end")
    void test20_completeWorkflow_endToEnd() throws Exception {
        // Book appointment
        BookAppointmentRequest bookReq = new BookAppointmentRequest();
        bookReq.setDoctorId(doctor1Id);
        bookReq.setAppointmentDate(targetDate);
        bookReq.setAppointmentTime(LocalTime.of(11, 30));
        bookReq.setReason("Allergic Rhinitis");

        MvcResult bookRes = mockMvc.perform(post("/api/patient/appointments")
                        .header("Authorization", "Bearer " + patient1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andReturn();
        Long apptId = objectMapper.readTree(bookRes.getResponse().getContentAsString()).path("id").asLong();

        // 1. CONFIRMED -> CHECKED_IN
        mockMvc.perform(post("/api/doctor/appointments/" + apptId + "/check-in")
                        .header("Authorization", "Bearer " + doctor1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CHECKED_IN"));

        // 2. CHECKED_IN -> IN_CONSULTATION
        mockMvc.perform(post("/api/doctor/appointments/" + apptId + "/start-consultation")
                        .header("Authorization", "Bearer " + doctor1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_CONSULTATION"));

        // 3. Create Consultation + Prescription in consultation
        CreateConsultationRequest cReq = new CreateConsultationRequest();
        cReq.setSymptoms("Sneezing, runny nose, itchy watery eyes");
        cReq.setDiagnosis("Seasonal Allergic Rhinitis");
        cReq.setClinicalNotes("Nasal mucosa pale and swollen.");
        cReq.setTreatmentNotes("Avoid pollen exposure, keep windows closed.");
        cReq.setFollowUpDate(targetDate.plusDays(10));
        cReq.setGeneralInstructions("Take antihistamine at night before sleep.");

        List<PrescriptionItemRequest> items = new ArrayList<>();
        items.add(new PrescriptionItemRequest("Cetirizine 10mg", "10 mg", "Once daily", "10 days", "At night before bedtime"));
        items.add(new PrescriptionItemRequest("Fluticasone Nasal Spray", "50 mcg", "2 sprays per nostril", "14 days", "Morning"));
        cReq.setMedicines(items);

        MvcResult cRes = mockMvc.perform(post("/api/doctor/appointments/" + apptId + "/consultation")
                        .header("Authorization", "Bearer " + doctor1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.diagnosis").value("Seasonal Allergic Rhinitis"))
                .andExpect(jsonPath("$.prescription.items", hasSize(2)))
                .andReturn();
        Long finalPrescriptionId = objectMapper.readTree(cRes.getResponse().getContentAsString())
                .path("prescription").path("id").asLong();

        // 4. IN_CONSULTATION -> COMPLETED
        mockMvc.perform(post("/api/doctor/appointments/" + apptId + "/complete")
                        .header("Authorization", "Bearer " + doctor1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        // 5. Patient views completed appointment prescription
        mockMvc.perform(get("/api/patient/prescriptions/" + finalPrescriptionId)
                        .header("Authorization", "Bearer " + patient1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.diagnosis").value("Seasonal Allergic Rhinitis"))
                .andExpect(jsonPath("$.items", hasSize(2)));

        // 6. Doctor views consultation history
        mockMvc.perform(get("/api/doctor/consultations")
                        .header("Authorization", "Bearer " + doctor1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(3))));
    }
}
