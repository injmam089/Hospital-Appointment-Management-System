package com.hams.entity;

import com.hams.enums.DayOfWeek;
import jakarta.persistence.*;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "doctor_availability",
    uniqueConstraints = @UniqueConstraint(columnNames = {"doctor_id", "day_of_week"}))
public class DoctorAvailability extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false, length = 10)
    private DayOfWeek dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "slot_duration_mins", nullable = false)
    private Integer slotDurationMins = 30;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "availability", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DoctorBreak> breaks = new ArrayList<>();

    public DoctorAvailability() {
    }

    public DoctorAvailability(Long id, Doctor doctor, DayOfWeek dayOfWeek, LocalTime startTime,
                              LocalTime endTime, Integer slotDurationMins, boolean active) {
        this.id = id;
        this.doctor = doctor;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.slotDurationMins = slotDurationMins != null ? slotDurationMins : 30;
        this.active = active;
        this.breaks = new ArrayList<>();
    }

    public void addBreak(DoctorBreak doctorBreak) {
        doctorBreak.setAvailability(this);
        this.breaks.add(doctorBreak);
    }

    public void clearBreaks() {
        this.breaks.clear();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Doctor doctor;
        private DayOfWeek dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private Integer slotDurationMins = 30;
        private boolean active = true;
        private List<DoctorBreak> breaks = new ArrayList<>();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder doctor(Doctor doctor) { this.doctor = doctor; return this; }
        public Builder dayOfWeek(DayOfWeek dayOfWeek) { this.dayOfWeek = dayOfWeek; return this; }
        public Builder startTime(LocalTime startTime) { this.startTime = startTime; return this; }
        public Builder endTime(LocalTime endTime) { this.endTime = endTime; return this; }
        public Builder slotDurationMins(Integer slotDurationMins) { this.slotDurationMins = slotDurationMins; return this; }
        public Builder active(boolean active) { this.active = active; return this; }
        public Builder breaks(List<DoctorBreak> breaks) { this.breaks = breaks; return this; }

        public DoctorAvailability build() {
            DoctorAvailability avail = new DoctorAvailability(id, doctor, dayOfWeek, startTime, endTime, slotDurationMins, active);
            if (breaks != null) {
                for (DoctorBreak b : breaks) {
                    avail.addBreak(b);
                }
            }
            return avail;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

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

    public List<DoctorBreak> getBreaks() { return breaks; }
    public void setBreaks(List<DoctorBreak> breaks) { this.breaks = breaks; }
}
