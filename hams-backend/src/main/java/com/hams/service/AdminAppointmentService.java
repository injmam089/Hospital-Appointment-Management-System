package com.hams.service;

import com.hams.dto.admin.AdminAppointmentResponse;
import com.hams.entity.Appointment;
import com.hams.enums.AppointmentStatus;
import com.hams.exception.HamsException;
import com.hams.repository.AppointmentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@Transactional(readOnly = true)
public class AdminAppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AdminAppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public Page<AdminAppointmentResponse> getAppointments(
            String ref,
            String patientSearch,
            String doctorSearch,
            Long departmentId,
            AppointmentStatus status,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable
    ) {
        String trimmedRef = (ref != null && !ref.trim().isEmpty()) ? ref.trim() : null;
        String trimmedPatient = (patientSearch != null && !patientSearch.trim().isEmpty()) ? patientSearch.trim() : null;
        String trimmedDoctor = (doctorSearch != null && !doctorSearch.trim().isEmpty()) ? doctorSearch.trim() : null;

        Page<Appointment> page = appointmentRepository.findAdminAppointmentsFiltered(
                trimmedRef,
                trimmedPatient,
                trimmedDoctor,
                departmentId,
                status,
                startDate,
                endDate,
                pageable
        );

        return page.map(this::mapToResponse);
    }

    public AdminAppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> HamsException.notFound("Appointment", id));
        return mapToResponse(appointment);
    }

    private AdminAppointmentResponse mapToResponse(Appointment appt) {
        return AdminAppointmentResponse.builder()
                .id(appt.getId())
                .appointmentRef(appt.getAppointmentRef())
                .appointmentDate(appt.getAppointmentDate())
                .appointmentTime(appt.getAppointmentTime())
                .endTime(appt.getEndTime())
                .status(appt.getStatus())
                .reason(appt.getReason())
                .cancellationReason(appt.getCancellationReason())
                .patientId(appt.getPatient() != null ? appt.getPatient().getId() : null)
                .patientName(appt.getPatient() != null ? appt.getPatient().getFullName() : null)
                .patientPhone(appt.getPatient() != null ? appt.getPatient().getPhone() : null)
                .doctorId(appt.getDoctor() != null ? appt.getDoctor().getId() : null)
                .doctorName(appt.getDoctor() != null ? appt.getDoctor().getFullName() : null)
                .doctorSpecialization(appt.getDoctor() != null ? appt.getDoctor().getSpecialization() : null)
                .departmentName(appt.getDoctor() != null && appt.getDoctor().getDepartment() != null ? appt.getDoctor().getDepartment().getName() : null)
                .createdAt(appt.getCreatedAt())
                .build();
    }
}
