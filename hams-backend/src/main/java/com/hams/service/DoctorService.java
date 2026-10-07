package com.hams.service;

import com.hams.dto.doctor.*;
import com.hams.entity.Department;
import com.hams.entity.Doctor;
import com.hams.entity.User;
import com.hams.enums.Role;
import com.hams.enums.VerificationStatus;
import com.hams.exception.HamsException;
import com.hams.repository.DepartmentRepository;
import com.hams.repository.DoctorRepository;
import com.hams.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DoctorService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public DoctorService(
            UserRepository userRepository,
            DoctorRepository doctorRepository,
            DepartmentRepository departmentRepository,
            PasswordEncoder passwordEncoder,
            AuditLogService auditLogService
    ) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public DoctorProfileResponse getDoctorProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> HamsException.notFound("User", null));

        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> HamsException.notFound("Doctor", null));

        return DoctorProfileResponse.fromEntity(doctor);
    }

    @Transactional
    public DoctorProfileResponse updateDoctorProfileByEmail(String email, UpdateDoctorProfileRequest req, String ipAddress) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> HamsException.notFound("User", null));

        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> HamsException.notFound("Doctor", null));

        doctor.setFirstName(req.getFirstName().trim());
        doctor.setLastName(req.getLastName().trim());
        if (req.getPhone() != null) doctor.setPhone(req.getPhone().trim());
        if (req.getBio() != null) doctor.setBio(req.getBio().trim());
        if (req.getQualification() != null) doctor.setQualification(req.getQualification().trim());
        if (req.getConsultationFee() != null) doctor.setConsultationFee(req.getConsultationFee());
        if (req.getPhotoUrl() != null) doctor.setPhotoUrl(req.getPhotoUrl().trim());

        doctor = doctorRepository.save(doctor);

        auditLogService.logAction(
                user.getId(),
                "DOCTOR_PROFILE_UPDATED",
                "Doctor",
                doctor.getId(),
                ipAddress,
                "Doctor updated permitted professional details"
        );

        return DoctorProfileResponse.fromEntity(doctor);
    }

    @Transactional(readOnly = true)
    public DoctorProfileResponse getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> HamsException.notFound("Doctor", id));
        return DoctorProfileResponse.fromEntity(doctor);
    }

    @Transactional(readOnly = true)
    public DoctorProfileResponse getPublicDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> HamsException.notFound("Doctor", id));
        if (!doctor.isActive() || !doctor.isVerified()) {
            throw HamsException.notFound("Doctor", id);
        }
        return DoctorProfileResponse.fromEntity(doctor);
    }

    @Transactional(readOnly = true)
    public Page<DoctorProfileResponse> adminSearchDoctors(
            String search,
            Long departmentId,
            VerificationStatus verificationStatus,
            Boolean active,
            Pageable pageable
    ) {
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        return doctorRepository.adminSearchDoctors(cleanSearch, departmentId, verificationStatus, active, pageable)
                .map(DoctorProfileResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<DoctorProfileResponse> publicSearchDoctors(String search, Long departmentId, Pageable pageable) {
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        return doctorRepository.searchDoctors(cleanSearch, departmentId, pageable)
                .map(DoctorProfileResponse::fromEntity);
    }

    @Transactional
    public DoctorProfileResponse createDoctor(CreateDoctorRequest req, String ipAddress) {
        final String email = req.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw HamsException.conflict("Account with email " + email + " already exists.");
        }

        Department department = departmentRepository.findById(req.getDepartmentId())
                .orElseThrow(() -> HamsException.badRequest("Selected department does not exist."));

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(Role.DOCTOR)
                .active(true)
                .emailVerified(true)
                .build();
        user = userRepository.save(user);

        VerificationStatus initialStatus = req.isVerified() ? VerificationStatus.APPROVED : VerificationStatus.PENDING;

        Doctor doctor = Doctor.builder()
                .user(user)
                .department(department)
                .firstName(req.getFirstName().trim())
                .lastName(req.getLastName().trim())
                .specialization(req.getSpecialization().trim())
                .qualification(req.getQualification())
                .experienceYears(req.getExperienceYears())
                .consultationFee(req.getConsultationFee())
                .bio(req.getBio())
                .phone(req.getPhone())
                .registrationNumber(req.getRegistrationNumber())
                .verified(req.isVerified())
                .verificationStatus(initialStatus)
                .active(true)
                .build();

        doctor = doctorRepository.save(doctor);

        auditLogService.logAction(
                null,
                "ADMIN_CREATED_DOCTOR",
                "Doctor",
                doctor.getId(),
                ipAddress,
                "Admin created doctor account for " + email
        );

        return DoctorProfileResponse.fromEntity(doctor);
    }

    @Transactional
    public DoctorProfileResponse adminUpdateDoctor(Long id, AdminUpdateDoctorRequest req, String ipAddress) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> HamsException.notFound("Doctor", id));

        doctor.setFirstName(req.getFirstName().trim());
        doctor.setLastName(req.getLastName().trim());
        doctor.setSpecialization(req.getSpecialization().trim());
        if (req.getDepartmentId() != null) {
            Department department = departmentRepository.findById(req.getDepartmentId())
                    .orElseThrow(() -> HamsException.badRequest("Department not found with ID: " + req.getDepartmentId()));
            doctor.setDepartment(department);
        }
        if (req.getQualification() != null) doctor.setQualification(req.getQualification());
        if (req.getExperienceYears() != null) doctor.setExperienceYears(req.getExperienceYears());
        if (req.getConsultationFee() != null) doctor.setConsultationFee(req.getConsultationFee());
        if (req.getBio() != null) doctor.setBio(req.getBio());
        if (req.getPhone() != null) doctor.setPhone(req.getPhone());
        if (req.getRegistrationNumber() != null) doctor.setRegistrationNumber(req.getRegistrationNumber());

        if (req.getActive() != null) {
            doctor.setActive(req.getActive());
            if (doctor.getUser() != null) {
                doctor.getUser().setActive(req.getActive());
                userRepository.save(doctor.getUser());
            }
        }

        if (req.getVerificationStatus() != null) {
            doctor.setVerificationStatus(req.getVerificationStatus());
        }

        doctor = doctorRepository.save(doctor);

        auditLogService.logAction(
                null,
                "ADMIN_UPDATED_DOCTOR",
                "Doctor",
                doctor.getId(),
                ipAddress,
                "Admin updated doctor details for ID: " + id
        );

        return DoctorProfileResponse.fromEntity(doctor);
    }

    @Transactional
    public DoctorProfileResponse verifyDoctor(Long id, String ipAddress) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> HamsException.notFound("Doctor", id));

        doctor.setVerificationStatus(VerificationStatus.APPROVED);
        doctor = doctorRepository.save(doctor);

        auditLogService.logAction(null, "DOCTOR_APPROVED", "Doctor", id, ipAddress, "Doctor credentials verified and approved");
        return DoctorProfileResponse.fromEntity(doctor);
    }

    @Transactional
    public DoctorProfileResponse rejectDoctor(Long id, String ipAddress) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> HamsException.notFound("Doctor", id));

        doctor.setVerificationStatus(VerificationStatus.REJECTED);
        doctor = doctorRepository.save(doctor);

        auditLogService.logAction(null, "DOCTOR_REJECTED", "Doctor", id, ipAddress, "Doctor credentials rejected");
        return DoctorProfileResponse.fromEntity(doctor);
    }

    @Transactional
    public DoctorProfileResponse setDoctorActiveStatus(Long id, boolean active, String ipAddress) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> HamsException.notFound("Doctor", id));

        doctor.setActive(active);
        if (doctor.getUser() != null) {
            doctor.getUser().setActive(active);
            userRepository.save(doctor.getUser());
        }
        doctor = doctorRepository.save(doctor);

        String action = active ? "DOCTOR_ACTIVATED" : "DOCTOR_DEACTIVATED";
        auditLogService.logAction(null, action, "Doctor", id, ipAddress, "Doctor account active set to: " + active);

        return DoctorProfileResponse.fromEntity(doctor);
    }
}
