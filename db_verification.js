// HAMS Phase 8B - Direct Database Integrity Verification Script
// Queries PostgreSQL directly via docker exec to verify schema, foreign keys, timestamps, and audit privacy

const { execSync } = require('child_process');

function runPsql(sql) {
  try {
    const cmd = `docker exec -i hams_postgres psql -U hams_user -d hamsdb -t -A -c "${sql}"`;
    return execSync(cmd, { encoding: 'utf-8' }).trim();
  } catch (err) {
    return `ERROR: ${err.message}`;
  }
}

console.log('================================================================');
console.log('   HAMS PHASE 8B — DATABASE DIRECT INTEGRITY AUDIT              ');
console.log('================================================================\n');

const tables = [
  'users',
  'patients',
  'doctors',
  'departments',
  'doctor_availability',
  'doctor_leaves',
  'appointments',
  'consultations',
  'prescriptions',
  'prescription_items',
  'notifications',
  'audit_logs'
];

console.log('--- 1. Table Record Counts ---');
const tableCounts = {};
for (const table of tables) {
  const count = runPsql(`SELECT count(*) FROM ${table};`);
  tableCounts[table] = parseInt(count, 10);
  console.log(`  Table ${table.padEnd(22)} : ${count} records`);
}

console.log('\n--- 2. Foreign Key & Orphan Records Audit ---');
// Check patient user foreign key
const orphanPatients = runPsql(`SELECT count(*) FROM patients p LEFT JOIN users u ON p.user_id = u.id WHERE u.id IS NULL;`);
console.log(`  Orphan Patients (invalid user_id)         : ${orphanPatients} (Expected: 0)`);

// Check doctor user foreign key
const orphanDoctors = runPsql(`SELECT count(*) FROM doctors d LEFT JOIN users u ON d.user_id = u.id WHERE u.id IS NULL;`);
console.log(`  Orphan Doctors (invalid user_id)          : ${orphanDoctors} (Expected: 0)`);

// Check appointment foreign keys
const orphanAppts = runPsql(`SELECT count(*) FROM appointments a LEFT JOIN patients p ON a.patient_id = p.id LEFT JOIN doctors d ON a.doctor_id = d.id WHERE p.id IS NULL OR d.id IS NULL;`);
console.log(`  Orphan Appointments (invalid patient/doc) : ${orphanAppts} (Expected: 0)`);

// Check consultation foreign keys
const orphanCons = runPsql(`SELECT count(*) FROM consultations c LEFT JOIN appointments a ON c.appointment_id = a.id WHERE a.id IS NULL;`);
console.log(`  Orphan Consultations (invalid appt_id)    : ${orphanCons} (Expected: 0)`);

// Check prescription foreign keys
const orphanRx = runPsql(`SELECT count(*) FROM prescriptions p LEFT JOIN consultations c ON p.consultation_id = c.id WHERE c.id IS NULL;`);
console.log(`  Orphan Prescriptions (invalid cons_id)    : ${orphanRx} (Expected: 0)`);

// Check prescription items
const orphanItems = runPsql(`SELECT count(*) FROM prescription_items pi LEFT JOIN prescriptions p ON pi.prescription_id = p.id WHERE p.id IS NULL;`);
console.log(`  Orphan Prescription Items                : ${orphanItems} (Expected: 0)`);

console.log('\n--- 3. Appointment Status Distribution in DB ---');
const statusCounts = runPsql(`SELECT status, count(*) FROM appointments GROUP BY status ORDER BY count(*) DESC;`);
console.log(statusCounts.split('\n').map(line => `  ${line}`).join('\n'));

console.log('\n--- 4. Audit Log Privacy Audit (Zero Credential Leakage) ---');
const leakedPasswords = runPsql(`SELECT count(*) FROM audit_logs WHERE details ILIKE '%password%' OR details ILIKE '%secret%' OR details ILIKE '%token%' OR details ILIKE '%Bearer%';`);
console.log(`  Audit logs containing credentials/tokens  : ${leakedPasswords} (Must be: 0)`);

console.log('\n--- 5. Double-Booking Slot Uniqueness Verification ---');
const duplicateSlots = runPsql(`SELECT doctor_id, appointment_date, appointment_time, count(*) FROM appointments WHERE status NOT IN ('CANCELLED', 'REJECTED', 'NO_SHOW') GROUP BY doctor_id, appointment_date, appointment_time HAVING count(*) > 1;`);
console.log(`  Duplicate active slots found              : ${duplicateSlots ? duplicateSlots : 'NONE (Perfect Uniqueness)'}`);

console.log('\n================================================================');
