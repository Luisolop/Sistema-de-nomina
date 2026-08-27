import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  UserProfile, 
  UserRole, 
  Department, 
  Position, 
  Employee, 
  WorkSchedule, 
  Holiday, 
  AttendanceRecord, 
  AttendanceCorrection, 
  PayPeriod, 
  PayrollItem, 
  VacationRequest, 
  LeaveRequest, 
  AnnualBenefit, 
  IntegrationConfig, 
  RawAttendanceEvent, 
  AuditLog, 
  SystemSettings,
  FirestoreDbStats,
  BiometricSyncLog
} from '../types';
import { 
  INITIAL_SETTINGS, 
  INITIAL_DEPARTMENTS, 
  INITIAL_POSITIONS, 
  INITIAL_SCHEDULES, 
  INITIAL_HOLIDAYS_2026, 
  INITIAL_EMPLOYEES, 
  INITIAL_PAY_PERIODS, 
  INITIAL_VACATION_REQUESTS, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_ANNUAL_BENEFITS, 
  INITIAL_INTEGRATION_CONFIG, 
  INITIAL_AUTHORIZED_USERS, 
  INITIAL_AUDIT_LOGS, 
  generateSampleAttendance 
} from './mockInitialData';
import { PayrollCalculationService } from './payrollEngine';
import { AttendanceCalculationService } from './attendanceEngine';
import { AttendanceProviderFactory } from './attendanceProvider';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, FirebaseUser } from './firebase';
import { 
  saveRawBiometricEventsToFirestore, 
  saveBiometricSyncLogToFirestore, 
  saveAttendanceRecordsToFirestore,
  getFirestoreDatabaseStats,
  seedInitialFirestoreData,
  fetchRawBiometricEventsFromFirestore,
  fetchAttendanceFromFirestore
} from './dbSync';
import firebaseConfig from '../../firebase-applet-config.json';

interface AppContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  authLoading: boolean;
  authError: string | null;
  currentRole: UserRole;
  isAuthorized: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  
  // Data entities
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  
  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  
  positions: Position[];
  addPosition: (pos: Omit<Position, 'id'>) => void;
  updatePosition: (id: string, pos: Partial<Position>) => void;
  deletePosition: (id: string) => void;
  
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  
  schedules: WorkSchedule[];
  addSchedule: (sch: Omit<WorkSchedule, 'id'>) => void;
  updateSchedule: (id: string, sch: Partial<WorkSchedule>) => void;
  deleteSchedule: (id: string) => void;
  
  holidays: Holiday[];
  addHoliday: (hol: Omit<Holiday, 'id'>) => void;
  updateHoliday: (id: string, hol: Partial<Holiday>) => void;
  deleteHoliday: (id: string) => void;
  
  attendance: AttendanceRecord[];
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => void;
  updateAttendanceRecord: (id: string, record: Partial<AttendanceRecord>) => void;
  
  corrections: AttendanceCorrection[];
  requestCorrection: (correction: Omit<AttendanceCorrection, 'id' | 'createdAt' | 'status'>) => void;
  approveCorrection: (correctionId: string, approvedBy: string) => void;
  rejectCorrection: (correctionId: string, rejectedBy: string, reason?: string) => void;
  
  vacations: VacationRequest[];
  requestVacation: (req: Omit<VacationRequest, 'id' | 'status' | 'requestedAt'>) => void;
  approveVacation: (id: string, approverName: string) => void;
  rejectVacation: (id: string) => void;
  
  leaves: LeaveRequest[];
  requestLeave: (req: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => void;
  approveLeave: (id: string, approverName: string) => void;
  rejectLeave: (id: string) => void;
  
  annualBenefits: AnnualBenefit[];
  updateAnnualBenefit: (id: string, benefit: Partial<AnnualBenefit>) => void;
  
  payPeriods: PayPeriod[];
  activePeriod: PayPeriod | null;
  addPayPeriod: (period: Omit<PayPeriod, 'id' | 'createdAt'>) => void;
  updatePayPeriodStatus: (id: string, status: PayPeriod['status']) => void;
  
  payrollCalculations: PayrollItem[];
  recalculatePayroll: (periodId?: string) => void;
  
  integrationConfig: IntegrationConfig;
  updateIntegrationConfig: (cfg: Partial<IntegrationConfig>) => void;
  testBiometricConnection: () => Promise<{ success: boolean; message: string; details?: any }>;
  syncBiometricsNow: () => Promise<{ success: boolean; newEventsCount: number; message: string }>;
  rawEvents: RawAttendanceEvent[];
  formattedCountdown: string;
  secondsUntilNextSync: number;
  
  // Database service & Firestore status
  dbStats: FirestoreDbStats;
  refreshDatabaseStats: () => Promise<void>;
  syncAllDataToFirestore: () => Promise<{ success: boolean; message: string }>;
  
  auditLogs: AuditLog[];
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  
  authorizedUsers: UserProfile[];
  addAuthorizedUser: (user: Omit<UserProfile, 'uid'>) => void;
  updateAuthorizedUser: (uid: string, user: Partial<UserProfile>) => void;
  deleteAuthorizedUser: (uid: string) => void;
  
  // Filtered views by department (for Gerentes)
  accessibleDepartments: Department[];
  accessibleEmployees: Employee[];
  accessibleAttendance: AttendanceRecord[];
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_PREFIX = 'rh_hotel_v1_';

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Storage read error:', e);
  }
  return fallback;
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  } catch (e) {
    console.warn('Storage write error:', e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Entities state
  const [settings, setSettings] = useState<SystemSettings>(() => getStored('settings', INITIAL_SETTINGS));
  const [departments, setDepartments] = useState<Department[]>(() => getStored('departments', INITIAL_DEPARTMENTS));
  const [positions, setPositions] = useState<Position[]>(() => getStored('positions', INITIAL_POSITIONS));
  const [employees, setEmployees] = useState<Employee[]>(() => getStored('employees', INITIAL_EMPLOYEES));
  const [schedules, setSchedules] = useState<WorkSchedule[]>(() => getStored('schedules', INITIAL_SCHEDULES));
  const [holidays, setHolidays] = useState<Holiday[]>(() => getStored('holidays', INITIAL_HOLIDAYS_2026));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getStored('attendance', generateSampleAttendance()));
  const [corrections, setCorrections] = useState<AttendanceCorrection[]>(() => getStored('corrections', []));
  const [vacations, setVacations] = useState<VacationRequest[]>(() => getStored('vacations', INITIAL_VACATION_REQUESTS));
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => getStored('leaves', INITIAL_LEAVE_REQUESTS));
  const [annualBenefits, setAnnualBenefits] = useState<AnnualBenefit[]>(() => getStored('benefits', INITIAL_ANNUAL_BENEFITS));
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>(() => getStored('payPeriods', INITIAL_PAY_PERIODS));
  const [integrationConfig, setIntegrationConfig] = useState<IntegrationConfig>(() => getStored('integration', INITIAL_INTEGRATION_CONFIG));
  const [rawEvents, setRawEvents] = useState<RawAttendanceEvent[]>(() => getStored('rawEvents', []));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getStored('auditLogs', INITIAL_AUDIT_LOGS));
  const [authorizedUsers, setAuthorizedUsers] = useState<UserProfile[]>(() => getStored('authorizedUsers', INITIAL_AUTHORIZED_USERS));

  // Database / Firestore status state
  const [dbStats, setDbStats] = useState<FirestoreDbStats>({
    databaseId: firebaseConfig.firestoreDatabaseId || 'ai-studio-portalrhhotel-59b77291-5eef-4829-937d-9a467303b034',
    isConnected: true,
    rawEventsCount: 0,
    attendanceRecordsCount: 0,
    employeesCount: 0,
    syncLogsCount: 0,
    lastDbWriteTime: new Date().toISOString()
  });

  // Database initialization & sync
  const refreshDatabaseStats = async () => {
    try {
      const stats = await getFirestoreDatabaseStats();
      setDbStats(stats);
    } catch (e) {
      console.warn('Could not update Firestore stats:', e);
    }
  };

  useEffect(() => {
    const initDb = async () => {
      try {
        // Seed initial data if Firestore collections are empty
        await seedInitialFirestoreData(
          rawEvents.length > 0 ? rawEvents : [],
          attendance,
          employees,
          settings,
          integrationConfig
        );
        // Refresh stats
        await refreshDatabaseStats();
      } catch (err) {
        console.warn('Initial Firestore setup skipped or offline:', err);
      }
    };
    initDb();
  }, []);

  // Sync to local storage
  useEffect(() => { setStored('settings', settings); }, [settings]);
  useEffect(() => { setStored('departments', departments); }, [departments]);
  useEffect(() => { setStored('positions', positions); }, [positions]);
  useEffect(() => { setStored('employees', employees); }, [employees]);
  useEffect(() => { setStored('schedules', schedules); }, [schedules]);
  useEffect(() => { setStored('holidays', holidays); }, [holidays]);
  useEffect(() => { setStored('attendance', attendance); }, [attendance]);
  useEffect(() => { setStored('corrections', corrections); }, [corrections]);
  useEffect(() => { setStored('vacations', vacations); }, [vacations]);
  useEffect(() => { setStored('leaves', leaves); }, [leaves]);
  useEffect(() => { setStored('benefits', annualBenefits); }, [annualBenefits]);
  useEffect(() => { setStored('payPeriods', payPeriods); }, [payPeriods]);
  useEffect(() => { setStored('integration', integrationConfig); }, [integrationConfig]);
  useEffect(() => { setStored('rawEvents', rawEvents); }, [rawEvents]);
  useEffect(() => { setStored('auditLogs', auditLogs); }, [auditLogs]);
  useEffect(() => { setStored('authorizedUsers', authorizedUsers); }, [authorizedUsers]);

  // Handle Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fUser) => {
      setFirebaseUser(fUser);
      if (fUser && fUser.email) {
        const userEmail = fUser.email.toLowerCase();
        // Check if user is in authorized users
        const matched = authorizedUsers.find(u => u.email.toLowerCase() === userEmail && u.active);
        
        // If developer/owner email, always grant Admin
        if (userEmail === 'alopez@playaassoc.com' || matched) {
          const profile: UserProfile = matched || {
            uid: fUser.uid,
            email: fUser.email,
            displayName: fUser.displayName || 'Lic. Ana López',
            photoURL: fUser.photoURL || undefined,
            role: 'ADMIN',
            active: true,
            lastLoginAt: new Date().toISOString()
          };
          setCurrentUser(profile);
          setAuthError(null);
        } else {
          // Reject access with exact required message
          setCurrentUser(null);
          setAuthError('Tu cuenta de Google no está autorizada para acceder a este sistema. Contacta al administrador.');
        }
      } else {
        // Fallback default admin user for instant exploration if not logged in yet
        const defaultAdmin = authorizedUsers[0] || INITIAL_AUTHORIZED_USERS[0];
        setCurrentUser(defaultAdmin);
        setAuthError(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [authorizedUsers]);

  // Login with Google
  const loginWithGoogle = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email?.toLowerCase();
      if (!email) {
        throw new Error('No se pudo obtener el correo de Google.');
      }
      const matched = authorizedUsers.find(u => u.email.toLowerCase() === email && u.active);
      if (email !== 'alopez@playaassoc.com' && !matched) {
        await signOut(auth);
        setCurrentUser(null);
        setAuthError('Tu cuenta de Google no está autorizada para acceder a este sistema. Contacta al administrador.');
      } else {
        const profile = matched || {
          uid: result.user.uid,
          email: result.user.email!,
          displayName: result.user.displayName || email,
          photoURL: result.user.photoURL || undefined,
          role: 'ADMIN',
          active: true,
          lastLoginAt: new Date().toISOString()
        };
        setCurrentUser(profile);
      }
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setAuthError(err.message || 'Error al iniciar sesión con Google.');
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Signout warning:', e);
    }
    setCurrentUser(null);
  };

  // Demo role switcher for testing all views without logging out
  const switchDemoRole = (role: UserRole) => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      role,
      departmentIds: role === 'GERENTE_DEPARTAMENTO' ? ['dept-rec'] : undefined
    };
    setCurrentUser(updated);
  };

  // Audit logger helper
  const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...log,
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Active Pay Period
  const activePeriod = useMemo(() => {
    return payPeriods.find(p => p.status === 'ABIERTO') || payPeriods[0] || null;
  }, [payPeriods]);

  // Payroll calculation computed state
  const payrollCalculations = useMemo(() => {
    if (!activePeriod) return [];
    return PayrollCalculationService.calculateAllPayroll(employees, activePeriod, attendance);
  }, [employees, activePeriod, attendance]);

  // Recalculate Payroll
  const recalculatePayroll = (periodId?: string) => {
    const targetPeriod = periodId ? payPeriods.find(p => p.id === periodId) : activePeriod;
    if (!targetPeriod) return;
    addAuditLog({
      userId: currentUser?.uid || 'sys',
      userEmail: currentUser?.email || 'admin@hotelplayaroyale.com',
      userRole: currentUser?.role || 'ADMIN',
      action: 'UPDATE',
      module: 'Prenómina',
      recordId: targetPeriod.id,
      recordDescription: `Recálculo ejecutado para periodo ${targetPeriod.name}`
    });
  };

  // Settings update
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addAuditLog({
      userId: currentUser?.uid || 'sys',
      userEmail: currentUser?.email || 'admin',
      userRole: currentUser?.role || 'ADMIN',
      action: 'UPDATE',
      module: 'Configuración General',
      recordId: 'system-settings',
      recordDescription: 'Actualización de parámetros del sistema y políticas hoteleras',
      newValue: newSettings
    });
  };

  // Departments CRUD
  const addDepartment = (dept: Omit<Department, 'id'>) => {
    const id = `dept-${dept.code.toLowerCase()}-${Date.now().toString(36)}`;
    const newDept: Department = { ...dept, id, employeeCount: 0 };
    setDepartments(prev => [...prev, newDept]);
    addAuditLog({
      userId: currentUser?.uid || 'sys',
      userEmail: currentUser?.email || 'admin',
      userRole: currentUser?.role || 'ADMIN',
      action: 'CREATE',
      module: 'Departamentos',
      recordId: id,
      recordDescription: `Creación de departamento ${dept.name} (${dept.code})`
    });
  };

  const updateDepartment = (id: string, dept: Partial<Department>) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...dept } : d));
    addAuditLog({
      userId: currentUser?.uid || 'sys',
      userEmail: currentUser?.email || 'admin',
      userRole: currentUser?.role || 'ADMIN',
      action: 'UPDATE',
      module: 'Departamentos',
      recordId: id,
      recordDescription: `Modificación de departamento ${id}`
    });
  };

  const deleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
    addAuditLog({
      userId: currentUser?.uid || 'sys',
      userEmail: currentUser?.email || 'admin',
      userRole: currentUser?.role || 'ADMIN',
      action: 'DELETE',
      module: 'Departamentos',
      recordId: id,
      recordDescription: `Eliminación de departamento ${id}`
    });
  };

  // Positions CRUD
  const addPosition = (pos: Omit<Position, 'id'>) => {
    const id = `pos-${Date.now().toString(36)}`;
    setPositions(prev => [...prev, { ...pos, id }]);
  };
  const updatePosition = (id: string, pos: Partial<Position>) => {
    setPositions(prev => prev.map(p => p.id === id ? { ...p, ...pos } : p));
  };
  const deletePosition = (id: string) => {
    setPositions(prev => prev.filter(p => p.id !== id));
  };

  // Employees CRUD
  const addEmployee = (empData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `emp-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const newEmp: Employee = {
      ...empData,
      id,
      createdAt: now,
      updatedAt: now
    };
    setEmployees(prev => [...prev, newEmp]);
    
    // Add annual benefit record for employee
    const newBenefit: AnnualBenefit = {
      id: `ben-${id}`,
      employeeId: id,
      employeeName: newEmp.fullName,
      benefitName: 'Días de Permiso con Goce Anual (Económicos)',
      description: 'Días con goce de sueldo para trámites personales o emergencias familiares',
      annualAllowanceDays: 5,
      usedDays: 0,
      remainingDays: 5,
      periodYear: 2026,
      renewalDate: '2027-01-01'
    };
    setAnnualBenefits(prev => [...prev, newBenefit]);

    addAuditLog({
      userId: currentUser?.uid || 'sys',
      userEmail: currentUser?.email || 'admin',
      userRole: currentUser?.role || 'ADMIN',
      action: 'CREATE',
      module: 'Colaboradores',
      recordId: id,
      recordDescription: `Alta de colaborador: ${newEmp.fullName} (${newEmp.employeeNumber}) en ${newEmp.departmentName}`
    });
  };

  const updateEmployee = (id: string, empData: Partial<Employee>) => {
    const now = new Date().toISOString();
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...empData, updatedAt: now } : e));
    addAuditLog({
      userId: currentUser?.uid || 'sys',
      userEmail: currentUser?.email || 'admin',
      userRole: currentUser?.role || 'ADMIN',
      action: 'UPDATE',
      module: 'Colaboradores',
      recordId: id,
      recordDescription: `Actualización de expediente del colaborador ${id}`
    });
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: 'BAJA' } : e));
    addAuditLog({
      userId: currentUser?.uid || 'sys',
      userEmail: currentUser?.email || 'admin',
      userRole: currentUser?.role || 'ADMIN',
      action: 'UPDATE',
      module: 'Colaboradores',
      recordId: id,
      recordDescription: `Baja de colaborador ${id}`
    });
  };

  // Schedules CRUD
  const addSchedule = (sch: Omit<WorkSchedule, 'id'>) => {
    const id = `sch-${Date.now().toString(36)}`;
    setSchedules(prev => [...prev, { ...sch, id }]);
  };
  const updateSchedule = (id: string, sch: Partial<WorkSchedule>) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...sch } : s));
  };
  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  // Holidays CRUD
  const addHoliday = (hol: Omit<Holiday, 'id'>) => {
    const id = `hol-${Date.now().toString(36)}`;
    setHolidays(prev => [...prev, { ...hol, id }]);
  };
  const updateHoliday = (id: string, hol: Partial<Holiday>) => {
    setHolidays(prev => prev.map(h => h.id === id ? { ...h, ...hol } : h));
  };
  const deleteHoliday = (id: string) => {
    setHolidays(prev => prev.filter(h => h.id !== id));
  };

  // Attendance Records
  const addAttendanceRecord = (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => {
    const id = `att-${record.employeeId}-${record.date}`;
    const newRecord: AttendanceRecord = {
      ...record,
      id,
      createdAt: new Date().toISOString()
    };
    setAttendance(prev => {
      const filtered = prev.filter(a => a.id !== id);
      return [newRecord, ...filtered];
    });
  };

  const updateAttendanceRecord = (id: string, record: Partial<AttendanceRecord>) => {
    setAttendance(prev => prev.map(a => a.id === id ? { ...a, ...record, modifiedAt: new Date().toISOString() } : a));
  };

  // Corrections workflow
  const requestCorrection = (corrData: Omit<AttendanceCorrection, 'id' | 'createdAt' | 'status'>) => {
    const id = `corr-${Date.now().toString(36)}`;
    const newCorr: AttendanceCorrection = {
      ...corrData,
      id,
      status: 'PENDIENTE',
      createdAt: new Date().toISOString()
    };
    setCorrections(prev => [newCorr, ...prev]);

    // Mark attendance record as pending correction
    setAttendance(prev => prev.map(a => a.id === corrData.recordId ? { ...a, hasCorrection: true, correctionId: id, status: 'CORRECCION_PENDIENTE' } : a));

    addAuditLog({
      userId: currentUser?.uid || 'user',
      userEmail: currentUser?.email || 'gerente',
      userRole: currentUser?.role || 'GERENTE_DEPARTAMENTO',
      action: 'CORRECT',
      module: 'Asistencia',
      recordId: corrData.recordId,
      recordDescription: `Solicitud de corrección de checada para ${corrData.employeeName} (${corrData.date}): Entrada ${corrData.newIn}, Salida ${corrData.newOut}. Motivo: ${corrData.reason}`
    });
  };

  const approveCorrection = (correctionId: string, approvedBy: string) => {
    const corr = corrections.find(c => c.id === correctionId);
    if (!corr) return;

    setCorrections(prev => prev.map(c => c.id === correctionId ? { ...c, status: 'APROBADA', approvedBy, approvedAt: new Date().toISOString() } : c));

    // Update attendance record with new times and recalculated status
    const emp = employees.find(e => e.id === corr.employeeId);
    const sch = schedules.find(s => s.id === emp?.scheduleId) || schedules[0];
    
    if (emp && sch) {
      const evaluated = AttendanceCalculationService.evaluateDailyAttendance({
        employee: emp,
        dateStr: corr.date,
        dayOfWeek: new Date(corr.date + 'T12:00:00').getDay(),
        schedule: sch,
        actualCheckIn: corr.newIn,
        actualCheckOut: corr.newOut,
        holidays,
        approvedVacations: vacations,
        approvedLeaves: leaves
      });

      setAttendance(prev => prev.map(a => a.id === corr.recordId ? {
        ...a,
        actualIn: corr.newIn,
        actualOut: corr.newOut,
        status: evaluated.status === 'SIN_REGISTRO' ? 'PRESENTE' : evaluated.status,
        delayMinutes: evaluated.delayMinutes,
        workedHours: evaluated.workedHours,
        notes: `Corregido por ${approvedBy}. Motivo: ${corr.reason}`,
        modifiedBy: approvedBy,
        modifiedAt: new Date().toISOString()
      } : a));
    }

    addAuditLog({
      userId: currentUser?.uid || 'admin',
      userEmail: currentUser?.email || 'admin',
      userRole: currentUser?.role || 'ADMIN',
      action: 'APPROVE',
      module: 'Asistencia',
      recordId: corr.recordId,
      recordDescription: `Corrección aprobada por ${approvedBy} para ${corr.employeeName}`
    });
  };

  const rejectCorrection = (correctionId: string, rejectedBy: string, reason?: string) => {
    setCorrections(prev => prev.map(c => c.id === correctionId ? { ...c, status: 'RECHAZADA', notes: reason, approvedBy: rejectedBy, approvedAt: new Date().toISOString() } : c));
  };

  // Vacations workflow
  const requestVacation = (reqData: Omit<VacationRequest, 'id' | 'status' | 'requestedAt'>) => {
    const id = `vac-${Date.now().toString(36)}`;
    const newReq: VacationRequest = {
      ...reqData,
      id,
      status: 'PENDIENTE',
      requestedAt: new Date().toISOString()
    };
    setVacations(prev => [newReq, ...prev]);
    addAuditLog({
      userId: currentUser?.uid || 'user',
      userEmail: currentUser?.email || 'user',
      userRole: currentUser?.role || 'RH',
      action: 'CREATE',
      module: 'Vacaciones',
      recordId: id,
      recordDescription: `Solicitud de vacaciones para ${reqData.employeeName} (${reqData.daysRequested} días del ${reqData.startDate} al ${reqData.endDate})`
    });
  };

  const approveVacation = (id: string, approverName: string) => {
    const vac = vacations.find(v => v.id === id);
    if (!vac) return;

    setVacations(prev => prev.map(v => v.id === id ? { ...v, status: 'APROBADA', authorizedBy: approverName, authorizedAt: new Date().toISOString() } : v));

    // Deduct vacation days from employee balance
    setEmployees(prev => prev.map(e => {
      if (e.id === vac.employeeId) {
        return {
          ...e,
          vacationDaysAvailable: Math.max(0, e.vacationDaysAvailable - vac.daysRequested),
          vacationDaysUsed: e.vacationDaysUsed + vac.daysRequested
        };
      }
      return e;
    }));

    addAuditLog({
      userId: currentUser?.uid || 'admin',
      userEmail: currentUser?.email || 'admin',
      userRole: currentUser?.role || 'ADMIN',
      action: 'APPROVE',
      module: 'Vacaciones',
      recordId: id,
      recordDescription: `Vacaciones aprobadas para ${vac.employeeName} (${vac.daysRequested} días)`
    });
  };

  const rejectVacation = (id: string) => {
    setVacations(prev => prev.map(v => v.id === id ? { ...v, status: 'RECHAZADA' } : v));
  };

  // Leaves workflow
  const requestLeave = (reqData: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => {
    const id = `leave-${Date.now().toString(36)}`;
    const newLeave: LeaveRequest = {
      ...reqData,
      id,
      status: 'PENDIENTE',
      createdAt: new Date().toISOString()
    };
    setLeaves(prev => [newLeave, ...prev]);

    addAuditLog({
      userId: currentUser?.uid || 'user',
      userEmail: currentUser?.email || 'user',
      userRole: currentUser?.role || 'RH',
      action: 'CREATE',
      module: 'Permisos',
      recordId: id,
      recordDescription: `Solicitud de permiso/incapacidad para ${reqData.employeeName} (${reqData.type})`
    });
  };

  const approveLeave = (id: string, approverName: string) => {
    const leave = leaves.find(l => l.id === id);
    if (!leave) return;

    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'APROBADA', authorizedBy: approverName, authorizedAt: new Date().toISOString() } : l));

    // If it's a paid leave, deduct from annual benefits if available
    if (leave.type === 'PERMISO_CON_GOCE') {
      setAnnualBenefits(prev => prev.map(b => {
        if (b.employeeId === leave.employeeId) {
          return {
            ...b,
            usedDays: b.usedDays + leave.daysCount,
            remainingDays: Math.max(0, b.remainingDays - leave.daysCount)
          };
        }
        return b;
      }));
    }

    addAuditLog({
      userId: currentUser?.uid || 'admin',
      userEmail: currentUser?.email || 'admin',
      userRole: currentUser?.role || 'ADMIN',
      action: 'APPROVE',
      module: 'Permisos',
      recordId: id,
      recordDescription: `Permiso aprobado por ${approverName} para ${leave.employeeName}`
    });
  };

  const rejectLeave = (id: string) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'RECHAZADA' } : l));
  };

  // Annual Benefits update
  const updateAnnualBenefit = (id: string, benefit: Partial<AnnualBenefit>) => {
    setAnnualBenefits(prev => prev.map(b => b.id === id ? { ...b, ...benefit } : b));
  };

  // Pay Periods
  const addPayPeriod = (periodData: Omit<PayPeriod, 'id' | 'createdAt'>) => {
    const id = `period-${Date.now().toString(36)}`;
    const newPeriod: PayPeriod = {
      ...periodData,
      id,
      createdAt: new Date().toISOString()
    };
    setPayPeriods(prev => [newPeriod, ...prev]);
    addAuditLog({
      userId: currentUser?.uid || 'sys',
      userEmail: currentUser?.email || 'admin',
      userRole: currentUser?.role || 'ADMIN',
      action: 'CREATE',
      module: 'Prenómina',
      recordId: id,
      recordDescription: `Creación de periodo de nómina: ${newPeriod.name} (${newPeriod.daysCount} días)`
    });
  };

  const updatePayPeriodStatus = (id: string, status: PayPeriod['status']) => {
    setPayPeriods(prev => prev.map(p => p.id === id ? {
      ...p,
      status,
      closedAt: status === 'CERRADO' ? new Date().toISOString() : p.closedAt,
      closedBy: status === 'CERRADO' ? currentUser?.email : p.closedBy
    } : p));

    addAuditLog({
      userId: currentUser?.uid || 'admin',
      userEmail: currentUser?.email || 'admin',
      userRole: currentUser?.role || 'ADMIN',
      action: status === 'CERRADO' ? 'CLOSE_PERIOD' : 'UPDATE',
      module: 'Prenómina',
      recordId: id,
      recordDescription: `Cambio de estado de periodo a ${status}`
    });
  };

  // Integration & Biometrics
  const updateIntegrationConfig = (cfg: Partial<IntegrationConfig>) => {
    setIntegrationConfig(prev => ({ ...prev, ...cfg }));
    addAuditLog({
      userId: currentUser?.uid || 'admin',
      userEmail: currentUser?.email || 'admin',
      userRole: currentUser?.role || 'ADMIN',
      action: 'UPDATE',
      module: 'Integraciones Biométricas',
      recordId: integrationConfig.id,
      recordDescription: 'Actualización de configuración del servidor HikCentral / Biométricos'
    });
  };

  const testBiometricConnection = async () => {
    const provider = AttendanceProviderFactory.getProvider(integrationConfig.provider);
    return provider.testConnection(integrationConfig);
  };

  const syncBiometricsNow = async () => {
    const startTime = Date.now();
    setIntegrationConfig(prev => ({ ...prev, lastSyncStatus: 'SYNCING' }));
    try {
      const provider = AttendanceProviderFactory.getProvider(integrationConfig.provider);
      const events = await provider.fetchRawEvents(integrationConfig);
      
      // Filter duplicates by hash
      const existingHashes = new Set(rawEvents.map(e => e.hash));
      const newEvents = events.filter(e => !existingHashes.has(e.hash));

      if (newEvents.length > 0) {
        setRawEvents(prev => [...newEvents, ...prev]);
        
        // 1. Persist directly into Firestore Database
        try {
          await saveRawBiometricEventsToFirestore(newEvents);
        } catch (dbErr) {
          console.warn('Could not save raw events to Firestore database:', dbErr);
        }
      }

      const syncTimestamp = new Date().toISOString();
      const durationMs = Date.now() - startTime;

      // 2. Persist Biometric Sync Log into Firestore
      const syncLog: BiometricSyncLog = {
        id: `synclog-${Date.now().toString(36)}`,
        timestamp: syncTimestamp,
        provider: integrationConfig.provider,
        serverUrl: `${integrationConfig.serverUrl}:${integrationConfig.port}`,
        eventsFetched: events.length,
        newEventsSaved: newEvents.length,
        status: 'SUCCESS',
        message: `Sincronización completada exitosamente. ${newEvents.length} eventos nuevos guardados en Firestore.`,
        durationMs,
        initiatedBy: 'MANUAL_USER'
      };

      try {
        await saveBiometricSyncLogToFirestore(syncLog);
      } catch (logErr) {
        console.warn('Could not save sync log to Firestore:', logErr);
      }

      setIntegrationConfig(prev => ({
        ...prev,
        lastSyncStatus: 'SUCCESS',
        lastSyncTimestamp: syncTimestamp,
        lastSyncEventsCount: (prev.lastSyncEventsCount || 0) + newEvents.length
      }));

      addAuditLog({
        userId: currentUser?.uid || 'sys',
        userEmail: currentUser?.email || 'admin',
        userRole: currentUser?.role || 'ADMIN',
        action: 'SYNC',
        module: 'Integraciones Biométricas / Firestore',
        recordId: integrationConfig.id,
        recordDescription: `Sincronización HikCentral completada: ${newEvents.length} nuevos eventos almacenados en Base de Datos Firestore.`
      });

      // Update live database stats
      await refreshDatabaseStats();

      return {
        success: true,
        newEventsCount: newEvents.length,
        message: `Sincronización exitosa con HikCentral y Firestore. Se persistieron ${newEvents.length} nuevos registros biométricos en la Base de Datos.`
      };
    } catch (err: any) {
      const syncTimestamp = new Date().toISOString();
      const durationMs = Date.now() - startTime;
      
      const errorLog: BiometricSyncLog = {
        id: `synclog-err-${Date.now().toString(36)}`,
        timestamp: syncTimestamp,
        provider: integrationConfig.provider,
        serverUrl: `${integrationConfig.serverUrl}:${integrationConfig.port}`,
        eventsFetched: 0,
        newEventsSaved: 0,
        status: 'ERROR',
        message: err?.message || 'Error de conexión con terminal biométrica',
        durationMs,
        initiatedBy: 'MANUAL_USER'
      };
      
      try {
        await saveBiometricSyncLogToFirestore(errorLog);
      } catch (e) {
        console.warn('Could not save error sync log:', e);
      }

      setIntegrationConfig(prev => ({
        ...prev,
        lastSyncStatus: 'ERROR',
        lastErrorMessage: err?.message || 'Error de sincronización'
      }));
      return {
        success: false,
        newEventsCount: 0,
        message: `Error al sincronizar con HikCentral: ${err?.message || 'Fallo de conexión'}`
      };
    }
  };

  // Full manual database synchronization
  const syncAllDataToFirestore = async (): Promise<{ success: boolean; message: string }> => {
    try {
      await saveRawBiometricEventsToFirestore(rawEvents);
      await saveAttendanceRecordsToFirestore(attendance);
      await refreshDatabaseStats();
      return {
        success: true,
        message: 'Todos los registros biométricos y de asistencia han sido respaldados y sincronizados en Firestore.'
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Error al respaldar en Firestore: ${err?.message || 'Fallo en servicio de base de datos'}`
      };
    }
  };

  // Background Recurring Auto-Sync Engine (e.g. Every 2 Hours by Default)
  const [secondsUntilNextSync, setSecondsUntilNextSync] = useState<number>(() => (integrationConfig.syncIntervalMinutes || 120) * 60);

  useEffect(() => {
    if (!integrationConfig.autoSync) {
      return;
    }

    const intervalMinutes = integrationConfig.syncIntervalMinutes || 120;
    const intervalMs = intervalMinutes * 60 * 1000;

    const timer = setInterval(() => {
      const lastSync = integrationConfig.lastSyncTimestamp ? new Date(integrationConfig.lastSyncTimestamp).getTime() : Date.now();
      const elapsed = Date.now() - lastSync;
      const remainingMs = Math.max(0, intervalMs - (elapsed % intervalMs));
      const remainingSec = Math.floor(remainingMs / 1000);
      setSecondsUntilNextSync(remainingSec);

      // When interval elapsed and not already syncing, trigger automatic sync
      if (elapsed >= intervalMs && integrationConfig.lastSyncStatus !== 'SYNCING') {
        syncBiometricsNow();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [integrationConfig.autoSync, integrationConfig.syncIntervalMinutes, integrationConfig.lastSyncTimestamp, integrationConfig.lastSyncStatus]);

  const formattedCountdown = useMemo(() => {
    if (!integrationConfig.autoSync) return 'Pausada';
    const hours = Math.floor(secondsUntilNextSync / 3600);
    const mins = Math.floor((secondsUntilNextSync % 3600) / 60);
    const secs = secondsUntilNextSync % 60;
    if (hours > 0) {
      return `${hours}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  }, [secondsUntilNextSync, integrationConfig.autoSync]);

  // Authorized Users CRUD
  const addAuthorizedUser = (userData: Omit<UserProfile, 'uid'>) => {
    const uid = `usr-${Date.now().toString(36)}`;
    const newUser: UserProfile = { ...userData, uid, firstLoginAt: new Date().toISOString() };
    setAuthorizedUsers(prev => [...prev, newUser]);
  };
  const updateAuthorizedUser = (uid: string, userData: Partial<UserProfile>) => {
    setAuthorizedUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...userData } : u));
  };
  const deleteAuthorizedUser = (uid: string) => {
    setAuthorizedUsers(prev => prev.filter(u => u.uid !== uid));
  };

  // Role-Aware Filtered Views (Department Manager restrictions)
  const currentRole = currentUser?.role || 'ADMIN';

  const accessibleDepartments = useMemo(() => {
    if (currentRole === 'ADMIN' || currentRole === 'RH' || currentRole === 'CONTABILIDAD') {
      return departments;
    }
    // Gerente de Departamento: only assigned departments
    const allowed = currentUser?.departmentIds || ['dept-rec'];
    return departments.filter(d => allowed.includes(d.id));
  }, [departments, currentRole, currentUser]);

  const accessibleEmployees = useMemo(() => {
    if (currentRole === 'ADMIN' || currentRole === 'RH' || currentRole === 'CONTABILIDAD') {
      return employees;
    }
    const allowed = currentUser?.departmentIds || ['dept-rec'];
    return employees.filter(e => allowed.includes(e.departmentId));
  }, [employees, currentRole, currentUser]);

  const accessibleAttendance = useMemo(() => {
    if (currentRole === 'ADMIN' || currentRole === 'RH' || currentRole === 'CONTABILIDAD') {
      return attendance;
    }
    const allowed = currentUser?.departmentIds || ['dept-rec'];
    return attendance.filter(a => allowed.includes(a.departmentId));
  }, [attendance, currentRole, currentUser]);

  const isAuthorized = !!currentUser && currentUser.active;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        firebaseUser,
        authLoading,
        authError,
        currentRole,
        isAuthorized,
        loginWithGoogle,
        logout,
        switchDemoRole,
        settings,
        updateSettings,
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        positions,
        addPosition,
        updatePosition,
        deletePosition,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        schedules,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        holidays,
        addHoliday,
        updateHoliday,
        deleteHoliday,
        attendance,
        addAttendanceRecord,
        updateAttendanceRecord,
        corrections,
        requestCorrection,
        approveCorrection,
        rejectCorrection,
        vacations,
        requestVacation,
        approveVacation,
        rejectVacation,
        leaves,
        requestLeave,
        approveLeave,
        rejectLeave,
        annualBenefits,
        updateAnnualBenefit,
        payPeriods,
        activePeriod,
        addPayPeriod,
        updatePayPeriodStatus,
        payrollCalculations,
        recalculatePayroll,
        integrationConfig,
        updateIntegrationConfig,
        testBiometricConnection,
        syncBiometricsNow,
        rawEvents,
        formattedCountdown,
        secondsUntilNextSync,
        dbStats,
        refreshDatabaseStats,
        syncAllDataToFirestore,
        auditLogs,
        addAuditLog,
        authorizedUsers,
        addAuthorizedUser,
        updateAuthorizedUser,
        deleteAuthorizedUser,
        accessibleDepartments,
        accessibleEmployees,
        accessibleAttendance
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
