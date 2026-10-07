package com.hams.service;

import com.hams.dto.department.DepartmentRequest;
import com.hams.dto.department.DepartmentResponse;
import com.hams.entity.Department;
import com.hams.exception.HamsException;
import com.hams.repository.DepartmentRepository;
import com.hams.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final AuditLogService auditLogService;

    public DepartmentService(
            DepartmentRepository departmentRepository,
            DoctorRepository doctorRepository,
            AuditLogService auditLogService
    ) {
        this.departmentRepository = departmentRepository;
        this.doctorRepository = doctorRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(d -> {
                    long count = doctorRepository.findByDepartmentId(d.getId()).size();
                    return DepartmentResponse.fromEntity(d, count);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getActiveDepartments() {
        return departmentRepository.findByActiveTrue().stream()
                .map(d -> {
                    long count = doctorRepository.findByDepartmentId(d.getId()).size();
                    return DepartmentResponse.fromEntity(d, count);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(Long id) {
        Department d = departmentRepository.findById(id)
                .orElseThrow(() -> HamsException.notFound("Department", id));
        long count = doctorRepository.findByDepartmentId(d.getId()).size();
        return DepartmentResponse.fromEntity(d, count);
    }

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest req, String ipAddress) {
        final String name = req.getName().trim();

        if (departmentRepository.existsByName(name)) {
            throw HamsException.conflict("Department with name '" + name + "' already exists.");
        }

        Department department = Department.builder()
                .name(name)
                .description(req.getDescription())
                .icon(req.getIcon() != null && !req.getIcon().isBlank() ? req.getIcon() : "activity")
                .active(true)
                .build();

        department = departmentRepository.save(department);

        auditLogService.logAction(
                null,
                "DEPARTMENT_CREATED",
                "Department",
                department.getId(),
                ipAddress,
                "Admin created department: " + name
        );

        return DepartmentResponse.fromEntity(department, 0);
    }

    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest req, String ipAddress) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> HamsException.notFound("Department", id));

        final String newName = req.getName().trim();
        if (!department.getName().equalsIgnoreCase(newName) && departmentRepository.existsByName(newName)) {
            throw HamsException.conflict("Department with name '" + newName + "' already exists.");
        }

        department.setName(newName);
        department.setDescription(req.getDescription());
        if (req.getIcon() != null && !req.getIcon().isBlank()) {
            department.setIcon(req.getIcon());
        }

        department = departmentRepository.save(department);

        auditLogService.logAction(
                null,
                "DEPARTMENT_UPDATED",
                "Department",
                department.getId(),
                ipAddress,
                "Admin updated department: " + newName
        );

        long count = doctorRepository.findByDepartmentId(department.getId()).size();
        return DepartmentResponse.fromEntity(department, count);
    }

    @Transactional
    public DepartmentResponse toggleDepartmentStatus(Long id, Boolean active, String ipAddress) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> HamsException.notFound("Department", id));

        boolean newStatus = active != null ? active : !department.isActive();
        department.setActive(newStatus);
        department = departmentRepository.save(department);

        auditLogService.logAction(
                null,
                "DEPARTMENT_STATUS_TOGGLED",
                "Department",
                department.getId(),
                ipAddress,
                "Admin toggled department status: " + department.getName() + " -> " + newStatus
        );

        long count = doctorRepository.findByDepartmentId(department.getId()).size();
        return DepartmentResponse.fromEntity(department, count);
    }
}
