package com.hams.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "prescription_items")
public class PrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @Column(name = "medicine_name", nullable = false, length = 200)
    private String medicineName;

    @Column(length = 100)
    private String dosage;

    @Column(length = 100)
    private String frequency;

    @Column(length = 100)
    private String duration;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    public PrescriptionItem() {
    }

    public PrescriptionItem(Long id, Prescription prescription, String medicineName, String dosage,
                            String frequency, String duration, String instructions) {
        this.id = id;
        this.prescription = prescription;
        this.medicineName = medicineName;
        this.dosage = dosage;
        this.frequency = frequency;
        this.duration = duration;
        this.instructions = instructions;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Prescription prescription;
        private String medicineName;
        private String dosage;
        private String frequency;
        private String duration;
        private String instructions;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder prescription(Prescription prescription) { this.prescription = prescription; return this; }
        public Builder medicineName(String medicineName) { this.medicineName = medicineName; return this; }
        public Builder dosage(String dosage) { this.dosage = dosage; return this; }
        public Builder frequency(String frequency) { this.frequency = frequency; return this; }
        public Builder duration(String duration) { this.duration = duration; return this; }
        public Builder instructions(String instructions) { this.instructions = instructions; return this; }

        public PrescriptionItem build() {
            return new PrescriptionItem(id, prescription, medicineName, dosage, frequency, duration, instructions);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Prescription getPrescription() { return prescription; }
    public void setPrescription(Prescription prescription) { this.prescription = prescription; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
}
