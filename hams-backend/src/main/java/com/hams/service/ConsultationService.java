package com.hams.service;

import com.hams.dto.appointment.AppointmentResponse;
import com.hams.dto.consultation.*;
import com.hams.entity.*;
import com.hams.enums.AppointmentStatus;
import com.hams.exception.HamsException;
import com.hams.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public ConsultationService(ConsultationRepository consultationRepository,
                               PrescriptionRepository prescriptionRepository,
                               AppointmentRepository appointmentRepository,
                               DoctorRepository doctorRepository,
                               PatientRepository patientRepository,
                               UserRepository userRepository,
                               AuditLogService auditLogService,
                               NotificationService notificationService) {
        this.consultationRepository = consultationRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    // ============================================================
    // APPOINTMENT STATUS TRANSITIONS (DOCTOR WORKFLOW)
    // ============================================================

    public AppointmentResponse checkInAppointment(String doctorEmail, Long appointmentId) {
        Doctor doctor = getDoctorByEmail(doctorEmail);
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> HamsException.notFound("Appointment", appointmentId));

        validateDoctorAppointmentOwnership(doctor, appointment);

        if (appointment.getStatus() == AppointmentStatus.CHECKED_IN) {
            return mapAppointmentToResponse(appointment);
        }

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw HamsException.badRequest("Cannot check in appointment with status: " + appointment.getStatus()
                    + ". Only CONFIRMED appointments can be checked in.");
        }

        appointment.setStatus(AppointmentStatus.CHECKED_IN);
        Appointment saved = appointmentRepository.saveAndFlush(appointment);

        auditLogService.logAction(
                doctor.getUser().getId(),
                "APPOINTMENT_CHECKED_IN",
                "APPOINTMENT",
                saved.getId(),
                null,
                "Checked in patient for appointment " + saved.getAppointmentRef()
        );

        notificationService.notifyAppointmentCheckedIn(saved);

        return mapAppointmentToResponse(saved);
    }

    public AppointmentResponse startConsultation(String doctorEmail, Long appointmentId) {
        Doctor doctor = getDoctorByEmail(doctorEmail);
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> HamsException.notFound("Appointment", appointmentId));

        validateDoctorAppointmentOwnership(doctor, appointment);

        if (appointment.getStatus() == AppointmentStatus.IN_CONSULTATION) {
            return mapAppointmentToResponse(appointment);
        }

        if (appointment.getStatus() != AppointmentStatus.CHECKED_IN) {
            throw HamsException.badRequest("Cannot start consultation for appointment with status: "
                    + appointment.getStatus() + ". Appointment must be in CHECKED_IN status first.");
        }

        appointment.setStatus(AppointmentStatus.IN_CONSULTATION);
        Appointment saved = appointmentRepository.saveAndFlush(appointment);

        auditLogService.logAction(
                doctor.getUser().getId(),
                "APPOINTMENT_CONSULTATION_STARTED",
                "APPOINTMENT",
                saved.getId(),
                null,
                "Started consultation for appointment " + saved.getAppointmentRef()
        );

        return mapAppointmentToResponse(saved);
    }

    public AppointmentResponse completeAppointment(String doctorEmail, Long appointmentId) {
        Doctor doctor = getDoctorByEmail(doctorEmail);
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> HamsException.notFound("Appointment", appointmentId));

        validateDoctorAppointmentOwnership(doctor, appointment);

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            return mapAppointmentToResponse(appointment);
        }

        if (appointment.getStatus() != AppointmentStatus.IN_CONSULTATION) {
            throw HamsException.badRequest("Cannot complete appointment with status: " + appointment.getStatus()
                    + ". Appointment must be IN_CONSULTATION before completion.");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        Appointment saved = appointmentRepository.saveAndFlush(appointment);

        auditLogService.logAction(
                doctor.getUser().getId(),
                "APPOINTMENT_COMPLETED",
                "APPOINTMENT",
                saved.getId(),
                null,
                "Completed appointment " + saved.getAppointmentRef()
        );

        notificationService.notifyConsultationCompleted(saved);

        return mapAppointmentToResponse(saved);
    }

    // ============================================================
    // CONSULTATION CREATION & MANAGEMENT (DOCTOR)
    // ============================================================

    public ConsultationResponse createConsultation(String doctorEmail, Long appointmentId, CreateConsultationRequest request) {
        Doctor doctor = getDoctorByEmail(doctorEmail);
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> HamsException.notFound("Appointment", appointmentId));

        validateDoctorAppointmentOwnership(doctor, appointment);

        // Check appointment eligibility
        if (appointment.getStatus() != AppointmentStatus.IN_CONSULTATION && appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw HamsException.badRequest("Cannot create consultation for appointment in status: "
                    + appointment.getStatus() + ". Appointment must be IN_CONSULTATION.");
        }

        // Duplicate consultation prevention
        if (consultationRepository.existsByAppointmentId(appointmentId)) {
            throw HamsException.conflict("A consultation record already exists for appointment ID: " + appointmentId);
        }

        if (request.getDiagnosis() == null || request.getDiagnosis().trim().isEmpty()) {
            throw HamsException.badRequest("Diagnosis is required.");
        }

        Consultation consultation = Consultation.builder()
                .appointment(appointment)
                .doctor(doctor)
                .patient(appointment.getPatient())
                .symptoms(request.getSymptoms() != null ? request.getSymptoms().trim() : null)
                .diagnosis(request.getDiagnosis().trim())
                .clinicalNotes(request.getClinicalNotes() != null ? request.getClinicalNotes().trim() : null)
                .notes(request.getClinicalNotes() != null ? request.getClinicalNotes().trim() : null)
                .treatmentNotes(request.getTreatmentNotes() != null ? request.getTreatmentNotes().trim() : null)
                .advice(request.getTreatmentNotes() != null ? request.getTreatmentNotes().trim() : null)
                .followUpDate(request.getFollowUpDate())
                .build();

        Consultation savedConsultation = consultationRepository.saveAndFlush(consultation);

        // If medicines are provided in this request, create the attached prescription
        if (request.getMedicines() != null && !request.getMedicines().isEmpty()) {
            Prescription prescription = buildPrescriptionFromItems(
                    savedConsultation,
                    doctor,
                    appointment.getPatient(),
                    request.getGeneralInstructions(),
                    request.getMedicines()
            );
            Prescription savedPrescription = prescriptionRepository.saveAndFlush(prescription);
            savedConsultation.setPrescription(savedPrescription);
            notificationService.notifyPrescriptionAvailable(appointment);
        }

        auditLogService.logAction(
                doctor.getUser().getId(),
                "CONSULTATION_CREATED",
                "CONSULTATION",
                savedConsultation.getId(),
                null,
                "Created clinical consultation for appointment " + appointment.getAppointmentRef()
        );

        return mapConsultationToResponse(savedConsultation);
    }

    @Transactional(readOnly = true)
    public List<ConsultationResponse> getDoctorConsultations(String doctorEmail) {
        Doctor doctor = getDoctorByEmail(doctorEmail);
        return consultationRepository.findByDoctorIdOrderByCreatedAtDesc(doctor.getId())
                .stream()
                .map(this::mapConsultationToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ConsultationResponse getDoctorConsultationById(String doctorEmail, Long consultationId) {
        Doctor doctor = getDoctorByEmail(doctorEmail);
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> HamsException.notFound("Consultation", consultationId));

        if (!consultation.getDoctor().getId().equals(doctor.getId())) {
            throw HamsException.forbidden("You do not have permission to view this consultation");
        }

        return mapConsultationToResponse(consultation);
    }

    // ============================================================
    // PRESCRIPTION CREATION & MANAGEMENT (DOCTOR)
    // ============================================================

    public PrescriptionResponse createPrescription(String doctorEmail, Long consultationId, CreatePrescriptionRequest request) {
        Doctor doctor = getDoctorByEmail(doctorEmail);
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> HamsException.notFound("Consultation", consultationId));

        if (!consultation.getDoctor().getId().equals(doctor.getId())) {
            throw HamsException.forbidden("You do not have permission to create a prescription for this consultation");
        }

        // Duplicate prescription prevention
        if (prescriptionRepository.existsByConsultationId(consultationId)) {
            throw HamsException.conflict("A prescription already exists for consultation ID: " + consultationId);
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw HamsException.badRequest("Prescription must contain at least one medicine item");
        }

        Prescription prescription = buildPrescriptionFromItems(
                consultation,
                doctor,
                consultation.getPatient(),
                request.getGeneralInstructions(),
                request.getItems()
        );

        Prescription saved = prescriptionRepository.saveAndFlush(prescription);
        consultation.setPrescription(saved);

        auditLogService.logAction(
                doctor.getUser().getId(),
                "PRESCRIPTION_CREATED",
                "PRESCRIPTION",
                saved.getId(),
                null,
                "Created prescription for consultation #" + consultation.getId() + " with " + saved.getItems().size() + " items"
        );

        notificationService.notifyPrescriptionAvailable(consultation.getAppointment());

        return mapPrescriptionToResponse(saved);
    }

    @Transactional(readOnly = true)
    public PrescriptionResponse getConsultationPrescription(String doctorEmail, Long consultationId) {
        Doctor doctor = getDoctorByEmail(doctorEmail);
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> HamsException.notFound("Consultation", consultationId));

        if (!consultation.getDoctor().getId().equals(doctor.getId())) {
            throw HamsException.forbidden("You do not have permission to view prescriptions for this consultation");
        }

        Prescription prescription = prescriptionRepository.findByConsultationId(consultationId)
                .orElseThrow(() -> HamsException.notFound("Prescription for consultation", consultationId));

        return mapPrescriptionToResponse(prescription);
    }

    // ============================================================
    // PATIENT PRESCRIPTION VIEWING (STRICT RBAC & ISOLATION)
    // ============================================================

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPatientPrescriptions(String patientEmail) {
        Patient patient = getPatientByEmail(patientEmail);
        return prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId())
                .stream()
                .map(this::mapPrescriptionToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PrescriptionResponse getPatientPrescriptionById(String patientEmail, Long prescriptionId) {
        Patient patient = getPatientByEmail(patientEmail);
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> HamsException.notFound("Prescription", prescriptionId));

        // Strict patient ownership check
        if (!prescription.getPatient().getId().equals(patient.getId())) {
            throw HamsException.forbidden("You do not have permission to access this prescription");
        }

        return mapPrescriptionToResponse(prescription);
    }

    @Transactional(readOnly = true)
    public ConsultationResponse getPatientConsultationByAppointmentId(String patientEmail, Long appointmentId) {
        Patient patient = getPatientByEmail(patientEmail);
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> HamsException.notFound("Appointment", appointmentId));

        if (!appointment.getPatient().getId().equals(patient.getId())) {
            throw HamsException.forbidden("You do not have permission to view this appointment consultation");
        }

        Consultation consultation = consultationRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> HamsException.notFound("Consultation for appointment", appointmentId));

        return mapConsultationToResponse(consultation);
    }

    // ============================================================
    // HELPER & MAPPING METHODS
    // ============================================================

    private void validateDoctorAppointmentOwnership(Doctor doctor, Appointment appointment) {
        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw HamsException.forbidden("You are not assigned to this appointment");
        }
    }

    private Prescription buildPrescriptionFromItems(Consultation consultation,
                                                    Doctor doctor,
                                                    Patient patient,
                                                    String generalInstructions,
                                                    List<PrescriptionItemRequest> itemRequests) {
        Prescription prescription = Prescription.builder()
                .consultation(consultation)
                .doctor(doctor)
                .patient(patient)
                .prescriptionDate(LocalDate.now())
                .generalInstructions(generalInstructions != null ? generalInstructions.trim() : null)
                .build();

        List<PrescriptionItem> items = new ArrayList<>();
        for (PrescriptionItemRequest itemReq : itemRequests) {
            if (itemReq.getMedicineName() == null || itemReq.getMedicineName().trim().isEmpty()) {
                throw HamsException.badRequest("Medicine name is required for all items");
            }
            if (itemReq.getDosage() == null || itemReq.getDosage().trim().isEmpty()) {
                throw HamsException.badRequest("Dosage is required for medicine: " + itemReq.getMedicineName());
            }
            if (itemReq.getFrequency() == null || itemReq.getFrequency().trim().isEmpty()) {
                throw HamsException.badRequest("Frequency is required for medicine: " + itemReq.getMedicineName());
            }
            if (itemReq.getDuration() == null || itemReq.getDuration().trim().isEmpty()) {
                throw HamsException.badRequest("Duration is required for medicine: " + itemReq.getMedicineName());
            }

            PrescriptionItem item = PrescriptionItem.builder()
                    .prescription(prescription)
                    .medicineName(itemReq.getMedicineName().trim())
                    .dosage(itemReq.getDosage().trim())
                    .frequency(itemReq.getFrequency().trim())
                    .duration(itemReq.getDuration().trim())
                    .instructions(itemReq.getInstructions() != null ? itemReq.getInstructions().trim() : null)
                    .build();
            items.add(item);
        }
        prescription.setItems(items);
        return prescription;
    }

    private ConsultationResponse mapConsultationToResponse(Consultation c) {
        String docName = c.getDoctor() != null ? c.getDoctor().getFullName() : "Doctor";
        String docSpec = c.getDoctor() != null ? c.getDoctor().getSpecialization() : "";
        String patName = c.getPatient() != null ? c.getPatient().getFullName() : "Patient";

        PrescriptionResponse rxResp = null;
        if (c.getPrescription() != null) {
            rxResp = mapPrescriptionToResponse(c.getPrescription());
        }

        return ConsultationResponse.builder()
                .id(c.getId())
                .appointmentId(c.getAppointment() != null ? c.getAppointment().getId() : null)
                .appointmentRef(c.getAppointment() != null ? c.getAppointment().getAppointmentRef() : null)
                .appointmentDate(c.getAppointment() != null ? c.getAppointment().getAppointmentDate() : null)
                .doctorId(c.getDoctor() != null ? c.getDoctor().getId() : null)
                .doctorName(docName)
                .doctorSpecialization(docSpec)
                .patientId(c.getPatient() != null ? c.getPatient().getId() : null)
                .patientName(patName)
                .symptoms(c.getSymptoms())
                .diagnosis(c.getDiagnosis())
                .clinicalNotes(c.getClinicalNotes())
                .treatmentNotes(c.getTreatmentNotes())
                .followUpDate(c.getFollowUpDate())
                .prescription(rxResp)
                .createdAt(c.getCreatedAt())
                .build();
    }

    private PrescriptionResponse mapPrescriptionToResponse(Prescription p) {
        String docName = p.getDoctor() != null ? p.getDoctor().getFullName() : "Doctor";
        String docSpec = p.getDoctor() != null ? p.getDoctor().getSpecialization() : "";
        String deptName = (p.getDoctor() != null && p.getDoctor().getDepartment() != null)
                ? p.getDoctor().getDepartment().getName()
                : "General";
        String patName = p.getPatient() != null ? p.getPatient().getFullName() : "Patient";

        String diag = p.getConsultation() != null ? p.getConsultation().getDiagnosis() : null;
        String advice = p.getConsultation() != null ? p.getConsultation().getTreatmentNotes() : null;
        Long apptId = (p.getConsultation() != null && p.getConsultation().getAppointment() != null)
                ? p.getConsultation().getAppointment().getId()
                : null;

        List<PrescriptionItemResponse> items = new ArrayList<>();
        if (p.getItems() != null) {
            items = p.getItems().stream()
                    .map(it -> new PrescriptionItemResponse(
                            it.getId(),
                            it.getMedicineName(),
                            it.getDosage(),
                            it.getFrequency(),
                            it.getDuration(),
                            it.getInstructions()
                    ))
                    .collect(Collectors.toList());
        }

        return PrescriptionResponse.builder()
                .id(p.getId())
                .consultationId(p.getConsultation() != null ? p.getConsultation().getId() : null)
                .appointmentId(apptId)
                .doctorId(p.getDoctor() != null ? p.getDoctor().getId() : null)
                .doctorName(docName)
                .doctorSpecialization(docSpec)
                .departmentName(deptName)
                .patientId(p.getPatient() != null ? p.getPatient().getId() : null)
                .patientName(patName)
                .prescriptionDate(p.getPrescriptionDate())
                .generalInstructions(p.getGeneralInstructions())
                .diagnosis(diag)
                .advice(advice)
                .items(items)
                .createdAt(p.getCreatedAt())
                .build();
    }

    private AppointmentResponse mapAppointmentToResponse(Appointment a) {
        String doctorName = a.getDoctor() != null ? a.getDoctor().getFullName() : "Unknown Doctor";
        String doctorSpec = a.getDoctor() != null ? a.getDoctor().getSpecialization() : "";
        String deptName = (a.getDoctor() != null && a.getDoctor().getDepartment() != null)
                ? a.getDoctor().getDepartment().getName()
                : "General";

        String patientName = a.getPatient() != null ? a.getPatient().getFullName() : "Unknown Patient";
        String patientPhone = a.getPatient() != null ? a.getPatient().getPhone() : "";

        AppointmentResponse res = new AppointmentResponse(
                a.getId(),
                a.getAppointmentRef(),
                a.getDoctor() != null ? a.getDoctor().getId() : null,
                doctorName,
                doctorSpec,
                deptName,
                a.getPatient() != null ? a.getPatient().getId() : null,
                patientName,
                patientPhone,
                a.getAppointmentDate(),
                a.getAppointmentTime(),
                a.getEndTime(),
                a.getStatus(),
                a.getReason(),
                a.getCancellationReason(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );

        if (a.getConsultation() != null) {
            res.setHasConsultation(true);
            res.setConsultationId(a.getConsultation().getId());
        } else {
            res.setHasConsultation(false);
        }

        return res;
    }

    private Doctor getDoctorByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> HamsException.notFound("User", 0L));
        return doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> HamsException.notFound("Doctor profile for user", user.getId()));
    }

    private Patient getPatientByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> HamsException.notFound("User", 0L));
        return patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> HamsException.notFound("Patient profile for user", user.getId()));
    }
}
