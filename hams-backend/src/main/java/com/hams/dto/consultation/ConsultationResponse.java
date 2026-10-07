package com.hams.dto.consultation;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ConsultationResponse {

    private Long id;
    private Long appointmentId;
    private String appointmentRef;
    private LocalDate appointmentDate;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private Long patientId;
    private String patientName;
    private String symptoms;
    private String diagnosis;
    private String clinicalNotes;
    private String treatmentNotes;
    private LocalDate followUpDate;
    private PrescriptionResponse prescription;
    private LocalDateTime createdAt;

    public ConsultationResponse() {
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Long appointmentId;
        private String appointmentRef;
        private LocalDate appointmentDate;
        private Long doctorId;
        private String doctorName;
        private String doctorSpecialization;
        private Long patientId;
        private String patientName;
        private String symptoms;
        private String diagnosis;
        private String clinicalNotes;
        private String treatmentNotes;
        private LocalDate followUpDate;
        private PrescriptionResponse prescription;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder appointmentId(Long appointmentId) { this.appointmentId = appointmentId; return this; }
        public Builder appointmentRef(String appointmentRef) { this.appointmentRef = appointmentRef; return this; }
        public Builder appointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; return this; }
        public Builder doctorId(Long doctorId) { this.doctorId = doctorId; return this; }
        public Builder doctorName(String doctorName) { this.doctorName = doctorName; return this; }
        public Builder doctorSpecialization(String doctorSpecialization) { this.doctorSpecialization = doctorSpecialization; return this; }
        public Builder patientId(Long patientId) { this.patientId = patientId; return this; }
        public Builder patientName(String patientName) { this.patientName = patientName; return this; }
        public Builder symptoms(String symptoms) { this.symptoms = symptoms; return this; }
        public Builder diagnosis(String diagnosis) { this.diagnosis = diagnosis; return this; }
        public Builder clinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; return this; }
        public Builder treatmentNotes(String treatmentNotes) { this.treatmentNotes = treatmentNotes; return this; }
        public Builder followUpDate(LocalDate followUpDate) { this.followUpDate = followUpDate; return this; }
        public Builder prescription(PrescriptionResponse prescription) { this.prescription = prescription; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public ConsultationResponse build() {
            ConsultationResponse r = new ConsultationResponse();
            r.id = this.id;
            r.appointmentId = this.appointmentId;
            r.appointmentRef = this.appointmentRef;
            r.appointmentDate = this.appointmentDate;
            r.doctorId = this.doctorId;
            r.doctorName = this.doctorName;
            r.doctorSpecialization = this.doctorSpecialization;
            r.patientId = this.patientId;
            r.patientName = this.patientName;
            r.symptoms = this.symptoms;
            r.diagnosis = this.diagnosis;
            r.clinicalNotes = this.clinicalNotes;
            r.treatmentNotes = this.treatmentNotes;
            r.followUpDate = this.followUpDate;
            r.prescription = this.prescription;
            r.createdAt = this.createdAt;
            return r;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public String getAppointmentRef() { return appointmentRef; }
    public void setAppointmentRef(String appointmentRef) { this.appointmentRef = appointmentRef; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getDoctorSpecialization() { return doctorSpecialization; }
    public void setDoctorSpecialization(String doctorSpecialization) { this.doctorSpecialization = doctorSpecialization; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }

    public String getTreatmentNotes() { return treatmentNotes; }
    public void setTreatmentNotes(String treatmentNotes) { this.treatmentNotes = treatmentNotes; }

    public LocalDate getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(LocalDate followUpDate) { this.followUpDate = followUpDate; }

    public PrescriptionResponse getPrescription() { return prescription; }
    public void setPrescription(PrescriptionResponse prescription) { this.prescription = prescription; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
