package com.hams.dto.consultation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public class CreateConsultationRequest {

    @Size(max = 2000, message = "Symptoms description must not exceed 2000 characters")
    private String symptoms;

    @NotBlank(message = "Diagnosis is required")
    @Size(max = 1000, message = "Diagnosis must not exceed 1000 characters")
    private String diagnosis;

    @Size(max = 4000, message = "Clinical notes must not exceed 4000 characters")
    private String clinicalNotes;

    @Size(max = 4000, message = "Treatment notes must not exceed 4000 characters")
    private String treatmentNotes;

    private LocalDate followUpDate;

    // Optional initial prescription items
    @Valid
    private List<PrescriptionItemRequest> medicines;

    @Size(max = 2000, message = "General instructions must not exceed 2000 characters")
    private String generalInstructions;

    public CreateConsultationRequest() {
    }

    public CreateConsultationRequest(String symptoms, String diagnosis, String clinicalNotes,
                                     String treatmentNotes, LocalDate followUpDate,
                                     List<PrescriptionItemRequest> medicines, String generalInstructions) {
        this.symptoms = symptoms;
        this.diagnosis = diagnosis;
        this.clinicalNotes = clinicalNotes;
        this.treatmentNotes = treatmentNotes;
        this.followUpDate = followUpDate;
        this.medicines = medicines;
        this.generalInstructions = generalInstructions;
    }

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

    public List<PrescriptionItemRequest> getMedicines() { return medicines; }
    public void setMedicines(List<PrescriptionItemRequest> medicines) { this.medicines = medicines; }

    public String getGeneralInstructions() { return generalInstructions; }
    public void setGeneralInstructions(String generalInstructions) { this.generalInstructions = generalInstructions; }
}
