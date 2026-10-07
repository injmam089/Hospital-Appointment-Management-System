package com.hams.service;

import com.hams.dto.admin.AdminUserResponse;
import com.hams.entity.Doctor;
import com.hams.entity.Patient;
import com.hams.entity.User;
import com.hams.enums.Role;
import com.hams.exception.HamsException;
import com.hams.repository.DoctorRepository;
import com.hams.repository.PatientRepository;
import com.hams.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class AdminUserService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AuditLogService auditLogService;

    public AdminUserService(UserRepository userRepository,
                            PatientRepository patientRepository,
                            DoctorRepository doctorRepository,
                            AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<AdminUserResponse> getUsers(String search, Role role, Boolean active, Pageable pageable) {
        String trimmedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<User> users = userRepository.findUsersFiltered(trimmedSearch, role, active, pageable);
        return users.map(this::mapToAdminUserResponse);
    }

    @Transactional(readOnly = true)
    public AdminUserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> HamsException.notFound("User", id));
        return mapToAdminUserResponse(user);
    }

    public AdminUserResponse updateUserStatus(String currentAdminEmail, Long targetUserId, Boolean active) {
        if (active == null) {
            throw HamsException.badRequest("Active status is required.");
        }

        User currentAdmin = userRepository.findByEmail(currentAdminEmail)
                .orElseThrow(() -> HamsException.notFound("Admin user", currentAdminEmail));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> HamsException.notFound("User", targetUserId));

        // Safeguard 1: Admin cannot deactivate their own currently authenticated account
        if (!active && targetUser.getId().equals(currentAdmin.getId())) {
            throw HamsException.badRequest("You cannot deactivate your own administrative account.");
        }

        // Safeguard 2: Do not allow the last active ADMIN account to be deactivated
        if (!active && targetUser.getRole() == Role.ADMIN) {
            long activeAdminCount = userRepository.countByRoleAndActiveTrue(Role.ADMIN);
            if (activeAdminCount <= 1) {
                throw HamsException.badRequest("Cannot deactivate the last active administrative account.");
            }
        }

        targetUser.setActive(active);
        User saved = userRepository.saveAndFlush(targetUser);

        auditLogService.logAction(
                currentAdmin.getId(),
                active ? "USER_ACTIVATED" : "USER_DEACTIVATED",
                "USER",
                saved.getId(),
                null,
                "Admin " + currentAdmin.getEmail() + " set status to " + (active ? "ACTIVE" : "INACTIVE") + " for user " + saved.getEmail()
        );

        return mapToAdminUserResponse(saved);
    }

    private AdminUserResponse mapToAdminUserResponse(User user) {
        String name = resolveUserName(user);
        return AdminUserResponse.builder()
                .id(user.getId())
                .name(name)
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.isActive())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private String resolveUserName(User user) {
        if (user.getRole() == Role.PATIENT) {
            Optional<Patient> patientOpt = patientRepository.findByUserId(user.getId());
            if (patientOpt.isPresent()) {
                return patientOpt.get().getFullName();
            }
        } else if (user.getRole() == Role.DOCTOR) {
            Optional<Doctor> doctorOpt = doctorRepository.findByUserId(user.getId());
            if (doctorOpt.isPresent()) {
                return doctorOpt.get().getFullName();
            }
        } else if (user.getRole() == Role.ADMIN) {
            return "Administrator";
        }
        return user.getEmail();
    }
}
