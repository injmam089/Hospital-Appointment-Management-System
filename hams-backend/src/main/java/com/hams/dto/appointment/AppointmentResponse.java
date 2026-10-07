package com.hams.dto.appointment;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.hams.enums.AppointmentStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class AppointmentResponse {

    private Long id;
    private String appointmentRef;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private String departmentName;
    private Long patientId;
    private String patientName;
    private String patientPhone;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate appointmentDate;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime appointmentTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    private AppointmentStatus status;
    private String reason;
    private String cancellationReason;

    private Boolean hasConsultation;
    private Long consultationId;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    public AppointmentResponse() {
    }

    public AppointmentResponse(Long id, String appointmentRef, Long doctorId, String doctorName,
                               String doctorSpecialization, String departmentName, Long patientId,
                               String patientName, String patientPhone, LocalDate appointmentDate,
                               LocalTime appointmentTime, LocalTime endTime, AppointmentStatus status,
                               String reason, String cancellationReason, LocalDateTime createdAt,
                               LocalDateTime updatedAt) {
        this.id = id;
        this.appointmentRef = appointmentRef;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.doctorSpecialization = doctorSpecialization;
        this.departmentName = departmentName;
        this.patientId = patientId;
        this.patientName = patientName;
        this.patientPhone = patientPhone;
        this.appointmentDate = appointmentDate;
        this.appointmentTime = appointmentTime;
        this.endTime = endTime;
        this.status = status;
        this.reason = reason;
        this.cancellationReason = cancellationReason;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAppointmentRef() { return appointmentRef; }
    public void setAppointmentRef(String appointmentRef) { this.appointmentRef = appointmentRef; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getDoctorSpecialization() { return doctorSpecialization; }
    public void setDoctorSpecialization(String doctorSpecialization) { this.doctorSpecialization = doctorSpecialization; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public LocalTime getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(LocalTime appointmentTime) { this.appointmentTime = appointmentTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Boolean getHasConsultation() { return hasConsultation; }
    public void setHasConsultation(Boolean hasConsultation) { this.hasConsultation = hasConsultation; }

    public Long getConsultationId() { return consultationId; }
    public void setConsultationId(Long consultationId) { this.consultationId = consultationId; }
}
