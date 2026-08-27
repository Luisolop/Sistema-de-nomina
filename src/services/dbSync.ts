import { 
  db, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  orderBy,
  limit
} from './firebase';
import { 
  RawAttendanceEvent, 
  AttendanceRecord, 
  Employee, 
  BiometricSyncLog, 
  SystemSettings, 
  IntegrationConfig,
  FirestoreDbStats
} from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Firestore collection names
export const COLLECTIONS = {
  RAW_EVENTS: 'raw_biometric_events',
  SYNC_LOGS: 'biometric_sync_logs',
  ATTENDANCE: 'attendance_records',
  EMPLOYEES: 'employees',
  SETTINGS: 'system_settings',
  INTEGRATION: 'integration_configs',
  AUDIT_LOGS: 'audit_logs'
} as const;

/**
 * Saves a list of raw biometric events directly to Firestore database.
 * Uses event.id as document key for idempotent writes (prevents duplicates).
 */
export async function saveRawBiometricEventsToFirestore(events: RawAttendanceEvent[]): Promise<{ savedCount: number; errors: string[] }> {
  if (!events || events.length === 0) return { savedCount: 0, errors: [] };

  let savedCount = 0;
  const errors: string[] = [];

  for (const event of events) {
    try {
      const docRef = doc(db, COLLECTIONS.RAW_EVENTS, event.id);
      await setDoc(docRef, {
        ...event,
        dbSavedAt: new Date().toISOString()
      }, { merge: true });
      savedCount++;
    } catch (err: any) {
      console.error('Error saving raw biometric event to Firestore:', err);
      errors.push(`Evento ${event.id}: ${err?.message || 'Error de escritura'}`);
    }
  }

  return { savedCount, errors };
}

/**
 * Saves a biometric synchronization execution log into Firestore
 */
export async function saveBiometricSyncLogToFirestore(log: BiometricSyncLog): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.SYNC_LOGS, log.id);
    await setDoc(docRef, {
      ...log,
      createdAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Error saving sync log to Firestore:', err);
  }
}

/**
 * Saves attendance records to Firestore
 */
export async function saveAttendanceRecordsToFirestore(records: AttendanceRecord[]): Promise<number> {
  let count = 0;
  for (const record of records) {
    try {
      const docRef = doc(db, COLLECTIONS.ATTENDANCE, record.id);
      await setDoc(docRef, {
        ...record,
        lastDbUpdate: new Date().toISOString()
      }, { merge: true });
      count++;
    } catch (err) {
      console.error('Error saving attendance record to Firestore:', err);
    }
  }
  return count;
}

/**
 * Fetches stored raw biometric events from Firestore
 */
export async function fetchRawBiometricEventsFromFirestore(limitCount: number = 100): Promise<RawAttendanceEvent[]> {
  try {
    const colRef = collection(db, COLLECTIONS.RAW_EVENTS);
    const q = query(colRef, limit(limitCount));
    const snapshot = await getDocs(q);
    const events: RawAttendanceEvent[] = [];
    snapshot.forEach(docSnap => {
      events.push(docSnap.data() as RawAttendanceEvent);
    });
    return events;
  } catch (err) {
    console.warn('Could not fetch raw events from Firestore (fallback to local):', err);
    return [];
  }
}

/**
 * Fetches recent sync logs from Firestore
 */
export async function fetchSyncLogsFromFirestore(limitCount: number = 20): Promise<BiometricSyncLog[]> {
  try {
    const colRef = collection(db, COLLECTIONS.SYNC_LOGS);
    const q = query(colRef, limit(limitCount));
    const snapshot = await getDocs(q);
    const logs: BiometricSyncLog[] = [];
    snapshot.forEach(docSnap => {
      logs.push(docSnap.data() as BiometricSyncLog);
    });
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (err) {
    console.warn('Could not fetch sync logs from Firestore:', err);
    return [];
  }
}

/**
 * Fetches attendance records from Firestore
 */
export async function fetchAttendanceFromFirestore(): Promise<AttendanceRecord[]> {
  try {
    const colRef = collection(db, COLLECTIONS.ATTENDANCE);
    const snapshot = await getDocs(colRef);
    const records: AttendanceRecord[] = [];
    snapshot.forEach(docSnap => {
      records.push(docSnap.data() as AttendanceRecord);
    });
    return records;
  } catch (err) {
    console.warn('Could not fetch attendance from Firestore:', err);
    return [];
  }
}

/**
 * Gets real-time Firestore database stats & counts
 */
export async function getFirestoreDatabaseStats(): Promise<FirestoreDbStats> {
  const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
  let isConnected = true;
  let rawCount = 0;
  let attendanceCount = 0;
  let employeesCount = 0;
  let syncLogsCount = 0;

  try {
    // Quick test ping
    const rawSnap = await getDocs(collection(db, COLLECTIONS.RAW_EVENTS));
    rawCount = rawSnap.size;

    const attSnap = await getDocs(collection(db, COLLECTIONS.ATTENDANCE));
    attendanceCount = attSnap.size;

    const empSnap = await getDocs(collection(db, COLLECTIONS.EMPLOYEES));
    employeesCount = empSnap.size;

    const logSnap = await getDocs(collection(db, COLLECTIONS.SYNC_LOGS));
    syncLogsCount = logSnap.size;
  } catch (err) {
    console.warn('Firestore stats read error:', err);
    isConnected = false;
  }

  return {
    databaseId,
    isConnected,
    rawEventsCount: rawCount,
    attendanceRecordsCount: attendanceCount,
    employeesCount,
    syncLogsCount,
    lastDbWriteTime: new Date().toISOString()
  };
}

/**
 * Seeds initial database collections in Firestore if they are empty
 */
export async function seedInitialFirestoreData(
  sampleEvents: RawAttendanceEvent[],
  sampleAttendance: AttendanceRecord[],
  sampleEmployees: Employee[],
  settings: SystemSettings,
  integration: IntegrationConfig
): Promise<void> {
  try {
    // Check if raw events already exist
    const rawSnap = await getDocs(collection(db, COLLECTIONS.RAW_EVENTS));
    if (rawSnap.empty && sampleEvents.length > 0) {
      console.log('Seeding raw biometric events into Firestore database...');
      await saveRawBiometricEventsToFirestore(sampleEvents);
    }

    // Check attendance
    const attSnap = await getDocs(collection(db, COLLECTIONS.ATTENDANCE));
    if (attSnap.empty && sampleAttendance.length > 0) {
      console.log('Seeding attendance records into Firestore database...');
      await saveAttendanceRecordsToFirestore(sampleAttendance);
    }

    // Check employees
    const empSnap = await getDocs(collection(db, COLLECTIONS.EMPLOYEES));
    if (empSnap.empty && sampleEmployees.length > 0) {
      console.log('Seeding employee master records into Firestore database...');
      for (const emp of sampleEmployees) {
        await setDoc(doc(db, COLLECTIONS.EMPLOYEES, emp.id), emp, { merge: true });
      }
    }

    // Seed settings & integration doc
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'default'), settings, { merge: true });
    await setDoc(doc(db, COLLECTIONS.INTEGRATION, 'default'), integration, { merge: true });

  } catch (err) {
    console.warn('Error during initial Firestore seeding:', err);
  }
}
