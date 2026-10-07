package com.hams.dto.doctor;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public class CreateDoctorRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "First name is required")
    @Size(min = 1, max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 1, max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotBlank(message = "Specialization is required")
    @Size(max = 150, message = "Specialization must not exceed 150 characters")
    private String specialization;

    @Size(max = 500, message = "Qualification must not exceed 500 characters")
    private String qualification;

    @Min(value = 0, message = "Experience years cannot be negative")
    private Integer experienceYears;

    @DecimalMin(value = "0.00", message = "Consultation fee cannot be negative")
    private BigDecimal consultationFee;

    @Size(max = 2000, message = "Bio must not exceed 2000 characters")
    private String bio;

    @Pattern(regexp = "^\\+?[0-9\\s\\-\\(\\)]{7,20}$", message = "Please provide a valid phone number")
    private String phone;

    @Size(max = 255, message = "Registration/License number must not exceed 255 characters")
    private String registrationNumber;

    private boolean verified = false;

    public CreateDoctorRequest() {
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

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

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
}
