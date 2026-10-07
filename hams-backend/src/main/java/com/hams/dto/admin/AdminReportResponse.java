package com.hams.dto.admin;

import java.util.List;
import java.util.Map;

public class AdminReportResponse {
    private long totalAppointments;
    private Map<String, Long> statusCounts;
    private List<DepartmentReportItem> departmentStats;
    private List<DoctorReportItem> doctorStats;

    public AdminReportResponse() {
    }

    public AdminReportResponse(long totalAppointments, Map<String, Long> statusCounts,
                               List<DepartmentReportItem> departmentStats, List<DoctorReportItem> doctorStats) {
        this.totalAppointments = totalAppointments;
        this.statusCounts = statusCounts;
        this.departmentStats = departmentStats;
        this.doctorStats = doctorStats;
    }

    public static class DepartmentReportItem {
        private Long departmentId;
        private String departmentName;
        private long doctorCount;
        private long appointmentCount;

        public DepartmentReportItem() {}
        public DepartmentReportItem(Long departmentId, String departmentName, long doctorCount, long appointmentCount) {
            this.departmentId = departmentId;
            this.departmentName = departmentName;
            this.doctorCount = doctorCount;
            this.appointmentCount = appointmentCount;
        }

        public Long getDepartmentId() { return departmentId; }
        public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
        public String getDepartmentName() { return departmentName; }
        public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
        public long getDoctorCount() { return doctorCount; }
        public void setDoctorCount(long doctorCount) { this.doctorCount = doctorCount; }
        public long getAppointmentCount() { return appointmentCount; }
        public void setAppointmentCount(long appointmentCount) { this.appointmentCount = appointmentCount; }
    }

    public static class DoctorReportItem {
        private Long doctorId;
        private String doctorName;
        private String departmentName;
        private long appointmentCount;
        private long completedCount;
        private long cancelledCount;

        public DoctorReportItem() {}
        public DoctorReportItem(Long doctorId, String doctorName, String departmentName,
                                long appointmentCount, long completedCount, long cancelledCount) {
            this.doctorId = doctorId;
            this.doctorName = doctorName;
            this.departmentName = departmentName;
            this.appointmentCount = appointmentCount;
            this.completedCount = completedCount;
            this.cancelledCount = cancelledCount;
        }

        public Long getDoctorId() { return doctorId; }
        public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
        public String getDoctorName() { return doctorName; }
        public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
        public String getDepartmentName() { return departmentName; }
        public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
        public long getAppointmentCount() { return appointmentCount; }
        public void setAppointmentCount(long appointmentCount) { this.appointmentCount = appointmentCount; }
        public long getCompletedCount() { return completedCount; }
        public void setCompletedCount(long completedCount) { this.completedCount = completedCount; }
        public long getCancelledCount() { return cancelledCount; }
        public void setCancelledCount(long cancelledCount) { this.cancelledCount = cancelledCount; }
    }

    public long getTotalAppointments() { return totalAppointments; }
    public void setTotalAppointments(long totalAppointments) { this.totalAppointments = totalAppointments; }

    public Map<String, Long> getStatusCounts() { return statusCounts; }
    public void setStatusCounts(Map<String, Long> statusCounts) { this.statusCounts = statusCounts; }

    public List<DepartmentReportItem> getDepartmentStats() { return departmentStats; }
    public void setDepartmentStats(List<DepartmentReportItem> departmentStats) { this.departmentStats = departmentStats; }

    public List<DoctorReportItem> getDoctorStats() { return doctorStats; }
    public void setDoctorStats(List<DoctorReportItem> doctorStats) { this.doctorStats = doctorStats; }
}
