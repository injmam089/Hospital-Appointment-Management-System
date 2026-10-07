package com.hams.dto.doctor;

import com.hams.entity.Doctor;
import com.hams.enums.VerificationStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DoctorProfileResponse {

    private Long id;
    private Long userId;
    private String email;
    private String role = "DOCTOR";
    private String firstName;
    private String lastName;
    private String fullName;
    private Long departmentId;
    private String departmentName;
    private String specialization;
    private String qualification;
    private Integer experienceYears;
    private BigDecimal consultationFee;
    private String bio;
    private String photoUrl;
    private String phone;
    private String registrationNumber;
    private boolean verified;
    private VerificationStatus verificationStatus;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DoctorProfileResponse() {
    }

    public static DoctorProfileResponse fromEntity(Doctor d) {
        DoctorProfileResponse resp = new DoctorProfileResponse();
        resp.id = d.getId();
        resp.userId = d.getUser() != null ? d.getUser().getId() : null;
        resp.email = d.getUser() != null ? d.getUser().getEmail() : null;
        resp.firstName = d.getFirstName();
        resp.lastName = d.getLastName();
        resp.fullName = "Dr. " + d.getFirstName() + " " + (d.getLastName() != null ? d.getLastName() : "");
        if (d.getDepartment() != null) {
            resp.departmentId = d.getDepartment().getId();
            resp.departmentName = d.getDepartment().getName();
        }
        resp.specialization = d.getSpecialization();
        resp.qualification = d.getQualification();
        resp.experienceYears = d.getExperienceYears();
        resp.consultationFee = d.getConsultationFee();
        resp.bio = d.getBio();
        resp.photoUrl = d.getPhotoUrl();
        resp.phone = d.getPhone();
        resp.registrationNumber = d.getRegistrationNumber();
        resp.verified = d.isVerified();
        resp.verificationStatus = d.getVerificationStatus();
        resp.active = d.isActive();
        resp.createdAt = d.getCreatedAt();
        resp.updatedAt = d.getUpdatedAt();
        return resp;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getFullName() { return fullName; }
    public Long getDepartmentId() { return departmentId; }
    public String getDepartmentName() { return departmentName; }
    public String getSpecialization() { return specialization; }
    public String getQualification() { return qualification; }
    public Integer getExperienceYears() { return experienceYears; }
    public BigDecimal getConsultationFee() { return consultationFee; }
    public String getBio() { return bio; }
    public String getPhotoUrl() { return photoUrl; }
    public String getPhone() { return phone; }
    public String getRegistrationNumber() { return registrationNumber; }
    public boolean isVerified() { return verified; }
    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public boolean isActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
