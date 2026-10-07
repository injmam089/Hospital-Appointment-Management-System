package com.hams.dto.appointment;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public class RescheduleAppointmentRequest {

    @NotNull(message = "New appointment date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate newDate;

    @NotNull(message = "New appointment time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime newTime;

    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;

    public RescheduleAppointmentRequest() {
    }

    public RescheduleAppointmentRequest(LocalDate newDate, LocalTime newTime, String reason) {
        this.newDate = newDate;
        this.newTime = newTime;
        this.reason = reason;
    }

    public LocalDate getNewDate() { return newDate; }
    public void setNewDate(LocalDate newDate) { this.newDate = newDate; }

    public LocalTime getNewTime() { return newTime; }
    public void setNewTime(LocalTime newTime) { this.newTime = newTime; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
