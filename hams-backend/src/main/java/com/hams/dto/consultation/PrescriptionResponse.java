package com.hams.dto.consultation;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class PrescriptionResponse {

    private Long id;
    private Long consultationId;
    private Long appointmentId;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private String departmentName;
    private Long patientId;
    private String patientName;
    private LocalDate prescriptionDate;
    private String generalInstructions;
    private String diagnosis;
    private String advice;
    private List<PrescriptionItemResponse> items = new ArrayList<>();
    private LocalDateTime createdAt;

    public PrescriptionResponse() {
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Long consultationId;
        private Long appointmentId;
        private Long doctorId;
        private String doctorName;
        private String doctorSpecialization;
        private String departmentName;
        private Long patientId;
        private String patientName;
        private LocalDate prescriptionDate;
        private String generalInstructions;
        private String diagnosis;
        private String advice;
        private List<PrescriptionItemResponse> items = new ArrayList<>();
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder consultationId(Long consultationId) { this.consultationId = consultationId; return this; }
        public Builder appointmentId(Long appointmentId) { this.appointmentId = appointmentId; return this; }
        public Builder doctorId(Long doctorId) { this.doctorId = doctorId; return this; }
        public Builder doctorName(String doctorName) { this.doctorName = doctorName; return this; }
        public Builder doctorSpecialization(String doctorSpecialization) { this.doctorSpecialization = doctorSpecialization; return this; }
        public Builder departmentName(String departmentName) { this.departmentName = departmentName; return this; }
        public Builder patientId(Long patientId) { this.patientId = patientId; return this; }
        public Builder patientName(String patientName) { this.patientName = patientName; return this; }
        public Builder prescriptionDate(LocalDate prescriptionDate) { this.prescriptionDate = prescriptionDate; return this; }
        public Builder generalInstructions(String generalInstructions) { this.generalInstructions = generalInstructions; return this; }
        public Builder diagnosis(String diagnosis) { this.diagnosis = diagnosis; return this; }
        public Builder advice(String advice) { this.advice = advice; return this; }
        public Builder items(List<PrescriptionItemResponse> items) { this.items = items; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public PrescriptionResponse build() {
            PrescriptionResponse r = new PrescriptionResponse();
            r.id = this.id;
            r.consultationId = this.consultationId;
            r.appointmentId = this.appointmentId;
            r.doctorId = this.doctorId;
            r.doctorName = this.doctorName;
            r.doctorSpecialization = this.doctorSpecialization;
            r.departmentName = this.departmentName;
            r.patientId = this.patientId;
            r.patientName = this.patientName;
            r.prescriptionDate = this.prescriptionDate;
            r.generalInstructions = this.generalInstructions;
            r.diagnosis = this.diagnosis;
            r.advice = this.advice;
            r.items = this.items != null ? this.items : new ArrayList<>();
            r.createdAt = this.createdAt;
            return r;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getConsultationId() { return consultationId; }
    public void setConsultationId(Long consultationId) { this.consultationId = consultationId; }

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

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

    public LocalDate getPrescriptionDate() { return prescriptionDate; }
    public void setPrescriptionDate(LocalDate prescriptionDate) { this.prescriptionDate = prescriptionDate; }

    public String getGeneralInstructions() { return generalInstructions; }
    public void setGeneralInstructions(String generalInstructions) { this.generalInstructions = generalInstructions; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getAdvice() { return advice; }
    public void setAdvice(String advice) { this.advice = advice; }

    public List<PrescriptionItemResponse> getItems() { return items; }
    public void setItems(List<PrescriptionItemResponse> items) { this.items = items; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
