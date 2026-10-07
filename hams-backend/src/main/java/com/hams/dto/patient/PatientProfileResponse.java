package com.hams.dto.patient;

import com.hams.entity.Patient;
import com.hams.enums.Gender;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PatientProfileResponse {

    private Long id;
    private Long userId;
    private String email;
    private String role = "PATIENT";
    private String firstName;
    private String lastName;
    private String fullName;
    private String phone;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String address;
    private String bloodGroup;
    private String emergencyContact;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PatientProfileResponse() {
    }

    public static PatientProfileResponse fromEntity(Patient p) {
        PatientProfileResponse resp = new PatientProfileResponse();
        resp.id = p.getId();
        resp.userId = p.getUser() != null ? p.getUser().getId() : null;
        resp.email = p.getUser() != null ? p.getUser().getEmail() : null;
        resp.firstName = p.getFirstName();
        resp.lastName = p.getLastName();
        resp.fullName = (p.getFirstName() + " " + (p.getLastName() != null ? p.getLastName() : "")).trim();
        resp.phone = p.getPhone();
        resp.gender = p.getGender();
        resp.dateOfBirth = p.getDateOfBirth();
        resp.address = p.getAddress();
        resp.bloodGroup = p.getBloodGroup();
        resp.emergencyContact = p.getEmergencyContact();
        resp.createdAt = p.getCreatedAt();
        resp.updatedAt = p.getUpdatedAt();
        return resp;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getFullName() { return fullName; }
    public String getPhone() { return phone; }
    public Gender getGender() { return gender; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public String getAddress() { return address; }
    public String getBloodGroup() { return bloodGroup; }
    public String getEmergencyContact() { return emergencyContact; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
