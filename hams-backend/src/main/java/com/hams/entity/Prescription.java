package com.hams.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prescriptions")
public class Prescription extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_id", nullable = false, unique = true)
    private Consultation consultation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(name = "prescription_date", nullable = false)
    private LocalDate prescriptionDate = LocalDate.now();

    @Column(name = "general_instructions", columnDefinition = "TEXT")
    private String generalInstructions;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PrescriptionItem> items = new ArrayList<>();

    public Prescription() {
    }

    public Prescription(Long id, Consultation consultation, Doctor doctor, Patient patient,
                        LocalDate prescriptionDate, String generalInstructions,
                        List<PrescriptionItem> items) {
        this.id = id;
        this.consultation = consultation;
        this.doctor = doctor;
        this.patient = patient;
        this.prescriptionDate = prescriptionDate != null ? prescriptionDate : LocalDate.now();
        this.generalInstructions = generalInstructions;
        this.items = items != null ? items : new ArrayList<>();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Consultation consultation;
        private Doctor doctor;
        private Patient patient;
        private LocalDate prescriptionDate = LocalDate.now();
        private String generalInstructions;
        private List<PrescriptionItem> items = new ArrayList<>();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder consultation(Consultation consultation) { this.consultation = consultation; return this; }
        public Builder doctor(Doctor doctor) { this.doctor = doctor; return this; }
        public Builder patient(Patient patient) { this.patient = patient; return this; }
        public Builder prescriptionDate(LocalDate prescriptionDate) { this.prescriptionDate = prescriptionDate; return this; }
        public Builder generalInstructions(String generalInstructions) { this.generalInstructions = generalInstructions; return this; }
        public Builder items(List<PrescriptionItem> items) { this.items = items; return this; }

        public Prescription build() {
            Prescription p = new Prescription(id, consultation, doctor, patient, prescriptionDate, generalInstructions, items);
            if (p.getItems() != null) {
                p.getItems().forEach(it -> it.setPrescription(p));
            }
            return p;
        }
    }

    public void addItem(PrescriptionItem item) {
        if (this.items == null) {
            this.items = new ArrayList<>();
        }
        this.items.add(item);
        item.setPrescription(this);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Consultation getConsultation() { return consultation; }
    public void setConsultation(Consultation consultation) { this.consultation = consultation; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public LocalDate getPrescriptionDate() { return prescriptionDate; }
    public void setPrescriptionDate(LocalDate prescriptionDate) { this.prescriptionDate = prescriptionDate; }

    public String getGeneralInstructions() { return generalInstructions; }
    public void setGeneralInstructions(String generalInstructions) { this.generalInstructions = generalInstructions; }

    public List<PrescriptionItem> getItems() { return items; }
    public void setItems(List<PrescriptionItem> items) { this.items = items; }
}
