package com.hams.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "doctor_leaves")
public class DoctorLeave extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "leave_date", nullable = false)
    private LocalDate leaveDate;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String reason;

    public DoctorLeave() {
    }

    public DoctorLeave(Long id, Doctor doctor, LocalDate leaveDate, LocalDate startDate, LocalDate endDate, String reason) {
        this.id = id;
        this.doctor = doctor;
        this.startDate = startDate != null ? startDate : leaveDate;
        this.endDate = endDate != null ? endDate : (startDate != null ? startDate : leaveDate);
        this.leaveDate = leaveDate != null ? leaveDate : this.startDate;
        this.reason = reason;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Doctor doctor;
        private LocalDate leaveDate;
        private LocalDate startDate;
        private LocalDate endDate;
        private String reason;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder doctor(Doctor doctor) { this.doctor = doctor; return this; }
        public Builder leaveDate(LocalDate leaveDate) { this.leaveDate = leaveDate; return this; }
        public Builder startDate(LocalDate startDate) { this.startDate = startDate; return this; }
        public Builder endDate(LocalDate endDate) { this.endDate = endDate; return this; }
        public Builder reason(String reason) { this.reason = reason; return this; }

        public DoctorLeave build() {
            return new DoctorLeave(id, doctor, leaveDate, startDate, endDate, reason);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public LocalDate getLeaveDate() { return leaveDate; }
    public void setLeaveDate(LocalDate leaveDate) { this.leaveDate = leaveDate; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
