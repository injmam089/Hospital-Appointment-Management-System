package com.hams.dto.consultation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.ArrayList;
import java.util.List;

public class CreatePrescriptionRequest {

    private String generalInstructions;

    @NotEmpty(message = "Prescription must contain at least one medicine item")
    @Valid
    private List<PrescriptionItemRequest> items = new ArrayList<>();

    public CreatePrescriptionRequest() {
    }

    public CreatePrescriptionRequest(String generalInstructions, List<PrescriptionItemRequest> items) {
        this.generalInstructions = generalInstructions;
        this.items = items;
    }

    public String getGeneralInstructions() { return generalInstructions; }
    public void setGeneralInstructions(String generalInstructions) { this.generalInstructions = generalInstructions; }

    public List<PrescriptionItemRequest> getItems() { return items; }
    public void setItems(List<PrescriptionItemRequest> items) { this.items = items; }
}
