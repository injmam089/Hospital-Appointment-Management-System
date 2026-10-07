package com.hams.dto.appointment;

import jakarta.validation.constraints.Size;

public class CancelAppointmentRequest {

    @Size(max = 500, message = "Cancellation reason cannot exceed 500 characters")
    private String cancellationReason;

    public CancelAppointmentRequest() {
    }

    public CancelAppointmentRequest(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
}
