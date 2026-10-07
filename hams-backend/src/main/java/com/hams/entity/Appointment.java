package com.hams.entity;

import com.hams.enums.AppointmentStatus;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "appointments",
    indexes = {
        @Index(name = "idx_appt_doctor_date", columnList = "doctor_id, appointment_date"),
        @Index(name = "idx_appt_patient", columnList = "patient_id")
    })
public class Appointment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "appointment_time", nullable = false)
    private LocalTime appointmentTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "appointment_ref", unique = true, length = 20)
    private String appointmentRef;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @OneToOne(mappedBy = "appointment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Consultation consultation;

    public Appointment() {
    }

    public Appointment(Long id, Patient patient, Doctor doctor, LocalDate appointmentDate,
                       LocalTime appointmentTime, LocalTime endTime, AppointmentStatus status, String reason,
                       String appointmentRef, String cancellationReason, Consultation consultation) {
        this.id = id;
        this.patient = patient;
        this.doctor = doctor;
        this.appointmentDate = appointmentDate;
        this.appointmentTime = appointmentTime;
        this.endTime = endTime;
        this.status = status != null ? status : AppointmentStatus.PENDING;
        this.reason = reason;
        this.appointmentRef = appointmentRef;
        this.cancellationReason = cancellationReason;
        this.consultation = consultation;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Patient patient;
        private Doctor doctor;
        private LocalDate appointmentDate;
        private LocalTime appointmentTime;
        private LocalTime endTime;
        private AppointmentStatus status = AppointmentStatus.PENDING;
        private String reason;
        private String appointmentRef;
        private String cancellationReason;
        private Consultation consultation;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder patient(Patient patient) { this.patient = patient; return this; }
        public Builder doctor(Doctor doctor) { this.doctor = doctor; return this; }
        public Builder appointmentDate(LocalDate date) { this.appointmentDate = date; return this; }
        public Builder appointmentTime(LocalTime time) { this.appointmentTime = time; return this; }
        public Builder endTime(LocalTime endTime) { this.endTime = endTime; return this; }
        public Builder status(AppointmentStatus status) { this.status = status; return this; }
        public Builder reason(String reason) { this.reason = reason; return this; }
        public Builder appointmentRef(String ref) { this.appointmentRef = ref; return this; }
        public Builder cancellationReason(String reason) { this.cancellationReason = reason; return this; }
        public Builder consultation(Consultation consultation) { this.consultation = consultation; return this; }

        public Appointment build() {
            return new Appointment(id, patient, doctor, appointmentDate, appointmentTime, endTime, status,
                    reason, appointmentRef, cancellationReason, consultation);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public LocalTime getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(LocalTime appointmentTime) { this.appointmentTime = appointmentTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getAppointmentRef() { return appointmentRef; }
    public void setAppointmentRef(String appointmentRef) { this.appointmentRef = appointmentRef; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public Consultation getConsultation() { return consultation; }
    public void setConsultation(Consultation consultation) { this.consultation = consultation; }
}
