package com.hams.service;

import com.hams.dto.admin.AdminDashboardStatsResponse;
import com.hams.enums.AppointmentStatus;
import com.hams.enums.VerificationStatus;
import com.hams.repository.AppointmentRepository;
import com.hams.repository.DepartmentRepository;
import com.hams.repository.DoctorRepository;
import com.hams.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final AppointmentRepository appointmentRepository;

    public AdminDashboardService(PatientRepository patientRepository,
                                 DoctorRepository doctorRepository,
                                 DepartmentRepository departmentRepository,
                                 AppointmentRepository appointmentRepository) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.departmentRepository = departmentRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public AdminDashboardStatsResponse getDashboardStats() {
        AdminDashboardStatsResponse stats = new AdminDashboardStatsResponse();

        stats.setTotalPatients(patientRepository.count());
        stats.setTotalDoctors(doctorRepository.count());
        stats.setActiveDoctors(doctorRepository.countByActiveTrue());
        stats.setTotalDepartments(departmentRepository.count());
        stats.setTodayAppointments(appointmentRepository.countTodayAppointments());
        stats.setUpcomingAppointments(appointmentRepository.countUpcomingAppointments());
        stats.setCompletedAppointments(appointmentRepository.countByStatus(AppointmentStatus.COMPLETED));
        stats.setCancelledAppointments(appointmentRepository.countByStatus(AppointmentStatus.CANCELLED));
        stats.setPendingDoctorVerifications(doctorRepository.countByVerificationStatus(VerificationStatus.PENDING));

        // 1. Status distribution map
        Map<String, Long> statusDistribution = new LinkedHashMap<>();
        for (AppointmentStatus status : AppointmentStatus.values()) {
            statusDistribution.put(status.name(), appointmentRepository.countByStatus(status));
        }
        stats.setStatusDistribution(statusDistribution);

        // 2. Appointments over time (last 14 days)
        LocalDate fourteenDaysAgo = LocalDate.now().minusDays(14);
        List<Object[]> rawOverTime = appointmentRepository.countAppointmentsOverTime(fourteenDaysAgo);
        List<AdminDashboardStatsResponse.TimePointCount> overTimeList = new ArrayList<>();
        for (Object[] row : rawOverTime) {
            LocalDate date = (LocalDate) row[0];
            Long count = (Long) row[1];
            overTimeList.add(new AdminDashboardStatsResponse.TimePointCount(date.toString(), count));
        }
        stats.setAppointmentsOverTime(overTimeList);

        // 3. Department activity
        List<Object[]> deptRaw = appointmentRepository.getDepartmentReportStats(null, null, null, null);
        List<AdminDashboardStatsResponse.DepartmentActivity> deptActivity = new ArrayList<>();
        for (Object[] row : deptRaw) {
            Long deptId = ((Number) row[0]).longValue();
            String deptName = (String) row[1];
            long docCount = ((Number) row[2]).longValue();
            long apptCount = ((Number) row[3]).longValue();
            deptActivity.add(new AdminDashboardStatsResponse.DepartmentActivity(deptId, deptName, docCount, apptCount));
        }
        stats.setDepartmentActivity(deptActivity);

        // 4. Doctor activity
        List<Object[]> docRaw = appointmentRepository.getDoctorReportStats(null, null, null, null, null);
        List<AdminDashboardStatsResponse.DoctorActivity> docActivity = new ArrayList<>();
        for (Object[] row : docRaw) {
            Long docId = ((Number) row[0]).longValue();
            String docName = (String) row[1];
            String deptName = (String) row[2];
            long apptCount = ((Number) row[3]).longValue();
            long compCount = ((Number) row[4]).longValue();
            long cancCount = ((Number) row[5]).longValue();
            docActivity.add(new AdminDashboardStatsResponse.DoctorActivity(docId, docName, deptName, apptCount, compCount, cancCount));
        }
        stats.setDoctorActivity(docActivity);

        return stats;
    }
}
