package com.hams.dto.admin;

import java.util.List;
import java.util.Map;

public class AdminDashboardStatsResponse {
    private long totalPatients;
    private long totalDoctors;
    private long activeDoctors;
    private long totalDepartments;
    private long todayAppointments;
    private long upcomingAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private long pendingDoctorVerifications;

    private Map<String, Long> statusDistribution;
    private List<TimePointCount> appointmentsOverTime;
    private List<DepartmentActivity> departmentActivity;
    private List<DoctorActivity> doctorActivity;

    public AdminDashboardStatsResponse() {
    }

    public static class TimePointCount {
        private String date;
        private long count;

        public TimePointCount() {}
        public TimePointCount(String date, long count) {
            this.date = date;
            this.count = count;
        }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public static class DepartmentActivity {
        private Long departmentId;
        private String departmentName;
        private long doctorCount;
        private long appointmentCount;

        public DepartmentActivity() {}
        public DepartmentActivity(Long departmentId, String departmentName, long doctorCount, long appointmentCount) {
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

    public static class DoctorActivity {
        private Long doctorId;
        private String doctorName;
        private String departmentName;
        private long appointmentCount;
        private long completedCount;
        private long cancelledCount;

        public DoctorActivity() {}
        public DoctorActivity(Long doctorId, String doctorName, String departmentName,
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

    // Getters and Setters
    public long getTotalPatients() { return totalPatients; }
    public void setTotalPatients(long totalPatients) { this.totalPatients = totalPatients; }

    public long getTotalDoctors() { return totalDoctors; }
    public void setTotalDoctors(long totalDoctors) { this.totalDoctors = totalDoctors; }

    public long getActiveDoctors() { return activeDoctors; }
    public void setActiveDoctors(long activeDoctors) { this.activeDoctors = activeDoctors; }

    public long getTotalDepartments() { return totalDepartments; }
    public void setTotalDepartments(long totalDepartments) { this.totalDepartments = totalDepartments; }

    public long getTodayAppointments() { return todayAppointments; }
    public void setTodayAppointments(long todayAppointments) { this.todayAppointments = todayAppointments; }

    public long getUpcomingAppointments() { return upcomingAppointments; }
    public void setUpcomingAppointments(long upcomingAppointments) { this.upcomingAppointments = upcomingAppointments; }

    public long getCompletedAppointments() { return completedAppointments; }
    public void setCompletedAppointments(long completedAppointments) { this.completedAppointments = completedAppointments; }

    public long getCancelledAppointments() { return cancelledAppointments; }
    public void setCancelledAppointments(long cancelledAppointments) { this.cancelledAppointments = cancelledAppointments; }

    public long getPendingDoctorVerifications() { return pendingDoctorVerifications; }
    public void setPendingDoctorVerifications(long pendingDoctorVerifications) { this.pendingDoctorVerifications = pendingDoctorVerifications; }

    public Map<String, Long> getStatusDistribution() { return statusDistribution; }
    public void setStatusDistribution(Map<String, Long> statusDistribution) { this.statusDistribution = statusDistribution; }

    public List<TimePointCount> getAppointmentsOverTime() { return appointmentsOverTime; }
    public void setAppointmentsOverTime(List<TimePointCount> appointmentsOverTime) { this.appointmentsOverTime = appointmentsOverTime; }

    public List<DepartmentActivity> getDepartmentActivity() { return departmentActivity; }
    public void setDepartmentActivity(List<DepartmentActivity> departmentActivity) { this.departmentActivity = departmentActivity; }

    public List<DoctorActivity> getDoctorActivity() { return doctorActivity; }
    public void setDoctorActivity(List<DoctorActivity> doctorActivity) { this.doctorActivity = doctorActivity; }
}
