package com.hams.service;

import com.hams.dto.appointment.AppointmentResponse;
import com.hams.dto.appointment.BookAppointmentRequest;
import com.hams.dto.appointment.CancelAppointmentRequest;
import com.hams.dto.appointment.RescheduleAppointmentRequest;
import com.hams.entity.Appointment;
import com.hams.entity.Doctor;
import com.hams.entity.Patient;
import com.hams.entity.User;
import com.hams.enums.AppointmentStatus;
import com.hams.exception.HamsException;
import com.hams.repository.AppointmentRepository;
import com.hams.repository.DoctorRepository;
import com.hams.repository.PatientRepository;
import com.hams.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final ScheduleService scheduleService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository,
                              UserRepository userRepository,
                              ScheduleService scheduleService,
                              AuditLogService auditLogService,
                              NotificationService notificationService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.scheduleService = scheduleService;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    // ============================================================
    // PATIENT BOOKING
    // ============================================================

    public AppointmentResponse bookAppointment(String patientEmail, BookAppointmentRequest request) {
        Patient patient = getPatientByEmail(patientEmail);

        if (request.getDoctorId() == null) {
            throw HamsException.badRequest("Doctor ID is required");
        }

        Doctor doctor = doctorRepository.findByIdWithLock(request.getDoctorId())
            .orElseThrow(() -> HamsException.notFound("Doctor", request.getDoctorId()));

        // Independent backend slot re-validation
        LocalTime slotEnd = scheduleService.validateAndGetSlotEndTime(
            doctor,
            request.getAppointmentDate(),
            request.getAppointmentTime()
        );

        // Generate readable appointment reference: e.g. HAMS-20261015-A1B2C
        String datePart = request.getAppointmentDate().format(DateTimeFormatter.BASIC_ISO_DATE);
        String randomSuffix = UUID.randomUUID().toString().replace("-", "").substring(0, 5).toUpperCase();
        String apptRef = "HAMS-" + datePart + "-" + randomSuffix;

        Appointment appointment = Appointment.builder()
            .patient(patient)
            .doctor(doctor)
            .appointmentDate(request.getAppointmentDate())
            .appointmentTime(request.getAppointmentTime())
            .endTime(slotEnd)
            .status(AppointmentStatus.CONFIRMED)
            .reason(request.getReason() != null ? request.getReason().trim() : null)
            .appointmentRef(apptRef)
            .build();

        try {
            Appointment saved = appointmentRepository.saveAndFlush(appointment);

            auditLogService.logAction(
                patient.getUser().getId(),
                "APPOINTMENT_BOOKED",
                "APPOINTMENT",
                saved.getId(),
                null,
                "Booked appointment " + apptRef + " with Dr. " + doctor.getFullName() +
                    " on " + saved.getAppointmentDate() + " at " + saved.getAppointmentTime()
            );

            notificationService.notifyAppointmentConfirmed(saved);

            return mapToResponse(saved);
        } catch (DataIntegrityViolationException ex) {
            throw HamsException.conflict("The selected appointment slot has already been booked. Please choose another time.");
        }
    }

    // ============================================================
    // PATIENT LISTING & DETAILS
    // ============================================================

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getPatientAppointments(String patientEmail, AppointmentStatus status) {
        Patient patient = getPatientByEmail(patientEmail);

        List<Appointment> list;
        if (status != null) {
            list = appointmentRepository.findByPatientIdAndStatusOrderByAppointmentDateDescAppointmentTimeDesc(
                patient.getId(), status);
        } else {
            list = appointmentRepository.findByPatientIdOrderByAppointmentDateDescAppointmentTimeDesc(
                patient.getId());
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getPatientAppointmentById(String patientEmail, Long appointmentId) {
        Patient patient = getPatientByEmail(patientEmail);

        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> HamsException.notFound("Appointment", appointmentId));

        if (!appointment.getPatient().getId().equals(patient.getId())) {
            throw HamsException.forbidden("You do not have permission to view this appointment");
        }

        return mapToResponse(appointment);
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getPatientUpcomingAppointment(String patientEmail) {
        Patient patient = getPatientByEmail(patientEmail);
        List<Appointment> upcoming = appointmentRepository.findUpcomingAppointmentsByPatientId(patient.getId());
        if (upcoming.isEmpty()) {
            return null;
        }
        return mapToResponse(upcoming.get(0));
    }

    // ============================================================
    // PATIENT CANCELLATION
    // ============================================================

    public AppointmentResponse cancelAppointment(String patientEmail, Long appointmentId, CancelAppointmentRequest request) {
        Patient patient = getPatientByEmail(patientEmail);

        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> HamsException.notFound("Appointment", appointmentId));

        if (!appointment.getPatient().getId().equals(patient.getId())) {
            throw HamsException.forbidden("You do not have permission to cancel this appointment");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw HamsException.badRequest("Appointment is already cancelled");
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw HamsException.badRequest("Cannot cancel an appointment that is already completed");
        }
        if (appointment.getStatus() == AppointmentStatus.REJECTED ||
            appointment.getStatus() == AppointmentStatus.NO_SHOW ||
            appointment.getStatus() == AppointmentStatus.RESCHEDULED) {
            throw HamsException.badRequest("Cannot cancel an appointment in " + appointment.getStatus() + " status");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        String reason = (request != null && request.getCancellationReason() != null && !request.getCancellationReason().trim().isEmpty())
            ? request.getCancellationReason().trim()
            : "Cancelled by patient";
        appointment.setCancellationReason(reason);

        Appointment saved = appointmentRepository.saveAndFlush(appointment);

        auditLogService.logAction(
            patient.getUser().getId(),
            "APPOINTMENT_CANCELLED",
            "APPOINTMENT",
            saved.getId(),
            null,
            "Cancelled appointment " + saved.getAppointmentRef() + ". Reason: " + reason
        );

        notificationService.notifyAppointmentCancelled(saved, reason);

        return mapToResponse(saved);
    }

    // ============================================================
    // PATIENT RESCHEDULING
    // ============================================================

    public AppointmentResponse rescheduleAppointment(String patientEmail, Long appointmentId, RescheduleAppointmentRequest request) {
        Patient patient = getPatientByEmail(patientEmail);

        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> HamsException.notFound("Appointment", appointmentId));

        if (!appointment.getPatient().getId().equals(patient.getId())) {
            throw HamsException.forbidden("You do not have permission to reschedule this appointment");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw HamsException.badRequest("Cannot reschedule a cancelled appointment");
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw HamsException.badRequest("Cannot reschedule a completed appointment");
        }
        if (appointment.getStatus() == AppointmentStatus.REJECTED ||
            appointment.getStatus() == AppointmentStatus.NO_SHOW ||
            appointment.getStatus() == AppointmentStatus.RESCHEDULED) {
            throw HamsException.badRequest("Cannot reschedule an appointment in " + appointment.getStatus() + " status");
        }

        if (request.getNewDate() == null || request.getNewTime() == null) {
            throw HamsException.badRequest("New appointment date and time are required for rescheduling");
        }

        if (appointment.getAppointmentDate().equals(request.getNewDate()) &&
            appointment.getAppointmentTime().equals(request.getNewTime())) {
            throw HamsException.badRequest("New appointment date and time must differ from the current scheduled slot");
        }

        // Lock doctor row to prevent concurrent race conditions during rescheduling
        Doctor doctor = doctorRepository.findByIdWithLock(appointment.getDoctor().getId())
            .orElseThrow(() -> HamsException.notFound("Doctor", appointment.getDoctor().getId()));

        // Full independent backend slot validation on the new slot
        LocalTime newEndTime = scheduleService.validateAndGetSlotEndTime(
            doctor,
            request.getNewDate(),
            request.getNewTime()
        );

        LocalDate oldDate = appointment.getAppointmentDate();
        LocalTime oldTime = appointment.getAppointmentTime();

        // Update appointment to new slot
        appointment.setAppointmentDate(request.getNewDate());
        appointment.setAppointmentTime(request.getNewTime());
        appointment.setEndTime(newEndTime);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        if (request.getReason() != null && !request.getReason().trim().isEmpty()) {
            appointment.setReason(request.getReason().trim());
        }

        try {
            Appointment saved = appointmentRepository.saveAndFlush(appointment);

            auditLogService.logAction(
                patient.getUser().getId(),
                "APPOINTMENT_RESCHEDULED",
                "APPOINTMENT",
                saved.getId(),
                null,
                "Rescheduled appointment " + saved.getAppointmentRef() +
                    " from " + oldDate + " " + oldTime + " to " + saved.getAppointmentDate() + " " + saved.getAppointmentTime()
            );

            notificationService.notifyAppointmentRescheduled(saved);

            return mapToResponse(saved);
        } catch (DataIntegrityViolationException ex) {
            throw HamsException.conflict("The selected appointment slot has already been booked. Please choose another time.");
        }
    }

    // ============================================================
    // DOCTOR APPOINTMENTS
    // ============================================================

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getDoctorAppointments(String doctorEmail, LocalDate date, AppointmentStatus status) {
        Doctor doctor = getDoctorByEmail(doctorEmail);

        List<Appointment> list;
        if (date != null) {
            list = appointmentRepository.findByDoctorIdAndAppointmentDateOrderByAppointmentTime(
                doctor.getId(), date);
        } else if (status != null) {
            list = appointmentRepository.findByDoctorIdAndStatusOrderByAppointmentDateDescAppointmentTimeDesc(
                doctor.getId(), status);
        } else {
            list = appointmentRepository.findByDoctorIdOrderByAppointmentDateDescAppointmentTimeDesc(
                doctor.getId());
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getDoctorAppointmentById(String doctorEmail, Long appointmentId) {
        Doctor doctor = getDoctorByEmail(doctorEmail);

        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> HamsException.notFound("Appointment", appointmentId));

        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw HamsException.forbidden("You do not have permission to view this appointment");
        }

        return mapToResponse(appointment);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getDoctorTodayAppointments(String doctorEmail) {
        Doctor doctor = getDoctorByEmail(doctorEmail);
        return appointmentRepository.findTodayAppointmentsByDoctorId(doctor.getId()).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // ============================================================
    // HELPERS & MAPPERS
    // ============================================================

    private Patient getPatientByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> HamsException.notFound("User", 0L));
        return patientRepository.findByUserId(user.getId())
            .orElseThrow(() -> HamsException.notFound("Patient profile for user", user.getId()));
    }

    private Doctor getDoctorByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> HamsException.notFound("User", 0L));
        return doctorRepository.findByUserId(user.getId())
            .orElseThrow(() -> HamsException.notFound("Doctor profile for user", user.getId()));
    }

    private AppointmentResponse mapToResponse(Appointment a) {
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
}
