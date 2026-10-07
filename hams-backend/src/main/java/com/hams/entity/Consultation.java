package com.hams.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "consultations")
public class Consultation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "clinical_notes", columnDefinition = "TEXT")
    private String clinicalNotes;

    @Column(columnDefinition = "TEXT")
    private String advice;

    @Column(name = "treatment_notes", columnDefinition = "TEXT")
    private String treatmentNotes;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @OneToOne(mappedBy = "consultation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Prescription prescription;

    public Consultation() {
    }

    public Consultation(Long id, Appointment appointment, Doctor doctor, Patient patient,
                        String symptoms, String diagnosis, String notes, String clinicalNotes,
                        String advice, String treatmentNotes, LocalDate followUpDate,
                        Prescription prescription) {
        this.id = id;
        this.appointment = appointment;
        this.doctor = doctor;
        this.patient = patient;
        this.symptoms = symptoms;
        this.diagnosis = diagnosis;
        this.notes = notes;
        this.clinicalNotes = clinicalNotes;
        this.advice = advice;
        this.treatmentNotes = treatmentNotes;
        this.followUpDate = followUpDate;
        this.prescription = prescription;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Appointment appointment;
        private Doctor doctor;
        private Patient patient;
        private String symptoms;
        private String diagnosis;
        private String notes;
        private String clinicalNotes;
        private String advice;
        private String treatmentNotes;
        private LocalDate followUpDate;
        private Prescription prescription;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder appointment(Appointment appointment) { this.appointment = appointment; return this; }
        public Builder doctor(Doctor doctor) { this.doctor = doctor; return this; }
        public Builder patient(Patient patient) { this.patient = patient; return this; }
        public Builder symptoms(String symptoms) { this.symptoms = symptoms; return this; }
        public Builder diagnosis(String diagnosis) { this.diagnosis = diagnosis; return this; }
        public Builder notes(String notes) { this.notes = notes; return this; }
        public Builder clinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; return this; }
        public Builder advice(String advice) { this.advice = advice; return this; }
        public Builder treatmentNotes(String treatmentNotes) { this.treatmentNotes = treatmentNotes; return this; }
        public Builder followUpDate(LocalDate followUpDate) { this.followUpDate = followUpDate; return this; }
        public Builder prescription(Prescription prescription) { this.prescription = prescription; return this; }

        public Consultation build() {
            return new Consultation(id, appointment, doctor, patient, symptoms, diagnosis,
                    notes, clinicalNotes, advice, treatmentNotes, followUpDate, prescription);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Appointment getAppointment() { return appointment; }
    public void setAppointment(Appointment appointment) { this.appointment = appointment; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getClinicalNotes() { return clinicalNotes != null ? clinicalNotes : notes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }

    public String getAdvice() { return advice; }
    public void setAdvice(String advice) { this.advice = advice; }

    public String getTreatmentNotes() { return treatmentNotes != null ? treatmentNotes : advice; }
    public void setTreatmentNotes(String treatmentNotes) { this.treatmentNotes = treatmentNotes; }

    public LocalDate getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(LocalDate followUpDate) { this.followUpDate = followUpDate; }

    public Prescription getPrescription() { return prescription; }
    public void setPrescription(Prescription prescription) { this.prescription = prescription; }
}
