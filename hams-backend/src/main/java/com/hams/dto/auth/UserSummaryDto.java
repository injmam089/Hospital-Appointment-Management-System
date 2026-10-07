package com.hams.dto.auth;

import com.hams.enums.Role;

public class UserSummaryDto {

    private Long id;
    private String email;
    private Role role;
    private String firstName;
    private String lastName;

    public UserSummaryDto() {
    }

    public UserSummaryDto(Long id, String email, Role role, String firstName, String lastName) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getFullName() {
        if (firstName == null && lastName == null) return email;
        return ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();
    }
}
