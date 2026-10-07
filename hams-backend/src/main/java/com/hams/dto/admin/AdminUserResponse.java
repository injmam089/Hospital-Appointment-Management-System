package com.hams.dto.admin;

import com.hams.enums.Role;
import java.time.LocalDateTime;

public class AdminUserResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private boolean active;
    private boolean emailVerified;
    private LocalDateTime createdAt;

    public AdminUserResponse() {
    }

    public AdminUserResponse(Long id, String name, String email, Role role, boolean active,
                             boolean emailVerified, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.active = active;
        this.emailVerified = emailVerified;
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String name;
        private String email;
        private Role role;
        private boolean active;
        private boolean emailVerified;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder role(Role role) { this.role = role; return this; }
        public Builder active(boolean active) { this.active = active; return this; }
        public Builder emailVerified(boolean emailVerified) { this.emailVerified = emailVerified; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public AdminUserResponse build() {
            return new AdminUserResponse(id, name, email, role, active, emailVerified, createdAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
