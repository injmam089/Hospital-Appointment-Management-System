package com.hams.service;

import com.hams.dto.patient.PatientProfileResponse;
import com.hams.dto.patient.UpdatePatientProfileRequest;
import com.hams.entity.Patient;
import com.hams.entity.User;
import com.hams.exception.HamsException;
import com.hams.repository.PatientRepository;
import com.hams.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PatientService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final AuditLogService auditLogService;

    public PatientService(
            UserRepository userRepository,
            PatientRepository patientRepository,
            AuditLogService auditLogService
    ) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public PatientProfileResponse getPatientProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> HamsException.notFound("User", null));

        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> HamsException.notFound("Patient", null));

        return PatientProfileResponse.fromEntity(patient);
    }

    @Transactional
    public PatientProfileResponse updatePatientProfileByEmail(String email, UpdatePatientProfileRequest req, String ipAddress) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> HamsException.notFound("User", null));

        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> HamsException.notFound("Patient", null));

        patient.setFirstName(req.getFirstName().trim());
        patient.setLastName(req.getLastName().trim());
        if (req.getPhone() != null) patient.setPhone(req.getPhone().trim());
        if (req.getGender() != null) patient.setGender(req.getGender());
        if (req.getDateOfBirth() != null) patient.setDateOfBirth(req.getDateOfBirth());
        if (req.getAddress() != null) patient.setAddress(req.getAddress().trim());
        if (req.getBloodGroup() != null) patient.setBloodGroup(req.getBloodGroup().trim());
        if (req.getEmergencyContact() != null) patient.setEmergencyContact(req.getEmergencyContact().trim());

        patient = patientRepository.save(patient);

        auditLogService.logAction(
                user.getId(),
                "PATIENT_PROFILE_UPDATED",
                "Patient",
                patient.getId(),
                ipAddress,
                "Patient updated personal profile"
        );

        return PatientProfileResponse.fromEntity(patient);
    }

    @Transactional(readOnly = true)
    public PatientProfileResponse getPatientById(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> HamsException.notFound("Patient", patientId));
        return PatientProfileResponse.fromEntity(patient);
    }

    @Transactional(readOnly = true)
    public Page<PatientProfileResponse> getAllPatients(Pageable pageable) {
        return patientRepository.findAll(pageable).map(PatientProfileResponse::fromEntity);
    }
}
