package com.hams.service;

import com.hams.dto.admin.AdminReportResponse;
import com.hams.enums.AppointmentStatus;
import com.hams.repository.AppointmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class AdminReportService {

    private final AppointmentRepository appointmentRepository;

    public AdminReportService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public AdminReportResponse getReportsSummary(
            LocalDate startDate,
            LocalDate endDate,
            Long departmentId,
            Long doctorId,
            AppointmentStatus status
    ) {
        // 1. Status breakdown
        List<Object[]> statusRows = appointmentRepository.countAppointmentsByStatusGrouped(startDate, endDate, departmentId, doctorId);
        Map<String, Long> statusCounts = new LinkedHashMap<>();
        long totalAppointments = 0;

        // Initialize zero counts for key statuses
        for (AppointmentStatus s : AppointmentStatus.values()) {
            statusCounts.put(s.name(), 0L);
        }

        for (Object[] row : statusRows) {
            AppointmentStatus st = (AppointmentStatus) row[0];
            Long count = ((Number) row[1]).longValue();
            statusCounts.put(st.name(), count);
            totalAppointments += count;
        }

        // 2. Department statistics
        List<Object[]> deptRows = appointmentRepository.getDepartmentReportStats(startDate, endDate, status, departmentId);
        List<AdminReportResponse.DepartmentReportItem> deptStats = new ArrayList<>();
        for (Object[] row : deptRows) {
            Long dId = ((Number) row[0]).longValue();
            String dName = (String) row[1];
            long docCount = ((Number) row[2]).longValue();
            long apptCount = ((Number) row[3]).longValue();
            deptStats.add(new AdminReportResponse.DepartmentReportItem(dId, dName, docCount, apptCount));
        }

        // 3. Doctor statistics
        List<Object[]> docRows = appointmentRepository.getDoctorReportStats(startDate, endDate, status, departmentId, doctorId);
        List<AdminReportResponse.DoctorReportItem> docStats = new ArrayList<>();
        for (Object[] row : docRows) {
            Long docId = ((Number) row[0]).longValue();
            String docName = (String) row[1];
            String deptName = (String) row[2];
            long apptCount = ((Number) row[3]).longValue();
            long compCount = ((Number) row[4]).longValue();
            long cancCount = ((Number) row[5]).longValue();
            docStats.add(new AdminReportResponse.DoctorReportItem(docId, docName, deptName, apptCount, compCount, cancCount));
        }

        return new AdminReportResponse(totalAppointments, statusCounts, deptStats, docStats);
    }
}
