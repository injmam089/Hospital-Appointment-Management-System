package com.hams.dto.schedule;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.hams.enums.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class DoctorDaySlotsResponse {

    private Long doctorId;
    private String doctorName;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    private DayOfWeek dayOfWeek;
    private boolean onLeave;
    private String leaveReason;
    private boolean workingDay;
    private List<TimeSlotDto> slots = new ArrayList<>();

    public DoctorDaySlotsResponse() {
    }

    public DoctorDaySlotsResponse(Long doctorId, String doctorName, LocalDate date, DayOfWeek dayOfWeek,
                                  boolean onLeave, String leaveReason, boolean workingDay, List<TimeSlotDto> slots) {
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.date = date;
        this.dayOfWeek = dayOfWeek;
        this.onLeave = onLeave;
        this.leaveReason = leaveReason;
        this.workingDay = workingDay;
        this.slots = slots != null ? slots : new ArrayList<>();
    }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public DayOfWeek getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(DayOfWeek dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public boolean isOnLeave() { return onLeave; }
    public void setOnLeave(boolean onLeave) { this.onLeave = onLeave; }

    public String getLeaveReason() { return leaveReason; }
    public void setLeaveReason(String leaveReason) { this.leaveReason = leaveReason; }

    public boolean isWorkingDay() { return workingDay; }
    public void setWorkingDay(boolean workingDay) { this.workingDay = workingDay; }

    public List<TimeSlotDto> getSlots() { return slots; }
    public void setSlots(List<TimeSlotDto> slots) { this.slots = slots; }
}
