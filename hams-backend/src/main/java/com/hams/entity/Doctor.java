package com.hams.entity;

import com.hams.enums.VerificationStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "doctors")
public class Doctor extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, length = 150)
    private String specialization;

    @Column(columnDefinition = "TEXT")
    private String qualification;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "consultation_fee", precision = 10, scale = 2)
    private BigDecimal consultationFee;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(name = "is_verified", nullable = false)
    private boolean verified = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 20)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(length = 20)
    private String phone;

    @Column(name = "registration_number", length = 255)
    private String registrationNumber;

    public Doctor() {
    }

    public Doctor(Long id, User user, Department department, String firstName, String lastName,
                  String specialization, String qualification, Integer experienceYears,
                  BigDecimal consultationFee, String bio, String photoUrl, boolean verified,
                  VerificationStatus verificationStatus, boolean active, String phone,
                  String registrationNumber) {
        this.id = id;
        this.user = user;
        this.department = department;
        this.firstName = firstName;
        this.lastName = lastName;
        this.specialization = specialization;
        this.qualification = qualification;
        this.experienceYears = experienceYears;
        this.consultationFee = consultationFee;
        this.bio = bio;
        this.photoUrl = photoUrl;
        this.verified = verified;
        this.verificationStatus = verificationStatus != null ? verificationStatus : (verified ? VerificationStatus.APPROVED : VerificationStatus.PENDING);
        this.active = active;
        this.phone = phone;
        this.registrationNumber = registrationNumber;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private User user;
        private Department department;
        private String firstName;
        private String lastName;
        private String specialization;
        private String qualification;
        private Integer experienceYears;
        private BigDecimal consultationFee;
        private String bio;
        private String photoUrl;
        private boolean verified = false;
        private VerificationStatus verificationStatus = VerificationStatus.PENDING;
        private boolean active = true;
        private String phone;
        private String registrationNumber;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder department(Department department) { this.department = department; return this; }
        public Builder firstName(String firstName) { this.firstName = firstName; return this; }
        public Builder lastName(String lastName) { this.lastName = lastName; return this; }
        public Builder specialization(String specialization) { this.specialization = specialization; return this; }
        public Builder qualification(String qualification) { this.qualification = qualification; return this; }
        public Builder experienceYears(Integer experienceYears) { this.experienceYears = experienceYears; return this; }
        public Builder consultationFee(BigDecimal fee) { this.consultationFee = fee; return this; }
        public Builder bio(String bio) { this.bio = bio; return this; }
        public Builder photoUrl(String photoUrl) { this.photoUrl = photoUrl; return this; }
        public Builder verified(boolean verified) {
            this.verified = verified;
            if (verified) this.verificationStatus = VerificationStatus.APPROVED;
            return this;
        }
        public Builder verificationStatus(VerificationStatus status) {
            this.verificationStatus = status;
            this.verified = (status == VerificationStatus.APPROVED);
            return this;
        }
        public Builder active(boolean active) { this.active = active; return this; }
        public Builder phone(String phone) { this.phone = phone; return this; }
        public Builder registrationNumber(String regNo) { this.registrationNumber = regNo; return this; }

        public Doctor build() {
            return new Doctor(id, user, department, firstName, lastName, specialization, qualification,
                    experienceYears, consultationFee, bio, photoUrl, verified, verificationStatus, active, phone, registrationNumber);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getFullName() { return (firstName + " " + lastName).trim(); }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

    public BigDecimal getConsultationFee() { return consultationFee; }
    public void setConsultationFee(BigDecimal consultationFee) { this.consultationFee = consultationFee; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) {
        this.verified = verified;
        if (verified && this.verificationStatus != VerificationStatus.APPROVED) {
            this.verificationStatus = VerificationStatus.APPROVED;
        }
    }

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
        this.verified = (verificationStatus == VerificationStatus.APPROVED);
    }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
}
