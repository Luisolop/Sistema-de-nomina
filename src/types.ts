/**
 * Types and Interfaces for Hotel HR, Attendance, and Payroll System
 */

export type UserRole = 'ADMIN' | 'RH' | 'CONTABILIDAD' | 'GERENTE_DEPARTAMENTO';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  departmentIds?: string[]; // Allowed departments for GERENTE_DEPARTAMENTO
  active: boolean;
  firstLoginAt?: string;
  lastLoginAt?: string;
  phone?: string;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  module: 'employees' | 'attendance' | 'schedules' | 'vacations' | 'leaves' | 'payroll' | 'reports' | 'integrations' | 'settings' | 'audit';
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  managerId?: string; // Employee or User ID
  color?: string;
  active: boolean;
  employeeCount?: number;
}

export interface Position {
  id: string;
  name: string;
  departmentId: string;
  departmentName?: string;
  level?: string;
  baseSalarySuggested?: number;
  active: boolean;
}

export type PaymentFrequency = 'QUINCENAL' | 'SEMANAL' | 'MENSUAL';
export type EmployeeStatus = 'ACTIVO' | 'INACTIVO' | 'BAJA' | 'SUSPENDIDO' | 'VACACIONES' | 'INCAPACIDAD';
export type ContractType = 'INDETERMINADO' | 'DETERMINADO' | 'TEMPORAL' | 'EVENTUAL';

export interface Employee {
  id: string;
  employeeNumber: string; // e.g. EMP-1001
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  fullName: string;
  email: string;
  phone: string;
  curp?: string;
  rfc?: string;
  nss?: string; // IMSS number
  departmentId: string;
  departmentName?: string;
  positionId: string;
  positionName?: string;
  immediateSupervisorId?: string;
  managerName?: string;
  hireDate: string; // YYYY-MM-DD
  terminationDate?: string;
  status: EmployeeStatus;
  contractType: ContractType;
  
  // Schedule and shift
  scheduleId: string;
  scheduleName?: string;
  restDays: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  hasRotatingSchedule?: boolean;
  
  // Sensitive financial data (protected by permissions)
  dailySalary: number;
  biweeklySalary: number;
  monthlySalary: number;
  paymentType: PaymentFrequency;
  bankName?: string;
  clabe?: string;
  accountNumber?: string;
  
  // Biometric device mapping
  biometricId: string; // ID assigned in Hikvision / HikCentral device
  badgeNumber?: string;
  facialTemplateEnrolled?: boolean;
  fingerprintEnrolled?: boolean;
  
  // Balances
  vacationDaysAvailable: number;
  vacationDaysUsed: number;
  annualBenefitsDaysAvailable: number;
  
  photoUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ShiftType = 'DIURNA' | 'MIXTA' | 'NOCTURNA' | 'ROTATIVA' | 'PERSONALIZADA';

export interface WorkSchedule {
  id: string;
  name: string;
  code: string;
  description: string;
  shiftType: ShiftType;
  checkInTime: string; // HH:mm (e.g., "08:00")
  checkOutTime: string; // HH:mm (e.g., "16:30")
  crossesMidnight: boolean; // For shifts like 22:00 -> 06:00
  workHoursPerDay: number;
  toleranceMinutes: number; // e.g. 10 min
  delayLimitMinutes: number; // e.g. 30 min (between 11 and 30 is delay, after is absence)
  absenceLimitMinutes: number; // e.g. >30 min counts as absence
  earlyDepartureToleranceMinutes: number;
  mealDurationMinutes: number;
  allowsOvertime: boolean;
  minWorkedHoursForAttendance: number; // minimum hours to validate a day
  color?: string;
  active: boolean;
}

export interface DailyScheduleConfig {
  dayOfWeek: number; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  dayName: string;
  isRestDay: boolean;
  scheduleId?: string;
  customCheckIn?: string;
  customCheckOut?: string;
}

export interface ScheduleAssignment {
  id: string;
  employeeId: string;
  scheduleId: string;
  restDays: number[]; // Mandatory selection
  rotationType: 'FIJO' | 'SEMANAL' | 'QUINCENAL' | 'MENSUAL' | 'CALENDARIO';
  effectiveFrom: string; // YYYY-MM-DD
  effectiveTo?: string; // YYYY-MM-DD
  dailyConfigs?: DailyScheduleConfig[];
  rotationScheduleIds?: string[]; // IDs for rotating shifts
}

export type AttendanceStatus =
  | 'PRESENTE'
  | 'RETARDO'
  | 'FALTA'
  | 'FALTA_JUSTIFICADA'
  | 'DESCANSO'
  | 'VACACIONES'
  | 'PERMISO_CON_GOCE'
  | 'PERMISO_SIN_GOCE'
  | 'INCAPACIDAD'
  | 'FESTIVO'
  | 'SIN_REGISTRO'
  | 'ENTRADA_INCOMPLETA'
  | 'SALIDA_INCOMPLETA'
  | 'CORRECCION_PENDIENTE'
  | 'CORRECCION_APROBADA';

export type AttendanceOrigin = 'BIOMETRICO' | 'MANUAL' | 'CORRECCION' | 'SISTEMA';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  employeeNumber?: string;
  departmentId: string;
  departmentName?: string;
  date: string; // YYYY-MM-DD
  scheduledIn: string; // HH:mm
  scheduledOut: string; // HH:mm
  actualIn?: string; // HH:mm
  actualOut?: string; // HH:mm
  status: AttendanceStatus;
  delayMinutes: number;
  workedHours: number;
  overtimeHours: number;
  isRestDay: boolean;
  isHoliday: boolean;
  holidayName?: string;
  origin: AttendanceOrigin;
  notes?: string;
  hasCorrection?: boolean;
  correctionId?: string;
  rawCheckInTimestamp?: string;
  rawCheckOutTimestamp?: string;
  deviceId?: string;
  modifiedBy?: string;
  modifiedAt?: string;
  createdAt: string;
}

export interface AttendanceCorrection {
  id: string;
  recordId: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  date: string; // YYYY-MM-DD
  originalIn?: string;
  originalOut?: string;
  newIn: string;
  newOut: string;
  reason: string;
  status: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  requestedBy: string;
  requestedByEmail: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  notes?: string;
}

export type RawEventProvider = 'HikCentral' | 'HikConnect' | 'LocalAgent' | 'CSV' | 'Manual';

export interface RawAttendanceEvent {
  id: string;
  provider: RawEventProvider;
  deviceId: string;
  deviceName?: string;
  externalEmployeeId: string; // The ID sent by device
  timestamp: string; // ISO datetime
  eventType: 'CHECK_IN' | 'CHECK_OUT' | 'ACCESS_GRANTED' | 'DOOR_OPEN';
  verificationMode?: 'FACE' | 'FINGERPRINT' | 'CARD' | 'PIN' | 'OTHER';
  rawPayload: Record<string, any>;
  receivedAt: string;
  processed: boolean;
  processedAt?: string;
  matchedEmployeeId?: string;
  error?: string;
  hash: string; // Idempotency hash to prevent duplicates
}

export interface VacationPolicy {
  yearsOfSeniority: number;
  entitledDays: number; // e.g. 1 year = 12 days under Mexico LFT Reform
}

export interface VacationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  daysRequested: number;
  status: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA';
  requestedAt: string;
  authorizedBy?: string;
  authorizedAt?: string;
  notes?: string;
  reason?: string;
}

export type LeaveType =
  | 'PERMISO_CON_GOCE'
  | 'PERMISO_SIN_GOCE'
  | 'PERMISO_ESPECIAL'
  | 'PERMISO_PERSONAL'
  | 'PERMISO_MEDICO'
  | 'INCAPACIDAD'
  | 'COMISION_TRABAJO'
  | 'PATERNIDAD'
  | 'MATERNIDAD'
  | 'DEFUNCION';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  daysCount: number;
  reason: string;
  notes?: string;
  documentUrl?: string; // IMSS receipt or medical note
  status: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA';
  requestedBy: string;
  authorizedBy?: string;
  authorizedAt?: string;
  createdAt: string;
}

export interface AnnualBenefit {
  id: string;
  employeeId: string;
  employeeName?: string;
  benefitName: string; // e.g., "Días de Permiso con Goce Anual"
  description?: string;
  annualAllowanceDays: number;
  usedDays: number;
  remainingDays: number;
  periodYear: number;
  renewalDate: string; // YYYY-MM-DD
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  isMandatoryRest: boolean; // Conforme al Art. 74 LFT
  specialCompensationRate?: number; // e.g., 2x or 3x for worked holiday
  active: boolean;
  notes?: string;
}

export type PayPeriodStatus = 'ABIERTO' | 'REVISION' | 'AUTORIZADO' | 'CERRADO';

export interface PayPeriod {
  id: string;
  code: string; // e.g. "2026-Q16"
  name: string; // "1ra Quincena Agosto 2026"
  startDate: string; // 2026-08-01
  endDate: string; // 2026-08-15 or 2026-08-16
  daysCount: number; // 15 or 16 days
  year: number;
  periodNumber: number;
  status: PayPeriodStatus;
  createdAt: string;
  closedAt?: string;
  closedBy?: string;
}

export interface PayrollItem {
  id: string;
  periodId: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  departmentId: string;
  departmentName: string;
  positionName: string;
  
  // Base numbers
  dailySalary: number;
  periodDays: number; // 15 or 16
  
  // Attendance metrics
  workedDays: number;
  restDays: number;
  holidayDays: number;
  vacationDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  absencesCount: number;
  delaysCount: number;
  totalDelayMinutes: number;
  totalWorkedHours: number;
  overtimeHours: number;
  
  // Calculated money concepts
  baseGrossSalary: number; // dailySalary * periodDays
  absenceDeductions: number; // dailySalary * absencesCount
  delayDeductions: number;
  unpaidLeaveDeductions: number;
  holidayPremiumPay: number; // Extra for working on official holiday
  overtimePay: number;
  otherAdjustments: number;
  
  // Totals
  totalPerceptions: number;
  totalDeductions: number;
  calculatedNetPrenomina: number;
  
  status: 'CALCULADO' | 'REVISADO' | 'AUTORIZADO';
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface IntegrationConfig {
  id: string;
  provider: 'HikCentral' | 'HikConnect' | 'LocalAgent' | 'Manual';
  name: string;
  serverUrl: string; // IP or domain of HikCentral / API Server
  port: number;
  useHttps: boolean;
  username: string;
  tokenOrPasswordMasked: string;
  apiKey?: string;
  systemId?: string;
  syncIntervalMinutes: number;
  autoSync: boolean;
  lastSyncTimestamp?: string;
  lastSyncStatus: 'SUCCESS' | 'ERROR' | 'IDLE' | 'SYNCING';
  lastSyncEventsCount?: number;
  lastErrorMessage?: string;
  localAgentToken?: string;
  active: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'CORRECT' | 'SYNC' | 'CLOSE_PERIOD';
  module: string;
  recordId: string;
  recordDescription?: string;
  previousValue?: any;
  newValue?: any;
  timestamp: string;
  ipAddress?: string;
}

export interface SystemSettings {
  companyName: string;
  legalName: string;
  rfc: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  brandColor?: string;
  timezone: string; // e.g. "America/Cancun" or "America/Mexico_City"
  dateFormat: string;
  currency: string;
  
  // Hotel info
  hotelName: string;
  branchName: string;
  
  // Attendance defaults
  defaultToleranceMinutes: number; // 10
  defaultDelayLimitMinutes: number; // 30
  defaultAbsenceLimitMinutes: number; // 31+
  minWorkedHoursForAttendance: number; // 4
  
  // Vacation legal reform (LFT México)
  vacationScale: VacationPolicy[];
}

export interface BiometricSyncLog {
  id: string;
  timestamp: string;
  provider: string;
  serverUrl: string;
  eventsFetched: number;
  newEventsSaved: number;
  status: 'SUCCESS' | 'ERROR' | 'PARTIAL';
  message: string;
  durationMs?: number;
  initiatedBy: string; // 'AUTO_CRON' | 'MANUAL_USER' | 'LOCAL_AGENT'
}

export interface FirestoreDbStats {
  databaseId: string;
  isConnected: boolean;
  rawEventsCount: number;
  attendanceRecordsCount: number;
  employeesCount: number;
  syncLogsCount: number;
  lastDbWriteTime?: string;
}
