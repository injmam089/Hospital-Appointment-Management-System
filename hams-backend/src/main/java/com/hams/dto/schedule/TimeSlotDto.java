package com.hams.dto.schedule;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalTime;

public class TimeSlotDto {

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    private String formattedTime;
    private boolean available;

    public TimeSlotDto() {
    }

    public TimeSlotDto(LocalTime startTime, LocalTime endTime, String formattedTime, boolean available) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.formattedTime = formattedTime;
        this.available = available;
    }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getFormattedTime() { return formattedTime; }
    public void setFormattedTime(String formattedTime) { this.formattedTime = formattedTime; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
}
