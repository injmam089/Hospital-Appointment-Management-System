package com.hams.dto.department;

import com.hams.entity.Department;

public class DepartmentResponse {

    private Long id;
    private String name;
    private String description;
    private String icon;
    private boolean active;
    private long doctorCount;

    public DepartmentResponse() {
    }

    public DepartmentResponse(Long id, String name, String description, String icon, boolean active, long doctorCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.active = active;
        this.doctorCount = doctorCount;
    }

    public static DepartmentResponse fromEntity(Department d, long count) {
        return new DepartmentResponse(
                d.getId(),
                d.getName(),
                d.getDescription(),
                d.getIcon(),
                d.isActive(),
                count
        );
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getIcon() { return icon; }
    public boolean isActive() { return active; }
    public long getDoctorCount() { return doctorCount; }
}
