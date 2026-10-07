package com.hams.controller;

import com.hams.dto.department.DepartmentResponse;
import com.hams.dto.doctor.DoctorProfileResponse;
import com.hams.dto.schedule.DoctorDaySlotsResponse;
import com.hams.dto.schedule.DoctorScheduleResponse;
import com.hams.service.DepartmentService;
import com.hams.service.DoctorService;
import com.hams.service.ScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/public")
@Tag(name = "Public Discovery", description = "Publicly accessible endpoints for discovering hospital departments, verified doctors, and availability")
public class PublicDiscoveryController {

    private final DoctorService doctorService;
    private final DepartmentService departmentService;
    private final ScheduleService scheduleService;

    public PublicDiscoveryController(DoctorService doctorService,
                                     DepartmentService departmentService,
                                     ScheduleService scheduleService) {
        this.doctorService = doctorService;
        this.departmentService = departmentService;
        this.scheduleService = scheduleService;
    }

    @GetMapping("/doctors")
    @Operation(summary = "Search Verified Doctors", description = "Public search for verified and active hospital doctors with optional department filter")
    public ResponseEntity<Page<DoctorProfileResponse>> searchDoctors(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "experienceYears,desc") String sort
    ) {
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortField));

        return ResponseEntity.ok(doctorService.publicSearchDoctors(search, departmentId, pageRequest));
    }

    @GetMapping("/doctors/{id}")
    @Operation(summary = "Get Doctor Public Profile", description = "Returns public credentials, specialization, and consultation fee for a verified doctor")
    public ResponseEntity<DoctorProfileResponse> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getPublicDoctorById(id));
    }

    @GetMapping("/doctors/{id}/availability")
    @Operation(summary = "Get Doctor Weekly Schedule", description = "Returns public weekly working schedule and hours for a verified doctor")
    public ResponseEntity<DoctorScheduleResponse> getDoctorAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.getPublicDoctorSchedule(id));
    }

    @GetMapping("/doctors/{id}/slots")
    @Operation(summary = "Get Available Slots for Date", description = "Returns available booking slots for a doctor on a specific date, accounting for schedule, slot duration, breaks, and leaves")
    public ResponseEntity<DoctorDaySlotsResponse> getDoctorSlots(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(scheduleService.getPublicAvailableSlotsForDate(id, date));
    }

    @GetMapping("/departments")
    @Operation(summary = "List Active Hospital Departments", description = "Returns all currently active medical departments with doctor counts")
    public ResponseEntity<List<DepartmentResponse>> getDepartments() {
        return ResponseEntity.ok(departmentService.getActiveDepartments());
    }
}
