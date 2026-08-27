import {
  AttendanceRecord,
  AttendanceStatus,
  Employee,
  WorkSchedule,
  Holiday,
  VacationRequest,
  LeaveRequest,
  SystemSettings
} from '../types';

export interface AttendanceEvaluationParams {
  employee: Employee;
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: number; // 0=Sunday, 1=Monday... 6=Saturday
  schedule: WorkSchedule;
  actualCheckIn?: string; // HH:mm
  actualCheckOut?: string; // HH:mm
  holidays: Holiday[];
  approvedVacations: VacationRequest[];
  approvedLeaves: LeaveRequest[];
  settings?: SystemSettings;
}

/**
 * Centralized Attendance Rule Engine
 * Priority hierarchy:
 * 1. Holiday (Día Festivo)
 * 2. Approved Vacations (Vacaciones)
 * 3. Approved Leave / Incapacidad (Permiso con/sin goce / Incapacidad IMSS)
 * 4. Scheduled Rest Day (Día de Descanso)
 * 5. Work Shift & Biometric Punches Evaluation (Tolerancias, Retardos, Faltas, Horas trabajadas)
 */
export class AttendanceCalculationService {
  /**
   * Evaluates and computes an attendance record for an employee on a given date.
   */
  public static evaluateDailyAttendance(params: AttendanceEvaluationParams): Omit<AttendanceRecord, 'id' | 'createdAt'> {
    const {
      employee,
      dateStr,
      dayOfWeek,
      schedule,
      actualCheckIn,
      actualCheckOut,
      holidays,
      approvedVacations,
      approvedLeaves
    } = params;

    const isRestDay = employee.restDays.includes(dayOfWeek);
    
    // 1. Check Holiday
    const holiday = holidays.find(h => h.date === dateStr && h.active);
    const isHoliday = !!holiday;

    // 2. Check Vacations
    const onVacation = approvedVacations.some(
      v => v.status === 'APROBADA' && 
      v.employeeId === employee.id && 
      dateStr >= v.startDate && 
      dateStr <= v.endDate
    );

    // 3. Check Leaves / Disabilities
    const activeLeave = approvedLeaves.find(
      l => l.status === 'APROBADA' &&
      l.employeeId === employee.id &&
      dateStr >= l.startDate &&
      dateStr <= l.endDate
    );

    // Initial Defaults
    let status: AttendanceStatus = 'SIN_REGISTRO';
    let delayMinutes = 0;
    let workedHours = 0;
    let overtimeHours = 0;
    let notes = '';

    // Step 1: Holiday Check
    if (isHoliday) {
      if (actualCheckIn && actualCheckOut) {
        // Employee worked on holiday!
        status = 'PRESENTE';
        workedHours = this.computeWorkedHours(actualCheckIn, actualCheckOut, schedule.crossesMidnight, schedule.mealDurationMinutes);
        notes = `Laboró en día festivo oficial: ${holiday?.name || 'Festivo'}`;
      } else {
        status = 'FESTIVO';
        notes = `Día Festivo: ${holiday?.name || 'Festivo oficial'}`;
      }
      return {
        employeeId: employee.id,
        employeeName: employee.fullName,
        employeeNumber: employee.employeeNumber,
        departmentId: employee.departmentId,
        departmentName: employee.departmentName,
        date: dateStr,
        scheduledIn: schedule.checkInTime,
        scheduledOut: schedule.checkOutTime,
        actualIn: actualCheckIn,
        actualOut: actualCheckOut,
        status,
        delayMinutes: 0,
        workedHours,
        overtimeHours: 0,
        isRestDay,
        isHoliday: true,
        holidayName: holiday?.name,
        origin: 'SISTEMA',
        notes
      };
    }

    // Step 2: Vacation Check
    if (onVacation) {
      return {
        employeeId: employee.id,
        employeeName: employee.fullName,
        employeeNumber: employee.employeeNumber,
        departmentId: employee.departmentId,
        departmentName: employee.departmentName,
        date: dateStr,
        scheduledIn: schedule.checkInTime,
        scheduledOut: schedule.checkOutTime,
        actualIn: actualCheckIn,
        actualOut: actualCheckOut,
        status: 'VACACIONES',
        delayMinutes: 0,
        workedHours: 0,
        overtimeHours: 0,
        isRestDay,
        isHoliday: false,
        origin: 'SISTEMA',
        notes: 'Periodo vacacional autorizado'
      };
    }

    // Step 3: Approved Leave Check
    if (activeLeave) {
      if (activeLeave.type === 'INCAPACIDAD') {
        status = 'INCAPACIDAD';
        notes = 'Incapacidad médica certificada';
      } else if (activeLeave.type === 'PERMISO_CON_GOCE') {
        status = 'PERMISO_CON_GOCE';
        notes = `Permiso con goce de sueldo: ${activeLeave.reason}`;
      } else if (activeLeave.type === 'PERMISO_SIN_GOCE') {
        status = 'PERMISO_SIN_GOCE';
        notes = `Permiso sin goce: ${activeLeave.reason}`;
      } else {
        status = 'PERMISO_CON_GOCE';
        notes = activeLeave.reason;
      }

      return {
        employeeId: employee.id,
        employeeName: employee.fullName,
        employeeNumber: employee.employeeNumber,
        departmentId: employee.departmentId,
        departmentName: employee.departmentName,
        date: dateStr,
        scheduledIn: schedule.checkInTime,
        scheduledOut: schedule.checkOutTime,
        actualIn: actualCheckIn,
        actualOut: actualCheckOut,
        status,
        delayMinutes: 0,
        workedHours: 0,
        overtimeHours: 0,
        isRestDay,
        isHoliday: false,
        origin: 'SISTEMA',
        notes
      };
    }

    // Step 4: Scheduled Rest Day
    if (isRestDay) {
      if (actualCheckIn && actualCheckOut) {
        // Worked on scheduled rest day
        status = 'PRESENTE';
        workedHours = this.computeWorkedHours(actualCheckIn, actualCheckOut, schedule.crossesMidnight, schedule.mealDurationMinutes);
        notes = 'Laboró en día de descanso programado';
      } else {
        status = 'DESCANSO';
        notes = 'Día de descanso semanal';
      }

      return {
        employeeId: employee.id,
        employeeName: employee.fullName,
        employeeNumber: employee.employeeNumber,
        departmentId: employee.departmentId,
        departmentName: employee.departmentName,
        date: dateStr,
        scheduledIn: schedule.checkInTime,
        scheduledOut: schedule.checkOutTime,
        actualIn: actualCheckIn,
        actualOut: actualCheckOut,
        status,
        delayMinutes: 0,
        workedHours,
        overtimeHours: 0,
        isRestDay: true,
        isHoliday: false,
        origin: 'SISTEMA',
        notes
      };
    }

    // Step 5: Regular Work Day Evaluation against scheduled check-in and tolerances
    if (!actualCheckIn && !actualCheckOut) {
      status = 'FALTA';
      notes = 'Ausencia / Sin registro de checador';
    } else if (actualCheckIn && !actualCheckOut) {
      status = 'SALIDA_INCOMPLETA';
      notes = 'Registro de salida pendiente o incompleto';
      delayMinutes = this.computeDelay(schedule.checkInTime, actualCheckIn);
      workedHours = Math.max(0, schedule.workHoursPerDay / 2); // Partial credit until corrected
    } else if (!actualCheckIn && actualCheckOut) {
      status = 'ENTRADA_INCOMPLETA';
      notes = 'Registro de entrada omitido';
      workedHours = Math.max(0, schedule.workHoursPerDay / 2);
    } else if (actualCheckIn && actualCheckOut) {
      delayMinutes = this.computeDelay(schedule.checkInTime, actualCheckIn);
      workedHours = this.computeWorkedHours(actualCheckIn, actualCheckOut, schedule.crossesMidnight, schedule.mealDurationMinutes);

      const tolerance = schedule.toleranceMinutes || 10;
      const delayLimit = schedule.delayLimitMinutes || 30;
      const minHours = schedule.minWorkedHoursForAttendance || 4;

      if (delayMinutes <= tolerance) {
        // Dentro de tolerancia (0 a 10 min)
        status = 'PRESENTE';
        delayMinutes = 0; // Tolerance is forgiven
      } else if (delayMinutes > tolerance && delayMinutes <= delayLimit) {
        // Retardo (11 a 30 min)
        status = 'RETARDO';
        notes = `Retardo de ${delayMinutes} min`;
      } else {
        // Pasó del límite de retardo (>30 min) o no cumplió horas mínimas
        if (workedHours < minHours) {
          status = 'FALTA';
          notes = `Falta por exceder límite de retardo (${delayMinutes} min) y horas insuficientes (${workedHours.toFixed(1)}h)`;
        } else {
          status = 'RETARDO';
          notes = `Retardo severo (${delayMinutes} min)`;
        }
      }

      // Calculate Overtime if allowed
      if (schedule.allowsOvertime && workedHours > schedule.workHoursPerDay) {
        overtimeHours = Number((workedHours - schedule.workHoursPerDay).toFixed(1));
      }
    }

    return {
      employeeId: employee.id,
      employeeName: employee.fullName,
      employeeNumber: employee.employeeNumber,
      departmentId: employee.departmentId,
      departmentName: employee.departmentName,
      date: dateStr,
      scheduledIn: schedule.checkInTime,
      scheduledOut: schedule.checkOutTime,
      actualIn: actualCheckIn,
      actualOut: actualCheckOut,
      status,
      delayMinutes,
      workedHours: Number(workedHours.toFixed(1)),
      overtimeHours,
      isRestDay: false,
      isHoliday: false,
      origin: 'BIOMETRICO',
      notes
    };
  }

  /**
   * Calculates delay in minutes between scheduled time and actual punch.
   */
  public static computeDelay(scheduledHHmm: string, actualHHmm: string): number {
    const [sH, sM] = scheduledHHmm.split(':').map(Number);
    const [aH, aM] = actualHHmm.split(':').map(Number);

    const scheduledTotal = sH * 60 + sM;
    const actualTotal = aH * 60 + aM;

    const diff = actualTotal - scheduledTotal;
    return diff > 0 ? diff : 0;
  }

  /**
   * Computes worked hours considering night shifts that cross midnight and meal time deductions.
   */
  public static computeWorkedHours(
    checkInHHmm: string, 
    checkOutHHmm: string, 
    crossesMidnight: boolean = false, 
    mealDurationMinutes: number = 0
  ): number {
    const [inH, inM] = checkInHHmm.split(':').map(Number);
    const [outH, outM] = checkOutHHmm.split(':').map(Number);

    let inMinutes = inH * 60 + inM;
    let outMinutes = outH * 60 + outM;

    if (crossesMidnight || outMinutes < inMinutes) {
      outMinutes += 24 * 60; // Add 24h for next day checkout
    }

    let totalDurationMinutes = outMinutes - inMinutes;
    if (mealDurationMinutes > 0 && totalDurationMinutes > mealDurationMinutes + 60) {
      totalDurationMinutes -= mealDurationMinutes;
    }

    return Math.max(0, totalDurationMinutes / 60);
  }

  /**
   * Calculates vacation balance per Mexican LFT (Ley Federal del Trabajo Reform)
   * Standard Mexican Scale:
   * Year 1: 12 days
   * Year 2: 14 days
   * Year 3: 16 days
   * Year 4: 18 days
   * Year 5: 20 days
   * Years 6-10: 22 days
   * Years 11-15: 24 days
   * Years 16-20: 26 days
   */
  public static calculateVacationDaysBySeniority(hireDateStr: string, currentDateStr?: string): number {
    const hire = new Date(hireDateStr);
    const now = currentDateStr ? new Date(currentDateStr) : new Date();

    let years = now.getFullYear() - hire.getFullYear();
    const monthDiff = now.getMonth() - hire.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < hire.getDate())) {
      years--;
    }

    if (years < 1) return 12; // First year grant or pro-rated
    if (years === 1) return 12;
    if (years === 2) return 14;
    if (years === 3) return 16;
    if (years === 4) return 18;
    if (years >= 5 && years <= 9) return 20;
    if (years >= 10 && years <= 14) return 22;
    if (years >= 15 && years <= 19) return 24;
    if (years >= 20 && years <= 24) return 26;
    if (years >= 25 && years <= 29) return 28;
    return 30;
  }
}
