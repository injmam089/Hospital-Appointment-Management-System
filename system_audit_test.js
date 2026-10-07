// HAMS Phase 8B - Full System Integration & Functionality Verification Suite
// Tests every endpoint, workflow, security constraint, and business rule against live server

const BASE_URL = 'http://localhost:8080';

const results = {
  passed: 0,
  failed: 0,
  total: 0,
  categories: {},
  tests: []
};

function recordTest(category, name, passed, details = '') {
  results.total++;
  if (!results.categories[category]) results.categories[category] = { passed: 0, failed: 0 };
  
  if (passed) {
    results.passed++;
    results.categories[category].passed++;
    console.log(`  [PASS] [${category}] ${name}`);
  } else {
    results.failed++;
    results.categories[category].failed++;
    console.error(`  [FAIL] [${category}] ${name} - ${details}`);
  }
  results.tests.push({ category, name, passed, details });
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  try {
    const res = await fetch(url, {
      ...options,
      headers
    });
    let data = null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json') || contentType.includes('application/problem+json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }
    return { status: res.status, ok: res.ok, data, headers: res.headers };
  } catch (err) {
    return { status: 0, ok: false, data: null, error: err.message };
  }
}

async function runAudit() {
  console.log('================================================================');
  console.log('   HAMS PHASE 8B — COMPLETE SYSTEM & API INTEGRATION AUDIT       ');
  console.log('================================================================\n');

  // ============================================================
  // 1. HEALTH & CONNECTIVITY
  // ============================================================
  console.log('--- 1. Health & Discovery Endpoints ---');
  const healthRes = await request('/api/public/health');
  recordTest('Health', 'GET /api/public/health returns 200 and status UP',
    healthRes.status === 200 && healthRes.data?.status === 'UP', JSON.stringify(healthRes.data));

  const deptRes = await request('/api/public/departments');
  recordTest('Discovery', 'GET /api/public/departments returns active departments',
    deptRes.status === 200 && Array.isArray(deptRes.data) && deptRes.data.length >= 10,
    `Found ${deptRes.data?.length || 0} departments`);

  const docSearchRes = await request('/api/public/doctors?size=10');
  recordTest('Discovery', 'GET /api/public/doctors returns paginated verified doctors',
    docSearchRes.status === 200 && docSearchRes.data?.content?.length > 0,
    `Found ${docSearchRes.data?.content?.length || 0} doctors`);

  const sampleDoctor = docSearchRes.data?.content?.[0];
  const sampleDocId = sampleDoctor ? sampleDoctor.id : 1;

  const docProfileRes = await request(`/api/public/doctors/${sampleDocId}`);
  recordTest('Discovery', `GET /api/public/doctors/${sampleDocId} returns doctor details`,
    docProfileRes.status === 200 && docProfileRes.data?.id === sampleDocId);

  // ============================================================
  // 2. AUTHENTICATION & TOKEN LIFECYCLE
  // ============================================================
  console.log('\n--- 2. Authentication Testing ---');
  // Admin Login
  const adminLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@hams.local', password: 'Admin@HAMS2024!' })
  });
  const adminToken = adminLogin.data?.accessToken;
  recordTest('Auth', 'Admin valid login succeeds with 200 & JWT',
    adminLogin.status === 200 && !!adminToken);

  // Invalid Password
  const badLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@hams.local', password: 'WrongPassword999!' })
  });
  recordTest('Auth', 'Invalid password rejected with 400 or 401', badLogin.status === 400 || badLogin.status === 401);

  // Empty Credentials
  const emptyLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: '', password: '' })
  });
  recordTest('Auth', 'Empty credentials rejected with 400 or 422',
    emptyLogin.status === 400 || emptyLogin.status === 422);

  // Non-existent email
  const nonExistentUser = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'nobody_exists_12345@example.com', password: 'Password@123' })
  });
  recordTest('Auth', 'Nonexistent user login rejected with 400 or 401', nonExistentUser.status === 400 || nonExistentUser.status === 401);

  // Register Patient A
  const ts = Date.now();
  const emailA = `patient_alpha_${ts}@example.com`;
  const regPatientA = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: emailA,
      password: 'PatientPass123',
      firstName: 'Alpha',
      lastName: 'Patient',
      phone: '9876543210',
      dateOfBirth: '1990-01-01',
      gender: 'FEMALE',
      bloodGroup: 'O+'
    })
  });
  const tokenA = regPatientA.data?.accessToken;
  const refreshA = regPatientA.data?.refreshToken;
  recordTest('Auth', 'Patient A registration returns 201 Created & JWT',
    regPatientA.status === 201 && !!tokenA);

  // Duplicate Email
  const dupReg = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: emailA,
      password: 'PatientPass123',
      firstName: 'AlphaDuplicate',
      lastName: 'Patient',
      phone: '9876543210'
    })
  });
  recordTest('Auth', 'Duplicate email registration returns 409 Conflict', dupReg.status === 409);

  // Refresh Token Flow
  const refreshRes = await request('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: refreshA })
  });
  const renewedTokenA = refreshRes.data?.accessToken || tokenA;
  recordTest('Auth', 'Refresh token exchanges for new access token (200 OK)',
    refreshRes.status === 200 && !!refreshRes.data?.accessToken);

  // Register Patient B (for cross-tenant / IDOR & concurrency tests)
  const emailB = `patient_beta_${ts}@example.com`;
  const regPatientB = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: emailB,
      password: 'PatientPass123',
      firstName: 'Beta',
      lastName: 'Patient',
      phone: '9876543211',
      dateOfBirth: '1992-06-15',
      gender: 'MALE',
      bloodGroup: 'AB+'
    })
  });
  const tokenB = regPatientB.data?.accessToken;
  recordTest('Auth', 'Patient B registration returns 201 Created & JWT',
    regPatientB.status === 201 && !!tokenB);

  // Doctor Login
  const doctorLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'doctor.smith@hams.local', password: 'Doctor@HAMS2024!' })
  });
  const doctorToken = doctorLogin.data?.accessToken;
  const doctorId = 1; // Dr Sarah Smith is Doctor ID 1
  recordTest('Auth', 'Doctor valid login returns 200 & JWT',
    doctorLogin.status === 200 && !!doctorToken);

  // /api/auth/me Profile verification
  const mePatient = await request('/api/auth/me', { headers: { Authorization: `Bearer ${renewedTokenA}` } });
  recordTest('Auth', 'GET /api/auth/me returns patient user summary',
    mePatient.status === 200 && mePatient.data?.role === 'PATIENT');

  const meDoctor = await request('/api/auth/me', { headers: { Authorization: `Bearer ${doctorToken}` } });
  recordTest('Auth', 'GET /api/auth/me returns doctor user summary',
    meDoctor.status === 200 && meDoctor.data?.role === 'DOCTOR');

  const meAdmin = await request('/api/auth/me', { headers: { Authorization: `Bearer ${adminToken}` } });
  recordTest('Auth', 'GET /api/auth/me returns admin user summary',
    meAdmin.status === 200 && meAdmin.data?.role === 'ADMIN');

  // ============================================================
  // 3. RBAC & IDOR SECURITY TESTS
  // ============================================================
  console.log('\n--- 3. RBAC & Access Control Security ---');
  // Anonymous access to protected endpoint
  const anonAccess = await request('/api/patient/profile');
  recordTest('Security/RBAC', 'Anonymous request to protected endpoint returns 401 Unauthorized', anonAccess.status === 401);

  // Patient accessing Admin endpoint
  const patientToAdmin = await request('/api/admin/stats', {
    headers: { Authorization: `Bearer ${renewedTokenA}` }
  });
  recordTest('Security/RBAC', 'Patient accessing /api/admin/stats returns 403 Forbidden', patientToAdmin.status === 403);

  // Doctor accessing Admin endpoint
  const doctorToAdmin = await request('/api/admin/stats', {
    headers: { Authorization: `Bearer ${doctorToken}` }
  });
  recordTest('Security/RBAC', 'Doctor accessing /api/admin/stats returns 403 Forbidden', doctorToAdmin.status === 403);

  // Doctor accessing Patient endpoint
  const doctorToPatient = await request('/api/patient/profile', {
    headers: { Authorization: `Bearer ${doctorToken}` }
  });
  recordTest('Security/RBAC', 'Doctor accessing /api/patient/profile returns 403 Forbidden', doctorToPatient.status === 403);

  // Patient accessing Doctor endpoint
  const patientToDoctor = await request('/api/doctor/availability', {
    headers: { Authorization: `Bearer ${renewedTokenA}` }
  });
  recordTest('Security/RBAC', 'Patient accessing /api/doctor/availability returns 403 Forbidden', patientToDoctor.status === 403);

  // ============================================================
  // 4. PATIENT COMPLETE WORKFLOW
  // ============================================================
  console.log('\n--- 4. Patient Complete Workflow ---');
  // Get patient profile
  const patProfile = await request('/api/patient/profile', {
    headers: { Authorization: `Bearer ${renewedTokenA}` }
  });
  recordTest('Patient Workflow', 'GET /api/patient/profile returns current profile',
    patProfile.status === 200 && patProfile.data?.firstName === 'Alpha');

  // Update patient profile
  const updateProfileRes = await request('/api/patient/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${renewedTokenA}` },
    body: JSON.stringify({
      firstName: 'Alpha',
      lastName: 'PatientUpdated',
      phone: '9876543299',
      dateOfBirth: '1990-01-01',
      gender: 'FEMALE',
      address: 'Suite 404 Health Center Rd',
      bloodGroup: 'O+',
      emergencyContact: '9123456780'
    })
  });
  recordTest('Patient Workflow', 'PUT /api/patient/profile updates profile and persists',
    updateProfileRes.status === 200 && updateProfileRes.data?.lastName === 'PatientUpdated');

  // Target booking date: Pick Wednesday next week
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 7);
  while (targetDate.getDay() === 0 || targetDate.getDay() === 6) {
    targetDate.setDate(targetDate.getDate() + 1);
  }
  const dateStr = targetDate.toISOString().split('T')[0];

  // Check slots for Doctor 1 (Dr. Sarah Smith)
  const slotsRes = await request(`/api/doctors/${doctorId}/slots?date=${dateStr}`);
  recordTest('Availability', `GET /api/doctors/${doctorId}/slots for ${dateStr} returns slot list`,
    slotsRes.status === 200 && Array.isArray(slotsRes.data?.slots) && slotsRes.data.slots.length > 0);

  // Get first available slot
  const availableSlot = slotsRes.data?.slots?.find(s => s.available);
  let slotTime = availableSlot ? availableSlot.startTime.substring(0, 5) : '09:00';

  // Book appointment as Patient A
  const bookApptResA = await request('/api/patient/appointments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${renewedTokenA}` },
    body: JSON.stringify({
      doctorId: doctorId,
      appointmentDate: dateStr,
      appointmentTime: slotTime,
      reason: 'Routine health screening & consultation'
    })
  });
  const apptA = bookApptResA.data;
  recordTest('Patient Workflow', `Book appointment on ${dateStr} at ${slotTime} returns 201 CONFIRMED`,
    bookApptResA.status === 201 && apptA?.status === 'CONFIRMED' && !!apptA?.appointmentRef,
    JSON.stringify(bookApptResA.data));
  const apptIdA = apptA?.id;

  // Verify appointment in Patient's appointments list
  const patientAppts = await request('/api/patient/appointments', {
    headers: { Authorization: `Bearer ${renewedTokenA}` }
  });
  recordTest('Patient Workflow', 'GET /api/patient/appointments contains new appointment',
    patientAppts.status === 200 && patientAppts.data?.some(a => a.id === apptIdA));

  // Get upcoming appointment
  const upcomingRes = await request('/api/patient/appointments/upcoming', {
    headers: { Authorization: `Bearer ${renewedTokenA}` }
  });
  recordTest('Patient Workflow', 'GET /api/patient/appointments/upcoming returns next active appointment',
    upcomingRes.status === 200 && !!upcomingRes.data?.id);

  // Get appointment details by ID
  const apptDetails = await request(`/api/patient/appointments/${apptIdA}`, {
    headers: { Authorization: `Bearer ${renewedTokenA}` }
  });
  recordTest('Patient Workflow', 'GET /api/patient/appointments/{id} returns details',
    apptDetails.status === 200 && apptDetails.data?.id === apptIdA);

  // ============================================================
  // 5. DOUBLE-BOOKING & CONCURRENCY TEST (CRITICAL)
  // ============================================================
  console.log('\n--- 5. Double-Booking Prevention & Concurrency ---');
  // Attempt to book the EXACT SAME occupied slot as Patient B
  const doubleBookRes = await request('/api/patient/appointments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({
      doctorId: doctorId,
      appointmentDate: dateStr,
      appointmentTime: slotTime,
      reason: 'Attempting conflicting booking on occupied slot'
    })
  });
  recordTest('Double-Booking', 'Booking already-reserved slot fails with 409 Conflict',
    doubleBookRes.status === 409, `Response was ${doubleBookRes.status}`);

  // Concurrent Simultaneous Booking Attempt:
  const freshSlots = await request(`/api/doctors/${doctorId}/slots?date=${dateStr}`);
  const secondAvailSlot = freshSlots.data?.slots?.find(s => s.available && s.startTime.substring(0, 5) !== slotTime);
  const raceSlotTime = secondAvailSlot ? secondAvailSlot.startTime.substring(0, 5) : '11:00';

  console.log(`  Executing simultaneous race booking for slot ${raceSlotTime}...`);
  const [raceRes1, raceRes2] = await Promise.all([
    request('/api/patient/appointments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${renewedTokenA}` },
      body: JSON.stringify({
        doctorId: doctorId,
        appointmentDate: dateStr,
        appointmentTime: raceSlotTime,
        reason: 'Simultaneous race booking 1'
      })
    }),
    request('/api/patient/appointments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({
        doctorId: doctorId,
        appointmentDate: dateStr,
        appointmentTime: raceSlotTime,
        reason: 'Simultaneous race booking 2'
      })
    })
  ]);

  const raceSucceeded = (raceRes1.status === 201 && raceRes2.status === 409) ||
                        (raceRes2.status === 201 && raceRes1.status === 409);
  recordTest('Double-Booking', 'Simultaneous booking: Exactly 1 succeeds (201), the other safely fails (409)',
    raceSucceeded, `Req 1: ${raceRes1.status}, Req 2: ${raceRes2.status}`);

  const activeApptB = raceRes1.status === 201 ? raceRes1.data?.id : raceRes2.data?.id;

  // ============================================================
  // 6. CANCELLATION, SLOT RELEASE & RE-BOOKING
  // ============================================================
  console.log('\n--- 6. Cancellation, Slot Release & Re-booking ---');
  // Patient A cancels Appointment A
  const cancelApptA = await request(`/api/patient/appointments/${apptIdA}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${renewedTokenA}` },
    body: JSON.stringify({ cancellationReason: 'Change of schedule by patient' })
  });
  recordTest('Cancellation', 'Cancel appointment returns 200 with status CANCELLED',
    cancelApptA.status === 200 && cancelApptA.data?.status === 'CANCELLED');

  // Verify that cancelled slot is now immediately available again in doctor's slot list
  const slotsAfterCancel = await request(`/api/doctors/${doctorId}/slots?date=${dateStr}`);
  const releasedSlot = slotsAfterCancel.data?.slots?.find(s => s.startTime.substring(0, 5) === slotTime);
  recordTest('Availability', 'Cancelled slot immediately becomes available again (available: true)',
    releasedSlot?.available === true);

  // Patient B re-books the newly freed slot
  const rebookRes = await request('/api/patient/appointments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({
      doctorId: doctorId,
      appointmentDate: dateStr,
      appointmentTime: slotTime,
      reason: 'Rebooking previously cancelled slot'
    })
  });
  recordTest('Re-booking', 'Rebooking newly freed slot succeeds with 201 CONFIRMED',
    rebookRes.status === 201 && rebookRes.data?.status === 'CONFIRMED');
  const apptForClinicalFlow = rebookRes.data?.id;

  // ============================================================
  // 7. APPOINTMENT RESCHEDULING
  // ============================================================
  console.log('\n--- 7. Rescheduling Flow ---');
  // Dr Sarah Smith works on WEDNESDAY and FRIDAY.
  // Rebook was on Wednesday (dateStr). Reschedule to Friday (+2 days).
  const fridayDate = new Date(targetDate);
  fridayDate.setDate(fridayDate.getDate() + 2); // Wednesday -> Friday
  const fridayDateStr = fridayDate.toISOString().split('T')[0];

  const rescheduleSlots = await request(`/api/doctors/${doctorId}/slots?date=${fridayDateStr}`);
  const newAvailSlot = rescheduleSlots.data?.slots?.find(s => s.available);
  const newSlotTime = newAvailSlot ? newAvailSlot.startTime.substring(0, 5) : '14:00';

  const rescheduleRes = await request(`/api/patient/appointments/${apptForClinicalFlow}/reschedule`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({
      newDate: fridayDateStr,
      newTime: newSlotTime,
      reason: 'Need afternoon slot on Friday'
    })
  });
  recordTest('Reschedule', `Reschedule appointment to Friday ${fridayDateStr} ${newSlotTime} returns 200 OK`,
    rescheduleRes.status === 200 && rescheduleRes.data?.appointmentDate === fridayDateStr);

  // Verify old slot is released and new slot is occupied
  const slotsOldDate = await request(`/api/doctors/${doctorId}/slots?date=${dateStr}`);
  const oldSlotCheck = slotsOldDate.data?.slots?.find(s => s.startTime.substring(0, 5) === slotTime);
  recordTest('Reschedule', 'Old slot is released (available: true)', oldSlotCheck?.available === true);

  const slotsNewDate = await request(`/api/doctors/${doctorId}/slots?date=${fridayDateStr}`);
  const newSlotCheck = slotsNewDate.data?.slots?.find(s => s.startTime.substring(0, 5) === newSlotTime);
  recordTest('Reschedule', 'New slot is occupied (available: false)', newSlotCheck?.available === false);

  // ============================================================
  // 8. APPOINTMENT STATE MACHINE & CLINICAL CONSULTATION
  // ============================================================
  console.log('\n--- 8. Appointment State Machine & Clinical Workflow ---');
  // State machine: CONFIRMED -> CHECKED_IN -> IN_CONSULTATION -> COMPLETED
  
  // Test Invalid Transition: CONFIRMED -> COMPLETED
  const invComp = await request(`/api/doctor/appointments/${apptForClinicalFlow}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${doctorToken}` }
  });
  recordTest('State Machine', 'Invalid transition CONFIRMED -> COMPLETED is rejected (400/409)',
    invComp.status === 400 || invComp.status === 409);

  // Test Invalid Transition: CONFIRMED -> IN_CONSULTATION
  const invInCons = await request(`/api/doctor/appointments/${apptForClinicalFlow}/start-consultation`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${doctorToken}` }
  });
  recordTest('State Machine', 'Invalid transition CONFIRMED -> IN_CONSULTATION is rejected (400/409)',
    invInCons.status === 400 || invInCons.status === 409);

  // Valid Transition 1: CHECK-IN
  const checkInRes = await request(`/api/doctor/appointments/${apptForClinicalFlow}/check-in`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${doctorToken}` }
  });
  recordTest('State Machine', 'Transition CONFIRMED -> CHECKED_IN succeeds (200 OK)',
    checkInRes.status === 200 && checkInRes.data?.status === 'CHECKED_IN');

  // Valid Transition 2: START CONSULTATION
  const startConsRes = await request(`/api/doctor/appointments/${apptForClinicalFlow}/start-consultation`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${doctorToken}` }
  });
  recordTest('State Machine', 'Transition CHECKED_IN -> IN_CONSULTATION succeeds (200 OK)',
    startConsRes.status === 200 && startConsRes.data?.status === 'IN_CONSULTATION');

  // Clinical Step: Create Consultation & Diagnosis
  const consCreateRes = await request(`/api/doctor/appointments/${apptForClinicalFlow}/consultation`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${doctorToken}` },
    body: JSON.stringify({
      symptoms: 'Patient reports persistent headache and sleep disturbance',
      diagnosis: 'Tension-type Headache with Cervical Strain',
      clinicalNotes: 'Vitals normal, BP 122/80. Neurological exam negative.',
      treatmentNotes: 'Postural correction, ergonomics training, hydration.',
      followUpDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
    })
  });
  const consId = consCreateRes.data?.id;
  recordTest('Doctor Workflow', 'POST consultation records diagnosis and clinical notes (201 Created)',
    consCreateRes.status === 201 && !!consId);

  // Clinical Step: Create Prescription with Multiple Medicines
  const rxCreateRes = await request(`/api/doctor/consultations/${consId}/prescription`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${doctorToken}` },
    body: JSON.stringify({
      generalInstructions: 'Take medications strictly after meals with plenty of water',
      items: [
        {
          medicineName: 'Naproxen 250mg',
          dosage: '250mg',
          frequency: 'Twice daily after food',
          duration: '5 days',
          instructions: 'Take with milk or full glass of water'
        },
        {
          medicineName: 'Magnesium Glycinate 200mg',
          dosage: '200mg',
          frequency: 'Once daily at bedtime',
          duration: '30 days',
          instructions: 'Take 30 mins before sleep'
        }
      ]
    })
  });
  const rxId = rxCreateRes.data?.id;
  recordTest('Doctor Workflow', 'POST prescription attaches multiple medicines (201 Created)',
    rxCreateRes.status === 201 && Array.isArray(rxCreateRes.data?.items) && rxCreateRes.data.items.length === 2);

  // Valid Transition 3: COMPLETE APPOINTMENT
  const completeRes = await request(`/api/doctor/appointments/${apptForClinicalFlow}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${doctorToken}` }
  });
  recordTest('State Machine', 'Transition IN_CONSULTATION -> COMPLETED succeeds (200 OK)',
    completeRes.status === 200 && completeRes.data?.status === 'COMPLETED');

  // Test Invalid Transition: COMPLETED -> CHECKED_IN
  const invCompToCheckIn = await request(`/api/doctor/appointments/${apptForClinicalFlow}/check-in`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${doctorToken}` }
  });
  recordTest('State Machine', 'Invalid transition COMPLETED -> CHECKED_IN is rejected (400/409)',
    invCompToCheckIn.status === 400 || invCompToCheckIn.status === 409);

  // ============================================================
  // 9. PATIENT ACCESS TO PRESCRIPTIONS & MEDICAL RECORDS
  // ============================================================
  console.log('\n--- 9. Patient Prescriptions & Records Access ---');
  // Patient B accesses prescriptions list
  const patRxList = await request('/api/patient/prescriptions', {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  recordTest('Patient Prescriptions', 'GET /api/patient/prescriptions returns patient prescriptions',
    patRxList.status === 200 && Array.isArray(patRxList.data) && patRxList.data.some(p => p.id === rxId));

  // Patient B accesses specific prescription
  const patRxDetails = await request(`/api/patient/prescriptions/${rxId}`, {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  recordTest('Patient Prescriptions', 'GET /api/patient/prescriptions/{id} returns full medicine details',
    patRxDetails.status === 200 && patRxDetails.data?.items?.length === 2);

  // IDOR Protection: Patient A accessing Patient B's prescription
  const crossRxAccess = await request(`/api/patient/prescriptions/${rxId}`, {
    headers: { Authorization: `Bearer ${renewedTokenA}` }
  });
  recordTest('Security/IDOR', 'Patient A accessing Patient B prescription returns 403 or 404',
    crossRxAccess.status === 403 || crossRxAccess.status === 404);

  // Patient B accessing consultation of appointment
  const patCons = await request(`/api/patient/appointments/${apptForClinicalFlow}/consultation`, {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  recordTest('Patient Prescriptions', 'GET /api/patient/appointments/{id}/consultation returns clinical summary',
    patCons.status === 200 && patCons.data?.diagnosis === 'Tension-type Headache with Cervical Strain');

  // ============================================================
  // 10. DOCTOR SCHEDULE, AVAILABILITY & LEAVES
  // ============================================================
  console.log('\n--- 10. Doctor Schedule & Leave Management ---');
  // View doctor own schedule
  const docSched = await request('/api/doctor/availability', {
    headers: { Authorization: `Bearer ${doctorToken}` }
  });
  recordTest('Doctor Schedule', 'GET /api/doctor/availability returns doctor weekly schedule & breaks',
    docSched.status === 200 && Array.isArray(docSched.data?.schedule));

  // Submit doctor leave request
  const leaveStartStr = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const leaveEndStr = new Date(Date.now() + 32 * 86400000).toISOString().split('T')[0];

  const createLeaveRes = await request('/api/doctor/leaves', {
    method: 'POST',
    headers: { Authorization: `Bearer ${doctorToken}` },
    body: JSON.stringify({
      startDate: leaveStartStr,
      endDate: leaveEndStr,
      reason: 'Attending International Cardiology Symposium'
    })
  });
  const createdLeaveId = createLeaveRes.data?.id;
  recordTest('Doctor Schedule', 'POST /api/doctor/leaves schedules leave period (200 OK)',
    createLeaveRes.status === 200 && !!createdLeaveId);

  // Verify leave overlap prevention
  const dupLeaveRes = await request('/api/doctor/leaves', {
    method: 'POST',
    headers: { Authorization: `Bearer ${doctorToken}` },
    body: JSON.stringify({
      startDate: leaveStartStr,
      endDate: leaveEndStr,
      reason: 'Overlapping leave request'
    })
  });
  recordTest('Doctor Schedule', 'Overlapping leave request is rejected (400 or 409 Conflict)',
    dupLeaveRes.status === 400 || dupLeaveRes.status === 409);

  // List doctor leaves
  const getLeavesRes = await request('/api/doctor/leaves', {
    headers: { Authorization: `Bearer ${doctorToken}` }
  });
  recordTest('Doctor Schedule', 'GET /api/doctor/leaves returns scheduled leaves',
    getLeavesRes.status === 200 && Array.isArray(getLeavesRes.data) && getLeavesRes.data.some(l => l.id === createdLeaveId));

  // Cancel doctor leave
  if (createdLeaveId) {
    const cancelLeaveRes = await request(`/api/doctor/leaves/${createdLeaveId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${doctorToken}` }
    });
    recordTest('Doctor Schedule', 'DELETE /api/doctor/leaves/{id} cancels leave (204 No Content)',
      cancelLeaveRes.status === 204 || cancelLeaveRes.status === 200);
  }

  // ============================================================
  // 11. ADMIN COMPLETE WORKFLOW
  // ============================================================
  console.log('\n--- 11. Admin Complete Workflow ---');
  // High-level hospital stats
  const adminStats = await request('/api/admin/stats', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  recordTest('Admin Workflow', 'GET /api/admin/stats returns real hospital metrics',
    adminStats.status === 200 && adminStats.data?.totalUsers > 0 && adminStats.data?.totalDoctors > 0);

  // Dashboard stats
  const adminDashStats = await request('/api/admin/dashboard/stats', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  recordTest('Admin Workflow', 'GET /api/admin/dashboard/stats returns operational stats & status breakdown',
    adminDashStats.status === 200 && typeof adminDashStats.data?.totalDoctors === 'number' && !!adminDashStats.data?.statusDistribution);

  // Search & list users
  const adminUsers = await request('/api/admin/users?size=10', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  recordTest('Admin Workflow', 'GET /api/admin/users returns paginated user administration list',
    adminUsers.status === 200 && adminUsers.data?.content?.length > 0);

  // Search & filter doctors
  const adminDoctors = await request('/api/admin/doctors?size=10', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  recordTest('Admin Workflow', 'GET /api/admin/doctors returns paginated doctor administration list',
    adminDoctors.status === 200 && adminDoctors.data?.content?.length > 0);

  // Global appointment oversight
  const adminAppts = await request('/api/admin/appointments?size=10', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  recordTest('Admin Workflow', 'GET /api/admin/appointments returns global hospital appointments',
    adminAppts.status === 200 && adminAppts.data?.content?.length > 0);

  // Aggregated reports summary
  const adminReports = await request('/api/admin/reports/summary', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  recordTest('Admin Workflow', 'GET /api/admin/reports/summary returns analytics breakdown',
    adminReports.status === 200 && typeof adminReports.data?.totalAppointments === 'number');

  // Audit logs inspection
  const adminAudit = await request('/api/admin/audit-logs?size=10', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  recordTest('Admin Workflow', 'GET /api/admin/audit-logs returns real audit trail',
    adminAudit.status === 200 && adminAudit.data?.content?.length > 0);

  // Department management: list all
  const adminDepts = await request('/api/admin/departments', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  recordTest('Admin Workflow', 'GET /api/admin/departments returns all 12 departments with doctor counts',
    adminDepts.status === 200 && adminDepts.data?.length >= 10);

  // Create temporary department
  const tempDeptName = `Test Specialty ${Date.now()}`;
  const createDeptRes = await request('/api/admin/departments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: tempDeptName,
      description: 'Department created for admin workflow test',
      icon: 'activity'
    })
  });
  recordTest('Admin Workflow', 'POST /api/admin/departments creates new department (201 Created)',
    createDeptRes.status === 201 && createDeptRes.data?.name === tempDeptName);
  const tempDeptId = createDeptRes.data?.id;

  // Toggle department status
  if (tempDeptId) {
    const toggleDeptRes = await request(`/api/admin/departments/${tempDeptId}/status?active=false`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    recordTest('Admin Workflow', 'PATCH /api/admin/departments/{id}/status deactivates department (200 OK)',
      toggleDeptRes.status === 200 && toggleDeptRes.data?.active === false);
  }

  // ============================================================
  // 12. NOTIFICATION CENTER TESTING
  // ============================================================
  console.log('\n--- 12. Notification Center Testing ---');
  // Patient B notifications (generated by booking, rescheduling, and consultation)
  const notifsB = await request('/api/notifications', {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  recordTest('Notifications', 'GET /api/notifications returns user notification page',
    notifsB.status === 200 && Array.isArray(notifsB.data?.content));

  const unreadCountB = await request('/api/notifications/unread-count', {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  recordTest('Notifications', 'GET /api/notifications/unread-count returns unread count',
    unreadCountB.status === 200 && typeof unreadCountB.data?.unreadCount === 'number');

  if (notifsB.data?.content?.length > 0) {
    const notifItem = notifsB.data.content[0];
    // Mark single notification as read
    const markOneRes = await request(`/api/notifications/${notifItem.id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    recordTest('Notifications', 'PATCH /api/notifications/{id}/read marks single notification read',
      markOneRes.status === 200 && markOneRes.data?.read === true);

    // Cross-user IDOR check: Patient A attempting to mark Patient B's notification read
    const crossNotifRes = await request(`/api/notifications/${notifItem.id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${renewedTokenA}` }
    });
    recordTest('Security/IDOR', 'Cross-user mark notification read is rejected with 403 or 404',
      crossNotifRes.status === 403 || crossNotifRes.status === 404);
  }

  // Mark all notifications as read
  const markAllRes = await request('/api/notifications/read-all', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  recordTest('Notifications', 'PATCH /api/notifications/read-all marks all notifications read',
    markAllRes.status === 200);

  // ============================================================
  // 13. API NEGATIVE TESTING & RFC 7807 ERROR FORMAT
  // ============================================================
  console.log('\n--- 13. API Negative Testing & RFC 7807 Format ---');
  // Non-existent doctor ID
  const nonExistentDoc = await request('/api/public/doctors/9999999');
  recordTest('Negative API', 'Non-existent doctor ID returns 404 with RFC 7807 title/detail',
    nonExistentDoc.status === 404 && (nonExistentDoc.data?.title || nonExistentDoc.data?.detail));

  // Non-existent appointment ID
  const nonExistentAppt = await request('/api/patient/appointments/9999999', {
    headers: { Authorization: `Bearer ${renewedTokenA}` }
  });
  recordTest('Negative API', 'Non-existent appointment ID returns 404',
    nonExistentAppt.status === 404);

  // Malformed date parameter
  const malformedDate = await request(`/api/doctors/${doctorId}/slots?date=bad-date-format`);
  recordTest('Negative API', 'Malformed date parameter returns 400 Bad Request',
    malformedDate.status === 400);

  // Past date appointment booking attempt
  const pastApptRes = await request('/api/patient/appointments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${renewedTokenA}` },
    body: JSON.stringify({
      doctorId: doctorId,
      appointmentDate: '2022-01-01',
      appointmentTime: '10:00',
      reason: 'Attempting to book appointment in the past'
    })
  });
  recordTest('Negative API', 'Past date booking rejected with 400 or 422',
    pastApptRes.status === 400 || pastApptRes.status === 422);

  // Invalid JWT Token
  const badTokenRes = await request('/api/patient/profile', {
    headers: { Authorization: 'Bearer this.is.an.invalid.token' }
  });
  recordTest('Negative API', 'Invalid JWT token returns 401 Unauthorized',
    badTokenRes.status === 401);

  // Missing Authorization Header on secured endpoint
  const noTokenRes = await request('/api/patient/appointments');
  recordTest('Negative API', 'Missing token on secured endpoint returns 401',
    noTokenRes.status === 401);

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${results.total} | PASSED: ${results.passed} | FAILED: ${results.failed}`);
  console.log('Category Breakdown:');
  for (const [cat, count] of Object.entries(results.categories)) {
    console.log(`  - ${cat.padEnd(20)}: ${count.passed} Passed / ${count.failed} Failed`);
  }
  console.log('================================================================\n');

  return results;
}

runAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
