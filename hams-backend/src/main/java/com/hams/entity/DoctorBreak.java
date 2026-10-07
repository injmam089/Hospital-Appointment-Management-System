package com.hams.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "doctor_breaks")
public class DoctorBreak {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "availability_id", nullable = false)
    private DoctorAvailability availability;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public DoctorBreak() {
    }

    public DoctorBreak(Long id, DoctorAvailability availability, LocalTime startTime, LocalTime endTime) {
        this.id = id;
        this.availability = availability;
        this.startTime = startTime;
        this.endTime = endTime;
        this.createdAt = LocalDateTime.now();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private DoctorAvailability availability;
        private LocalTime startTime;
        private LocalTime endTime;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder availability(DoctorAvailability availability) { this.availability = availability; return this; }
        public Builder startTime(LocalTime startTime) { this.startTime = startTime; return this; }
        public Builder endTime(LocalTime endTime) { this.endTime = endTime; return this; }

        public DoctorBreak build() {
            return new DoctorBreak(id, availability, startTime, endTime);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public DoctorAvailability getAvailability() { return availability; }
    public void setAvailability(DoctorAvailability availability) { this.availability = availability; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
