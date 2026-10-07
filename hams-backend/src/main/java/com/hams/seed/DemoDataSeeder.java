package com.hams.seed;

import com.hams.entity.*;
import com.hams.enums.*;
import com.hams.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

/**
 * Deterministic Demo and Development Data Seeder for HAMS.
 * Populates realistic synthetic doctors, patients, schedules, appointments,
 * consultations, prescriptions, notifications, and audit logs.
 */
@Component
@Order(100)
@ConditionalOnProperty(name = "hams.seed.demo-data", havingValue = "true")
public class DemoDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorLeaveRepository leaveRepository;
    private final AppointmentRepository appointmentRepository;
    private final ConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(
            UserRepository userRepository,
            DoctorRepository doctorRepository,
            DepartmentRepository departmentRepository,
            PatientRepository patientRepository,
            DoctorAvailabilityRepository availabilityRepository,
            DoctorLeaveRepository leaveRepository,
            AppointmentRepository appointmentRepository,
            ConsultationRepository consultationRepository,
            PrescriptionRepository prescriptionRepository,
            NotificationRepository notificationRepository,
            AuditLogRepository auditLogRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.departmentRepository = departmentRepository;
        this.patientRepository = patientRepository;
        this.availabilityRepository = availabilityRepository;
        this.leaveRepository = leaveRepository;
        this.appointmentRepository = appointmentRepository;
        this.consultationRepository = consultationRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        final String markerEmail = "doctor.demo1@hams.local";
        if (userRepository.existsByEmail(markerEmail)) {
            log.info("HAMS Demo Data already seeded (marker doctor {} exists). Skipping.", markerEmail);
            return;
        }

        log.info("============================================================");
        log.info("Starting HAMS Synthetic Demo Hospital Data Seeding...");
        log.info("============================================================");

        List<Department> departments = departmentRepository.findAll();
        if (departments.isEmpty()) {
            log.warn("No departments found! Please verify Flyway migrations V2. Aborting demo seeding.");
            return;
        }

        // 1. Seed Synthetic Doctors (20 doctors across 12 departments)
        List<Doctor> doctors = seedDoctors(departments);
        log.info("Seeded {} synthetic doctors across {} departments.", doctors.size(), departments.size());

        // 2. Seed Weekly Schedules, Breaks & Leaves for Approved Active Doctors
        seedDoctorAvailabilityAndLeaves(doctors);
        log.info("Seeded schedules, breaks, and leaves for active approved doctors.");

        // 3. Seed Synthetic Patients (60 patients)
        List<Patient> patients = seedPatients();
        log.info("Seeded {} synthetic patients with demographic diversity.", patients.size());

        // 4. Seed Appointments, Consultations & Prescriptions
        List<Appointment> appointments = seedAppointmentsAndClinical(doctors, patients);
        log.info("Seeded {} realistic appointments with consultations and prescriptions.", appointments.size());

        // 5. Seed Notifications
        seedNotifications(appointments);
        log.info("Seeded realistic user notifications.");

        // 6. Seed Audit Logs
        seedAuditLogs(doctors, patients, appointments);
        log.info("Seeded operational audit trail entries.");

        log.info("============================================================");
        log.info("HAMS Demo Data Seeding Completed Successfully!");
        log.info("============================================================");
    }

    private List<Doctor> seedDoctors(List<Department> departments) {
        Map<String, Department> deptMap = new HashMap<>();
        for (Department d : departments) {
            deptMap.put(d.getName(), d);
        }

        String doctorPasswordHash = passwordEncoder.encode("Doctor@HAMS2024!");

        // Doctor specs: Name, DeptName, Specialization, Qual, Exp, Fee, RegNo, Status, Active
        Object[][] doctorSpecs = {
            // Approved & Active doctors across all 12 departments
            {"Rajesh", "Kumar", "Cardiology", "Interventional Cardiology", "MD (Cardiology), DM", 15, 800, "MCI-2009-84729", VerificationStatus.APPROVED, true, "Senior Interventional Cardiologist specializing in coronary interventions and cardiac care."},
            {"Priya", "Nair", "Neurology", "Clinical Neurology & Stroke", "DM (Neurology), MD", 12, 900, "DMC-2012-39201", VerificationStatus.APPROVED, true, "Expert in stroke management, epilepsy, and neuromuscular movement disorders."},
            {"Amit", "Verma", "Orthopedics", "Joint Replacement & Arthroscopy", "MS (Orthopaedics), DNB", 10, 700, "KMC-2014-99201", VerificationStatus.APPROVED, true, "Specialized in robotic knee/hip replacement and sports injury rehabilitation."},
            {"Sunita", "Rao", "Pediatrics", "Pediatric Critical Care", "MD (Pediatrics), DCH", 8, 600, "MMC-2016-55102", VerificationStatus.APPROVED, true, "Compassionate pediatric specialist caring for newborns, infants, and adolescents."},
            {"Vikram", "Malhotra", "Dermatology", "Clinical Dermatology & Aesthetics", "MD (Dermatology, Venereology)", 9, 650, "DMC-2015-77291", VerificationStatus.APPROVED, true, "Specialist in inflammatory dermatoses, allergy management, and laser treatments."},
            {"Ananya", "Mukherjee", "Ophthalmology", "Cataract & Refractive Surgery", "MS (Ophthalmology), FICO", 11, 600, "WBMC-2013-18290", VerificationStatus.APPROVED, true, "Experienced ophthalmic surgeon specializing in phacoemulsification and corneal disorders."},
            {"Meenakshi", "Sundaram", "Gynecology", "Obstetrics & High-Risk Pregnancy", "MD (OB-GYN), DGO", 14, 750, "TNMC-2010-44910", VerificationStatus.APPROVED, true, "Dedicated obstetrician providing comprehensive maternal-fetal care and gynecological wellness."},
            {"Rohan", "Deshmukh", "Psychiatry", "Adult & Behavioral Psychiatry", "MD (Psychiatry), DNB", 7, 850, "MMC-2017-66291", VerificationStatus.APPROVED, true, "Focuses on evidence-based cognitive therapy, mood disorders, and stress management."},
            {"Sanjay", "Kapoor", "Gastroenterology", "Hepatology & Therapeutic Endoscopy", "DM (Gastroenterology)", 13, 900, "DMC-2011-88192", VerificationStatus.APPROVED, true, "Consultant gastroenterologist specializing in chronic liver conditions and therapeutic endoscopy."},
            {"Deepa", "Krishnan", "General Medicine", "Internal Medicine & Diabetes", "MD (Internal Medicine)", 16, 500, "KMC-2008-22910", VerificationStatus.APPROVED, true, "Senior physician with expertise in hypertension, lifestyle metabolic disorders, and geriatric care."},
            {"Alok", "Sengupta", "ENT", "Otolaryngology & Head-Neck Surgery", "MS (ENT), DLO", 8, 550, "WBMC-2016-39102", VerificationStatus.APPROVED, true, "Specialist in endoscopic sinus surgery, microscopic ear surgery, and pediatric ENT."},
            {"Kavita", "Iyer", "Radiology", "Diagnostic & Cross-Sectional Imaging", "MD (Radiodiagnosis)", 10, 700, "MMC-2014-49102", VerificationStatus.APPROVED, true, "Radiologist with advanced expertise in CT, MRI neuro-imaging, and musculoskeletal ultrasound."},
            {"Manisha", "Bansal", "Cardiology", "Non-Invasive Cardiology & Echocardiography", "DNB (Cardiology), PGDCC", 6, 750, "DMC-2018-91029", VerificationStatus.APPROVED, true, "Expert in preventive cardiac diagnostics, stress echo, and holter monitoring."},
            {"Harish", "Patel", "General Medicine", "Primary Care & Infectious Diseases", "MD (General Medicine)", 12, 500, "GPMC-2012-38192", VerificationStatus.APPROVED, true, "Primary care physician managing chronic medical illness, fevers, and health wellness."},
            {"Neeraj", "Chopra", "Orthopedics", "Trauma & Spine Care", "MS (Orthopaedics)", 5, 650, "HMC-2019-77192", VerificationStatus.APPROVED, true, "Orthopedic surgeon focusing on complex fractures, spine ailments, and pain relief."},
            {"Shilpa", "Chawla", "Pediatrics", "Neonatal & Child Health", "DCH, DNB (Pediatrics)", 9, 600, "DMC-2015-19283", VerificationStatus.APPROVED, true, "Passionate pediatrician skilled in developmental assessments and childhood immunizations."},
            // Pending Verification Doctors (demonstrating admin review workflow)
            {"Tarun", "Saxena", "Neurology", "Clinical Neurophysiology", "DM (Neurology)", 4, 700, "DMC-2022-88192", VerificationStatus.PENDING, true, "Neurology fellow specializing in EEG, EMG studies, and nerve conduction assessments."},
            {"Radhika", "Singhal", "Dermatology", "Dermatosurgery", "MD (Dermatology)", 3, 600, "KMC-2023-11029", VerificationStatus.PENDING, true, "Junior consultant focused on clinical dermatology and pediatric skin conditions."},
            {"Vivek", "Joshi", "Gastroenterology", "Luminal Gastroenterology", "DM (Gastroenterology)", 5, 800, "MMC-2021-39482", VerificationStatus.PENDING, true, "Specialized in inflammatory bowel disease, GI motility, and diagnostic colonoscopy."},
            // Rejected Doctor (demonstrating admin rejection record)
            {"Suresh", "Nambiar", "General Medicine", "General Practice", "MBBS", 2, 400, "REJ-2024-00129", VerificationStatus.REJECTED, false, "Incomplete verification documents submitted for medical council license registration."}
        };

        List<Doctor> createdDoctors = new ArrayList<>();
        int index = 1;

        for (Object[] spec : doctorSpecs) {
            String firstName = (String) spec[0];
            String lastName = (String) spec[1];
            String deptName = (String) spec[2];
            String specialization = (String) spec[3];
            String qual = (String) spec[4];
            int exp = (int) spec[5];
            double fee = ((Number) spec[6]).doubleValue();
            String regNo = (String) spec[7];
            VerificationStatus status = (VerificationStatus) spec[8];
            boolean active = (boolean) spec[9];
            String bio = (String) spec[10];

            String email = "doctor.demo" + index + "@hams.local";
            String phone = String.format("+91 98765 %05d", 20000 + index);

            User docUser = User.builder()
                    .email(email)
                    .passwordHash(doctorPasswordHash)
                    .role(Role.DOCTOR)
                    .active(active)
                    .emailVerified(true)
                    .failedLoginAttempts(0)
                    .build();
            docUser = userRepository.save(docUser);

            Department dept = deptMap.getOrDefault(deptName, departments.get(0));

            Doctor doctor = Doctor.builder()
                    .user(docUser)
                    .department(dept)
                    .firstName(firstName)
                    .lastName(lastName)
                    .specialization(specialization)
                    .qualification(qual)
                    .experienceYears(exp)
                    .consultationFee(BigDecimal.valueOf(fee))
                    .bio(bio)
                    .phone(phone)
                    .registrationNumber(regNo)
                    .verificationStatus(status)
                    .verified(status == VerificationStatus.APPROVED)
                    .active(active)
                    .build();

            doctor = doctorRepository.save(doctor);
            createdDoctors.add(doctor);
            index++;
        }

        return createdDoctors;
    }

    private void seedDoctorAvailabilityAndLeaves(List<Doctor> doctors) {
        DayOfWeek[] weekdays = {
            DayOfWeek.MONDAY,
            DayOfWeek.TUESDAY,
            DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY,
            DayOfWeek.FRIDAY
        };

        int approvedCount = 0;
        for (Doctor doctor : doctors) {
            if (doctor.getVerificationStatus() != VerificationStatus.APPROVED || !doctor.isActive()) {
                continue;
            }
            approvedCount++;

            // Weekly schedule Mon-Fri 09:00 to 17:00 with lunch break 13:00 to 14:00
            for (DayOfWeek day : weekdays) {
                DoctorAvailability avail = DoctorAvailability.builder()
                        .doctor(doctor)
                        .dayOfWeek(day)
                        .startTime(LocalTime.of(9, 0))
                        .endTime(LocalTime.of(17, 0))
                        .slotDurationMins(30)
                        .active(true)
                        .build();

                DoctorBreak lunchBreak = DoctorBreak.builder()
                        .startTime(LocalTime.of(13, 0))
                        .endTime(LocalTime.of(14, 0))
                        .build();
                avail.addBreak(lunchBreak);

                availabilityRepository.save(avail);
            }

            // Doctors 1 through 8 also have Saturday morning availability
            if (approvedCount <= 8) {
                DoctorAvailability satAvail = DoctorAvailability.builder()
                        .doctor(doctor)
                        .dayOfWeek(DayOfWeek.SATURDAY)
                        .startTime(LocalTime.of(9, 0))
                        .endTime(LocalTime.of(13, 0))
                        .slotDurationMins(30)
                        .active(true)
                        .build();
                availabilityRepository.save(satAvail);
            }
        }

        // Realistic Doctor Leaves on upcoming dates
        LocalDate today = LocalDate.now();
        if (doctors.size() >= 10) {
            Doctor doc1 = doctors.get(0); // Dr. Rajesh Kumar
            leaveRepository.save(DoctorLeave.builder()
                    .doctor(doc1)
                    .leaveDate(today.plusDays(7))
                    .startDate(today.plusDays(7))
                    .endDate(today.plusDays(7))
                    .reason("Attending National Cardiology Annual Symposium")
                    .build());

            Doctor doc3 = doctors.get(2); // Dr. Amit Verma
            leaveRepository.save(DoctorLeave.builder()
                    .doctor(doc3)
                    .leaveDate(today.plusDays(3))
                    .startDate(today.plusDays(3))
                    .endDate(today.plusDays(3))
                    .reason("Personal / Family Medical Emergency")
                    .build());

            Doctor doc10 = doctors.get(9); // Dr. Deepa Krishnan
            leaveRepository.save(DoctorLeave.builder()
                    .doctor(doc10)
                    .leaveDate(today.plusDays(5))
                    .startDate(today.plusDays(5))
                    .endDate(today.plusDays(5))
                    .reason("State Medical Council CME Workshop")
                    .build());
        }
    }

    private List<Patient> seedPatients() {
        String patientPasswordHash = passwordEncoder.encode("Patient@HAMS2024!");

        String[][] patientData = {
            {"Rahul", "Sharma", "MALE", "1988-06-12", "B+", "Flat 402, Lotus Apartments, Sector 14, Gurgaon", "+91 98111 01001"},
            {"Ananya", "Sen", "FEMALE", "1994-02-18", "A+", "12/A Southern Avenue, Kolkata 700029", "+91 98111 01002"},
            {"Rohan", "Mehta", "MALE", "1982-11-04", "O+", "701 Sea View Residency, Bandra West, Mumbai", "+91 98111 01003"},
            {"Kavita", "Joshi", "FEMALE", "1990-09-23", "AB+", "B-14 Green Glen Layout, Bellandur, Bangalore", "+91 98111 01004"},
            {"Arvind", "Gupta", "MALE", "1975-04-15", "O-", "54 Ashoka Enclave, Model Town, Delhi 110009", "+91 98111 01005"},
            {"Deepa", "Patel", "FEMALE", "1996-08-30", "A-", "204 Shivalik Heights, Satellite, Ahmedabad", "+91 98111 01006"},
            {"Suresh", "Reddy", "MALE", "1968-01-12", "B+", "Plot 88, Jubilee Hills Road No. 36, Hyderabad", "+91 98111 01007"},
            {"Neha", "Singh", "FEMALE", "1992-12-05", "O+", "C-33 Gomti Nagar Extension, Lucknow 226010", "+91 98111 01008"},
            {"Amitav", "Ghosh", "MALE", "1985-07-21", "A+", "302 Lakeview Gardens, Whitefield, Bangalore", "+91 98111 01009"},
            {"Pooja", "Kulkarni", "FEMALE", "1999-03-14", "B-", "15 Shivajinagar, FC Road, Pune 411005", "+91 98111 01010"},
            {"Manish", "Verma", "MALE", "1979-10-28", "O+", "67 Civil Lines, Jaipur 302006", "+91 98111 01011"},
            {"Smriti", "Bansal", "FEMALE", "1993-05-19", "AB-", "45 Park Street, Flat 3B, Kolkata 700016", "+91 98111 01012"},
            {"Gaurav", "Nair", "MALE", "1987-04-09", "B+", "TC 28/412 Panampilly Nagar, Kochi 682036", "+91 98111 01013"},
            {"Swati", "Deshmukh", "FEMALE", "1991-08-11", "O+", "88 Kothrud Dahanukar Colony, Pune 411038", "+91 98111 01014"},
            {"Vikram", "Chauhan", "MALE", "1972-02-25", "A+", "House 121, Sector 21-A, Chandigarh 160022", "+91 98111 01015"},
            {"Ritu", "Agarwal", "FEMALE", "1986-11-17", "B+", "Flat 5A, Silver Arch, Malabar Hill, Mumbai", "+91 98111 01016"},
            {"Karthik", "Raman", "MALE", "1995-01-30", "O+", "18 Besant Nagar 4th Avenue, Chennai 600090", "+91 98111 01017"},
            {"Sneha", "Chatterjee", "FEMALE", "1997-06-22", "A-", "25 Salt Lake Sector 2, Kolkata 700091", "+91 98111 01018"},
            {"Aditya", "Mishra", "MALE", "1983-09-08", "B+", "102 Surya Nagar, Ghaziabad 201011", "+91 98111 01019"},
            {"Preeti", "Bhatia", "FEMALE", "1989-07-03", "O+", "C-12 Paschim Vihar, New Delhi 110063", "+91 98111 01020"},
            {"Abhishek", "Dubey", "MALE", "1991-03-27", "AB+", "B-44 Indira Nagar, Lucknow 226016", "+91 98111 01021"},
            {"Sunita", "Pillai", "FEMALE", "1965-12-14", "O-", "Hill Palace Road, Thripunithura, Ernakulam", "+91 98111 01022"},
            {"Varun", "Kapoor", "MALE", "1984-05-18", "A+", "Pocket B, Mayur Vihar Phase 2, Delhi 110091", "+91 98111 01023"},
            {"Divya", "Menon", "FEMALE", "1998-10-09", "B+", "Prashasan Nagar, Jubilee Hills, Hyderabad", "+91 98111 01024"},
            {"Ashok", "Kumar", "MALE", "1958-08-20", "O+", "Railway Colony Quarter 14, Kanpur 208001", "+91 98111 01025"},
            {"Shweta", "Trivedi", "FEMALE", "1990-04-12", "A+", "University Road, Navrangpura, Ahmedabad", "+91 98111 01026"},
            {"Nitin", "Saxena", "MALE", "1981-11-29", "B+", "G-9 Rajendra Nagar, Bareilly 243122", "+91 98111 01027"},
            {"Bhavna", "Purohit", "FEMALE", "1995-07-07", "AB+", "Hawa Mahal Marg, Badi Chaupar, Jaipur", "+91 98111 01028"},
            {"Ramesh", "Choudhury", "MALE", "1962-09-15", "O+", "Dispur Last Gate, Guwahati 781006", "+91 98111 01029"},
            {"Geeta", "Iyer", "FEMALE", "1978-01-24", "A+", "4th Main Malleshwaram, Bangalore 560003", "+91 98111 01030"},
            {"Siddharth", "Rao", "MALE", "1989-06-05", "B-", "Kalyan Nagar, Outer Ring Road, Bangalore", "+91 98111 01031"},
            {"Meera", "Sen", "FEMALE", "1992-02-14", "O+", "Ballygunge Circular Road, Kolkata 700019", "+91 98111 01032"},
            {"Kunal", "Tandon", "MALE", "1986-10-31", "A+", "GK-2 M Block Market Road, New Delhi 110048", "+91 98111 01033"},
            {"Aarti", "Shukla", "FEMALE", "1996-12-08", "B+", "Vipul Belmonte, Golf Course Road, Gurgaon", "+91 98111 01034"},
            {"Harish", "Venkatesh", "MALE", "1974-03-19", "O+", "Indiranagar 100ft Road, Bangalore 560038", "+91 98111 01035"},
            {"Anu", "Puri", "FEMALE", "1988-08-25", "A-", "Sector 15, Panchkula, Haryana 134113", "+91 98111 01036"},
            {"Rajeev", "Bajpai", "MALE", "1980-05-11", "B+", "Civil Lines, Allahabad (Prayagraj) 211001", "+91 98111 01037"},
            {"Pallavi", "Gokhale", "FEMALE", "1994-09-16", "AB-", "Deccan Gymkhana, Pune 411004", "+91 98111 01038"},
            {"Tushar", "Pandey", "MALE", "1993-01-02", "O+", "Lanka BHU Road, Varanasi 221005", "+91 98111 01039"},
            {"Tanvi", "Malik", "FEMALE", "1997-11-21", "A+", "DLF Phase 4, Galleria Market Road, Gurgaon", "+91 98111 01040"},
            {"Naveen", "Shetty", "MALE", "1985-04-17", "B+", "Kankanady Bypass Road, Mangalore 575002", "+91 98111 01041"},
            {"Rashmi", "Kashyap", "FEMALE", "1991-07-29", "O+", "Morabadi, Ranchi, Jharkhand 834008", "+91 98111 01042"},
            {"Deepak", "Bhardwaj", "MALE", "1977-12-03", "A+", "Rajendra Place, Central Delhi 110008", "+91 98111 01043"},
            {"Kiran", "Babu", "OTHER", "1992-03-11", "O-", "HSR Layout Sector 1, Bangalore 560102", "+91 98111 01044"},
            {"Alka", "Srivastava", "FEMALE", "1970-08-14", "B+", "Ashiyana Colony, Kanpur Road, Lucknow", "+91 98111 01045"},
            {"Pankaj", "Jain", "MALE", "1983-02-28", "A+", "Chopasni Housing Board, Jodhpur 342008", "+91 98111 01046"},
            {"Shalini", "Dixit", "FEMALE", "1987-06-19", "AB+", "Shastri Nagar, Meerut 250004", "+91 98111 01047"},
            {"Vivek", "Nath", "MALE", "1990-10-25", "O+", "Uzanbazar, Guwahati 781001", "+91 98111 01048"},
            {"Sangeeta", "Biswas", "FEMALE", "1969-04-06", "A+", "New Town Action Area 1, Kolkata 700156", "+91 98111 01049"},
            {"Vijay", "Solanki", "MALE", "1976-09-30", "B+", "Kalanala, Bhavnagar, Gujarat 364001", "+91 98111 01050"},
            {"Aparna", "Sundar", "FEMALE", "1995-05-15", "O-", "Mylapore Tank Street, Chennai 600004", "+91 98111 01051"},
            {"Mohit", "Arora", "MALE", "1984-01-22", "A+", "Model Town, Panipat, Haryana 132103", "+91 98111 01052"},
            {"Madhavi", "Latha", "FEMALE", "1982-11-13", "B+", "Madhapur, HITEC City, Hyderabad 500081", "+91 98111 01053"},
            {"Sameer", "Khan", "MALE", "1991-08-04", "O+", "Hazratganj, Lucknow 226001", "+91 98111 01054"},
            {"Isha", "Chopra", "FEMALE", "1998-04-18", "A+", "South Extension Part 1, New Delhi 110049", "+91 98111 01055"},
            {"Hemant", "Goyal", "MALE", "1986-07-27", "AB+", "Surajpole, Udaipur, Rajasthan 313001", "+91 98111 01056"},
            {"Bina", "Majumdar", "FEMALE", "1973-03-08", "B-", "Behala Chowrasta, Kolkata 700034", "+91 98111 01057"},
            {"Devendra", "Singh", "MALE", "1966-10-12", "O+", "Cantt Road, Dehradun 248001", "+91 98111 01058"},
            {"Chitra", "Natarajan", "FEMALE", "1993-06-24", "A+", "Gandhinagar, Adyar, Chennai 600020", "+91 98111 01059"},
            {"Yash", "Singhania", "MALE", "2001-09-02", "O+", "Napean Sea Road, Mumbai 400006", "+91 98111 01060"}
        };

        List<Patient> createdPatients = new ArrayList<>();
        int index = 1;

        for (String[] p : patientData) {
            String firstName = p[0];
            String lastName = p[1];
            Gender gender = Gender.valueOf(p[2]);
            LocalDate dob = LocalDate.parse(p[3]);
            String bloodGroup = p[4];
            String address = p[5];
            String emergency = p[6];

            String email = "patient.demo" + index + "@example.com";
            String phone = String.format("+91 98111 %05d", 30000 + index);

            User patientUser = User.builder()
                    .email(email)
                    .passwordHash(patientPasswordHash)
                    .role(Role.PATIENT)
                    .active(true)
                    .emailVerified(true)
                    .failedLoginAttempts(0)
                    .build();
            patientUser = userRepository.save(patientUser);

            Patient patient = Patient.builder()
                    .user(patientUser)
                    .firstName(firstName)
                    .lastName(lastName)
                    .dateOfBirth(dob)
                    .gender(gender)
                    .bloodGroup(bloodGroup)
                    .phone(phone)
                    .address(address)
                    .emergencyContact(emergency)
                    .build();

            patient = patientRepository.save(patient);
            createdPatients.add(patient);
            index++;
        }

        return createdPatients;
    }

    private List<Appointment> seedAppointmentsAndClinical(List<Doctor> doctors, List<Patient> patients) {
        LocalDate today = LocalDate.now();

        // Filter approved active doctors who have availability
        List<Doctor> activeDoctors = doctors.stream()
                .filter(d -> d.getVerificationStatus() == VerificationStatus.APPROVED && d.isActive())
                .toList();

        if (activeDoctors.isEmpty() || patients.isEmpty()) {
            return Collections.emptyList();
        }

        // Available working slots outside 13:00-14:00 lunch break
        LocalTime[] slotTimes = {
            LocalTime.of(9, 0), LocalTime.of(9, 30),
            LocalTime.of(10, 0), LocalTime.of(10, 30),
            LocalTime.of(11, 0), LocalTime.of(11, 30),
            LocalTime.of(12, 0), LocalTime.of(12, 30),
            LocalTime.of(14, 0), LocalTime.of(14, 30),
            LocalTime.of(15, 0), LocalTime.of(15, 30),
            LocalTime.of(16, 0), LocalTime.of(16, 30)
        };

        Set<String> occupiedSlots = new HashSet<>();
        List<Appointment> allAppointments = new ArrayList<>();
        int refCounter = 1;

        // Target Distribution:
        // COMPLETED: 35
        // CANCELLED: 8
        // NO_SHOW: 3
        // CHECKED_IN: 5 (Today)
        // IN_CONSULTATION: 2 (Today)
        // CONFIRMED: 25 (Today afternoon & Upcoming)
        // PENDING: 5 (Upcoming)
        // RESCHEDULED: 2 (Upcoming)
        // Total = 85 appointments

        // 1. COMPLETED APPOINTMENTS (35 in past 1 to 14 days)
        int patientIndex = 0;
        int doctorIndex = 0;

        for (int i = 1; i <= 35; i++) {
            Doctor doc = activeDoctors.get(doctorIndex % activeDoctors.size());
            Patient pat = patients.get(patientIndex % patients.size());
            doctorIndex++;
            patientIndex++;

            // Days in past: 1 to 14
            int daysAgo = 1 + (i % 14);
            LocalDate apptDate = today.minusDays(daysAgo);
            LocalTime apptTime = findFreeSlot(doc.getId(), apptDate, slotTimes, occupiedSlots);

            Appointment appt = Appointment.builder()
                    .doctor(doc)
                    .patient(pat)
                    .appointmentDate(apptDate)
                    .appointmentTime(apptTime)
                    .endTime(apptTime.plusMinutes(30))
                    .status(AppointmentStatus.COMPLETED)
                    .reason(getAppointmentReason(doc.getDepartment().getName()))
                    .appointmentRef(String.format("HAMS-202610-%04d", refCounter++))
                    .build();
            appt = appointmentRepository.save(appt);
            allAppointments.add(appt);

            // Clinical Consultation for Completed Appointment
            Consultation consult = createConsultation(appt, doc, pat);
            consult = consultationRepository.save(consult);
            appt.setConsultation(consult);

            // Prescription for 30 of the 35 completed consultations
            if (i <= 30) {
                Prescription pres = createPrescription(consult, doc, pat, apptDate);
                prescriptionRepository.save(pres);
            }
        }

        // 2. CANCELLED APPOINTMENTS (8: 5 past, 3 future)
        for (int i = 1; i <= 8; i++) {
            Doctor doc = activeDoctors.get(doctorIndex % activeDoctors.size());
            Patient pat = patients.get(patientIndex % patients.size());
            doctorIndex++;
            patientIndex++;

            LocalDate apptDate = (i <= 5) ? today.minusDays(2 + i) : today.plusDays(i - 4);
            LocalTime apptTime = slotTimes[i % slotTimes.length];

            Appointment appt = Appointment.builder()
                    .doctor(doc)
                    .patient(pat)
                    .appointmentDate(apptDate)
                    .appointmentTime(apptTime)
                    .endTime(apptTime.plusMinutes(30))
                    .status(AppointmentStatus.CANCELLED)
                    .reason(getAppointmentReason(doc.getDepartment().getName()))
                    .cancellationReason(i % 2 == 0 ? "Patient had unexpected conflict in schedule" : "Doctor had emergency procedure")
                    .appointmentRef(String.format("HAMS-202610-%04d", refCounter++))
                    .build();
            allAppointments.add(appointmentRepository.save(appt));
        }

        // 3. NO_SHOW APPOINTMENTS (3 in past)
        for (int i = 1; i <= 3; i++) {
            Doctor doc = activeDoctors.get(doctorIndex % activeDoctors.size());
            Patient pat = patients.get(patientIndex % patients.size());
            doctorIndex++;
            patientIndex++;

            LocalDate apptDate = today.minusDays(2 * i);
            LocalTime apptTime = slotTimes[(i + 3) % slotTimes.length];

            Appointment appt = Appointment.builder()
                    .doctor(doc)
                    .patient(pat)
                    .appointmentDate(apptDate)
                    .appointmentTime(apptTime)
                    .endTime(apptTime.plusMinutes(30))
                    .status(AppointmentStatus.NO_SHOW)
                    .reason(getAppointmentReason(doc.getDepartment().getName()))
                    .appointmentRef(String.format("HAMS-202610-%04d", refCounter++))
                    .build();
            allAppointments.add(appointmentRepository.save(appt));
        }

        // 4. CHECKED_IN APPOINTMENTS (5 today morning)
        for (int i = 1; i <= 5; i++) {
            Doctor doc = activeDoctors.get(i - 1);
            Patient pat = patients.get(patientIndex % patients.size());
            patientIndex++;

            LocalTime apptTime = findFreeSlot(doc.getId(), today, slotTimes, occupiedSlots);

            Appointment appt = Appointment.builder()
                    .doctor(doc)
                    .patient(pat)
                    .appointmentDate(today)
                    .appointmentTime(apptTime)
                    .endTime(apptTime.plusMinutes(30))
                    .status(AppointmentStatus.CHECKED_IN)
                    .reason(getAppointmentReason(doc.getDepartment().getName()))
                    .appointmentRef(String.format("HAMS-202610-%04d", refCounter++))
                    .build();
            allAppointments.add(appointmentRepository.save(appt));
        }

        // 5. IN_CONSULTATION APPOINTMENTS (2 today)
        for (int i = 1; i <= 2; i++) {
            Doctor doc = activeDoctors.get(6 + i);
            Patient pat = patients.get(patientIndex % patients.size());
            patientIndex++;

            LocalTime apptTime = findFreeSlot(doc.getId(), today, slotTimes, occupiedSlots);

            Appointment appt = Appointment.builder()
                    .doctor(doc)
                    .patient(pat)
                    .appointmentDate(today)
                    .appointmentTime(apptTime)
                    .endTime(apptTime.plusMinutes(30))
                    .status(AppointmentStatus.IN_CONSULTATION)
                    .reason(getAppointmentReason(doc.getDepartment().getName()))
                    .appointmentRef(String.format("HAMS-202610-%04d", refCounter++))
                    .build();
            allAppointments.add(appointmentRepository.save(appt));
        }

        // 6. CONFIRMED APPOINTMENTS (25: 5 today afternoon, 20 upcoming days)
        for (int i = 1; i <= 25; i++) {
            Doctor doc = activeDoctors.get(doctorIndex % activeDoctors.size());
            Patient pat = patients.get(patientIndex % patients.size());
            doctorIndex++;
            patientIndex++;

            LocalDate apptDate = (i <= 5) ? today : today.plusDays(1 + (i % 10));
            LocalTime apptTime = findFreeSlot(doc.getId(), apptDate, slotTimes, occupiedSlots);

            Appointment appt = Appointment.builder()
                    .doctor(doc)
                    .patient(pat)
                    .appointmentDate(apptDate)
                    .appointmentTime(apptTime)
                    .endTime(apptTime.plusMinutes(30))
                    .status(AppointmentStatus.CONFIRMED)
                    .reason(getAppointmentReason(doc.getDepartment().getName()))
                    .appointmentRef(String.format("HAMS-202610-%04d", refCounter++))
                    .build();
            allAppointments.add(appointmentRepository.save(appt));
        }

        // 7. PENDING APPOINTMENTS (5 upcoming)
        for (int i = 1; i <= 5; i++) {
            Doctor doc = activeDoctors.get(doctorIndex % activeDoctors.size());
            Patient pat = patients.get(patientIndex % patients.size());
            doctorIndex++;
            patientIndex++;

            LocalDate apptDate = today.plusDays(2 + i);
            LocalTime apptTime = findFreeSlot(doc.getId(), apptDate, slotTimes, occupiedSlots);

            Appointment appt = Appointment.builder()
                    .doctor(doc)
                    .patient(pat)
                    .appointmentDate(apptDate)
                    .appointmentTime(apptTime)
                    .endTime(apptTime.plusMinutes(30))
                    .status(AppointmentStatus.PENDING)
                    .reason(getAppointmentReason(doc.getDepartment().getName()))
                    .appointmentRef(String.format("HAMS-202610-%04d", refCounter++))
                    .build();
            allAppointments.add(appointmentRepository.save(appt));
        }

        // 8. RESCHEDULED APPOINTMENTS (2 upcoming)
        for (int i = 1; i <= 2; i++) {
            Doctor doc = activeDoctors.get(doctorIndex % activeDoctors.size());
            Patient pat = patients.get(patientIndex % patients.size());
            doctorIndex++;
            patientIndex++;

            LocalDate apptDate = today.plusDays(3 + i);
            LocalTime apptTime = slotTimes[(i + 5) % slotTimes.length];

            Appointment appt = Appointment.builder()
                    .doctor(doc)
                    .patient(pat)
                    .appointmentDate(apptDate)
                    .appointmentTime(apptTime)
                    .endTime(apptTime.plusMinutes(30))
                    .status(AppointmentStatus.RESCHEDULED)
                    .reason(getAppointmentReason(doc.getDepartment().getName()))
                    .appointmentRef(String.format("HAMS-202610-%04d", refCounter++))
                    .build();
            allAppointments.add(appointmentRepository.save(appt));
        }

        return allAppointments;
    }

    private LocalTime findFreeSlot(Long doctorId, LocalDate date, LocalTime[] slots, Set<String> occupied) {
        for (LocalTime t : slots) {
            String key = doctorId + "_" + date + "_" + t;
            if (!occupied.contains(key)) {
                occupied.add(key);
                return t;
            }
        }
        // Fallback to slot 0 if all occupied (safe slot fallback)
        return slots[0];
    }

    private String getAppointmentReason(String deptName) {
        return switch (deptName) {
            case "Cardiology" -> "Follow-up blood pressure check and chest discomfort evaluation";
            case "Neurology" -> "Persistent episodic migraine and dizziness assessment";
            case "Orthopedics" -> "Knee joint stiffness and post-walk pain review";
            case "Pediatrics" -> "Routine childhood growth assessment and fever review";
            case "Dermatology" -> "Skin allergy rash and persistent itching consultation";
            case "Ophthalmology" -> "Blurry vision in right eye and visual acuity examination";
            case "Gynecology" -> "Routine antenatal health check and nutritional consultation";
            case "Psychiatry" -> "Sleep disturbance, stress symptoms and general anxiety evaluation";
            case "Gastroenterology" -> "Post-prandial acid reflux and abdominal bloating consultation";
            case "General Medicine" -> "General seasonal fever, fatigue and annual wellness examination";
            case "ENT" -> "Sore throat, difficulty swallowing and nasal congestion consultation";
            case "Radiology" -> "Ultrasound abdominal scan follow-up and clinical review";
            default -> "General clinical consultation and health assessment";
        };
    }

    private Consultation createConsultation(Appointment appt, Doctor doc, Patient pat) {
        String dept = doc.getDepartment().getName();
        String symptoms;
        String diagnosis;
        String advice;

        switch (dept) {
            case "Cardiology" -> {
                symptoms = "Mild chest heaviness upon moderate exertion, occasional palpitations, and fatigue.";
                diagnosis = "Essential Primary Hypertension - Stage 1 (ICD-10 I10)";
                advice = "Low dietary sodium intake (<2g/day), 30 minutes brisk walking daily, avoid caffeine.";
            }
            case "Neurology" -> {
                symptoms = "Unilateral throbbing headache, photophobia, mild nausea lasting >6 hours.";
                diagnosis = "Common Migraine without aura (ICD-10 G43.0)";
                advice = "Identify dietary triggers, ensure regular 8-hour sleep schedule, stay well hydrated.";
            }
            case "Orthopedics" -> {
                symptoms = "Medial right knee joint pain aggravated by descending stairs, morning stiffness.";
                diagnosis = "Bilateral Primary Knee Osteoarthritis - Grade 2 (ICD-10 M17.0)";
                advice = "Quadriceps strengthening physiotherapy exercises, avoid squatting and high-impact sports.";
            }
            case "Pediatrics" -> {
                symptoms = "Low-grade fever for 48 hours, clear rhinorrhea, reduced oral liquid intake.";
                diagnosis = "Acute Viral Upper Respiratory Tract Infection (ICD-10 J06.9)";
                advice = "Adequate oral fluids, warm water gargling, monitor temperature every 6 hours.";
            }
            case "Dermatology" -> {
                symptoms = "Erythematous pruritic maculopapular rash on both upper extremities.";
                diagnosis = "Allergic Contact Dermatitis (ICD-10 L23.9)";
                advice = "Avoid direct contact with suspected synthetic detergents, apply moisturizer twice daily.";
            }
            case "Ophthalmology" -> {
                symptoms = "Difficulty seeing distant street signs clearly, eye strain after prolonged screen time.";
                diagnosis = "Compound Myopic Astigmatism (ICD-10 H52.2)";
                advice = "Follow 20-20-20 screen rule, wear corrective prescription glasses consistently.";
            }
            case "Gynecology" -> {
                symptoms = "Routine second-trimester antenatal checkup, mild lumbar discomfort.";
                diagnosis = "Normal Antenatal Progress - 22 Weeks Gestation (ICD-10 Z34.8)";
                advice = "Continue prenatal vitamins, maintain adequate hydration, perform light prenatal yoga.";
            }
            case "Psychiatry" -> {
                symptoms = "Sleep maintenance insomnia, heightened worry about daily activities, muscle tension.";
                diagnosis = "Generalized Anxiety Disorder - Mild (ICD-10 F41.1)";
                advice = "Practice diaphragmatic breathing, sleep hygiene protocols, reduce evening screen exposure.";
            }
            case "Gastroenterology" -> {
                symptoms = "Retro-sternal heartburn, post-meal epigastric burning, occasional acid regurgitation.";
                diagnosis = "Gastroesophageal Reflux Disease without esophagitis (ICD-10 K21.9)";
                advice = "Elevate head of bed by 15 degrees, avoid spicy and late-night meals, eat smaller portions.";
            }
            case "ENT" -> {
                symptoms = "Throat pain while swallowing, bilateral cervical lymph node tenderness.";
                diagnosis = "Acute Non-Streptococcal Pharyngitis (ICD-10 J02.9)";
                advice = "Warm salt-water gargles thrice daily, drink warm fluids, voice rest.";
            }
            default -> {
                symptoms = "General body fatigue, mild headache, myalgia following seasonal flu.";
                diagnosis = "Post-Viral Fatigue Syndrome and Convalescence (ICD-10 G93.3)";
                advice = "Adequate bed rest, balanced nutritious diet, multivitamin supplementation.";
            }
        }

        return Consultation.builder()
                .appointment(appt)
                .doctor(doc)
                .patient(pat)
                .symptoms(symptoms)
                .diagnosis(diagnosis)
                .notes("Patient alert and oriented. Vital signs recorded within acceptable baseline limits.")
                .clinicalNotes("Physical examination confirms clinical presentation. No systemic complications noted.")
                .advice(advice)
                .treatmentNotes("Conservative pharmacotherapy initiated along with recommended lifestyle modifications.")
                .followUpDate(appt.getAppointmentDate().plusDays(14))
                .build();
    }

    private Prescription createPrescription(Consultation consultation, Doctor doctor, Patient patient, LocalDate date) {
        Prescription prescription = Prescription.builder()
                .consultation(consultation)
                .doctor(doctor)
                .patient(patient)
                .prescriptionDate(date)
                .generalInstructions("Take all medications strictly as prescribed. Review promptly in case of adverse reactions.")
                .build();

        String dept = doctor.getDepartment().getName();
        switch (dept) {
            case "Cardiology" -> {
                prescription.addItem(PrescriptionItem.builder()
                        .medicineName("Telmisartan 40mg")
                        .dosage("1 tablet")
                        .frequency("Once daily (Morning)")
                        .duration("30 days")
                        .instructions("Take after breakfast with water")
                        .build());
                prescription.addItem(PrescriptionItem.builder()
                        .medicineName("Atorvastatin 10mg")
                        .dosage("1 tablet")
                        .frequency("Once daily (Night)")
                        .duration("30 days")
                        .instructions("Take at bedtime")
                        .build());
            }
            case "Neurology" -> {
                prescription.addItem(PrescriptionItem.builder()
                        .medicineName("Naproxen Sodium 500mg")
                        .dosage("1 tablet")
                        .frequency("As needed (SOS)")
                        .duration("10 days")
                        .instructions("Take during acute headache episodes with food")
                        .build());
                prescription.addItem(PrescriptionItem.builder()
                        .medicineName("Propranolol 20mg")
                        .dosage("1 tablet")
                        .frequency("Twice daily")
                        .duration("30 days")
                        .instructions("Take morning and evening")
                        .build());
            }
            case "Orthopedics" -> {
                prescription.addItem(PrescriptionItem.builder()
                        .medicineName("Aceclofenac 100mg + Paracetamol 325mg")
                        .dosage("1 tablet")
                        .frequency("Twice daily after food")
                        .duration("5 days")
                        .instructions("Do not take on empty stomach")
                        .build());
                prescription.addItem(PrescriptionItem.builder()
                        .medicineName("Glucosamine Sulfate 1500mg")
                        .dosage("1 sachet")
                        .frequency("Once daily")
                        .duration("60 days")
                        .instructions("Dissolve in glass of water after breakfast")
                        .build());
            }
            case "Dermatology" -> {
                prescription.addItem(PrescriptionItem.builder()
                        .medicineName("Desloratadine 5mg")
                        .dosage("1 tablet")
                        .frequency("Once daily at bedtime")
                        .duration("10 days")
                        .instructions("May cause mild drowsiness")
                        .build());
                prescription.addItem(PrescriptionItem.builder()
                        .medicineName("Hydrocortisone 1% Topical Cream")
                        .dosage("Thin application")
                        .frequency("Twice daily")
                        .duration("7 days")
                        .instructions("Apply sparingly on affected areas")
                        .build());
            }
            case "Gastroenterology" -> {
                prescription.addItem(PrescriptionItem.builder()
                        .medicineName("Pantoprazole 40mg")
                        .dosage("1 tablet")
                        .frequency("Once daily (Before breakfast)")
                        .duration("14 days")
                        .instructions("Take 30 minutes before first meal with water")
                        .build());
                prescription.addItem(PrescriptionItem.builder()
                        .medicineName("Sucralfate Oral Suspension")
                        .dosage("10 ml")
                        .frequency("Thrice daily before meals")
                        .duration("7 days")
                        .instructions("Shake bottle well before use")
                        .build());
            }
            default -> {
                prescription.addItem(PrescriptionItem.builder()
                        .medicineName("Paracetamol 650mg")
                        .dosage("1 tablet")
                        .frequency("Thrice daily as needed")
                        .duration("5 days")
                        .instructions("Take with warm water after food")
                        .build());
                prescription.addItem(PrescriptionItem.builder()
                        .medicineName("Vitamin C 500mg + Zinc")
                        .dosage("1 chewable tablet")
                        .frequency("Once daily")
                        .duration("15 days")
                        .instructions("Chew completely after meal")
                        .build());
            }
        }

        return prescription;
    }

    private void seedNotifications(List<Appointment> appointments) {
        List<Notification> notifs = new ArrayList<>();

        for (int i = 0; i < Math.min(appointments.size(), 50); i++) {
            Appointment a = appointments.get(i);
            User patientUser = a.getPatient().getUser();
            User doctorUser = a.getDoctor().getUser();

            switch (a.getStatus()) {
                case COMPLETED -> {
                    notifs.add(Notification.builder()
                            .user(patientUser)
                            .title("Consultation Completed")
                            .message("Your consultation with Dr. " + a.getDoctor().getFullName() + " has been completed. Digital prescription is available.")
                            .type(NotificationType.CONSULTATION_COMPLETED)
                            .read(true)
                            .build());
                    notifs.add(Notification.builder()
                            .user(patientUser)
                            .title("Prescription Ready")
                            .message("Prescription has been generated for your appointment (" + a.getAppointmentRef() + ").")
                            .type(NotificationType.PRESCRIPTION_READY)
                            .read(true)
                            .build());
                }
                case CONFIRMED -> {
                    notifs.add(Notification.builder()
                            .user(patientUser)
                            .title("Appointment Confirmed")
                            .message("Your appointment (" + a.getAppointmentRef() + ") with Dr. " + a.getDoctor().getFullName() + " on " + a.getAppointmentDate() + " at " + a.getAppointmentTime() + " is confirmed.")
                            .type(NotificationType.APPOINTMENT_CONFIRMED)
                            .read(false)
                            .build());
                    notifs.add(Notification.builder()
                            .user(doctorUser)
                            .title("New Confirmed Appointment")
                            .message("Patient " + a.getPatient().getFullName() + " is confirmed for " + a.getAppointmentDate() + " at " + a.getAppointmentTime() + ".")
                            .type(NotificationType.APPOINTMENT_CONFIRMED)
                            .read(false)
                            .build());
                }
                case CANCELLED -> notifs.add(Notification.builder()
                        .user(patientUser)
                        .title("Appointment Cancelled")
                        .message("Your appointment (" + a.getAppointmentRef() + ") has been cancelled. Reason: " + a.getCancellationReason())
                        .type(NotificationType.APPOINTMENT_CANCELLED)
                        .read(true)
                        .build());
                case CHECKED_IN -> notifs.add(Notification.builder()
                        .user(doctorUser)
                        .title("Patient Checked In")
                        .message("Patient " + a.getPatient().getFullName() + " has checked in at the clinic for appointment " + a.getAppointmentRef() + ".")
                        .type(NotificationType.APPOINTMENT_CHECKED_IN)
                        .read(false)
                        .build());
                default -> {
                    // General notification
                }
            }
        }

        notificationRepository.saveAll(notifs);
    }

    private void seedAuditLogs(List<Doctor> doctors, List<Patient> patients, List<Appointment> appointments) {
        List<AuditLog> auditLogs = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // 1. Doctor Verifications
        for (int i = 0; i < Math.min(doctors.size(), 16); i++) {
            Doctor doc = doctors.get(i);
            auditLogs.add(AuditLog.builder()
                    .userId(1L) // Admin user ID
                    .action("DOCTOR_VERIFIED")
                    .entityType("Doctor")
                    .entityId(doc.getId())
                    .ipAddress("127.0.0.1")
                    .details("Admin approved credentials and medical registration for Dr. " + doc.getFullName())
                    .createdAt(now.minusDays(14 - (i % 5)))
                    .build());
        }

        // 2. Patient Registrations
        for (int i = 0; i < Math.min(patients.size(), 20); i++) {
            Patient p = patients.get(i);
            auditLogs.add(AuditLog.builder()
                    .userId(p.getUser().getId())
                    .action("PATIENT_REGISTERED")
                    .entityType("Patient")
                    .entityId(p.getId())
                    .ipAddress("192.168.1." + (100 + i))
                    .details("Patient account registered: " + p.getUser().getEmail())
                    .createdAt(now.minusDays(15 - (i % 7)))
                    .build());
        }

        // 3. Appointments & Clinical Consultations
        for (int i = 0; i < Math.min(appointments.size(), 30); i++) {
            Appointment a = appointments.get(i);
            auditLogs.add(AuditLog.builder()
                    .userId(a.getPatient().getUser().getId())
                    .action("APPOINTMENT_BOOKED")
                    .entityType("Appointment")
                    .entityId(a.getId())
                    .ipAddress("192.168.1." + (120 + (i % 30)))
                    .details("Booked appointment " + a.getAppointmentRef() + " with Dr. " + a.getDoctor().getFullName())
                    .createdAt(now.minusDays(10 - (i % 5)))
                    .build());

            if (a.getStatus() == AppointmentStatus.COMPLETED) {
                auditLogs.add(AuditLog.builder()
                        .userId(a.getDoctor().getUser().getId())
                        .action("CONSULTATION_COMPLETED")
                        .entityType("Consultation")
                        .entityId(a.getId())
                        .ipAddress("10.0.0." + (10 + (i % 15)))
                        .details("Doctor completed consultation for appointment " + a.getAppointmentRef())
                        .createdAt(now.minusDays(8 - (i % 4)))
                        .build());
            }
        }

        auditLogRepository.saveAll(auditLogs);
    }
}
