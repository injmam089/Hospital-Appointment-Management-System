package com.hams.service;

import com.hams.dto.schedule.*;
import com.hams.entity.Doctor;
import com.hams.entity.DoctorAvailability;
import com.hams.entity.DoctorBreak;
import com.hams.entity.DoctorLeave;
import com.hams.enums.DayOfWeek;
import com.hams.exception.HamsException;
import com.hams.repository.AppointmentRepository;
import com.hams.repository.DoctorAvailabilityRepository;
import com.hams.repository.DoctorLeaveRepository;
import com.hams.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ScheduleService {

    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorLeaveRepository leaveRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public ScheduleService(DoctorAvailabilityRepository availabilityRepository,
                           DoctorLeaveRepository leaveRepository,
                           DoctorRepository doctorRepository,
                           AppointmentRepository appointmentRepository) {
        this.availabilityRepository = availabilityRepository;
        this.leaveRepository = leaveRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    // ============================================================
    // SCHEDULE / AVAILABILITY MANAGEMENT
    // ============================================================

    @Transactional(readOnly = true)
    public DoctorScheduleResponse getDoctorSchedule(Long doctorId) {
        Doctor doctor = getDoctorById(doctorId);
        List<DoctorAvailability> list = availabilityRepository.findByDoctorIdWithBreaks(doctorId);

        Map<DayOfWeek, DoctorAvailability> availMap = list.stream()
            .collect(Collectors.toMap(DoctorAvailability::getDayOfWeek, da -> da, (a, b) -> a));

        List<DayAvailabilityResponse> responses = new ArrayList<>();
        for (DayOfWeek day : DayOfWeek.values()) {
            DoctorAvailability da = availMap.get(day);
            if (da != null) {
                responses.add(mapToResponse(da));
            } else {
                responses.add(new DayAvailabilityResponse(null, day, null, null, 30, false, new ArrayList<>()));
            }
        }

        return new DoctorScheduleResponse(doctor.getId(), doctor.getFullName(), responses);
    }

    @Transactional(readOnly = true)
    public DoctorScheduleResponse getPublicDoctorSchedule(Long doctorId) {
        Doctor doctor = getDoctorById(doctorId);
        if (!doctor.isActive() || !doctor.isVerified()) {
            throw HamsException.notFound("Doctor", doctorId);
        }
        return getDoctorSchedule(doctorId);
    }

    public DoctorScheduleResponse updateDoctorSchedule(Long doctorId, List<DayAvailabilityRequest> requests) {
        Doctor doctor = getDoctorById(doctorId);

        if (requests == null || requests.isEmpty()) {
            throw HamsException.badRequest("Schedule requests list cannot be empty");
        }

        // Validate each day configuration
        for (DayAvailabilityRequest req : requests) {
            validateDayAvailability(req);
        }

        for (DayAvailabilityRequest req : requests) {
            Optional<DoctorAvailability> opt = availabilityRepository
                .findByDoctorIdAndDayOfWeek(doctorId, req.getDayOfWeek());

            DoctorAvailability da;
            if (opt.isPresent()) {
                da = opt.get();
                da.setActive(req.isActive());
                da.setStartTime(req.getStartTime());
                da.setEndTime(req.getEndTime());
                da.setSlotDurationMins(req.getSlotDurationMins() != null ? req.getSlotDurationMins() : 30);
                da.clearBreaks();
            } else {
                da = DoctorAvailability.builder()
                    .doctor(doctor)
                    .dayOfWeek(req.getDayOfWeek())
                    .startTime(req.getStartTime())
                    .endTime(req.getEndTime())
                    .slotDurationMins(req.getSlotDurationMins() != null ? req.getSlotDurationMins() : 30)
                    .active(req.isActive())
                    .build();
            }

            if (req.isActive() && req.getBreaks() != null) {
                for (BreakDto b : req.getBreaks()) {
                    da.addBreak(new DoctorBreak(null, da, b.getStartTime(), b.getEndTime()));
                }
            }

            availabilityRepository.save(da);
        }

        return getDoctorSchedule(doctorId);
    }

    // ============================================================
    // LEAVE MANAGEMENT
    // ============================================================

    @Transactional(readOnly = true)
    public List<DoctorLeaveResponse> getDoctorLeaves(Long doctorId) {
        getDoctorById(doctorId);
        return leaveRepository.findByDoctorIdOrderByStartDateDesc(doctorId).stream()
            .map(this::mapLeaveToResponse)
            .collect(Collectors.toList());
    }

    public DoctorLeaveResponse createDoctorLeave(Long doctorId, DoctorLeaveRequest request) {
        Doctor doctor = getDoctorById(doctorId);

        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw HamsException.badRequest("Leave start date and end date are required");
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw HamsException.badRequest("Leave end date cannot be before start date");
        }

        if (leaveRepository.hasOverlappingLeave(doctorId, request.getStartDate(), request.getEndDate())) {
            throw HamsException.conflict("Doctor already has a leave scheduled for the specified date range");
        }

        DoctorLeave leave = DoctorLeave.builder()
            .doctor(doctor)
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .leaveDate(request.getStartDate())
            .reason(request.getReason() != null ? request.getReason().trim() : null)
            .build();

        DoctorLeave saved = leaveRepository.save(leave);
        return mapLeaveToResponse(saved);
    }

    public void cancelDoctorLeave(Long doctorId, Long leaveId) {
        getDoctorById(doctorId);
        DoctorLeave leave = leaveRepository.findById(leaveId)
            .orElseThrow(() -> HamsException.notFound("Doctor leave", leaveId));

        if (!leave.getDoctor().getId().equals(doctorId)) {
            throw HamsException.forbidden("You are not authorized to cancel this leave record");
        }

        leaveRepository.delete(leave);
    }

    // ============================================================
    // SLOT GENERATION & AVAILABILITY CALCULATION
    // ============================================================

    @Transactional(readOnly = true)
    public DoctorDaySlotsResponse getAvailableSlotsForDate(Long doctorId, LocalDate date) {
        Doctor doctor = getDoctorById(doctorId);

        if (date == null) {
            throw HamsException.badRequest("Date parameter is required");
        }

        DayOfWeek dayOfWeek = DayOfWeek.valueOf(date.getDayOfWeek().name());

        // 1. Check if Doctor is on Leave
        boolean onLeave = leaveRepository.isDoctorOnLeave(doctorId, date);
        if (onLeave) {
            return new DoctorDaySlotsResponse(
                doctor.getId(),
                doctor.getFullName(),
                date,
                dayOfWeek,
                true,
                "Doctor is on approved leave",
                false,
                Collections.emptyList()
            );
        }

        // 2. Check if Day is an Active Working Day
        Optional<DoctorAvailability> availOpt = availabilityRepository
            .findActiveByDoctorIdAndDayOfWeekWithBreaks(doctorId, dayOfWeek);

        if (availOpt.isEmpty() || !availOpt.get().isActive()) {
            return new DoctorDaySlotsResponse(
                doctor.getId(),
                doctor.getFullName(),
                date,
                dayOfWeek,
                false,
                null,
                false,
                Collections.emptyList()
            );
        }

        DoctorAvailability avail = availOpt.get();
        LocalTime startTime = avail.getStartTime();
        LocalTime endTime = avail.getEndTime();
        int slotDuration = (avail.getSlotDurationMins() != null && avail.getSlotDurationMins() > 0)
            ? avail.getSlotDurationMins()
            : 30;

        List<DoctorBreak> breaks = avail.getBreaks() != null ? avail.getBreaks() : Collections.emptyList();
        List<TimeSlotDto> slots = new ArrayList<>();

        List<LocalTime> bookedTimes = appointmentRepository.findActiveAppointmentTimesByDoctorIdAndDate(doctorId, date);
        Set<LocalTime> bookedSet = new HashSet<>(bookedTimes);

        LocalTime current = startTime;
        while (!current.plusMinutes(slotDuration).isAfter(endTime)) {
            LocalTime slotEnd = current.plusMinutes(slotDuration);
            final LocalTime sStart = current;
            final LocalTime sEnd = slotEnd;

            // Slot overlaps with a break if: sStart < breakEnd && sEnd > breakStart
            boolean overlapsWithBreak = breaks.stream().anyMatch(b ->
                sStart.isBefore(b.getEndTime()) && sEnd.isAfter(b.getStartTime())
            );

            if (!overlapsWithBreak) {
                String formatted = String.format("%02d:%02d", sStart.getHour(), sStart.getMinute());
                boolean available = !bookedSet.contains(sStart);
                slots.add(new TimeSlotDto(sStart, sEnd, formatted, available));
            }

            current = current.plusMinutes(slotDuration);
        }

        return new DoctorDaySlotsResponse(
            doctor.getId(),
            doctor.getFullName(),
            date,
            dayOfWeek,
            false,
            null,
            true,
            slots
        );
    }

    @Transactional(readOnly = true)
    public DoctorDaySlotsResponse getPublicAvailableSlotsForDate(Long doctorId, LocalDate date) {
        Doctor doctor = getDoctorById(doctorId);
        if (!doctor.isActive() || !doctor.isVerified()) {
            throw HamsException.notFound("Doctor", doctorId);
        }
        return getAvailableSlotsForDate(doctorId, date);
    }

    // ============================================================
    // BACKEND SLOT RE-VALIDATION FOR APPOINTMENT BOOKING
    // ============================================================

    @Transactional(readOnly = true)
    public LocalTime validateAndGetSlotEndTime(Doctor doctor, LocalDate date, LocalTime time) {
        if (doctor == null || doctor.getId() == null) {
            throw HamsException.notFound("Doctor", 0L);
        }
        if (!doctor.isActive()) {
            throw HamsException.badRequest("Doctor is currently inactive and cannot accept appointments");
        }
        if (!doctor.isVerified()) {
            throw HamsException.badRequest("Doctor is not yet verified and cannot accept appointments");
        }
        if (date == null) {
            throw HamsException.badRequest("Appointment date is required");
        }
        if (date.isBefore(LocalDate.now())) {
            throw HamsException.badRequest("Cannot book an appointment for a past date");
        }
        if (date.isEqual(LocalDate.now()) && time.isBefore(LocalTime.now())) {
            throw HamsException.badRequest("Cannot book an appointment slot in the past");
        }

        // Check if on leave
        if (leaveRepository.isDoctorOnLeave(doctor.getId(), date)) {
            throw HamsException.badRequest("Doctor is on leave on " + date);
        }

        DayOfWeek dayOfWeek = DayOfWeek.valueOf(date.getDayOfWeek().name());
        Optional<DoctorAvailability> availOpt = availabilityRepository
            .findActiveByDoctorIdAndDayOfWeekWithBreaks(doctor.getId(), dayOfWeek);

        if (availOpt.isEmpty() || !availOpt.get().isActive()) {
            throw HamsException.badRequest("Doctor is not available for appointments on " + dayOfWeek);
        }

        DoctorAvailability avail = availOpt.get();
        int slotDuration = (avail.getSlotDurationMins() != null && avail.getSlotDurationMins() > 0)
            ? avail.getSlotDurationMins() : 30;

        LocalTime slotEnd = time.plusMinutes(slotDuration);

        // Within working hours
        if (time.isBefore(avail.getStartTime()) || slotEnd.isAfter(avail.getEndTime())) {
            throw HamsException.badRequest("Appointment time " + time + " is outside doctor's working hours (" +
                avail.getStartTime() + " - " + avail.getEndTime() + ")");
        }

        // Matches valid slot interval
        long minutesFromStart = ChronoUnit.MINUTES.between(avail.getStartTime(), time);
        if (minutesFromStart % slotDuration != 0) {
            throw HamsException.badRequest("Appointment time " + time + " does not align with " + slotDuration + "-minute slot intervals");
        }

        // Break collision check
        List<DoctorBreak> breaks = avail.getBreaks() != null ? avail.getBreaks() : Collections.emptyList();
        boolean overlapsWithBreak = breaks.stream().anyMatch(b ->
            time.isBefore(b.getEndTime()) && slotEnd.isAfter(b.getStartTime())
        );
        if (overlapsWithBreak) {
            throw HamsException.badRequest("The selected appointment slot falls during the doctor's scheduled break period");
        }

        // Active appointment collision check
        if (appointmentRepository.existsActiveAppointment(doctor.getId(), date, time)) {
            throw HamsException.conflict("The selected appointment slot has already been booked. Please choose another time.");
        }

        return slotEnd;
    }

    // ============================================================
    // VALIDATIONS & HELPERS
    // ============================================================

    private void validateDayAvailability(DayAvailabilityRequest req) {
        if (req.getDayOfWeek() == null) {
            throw HamsException.badRequest("Day of week is required");
        }

        if (req.isActive()) {
            if (req.getStartTime() == null || req.getEndTime() == null) {
                throw HamsException.badRequest("Working start time and end time are required for active day " + req.getDayOfWeek());
            }

            if (!req.getStartTime().isBefore(req.getEndTime())) {
                throw HamsException.badRequest("End time (" + req.getEndTime() + ") must be after start time (" + req.getStartTime() + ") on " + req.getDayOfWeek());
            }

            if (req.getSlotDurationMins() == null || req.getSlotDurationMins() <= 0) {
                throw HamsException.badRequest("Slot duration must be greater than 0 minutes");
            }

            long totalWorkingMins = ChronoUnit.MINUTES.between(req.getStartTime(), req.getEndTime());
            if (totalWorkingMins < req.getSlotDurationMins()) {
                throw HamsException.badRequest("Slot duration (" + req.getSlotDurationMins() + "m) cannot exceed total working duration (" + totalWorkingMins + "m)");
            }

            // Validate breaks
            if (req.getBreaks() != null && !req.getBreaks().isEmpty()) {
                List<BreakDto> sortedBreaks = new ArrayList<>(req.getBreaks());
                sortedBreaks.sort(Comparator.comparing(BreakDto::getStartTime));

                for (int i = 0; i < sortedBreaks.size(); i++) {
                    BreakDto b = sortedBreaks.get(i);
                    if (b.getStartTime() == null || b.getEndTime() == null) {
                        throw HamsException.badRequest("Break start and end times are required");
                    }

                    if (!b.getStartTime().isBefore(b.getEndTime())) {
                        throw HamsException.badRequest("Break end time (" + b.getEndTime() + ") must be after break start time (" + b.getStartTime() + ")");
                    }

                    if (b.getStartTime().isBefore(req.getStartTime()) || b.getEndTime().isAfter(req.getEndTime())) {
                        throw HamsException.badRequest("Break (" + b.getStartTime() + " - " + b.getEndTime() + ") must be entirely within working hours (" + req.getStartTime() + " - " + req.getEndTime() + ")");
                    }

                    if (i > 0) {
                        BreakDto prev = sortedBreaks.get(i - 1);
                        if (prev.getEndTime().isAfter(b.getStartTime())) {
                            throw HamsException.badRequest("Breaks cannot overlap with each other on " + req.getDayOfWeek());
                        }
                    }
                }
            }
        }
    }

    private Doctor getDoctorById(Long doctorId) {
        return doctorRepository.findById(doctorId)
            .orElseThrow(() -> HamsException.notFound("Doctor", doctorId));
    }

    public Doctor getDoctorByEmail(String email) {
        return doctorRepository.findAll().stream()
            .filter(d -> d.getUser() != null && d.getUser().getEmail().equalsIgnoreCase(email))
            .findFirst()
            .orElseThrow(() -> HamsException.notFound("Doctor profile for user", 0L));
    }

    private DayAvailabilityResponse mapToResponse(DoctorAvailability da) {
        List<BreakDto> breakDtos = da.getBreaks() != null
            ? da.getBreaks().stream()
                .map(b -> new BreakDto(b.getStartTime(), b.getEndTime()))
                .collect(Collectors.toList())
            : new ArrayList<>();

        return new DayAvailabilityResponse(
            da.getId(),
            da.getDayOfWeek(),
            da.getStartTime(),
            da.getEndTime(),
            da.getSlotDurationMins(),
            da.isActive(),
            breakDtos
        );
    }

    private DoctorLeaveResponse mapLeaveToResponse(DoctorLeave dl) {
        LocalDate start = dl.getStartDate() != null ? dl.getStartDate() : dl.getLeaveDate();
        LocalDate end = dl.getEndDate() != null ? dl.getEndDate() : start;
        return new DoctorLeaveResponse(
            dl.getId(),
            dl.getDoctor().getId(),
            start,
            end,
            dl.getReason(),
            dl.getCreatedAt()
        );
    }
}
