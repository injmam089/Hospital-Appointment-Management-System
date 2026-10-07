package com.hams.service;

import com.hams.dto.auth.*;
import com.hams.entity.Department;
import com.hams.entity.Doctor;
import com.hams.entity.Patient;
import com.hams.entity.User;
import com.hams.enums.Role;
import com.hams.exception.HamsException;
import com.hams.repository.DepartmentRepository;
import com.hams.repository.DoctorRepository;
import com.hams.repository.PatientRepository;
import com.hams.repository.UserRepository;
import com.hams.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditLogService auditLogService;

    @Value("${hams.admin.default-email:admin@hams.local}")
    private String defaultAdminEmail;

    @Value("${hams.admin.default-password:Admin@HAMS2024!}")
    private String defaultAdminPassword;

    public AuthService(
            UserRepository userRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            DepartmentRepository departmentRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuditLogService auditLogService
    ) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public AuthResponse registerPatient(RegisterRequest request, String ipAddress) {
        final String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw HamsException.conflict("An account with email " + email + " already exists.");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.PATIENT)
                .active(true)
                .emailVerified(true)
                .failedLoginAttempts(0)
                .build();

        user = userRepository.save(user);

        Patient patient = Patient.builder()
                .user(user)
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .phone(request.getPhone())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .bloodGroup(request.getBloodGroup())
                .address(request.getAddress())
                .emergencyContact(request.getEmergencyContact())
                .build();

        patientRepository.save(patient);

        auditLogService.logAction(
                user.getId(),
                "PATIENT_REGISTERED",
                "User",
                user.getId(),
                ipAddress,
                "Patient registered successfully: " + email
        );

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        UserSummaryDto summary = new UserSummaryDto(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                patient.getFirstName(),
                patient.getLastName()
        );

        return new AuthResponse(accessToken, refreshToken, jwtService.getAccessTokenExpiryMs(), summary);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String ipAddress) {
        final String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            if (user != null) {
                user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
                if (user.getFailedLoginAttempts() >= 5) {
                    user.setLockedUntil(LocalDateTime.now().plusMinutes(15));
                }
                userRepository.save(user);
            }
            auditLogService.logAction(
                    user != null ? user.getId() : null,
                    "LOGIN_FAILED",
                    "User",
                    null,
                    ipAddress,
                    "Failed login attempt for email: " + email
            );
            throw HamsException.badRequest("Invalid email address or password.");
        }

        if (!user.isActive()) {
            auditLogService.logAction(user.getId(), "LOGIN_BLOCKED_INACTIVE", "User", user.getId(), ipAddress, "Inactive account login attempt");
            throw HamsException.forbidden("Your account is currently disabled. Please contact the hospital administrator.");
        }

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            auditLogService.logAction(user.getId(), "LOGIN_BLOCKED_LOCKED", "User", user.getId(), ipAddress, "Locked account login attempt");
            throw HamsException.forbidden("Account is temporarily locked due to multiple failed login attempts. Please try again later.");
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        auditLogService.logAction(user.getId(), "LOGIN_SUCCESS", "User", user.getId(), ipAddress, "Successful authentication");

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        UserSummaryDto summary = buildUserSummary(user);

        return new AuthResponse(accessToken, refreshToken, jwtService.getAccessTokenExpiryMs(), summary);
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();

        if (!jwtService.validateToken(token)) {
            throw HamsException.badRequest("Refresh token is invalid or has expired. Please sign in again.");
        }

        String tokenType = jwtService.extractTokenType(token);
        if (!"REFRESH".equals(tokenType)) {
            throw HamsException.badRequest("Invalid token type. Refresh token required.");
        }

        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> HamsException.notFound("User", null));

        if (!user.isActive()) {
            throw HamsException.forbidden("User account is inactive.");
        }

        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        UserSummaryDto summary = buildUserSummary(user);

        return new AuthResponse(newAccessToken, token, jwtService.getAccessTokenExpiryMs(), summary);
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUserSummary(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> HamsException.notFound("User", null));
        return buildUserSummary(user);
    }

    private UserSummaryDto buildUserSummary(User user) {
        String firstName = null;
        String lastName = null;

        if (user.getRole() == Role.PATIENT) {
            Patient p = patientRepository.findByUserId(user.getId()).orElse(null);
            if (p != null) {
                firstName = p.getFirstName();
                lastName = p.getLastName();
            }
        } else if (user.getRole() == Role.DOCTOR) {
            Doctor d = doctorRepository.findByUserId(user.getId()).orElse(null);
            if (d != null) {
                firstName = d.getFirstName();
                lastName = d.getLastName();
            }
        } else if (user.getRole() == Role.ADMIN) {
            firstName = "Hospital";
            lastName = "Admin";
        }

        return new UserSummaryDto(user.getId(), user.getEmail(), user.getRole(), firstName, lastName);
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedInitialUsers() {
        try {
            // Seed Admin if not present
            if (!userRepository.existsByEmail(defaultAdminEmail)) {
                User admin = User.builder()
                        .email(defaultAdminEmail)
                        .passwordHash(passwordEncoder.encode(defaultAdminPassword))
                        .role(Role.ADMIN)
                        .active(true)
                        .emailVerified(true)
                        .build();
                userRepository.save(admin);
                log.info("Initialized default admin user: {}", defaultAdminEmail);
            }

            // Seed Sample Doctor if not present
            final String sampleDoctorEmail = "doctor.smith@hams.local";
            if (!userRepository.existsByEmail(sampleDoctorEmail)) {
                User doctorUser = User.builder()
                        .email(sampleDoctorEmail)
                        .passwordHash(passwordEncoder.encode("Doctor@HAMS2024!"))
                        .role(Role.DOCTOR)
                        .active(true)
                        .emailVerified(true)
                        .build();
                doctorUser = userRepository.save(doctorUser);

                Department department = departmentRepository.findByName("Cardiology")
                        .orElseGet(() -> departmentRepository.save(
                                Department.builder()
                                        .name("Cardiology")
                                        .description("Cardiovascular care")
                                        .icon("heart")
                                        .active(true)
                                        .build()
                        ));

                Doctor doctor = Doctor.builder()
                        .user(doctorUser)
                        .department(department)
                        .firstName("Sarah")
                        .lastName("Smith")
                        .specialization("Interventional Cardiology")
                        .qualification("MD, FACC, MBBS")
                        .experienceYears(12)
                        .consultationFee(BigDecimal.valueOf(800.00))
                        .bio("Senior Cardiologist specializing in preventive and interventional cardiovascular medicine.")
                        .phone("+91 98765 11223")
                        .registrationNumber("MED-CAR-84729")
                        .verified(true)
                        .active(true)
                        .build();
                doctorRepository.save(doctor);
                log.info("Initialized default verified doctor: {}", sampleDoctorEmail);
            }
        } catch (Exception e) {
            log.error("Error during initial user seeding", e);
        }
    }
}
