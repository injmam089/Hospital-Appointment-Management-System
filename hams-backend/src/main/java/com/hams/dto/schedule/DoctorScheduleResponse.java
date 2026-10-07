package com.hams.dto.schedule;

import java.util.ArrayList;
import java.util.List;

public class DoctorScheduleResponse {

    private Long doctorId;
    private String doctorName;
    private List<DayAvailabilityResponse> schedule = new ArrayList<>();

    public DoctorScheduleResponse() {
    }

    public DoctorScheduleResponse(Long doctorId, String doctorName, List<DayAvailabilityResponse> schedule) {
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.schedule = schedule != null ? schedule : new ArrayList<>();
    }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public List<DayAvailabilityResponse> getSchedule() { return schedule; }
    public void setSchedule(List<DayAvailabilityResponse> schedule) { this.schedule = schedule; }
}
