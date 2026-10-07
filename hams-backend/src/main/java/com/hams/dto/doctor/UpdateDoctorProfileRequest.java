package com.hams.dto.doctor;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class UpdateDoctorProfileRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 1, max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 1, max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @Pattern(regexp = "^\\+?[0-9\\s\\-\\(\\)]{7,20}$", message = "Please provide a valid phone number")
    private String phone;

    @Size(max = 2000, message = "Bio must not exceed 2000 characters")
    private String bio;

    @Size(max = 500, message = "Qualification must not exceed 500 characters")
    private String qualification;

    @DecimalMin(value = "0.00", message = "Consultation fee cannot be negative")
    private BigDecimal consultationFee;

    @Size(max = 500, message = "Photo URL must not exceed 500 characters")
    private String photoUrl;

    public UpdateDoctorProfileRequest() {
    }

    public UpdateDoctorProfileRequest(String firstName, String lastName, String phone, String bio,
                                      String qualification, BigDecimal consultationFee, String photoUrl) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.bio = bio;
        this.qualification = qualification;
        this.consultationFee = consultationFee;
        this.photoUrl = photoUrl;
    }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public BigDecimal getConsultationFee() { return consultationFee; }
    public void setConsultationFee(BigDecimal consultationFee) { this.consultationFee = consultationFee; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
}
