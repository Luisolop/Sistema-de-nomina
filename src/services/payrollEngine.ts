import {
  AttendanceRecord,
  Employee,
  PayrollItem,
  PayPeriod
} from '../types';

export class PayrollCalculationService {
  /**
   * Calculates detailed pre-payroll (prenómina) for a given employee and pay period.
   */
  public static calculateEmployeePayroll(
    employee: Employee,
    period: PayPeriod,
    attendanceRecords: AttendanceRecord[]
  ): PayrollItem {
    // Filter records for this employee within the period range
    const records = attendanceRecords.filter(
      r => r.employeeId === employee.id &&
      r.date >= period.startDate &&
      r.date <= period.endDate
    );

    let workedDays = 0;
    let restDays = 0;
    let holidayDays = 0;
    let vacationDays = 0;
    let paidLeaveDays = 0;
    let unpaidLeaveDays = 0;
    let absencesCount = 0;
    let delaysCount = 0;
    let totalDelayMinutes = 0;
    let totalWorkedHours = 0;
    let overtimeHours = 0;
    let workedOnHolidayDays = 0;

    for (const record of records) {
      if (record.status === 'PRESENTE') {
        workedDays++;
        totalWorkedHours += record.workedHours || 0;
        overtimeHours += record.overtimeHours || 0;
        if (record.isHoliday) {
          workedOnHolidayDays++;
        }
      } else if (record.status === 'RETARDO') {
        workedDays++; // Still counted as worked day, but has delay minutes
        delaysCount++;
        totalDelayMinutes += record.delayMinutes || 0;
        totalWorkedHours += record.workedHours || 0;
        overtimeHours += record.overtimeHours || 0;
      } else if (record.status === 'DESCANSO') {
        restDays++;
      } else if (record.status === 'FESTIVO') {
        holidayDays++;
      } else if (record.status === 'VACACIONES') {
        vacationDays++;
      } else if (record.status === 'PERMISO_CON_GOCE') {
        paidLeaveDays++;
      } else if (record.status === 'PERMISO_SIN_GOCE') {
        unpaidLeaveDays++;
      } else if (record.status === 'INCAPACIDAD') {
        paidLeaveDays++; // Handled via IMSS/Company policy
      } else if (record.status === 'FALTA' || record.status === 'FALTA_JUSTIFICADA' || record.status === 'SIN_REGISTRO') {
        absencesCount++;
      } else if (record.status === 'ENTRADA_INCOMPLETA' || record.status === 'SALIDA_INCOMPLETA') {
        // Partial day until verified
        workedDays += 0.5;
        delaysCount++;
        totalWorkedHours += record.workedHours || 0;
      }
    }

    const periodDays = period.daysCount;
    const dailySalary = employee.dailySalary || (employee.biweeklySalary ? employee.biweeklySalary / 15 : 450);
    const hourlyRate = dailySalary / 8;

    // Base gross salary for the whole period
    const baseGrossSalary = Number((dailySalary * periodDays).toFixed(2));

    // Deductions
    const absenceDeductions = Number((dailySalary * absencesCount).toFixed(2));
    const unpaidLeaveDeductions = Number((dailySalary * unpaidLeaveDays).toFixed(2));
    
    // Delay deduction: 3 retardos = 1 día de descuento O proporcional si excede 60 min
    let delayDeductions = 0;
    if (delaysCount >= 3) {
      const penaltyDays = Math.floor(delaysCount / 3);
      delayDeductions = Number((penaltyDays * dailySalary).toFixed(2));
    }

    // Extra payments
    // Extra pay for working on official holiday (LFT Art. 75: salario doble adicional)
    const holidayPremiumPay = Number((workedOnHolidayDays * dailySalary * 2).toFixed(2));
    
    // Overtime pay (double rate for standard overtime)
    const overtimePay = Number((overtimeHours * hourlyRate * 2).toFixed(2));

    const totalPerceptions = Number((baseGrossSalary + holidayPremiumPay + overtimePay).toFixed(2));
    const totalDeductions = Number((absenceDeductions + unpaidLeaveDeductions + delayDeductions).toFixed(2));
    const calculatedNetPrenomina = Number(Math.max(0, totalPerceptions - totalDeductions).toFixed(2));

    return {
      id: `calc-${period.id}-${employee.id}`,
      periodId: period.id,
      employeeId: employee.id,
      employeeName: employee.fullName,
      employeeNumber: employee.employeeNumber,
      departmentId: employee.departmentId,
      departmentName: employee.departmentName || 'General',
      positionName: employee.positionName || 'Colaborador',
      dailySalary,
      periodDays,
      workedDays,
      restDays,
      holidayDays,
      vacationDays,
      paidLeaveDays,
      unpaidLeaveDays,
      absencesCount,
      delaysCount,
      totalDelayMinutes,
      totalWorkedHours: Number(totalWorkedHours.toFixed(1)),
      overtimeHours: Number(overtimeHours.toFixed(1)),
      baseGrossSalary,
      absenceDeductions,
      delayDeductions,
      unpaidLeaveDeductions,
      holidayPremiumPay,
      overtimePay,
      otherAdjustments: 0,
      totalPerceptions,
      totalDeductions,
      calculatedNetPrenomina,
      status: 'CALCULADO'
    };
  }

  /**
   * Calculates payroll items for all employees in the given pay period.
   */
  public static calculateAllPayroll(
    employees: Employee[],
    period: PayPeriod,
    attendanceRecords: AttendanceRecord[]
  ): PayrollItem[] {
    return employees
      .filter(e => e.status === 'ACTIVO' || e.status === 'VACACIONES')
      .map(emp => this.calculateEmployeePayroll(emp, period, attendanceRecords));
  }
}
