package com.hams.dto.admin;

import com.hams.enums.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class AdminAppointmentResponse {
    private Long id;
    private String appointmentRef;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private LocalTime endTime;
    private AppointmentStatus status;
    private String reason;
    private String cancellationReason;

    private Long patientId;
    private String patientName;
    private String patientPhone;

    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private String departmentName;

    private LocalDateTime createdAt;

    public AdminAppointmentResponse() {
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String appointmentRef;
        private LocalDate appointmentDate;
        private LocalTime appointmentTime;
        private LocalTime endTime;
        private AppointmentStatus status;
        private String reason;
        private String cancellationReason;
        private Long patientId;
        private String patientName;
        private String patientPhone;
        private Long doctorId;
        private String doctorName;
        private String doctorSpecialization;
        private String departmentName;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder appointmentRef(String ref) { this.appointmentRef = ref; return this; }
        public Builder appointmentDate(LocalDate d) { this.appointmentDate = d; return this; }
        public Builder appointmentTime(LocalTime t) { this.appointmentTime = t; return this; }
        public Builder endTime(LocalTime et) { this.endTime = et; return this; }
        public Builder status(AppointmentStatus s) { this.status = s; return this; }
        public Builder reason(String r) { this.reason = r; return this; }
        public Builder cancellationReason(String cr) { this.cancellationReason = cr; return this; }
        public Builder patientId(Long pid) { this.patientId = pid; return this; }
        public Builder patientName(String pn) { this.patientName = pn; return this; }
        public Builder patientPhone(String pp) { this.patientPhone = pp; return this; }
        public Builder doctorId(Long did) { this.doctorId = did; return this; }
        public Builder doctorName(String dn) { this.doctorName = dn; return this; }
        public Builder doctorSpecialization(String ds) { this.doctorSpecialization = ds; return this; }
        public Builder departmentName(String depn) { this.departmentName = depn; return this; }
        public Builder createdAt(LocalDateTime ca) { this.createdAt = ca; return this; }

        public AdminAppointmentResponse build() {
            AdminAppointmentResponse resp = new AdminAppointmentResponse();
            resp.id = this.id;
            resp.appointmentRef = this.appointmentRef;
            resp.appointmentDate = this.appointmentDate;
            resp.appointmentTime = this.appointmentTime;
            resp.endTime = this.endTime;
            resp.status = this.status;
            resp.reason = this.reason;
            resp.cancellationReason = this.cancellationReason;
            resp.patientId = this.patientId;
            resp.patientName = this.patientName;
            resp.patientPhone = this.patientPhone;
            resp.doctorId = this.doctorId;
            resp.doctorName = this.doctorName;
            resp.doctorSpecialization = this.doctorSpecialization;
            resp.departmentName = this.departmentName;
            resp.createdAt = this.createdAt;
            return resp;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAppointmentRef() { return appointmentRef; }
    public void setAppointmentRef(String appointmentRef) { this.appointmentRef = appointmentRef; }
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
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public String getDoctorSpecialization() { return doctorSpecialization; }
    public void setDoctorSpecialization(String doctorSpecialization) { this.doctorSpecialization = doctorSpecialization; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
