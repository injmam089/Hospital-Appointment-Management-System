package com.hams.dto.schedule;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.hams.enums.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class DayAvailabilityResponse {

    private Long id;
    private DayOfWeek dayOfWeek;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    private Integer slotDurationMins;
    private boolean active;
    private List<BreakDto> breaks = new ArrayList<>();

    public DayAvailabilityResponse() {
    }

    public DayAvailabilityResponse(Long id, DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime,
                                   Integer slotDurationMins, boolean active, List<BreakDto> breaks) {
        this.id = id;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.slotDurationMins = slotDurationMins;
        this.active = active;
        this.breaks = breaks != null ? breaks : new ArrayList<>();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public DayOfWeek getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(DayOfWeek dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Integer getSlotDurationMins() { return slotDurationMins; }
    public void setSlotDurationMins(Integer slotDurationMins) { this.slotDurationMins = slotDurationMins; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public List<BreakDto> getBreaks() { return breaks; }
    public void setBreaks(List<BreakDto> breaks) { this.breaks = breaks; }
}
