import {
  Department,
  Position,
  Employee,
  WorkSchedule,
  Holiday,
  AttendanceRecord,
  PayPeriod,
  VacationRequest,
  LeaveRequest,
  AnnualBenefit,
  IntegrationConfig,
  UserProfile,
  AuditLog,
  SystemSettings
} from '../types';

export const INITIAL_SETTINGS: SystemSettings = {
  companyName: 'Operadora Hotelera del Caribe S.A. de C.V.',
  legalName: 'Operadora Hotelera del Caribe S.A. de C.V.',
  rfc: 'OHC180422K98',
  address: 'Blvd. Kukulcán Km 14.5, Zona Hotelera, Cancún, Quintana Roo, C.P. 77500',
  phone: '+52 (998) 881-2300',
  email: 'rh@hotelplayaroyale.com',
  website: 'https://hotelplayaroyale.com',
  logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=160&auto=format&fit=crop&q=80',
  brandColor: '#7c3aed', // Elegant Lilac / Royal Violet
  timezone: 'America/Cancun',
  dateFormat: 'DD/MM/YYYY',
  currency: 'MXN ($)',
  hotelName: 'Grand Playa Resort & Spa Cancún',
  branchName: 'Complejo Cancún Zona Hotelera',
  defaultToleranceMinutes: 10,
  defaultDelayLimitMinutes: 30,
  defaultAbsenceLimitMinutes: 31,
  minWorkedHoursForAttendance: 4,
  vacationScale: [
    { yearsOfSeniority: 1, entitledDays: 12 },
    { yearsOfSeniority: 2, entitledDays: 14 },
    { yearsOfSeniority: 3, entitledDays: 16 },
    { yearsOfSeniority: 4, entitledDays: 18 },
    { yearsOfSeniority: 5, entitledDays: 20 },
    { yearsOfSeniority: 10, entitledDays: 22 },
    { yearsOfSeniority: 15, entitledDays: 24 },
    { yearsOfSeniority: 20, entitledDays: 26 },
    { yearsOfSeniority: 25, entitledDays: 28 },
    { yearsOfSeniority: 30, entitledDays: 30 }
  ]
};

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-rec', name: 'Recepción y Front Desk', code: 'REC', description: 'Atención al huésped, check-in, check-out y concierge', color: '#0284c7', active: true, employeeCount: 4 },
  { id: 'dept-ama', name: 'Ama de Llaves y Habitaciones', code: 'AMA', description: 'Limpieza de habitaciones, lavandería y áreas públicas', color: '#ec4899', active: true, employeeCount: 5 },
  { id: 'dept-ayb', name: 'Alimentos y Bebidas', code: 'AYB', description: 'Cocina internacional, restaurantes de especialidad y bares', color: '#f59e0b', active: true, employeeCount: 5 },
  { id: 'dept-man', name: 'Mantenimiento y Servicios', code: 'MAN', description: 'Mantenimiento preventivo, electromecánica y albercas', color: '#10b981', active: true, employeeCount: 3 },
  { id: 'dept-seg', name: 'Seguridad y Auditoría', code: 'SEG', description: 'Seguridad patrimonial, control de accesos y auditoría nocturna', color: '#6366f1', active: true, employeeCount: 3 }
];

export const INITIAL_POSITIONS: Position[] = [
  { id: 'pos-1', name: 'Gerente de Recepción', departmentId: 'dept-rec', departmentName: 'Recepción y Front Desk', level: 'Gerencial', baseSalarySuggested: 950, active: true },
  { id: 'pos-2', name: 'Supervisor de Recepción', departmentId: 'dept-rec', departmentName: 'Recepción y Front Desk', level: 'Supervisión', baseSalarySuggested: 650, active: true },
  { id: 'pos-3', name: 'Recepcionista Bilingüe', departmentId: 'dept-rec', departmentName: 'Recepción y Front Desk', level: 'Operativo', baseSalarySuggested: 480, active: true },
  { id: 'pos-4', name: 'Concierge VIP', departmentId: 'dept-rec', departmentName: 'Recepción y Front Desk', level: 'Operativo', baseSalarySuggested: 500, active: true },
  
  { id: 'pos-5', name: 'Gerente de Ama de Llaves', departmentId: 'dept-ama', departmentName: 'Ama de Llaves y Habitaciones', level: 'Gerencial', baseSalarySuggested: 900, active: true },
  { id: 'pos-6', name: 'Supervisora de Pisos', departmentId: 'dept-ama', departmentName: 'Ama de Llaves y Habitaciones', level: 'Supervisión', baseSalarySuggested: 580, active: true },
  { id: 'pos-7', name: 'Camarista', departmentId: 'dept-ama', departmentName: 'Ama de Llaves y Habitaciones', level: 'Operativo', baseSalarySuggested: 390, active: true },
  { id: 'pos-8', name: 'Operador de Lavandería', departmentId: 'dept-ama', departmentName: 'Ama de Llaves y Habitaciones', level: 'Operativo', baseSalarySuggested: 380, active: true },

  { id: 'pos-9', name: 'Chef Ejecutivo', departmentId: 'dept-ayb', departmentName: 'Alimentos y Bebidas', level: 'Gerencial', baseSalarySuggested: 1200, active: true },
  { id: 'pos-10', name: 'Sous Chef', departmentId: 'dept-ayb', departmentName: 'Alimentos y Bebidas', level: 'Supervisión', baseSalarySuggested: 750, active: true },
  { id: 'pos-11', name: 'Cocinero A', departmentId: 'dept-ayb', departmentName: 'Alimentos y Bebidas', level: 'Operativo', baseSalarySuggested: 480, active: true },
  { id: 'pos-12', name: 'Capitán de Meseros', departmentId: 'dept-ayb', departmentName: 'Alimentos y Bebidas', level: 'Supervisión', baseSalarySuggested: 550, active: true },
  { id: 'pos-13', name: 'Mesero / Bartender', departmentId: 'dept-ayb', departmentName: 'Alimentos y Bebidas', level: 'Operativo', baseSalarySuggested: 400, active: true },

  { id: 'pos-14', name: 'Jefe de Mantenimiento', departmentId: 'dept-man', departmentName: 'Mantenimiento y Servicios', level: 'Gerencial', baseSalarySuggested: 950, active: true },
  { id: 'pos-15', name: 'Técnico Electromecánico', departmentId: 'dept-man', departmentName: 'Mantenimiento y Servicios', level: 'Operativo', baseSalarySuggested: 520, active: true },
  { id: 'pos-16', name: 'Técnico de Refrigeración y Climas', departmentId: 'dept-man', departmentName: 'Mantenimiento y Servicios', level: 'Operativo', baseSalarySuggested: 510, active: true },

  { id: 'pos-17', name: 'Jefe de Seguridad', departmentId: 'dept-seg', departmentName: 'Seguridad y Auditoría', level: 'Gerencial', baseSalarySuggested: 880, active: true },
  { id: 'pos-18', name: 'Guardia de Seguridad', departmentId: 'dept-seg', departmentName: 'Seguridad y Auditoría', level: 'Operativo', baseSalarySuggested: 420, active: true },
  { id: 'pos-19', name: 'Auditor Nocturno', departmentId: 'dept-seg', departmentName: 'Seguridad y Auditoría', level: 'Operativo', baseSalarySuggested: 560, active: true }
];

export const INITIAL_SCHEDULES: WorkSchedule[] = [
  {
    id: 'sch-matutino',
    name: 'Turno Matutino (08:00 - 16:30)',
    code: 'MAT-08',
    description: 'Jornada diurna estándar de 8 horas con 30 min de comida',
    shiftType: 'DIURNA',
    checkInTime: '08:00',
    checkOutTime: '16:30',
    crossesMidnight: false,
    workHoursPerDay: 8,
    toleranceMinutes: 10,
    delayLimitMinutes: 30,
    absenceLimitMinutes: 31,
    earlyDepartureToleranceMinutes: 10,
    mealDurationMinutes: 30,
    allowsOvertime: true,
    minWorkedHoursForAttendance: 4,
    color: '#0284c7',
    active: true
  },
  {
    id: 'sch-vespertino',
    name: 'Turno Vespertino (14:00 - 22:30)',
    code: 'VES-14',
    description: 'Jornada mixta de tarde-noche',
    shiftType: 'MIXTA',
    checkInTime: '14:00',
    checkOutTime: '22:30',
    crossesMidnight: false,
    workHoursPerDay: 8,
    toleranceMinutes: 10,
    delayLimitMinutes: 30,
    absenceLimitMinutes: 31,
    earlyDepartureToleranceMinutes: 10,
    mealDurationMinutes: 30,
    allowsOvertime: true,
    minWorkedHoursForAttendance: 4,
    color: '#f59e0b',
    active: true
  },
  {
    id: 'sch-nocturno',
    name: 'Turno Nocturno (22:00 - 06:00)',
    code: 'NOC-22',
    description: 'Jornada nocturna que cruza medianoche (Seguridad y Auditoría)',
    shiftType: 'NOCTURNA',
    checkInTime: '22:00',
    checkOutTime: '06:00',
    crossesMidnight: true,
    workHoursPerDay: 7.5,
    toleranceMinutes: 10,
    delayLimitMinutes: 30,
    absenceLimitMinutes: 31,
    earlyDepartureToleranceMinutes: 10,
    mealDurationMinutes: 30,
    allowsOvertime: true,
    minWorkedHoursForAttendance: 3.5,
    color: '#6366f1',
    active: true
  },
  {
    id: 'sch-rotativo',
    name: 'Turno Rotativo Hotelero',
    code: 'ROT-01',
    description: 'Rotación semanal entre matutino y vespertino según ocupación',
    shiftType: 'ROTATIVA',
    checkInTime: '08:00',
    checkOutTime: '16:30',
    crossesMidnight: false,
    workHoursPerDay: 8,
    toleranceMinutes: 10,
    delayLimitMinutes: 30,
    absenceLimitMinutes: 31,
    earlyDepartureToleranceMinutes: 10,
    mealDurationMinutes: 30,
    allowsOvertime: true,
    minWorkedHoursForAttendance: 4,
    color: '#10b981',
    active: true
  }
];

export const INITIAL_HOLIDAYS_2026: Holiday[] = [
  { id: 'hol-1', date: '2026-01-01', name: 'Año Nuevo', isMandatoryRest: true, specialCompensationRate: 2, active: true },
  { id: 'hol-2', date: '2026-02-02', name: 'Día de la Constitución Mexicana (Conmemoración)', isMandatoryRest: true, specialCompensationRate: 2, active: true },
  { id: 'hol-3', date: '2026-03-16', name: 'Natalicio de Benito Juárez (Conmemoración)', isMandatoryRest: true, specialCompensationRate: 2, active: true },
  { id: 'hol-4', date: '2026-05-01', name: 'Día del Trabajo', isMandatoryRest: true, specialCompensationRate: 2, active: true },
  { id: 'hol-5', date: '2026-09-16', name: 'Día de la Independencia de México', isMandatoryRest: true, specialCompensationRate: 2, active: true },
  { id: 'hol-6', date: '2026-11-16', name: 'Revolución Mexicana (Conmemoración)', isMandatoryRest: true, specialCompensationRate: 2, active: true },
  { id: 'hol-7', date: '2026-12-25', name: 'Navidad', isMandatoryRest: true, specialCompensationRate: 2, active: true }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  // 1. Recepción
  {
    id: 'emp-101',
    employeeNumber: 'EMP-1001',
    firstName: 'Alejandro',
    paternalSurname: 'Mendoza',
    maternalSurname: 'Solís',
    fullName: 'Alejandro Mendoza Solís',
    email: 'a.mendoza@hotelplayaroyale.com',
    phone: '998-123-4501',
    curp: 'MESA880415HQRNLL01',
    rfc: 'MESA8804153A2',
    nss: '12889201948',
    departmentId: 'dept-rec',
    departmentName: 'Recepción y Front Desk',
    positionId: 'pos-1',
    positionName: 'Gerente de Recepción',
    hireDate: '2021-03-15',
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: 'sch-matutino',
    scheduleName: 'Turno Matutino (08:00 - 16:30)',
    restDays: [0], // Domingo
    dailySalary: 950,
    biweeklySalary: 14250,
    monthlySalary: 28500,
    paymentType: 'QUINCENAL',
    bankName: 'BBVA México',
    clabe: '012691001234567890',
    accountNumber: '1234567890',
    biometricId: 'BIO-101',
    badgeNumber: 'BDG-1001',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 16,
    vacationDaysUsed: 4,
    annualBenefitsDaysAvailable: 5,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2021-03-15T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'emp-102',
    employeeNumber: 'EMP-1002',
    firstName: 'Sofia',
    paternalSurname: 'Castillo',
    maternalSurname: 'Lara',
    fullName: 'Sofia Castillo Lara',
    email: 's.castillo@hotelplayaroyale.com',
    phone: '998-123-4502',
    curp: 'CALS920620MQRNRA04',
    rfc: 'CALS9206204B3',
    departmentId: 'dept-rec',
    departmentName: 'Recepción y Front Desk',
    positionId: 'pos-2',
    positionName: 'Supervisor de Recepción',
    hireDate: '2022-06-01',
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: 'sch-vespertino',
    scheduleName: 'Turno Vespertino (14:00 - 22:30)',
    restDays: [1], // Lunes
    dailySalary: 650,
    biweeklySalary: 9750,
    monthlySalary: 19500,
    paymentType: 'QUINCENAL',
    bankName: 'Santander',
    clabe: '014691009876543210',
    biometricId: 'BIO-102',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 14,
    vacationDaysUsed: 2,
    annualBenefitsDaysAvailable: 4,
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2022-06-01T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'emp-103',
    employeeNumber: 'EMP-1003',
    firstName: 'Carlos',
    paternalSurname: 'Navarro',
    maternalSurname: 'Rios',
    fullName: 'Carlos Navarro Rios',
    email: 'c.navarro@hotelplayaroyale.com',
    phone: '998-123-4503',
    departmentId: 'dept-rec',
    departmentName: 'Recepción y Front Desk',
    positionId: 'pos-3',
    positionName: 'Recepcionista Bilingüe',
    hireDate: '2024-01-10',
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: 'sch-matutino',
    scheduleName: 'Turno Matutino (08:00 - 16:30)',
    restDays: [2], // Martes
    dailySalary: 480,
    biweeklySalary: 7200,
    monthlySalary: 14400,
    paymentType: 'QUINCENAL',
    bankName: 'Banorte',
    biometricId: 'BIO-103',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 12,
    vacationDaysUsed: 0,
    annualBenefitsDaysAvailable: 5,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'emp-104',
    employeeNumber: 'EMP-1004',
    firstName: 'Mariana',
    paternalSurname: 'Vega',
    maternalSurname: 'Ortiz',
    fullName: 'Mariana Vega Ortiz',
    email: 'm.vega@hotelplayaroyale.com',
    phone: '998-123-4504',
    departmentId: 'dept-rec',
    departmentName: 'Recepción y Front Desk',
    positionId: 'pos-4',
    positionName: 'Concierge VIP',
    hireDate: '2023-08-15',
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: 'sch-matutino',
    restDays: [3], // Miércoles
    dailySalary: 500,
    biweeklySalary: 7500,
    monthlySalary: 15000,
    paymentType: 'QUINCENAL',
    bankName: 'BBVA México',
    biometricId: 'BIO-104',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 14,
    vacationDaysUsed: 3,
    annualBenefitsDaysAvailable: 5,
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2023-08-15T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },

  // 2. Ama de Llaves
  {
    id: 'emp-105',
    employeeNumber: 'EMP-1005',
    firstName: 'Guadalupe',
    paternalSurname: 'Hernández',
    maternalSurname: 'Pérez',
    fullName: 'Guadalupe Hernández Pérez',
    email: 'g.hernandez@hotelplayaroyale.com',
    phone: '998-123-4505',
    departmentId: 'dept-ama',
    departmentName: 'Ama de Llaves y Habitaciones',
    positionId: 'pos-5',
    positionName: 'Gerente de Ama de Llaves',
    hireDate: '2019-05-10',
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: 'sch-matutino',
    restDays: [0], // Domingo
    dailySalary: 900,
    biweeklySalary: 13500,
    monthlySalary: 27000,
    paymentType: 'QUINCENAL',
    bankName: 'Citibanamex',
    biometricId: 'BIO-105',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 22,
    vacationDaysUsed: 6,
    annualBenefitsDaysAvailable: 5,
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    createdAt: '2019-05-10T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'emp-106',
    employeeNumber: 'EMP-1006',
    firstName: 'Rosa',
    paternalSurname: 'Jiménez',
    maternalSurname: 'Cruz',
    fullName: 'Rosa Jiménez Cruz',
    email: 'r.jimenez@hotelplayaroyale.com',
    phone: '998-123-4506',
    departmentId: 'dept-ama',
    departmentName: 'Ama de Llaves y Habitaciones',
    positionId: 'pos-6',
    positionName: 'Supervisora de Pisos',
    hireDate: '2022-02-14',
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: 'sch-matutino',
    restDays: [1], // Lunes
    dailySalary: 580,
    biweeklySalary: 8700,
    monthlySalary: 17400,
    paymentType: 'QUINCENAL',
    bankName: 'BBVA México',
    biometricId: 'BIO-106',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 16,
    vacationDaysUsed: 4,
    annualBenefitsDaysAvailable: 3,
    photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    createdAt: '2022-02-14T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'emp-107',
    employeeNumber: 'EMP-1007',
    firstName: 'Carmen',
    paternalSurname: 'Sánchez',
    maternalSurname: 'Gómez',
    fullName: 'Carmen Sánchez Gómez',
    email: 'c.sanchez@hotelplayaroyale.com',
    phone: '998-123-4507',
    departmentId: 'dept-ama',
    departmentName: 'Ama de Llaves y Habitaciones',
    positionId: 'pos-7',
    positionName: 'Camarista',
    hireDate: '2023-11-01',
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: 'sch-matutino',
    restDays: [2], // Martes
    dailySalary: 390,
    biweeklySalary: 5850,
    monthlySalary: 11700,
    paymentType: 'QUINCENAL',
    bankName: 'Banco Azteca',
    biometricId: 'BIO-107',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 12,
    vacationDaysUsed: 0,
    annualBenefitsDaysAvailable: 5,
    photoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2023-11-01T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'emp-108',
    employeeNumber: 'EMP-1008',
    firstName: 'María Elena',
    paternalSurname: 'Torres',
    maternalSurname: 'López',
    fullName: 'María Elena Torres López',
    email: 'm.torres@hotelplayaroyale.com',
    phone: '998-123-4508',
    departmentId: 'dept-ama',
    departmentName: 'Ama de Llaves y Habitaciones',
    positionId: 'pos-7',
    positionName: 'Camarista',
    hireDate: '2024-03-20',
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: 'sch-matutino',
    restDays: [3], // Miércoles
    dailySalary: 390,
    biweeklySalary: 5850,
    monthlySalary: 11700,
    paymentType: 'QUINCENAL',
    bankName: 'HSBC',
    biometricId: 'BIO-108',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 12,
    vacationDaysUsed: 2,
    annualBenefitsDaysAvailable: 4,
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-03-20T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'emp-109',
    employeeNumber: 'EMP-1009',
    firstName: 'Pedro',
    paternalSurname: 'Ramírez',
    maternalSurname: 'Morales',
    fullName: 'Pedro Ramírez Morales',
    email: 'p.ramirez@hotelplayaroyale.com',
    phone: '998-123-4509',
    departmentId: 'dept-ama',
    departmentName: 'Ama de Llaves y Habitaciones',
    positionId: 'pos-8',
    positionName: 'Operador de Lavandería',
    hireDate: '2023-01-15',
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: 'sch-rotativo',
    restDays: [4], // Jueves
    dailySalary: 380,
    biweeklySalary: 5700,
    monthlySalary: 11400,
    paymentType: 'QUINCENAL',
    bankName: 'Banorte',
    biometricId: 'BIO-109',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 14,
    vacationDaysUsed: 5,
    annualBenefitsDaysAvailable: 3,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2023-01-15T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },

  // 3. Alimentos y Bebidas
  {
    id: 'emp-110',
    employeeNumber: 'EMP-1010',
    firstName: 'Gaston',
    paternalSurname: 'Valenzuela',
    maternalSurname: 'García',
    fullName: 'Gaston Valenzuela García',
    email: 'g.valenzuela@hotelplayaroyale.com',
    phone: '998-123-4510',
    departmentId: 'dept-ayb',
    departmentName: 'Alimentos y Bebidas',
    positionId: 'pos-9',
    positionName: 'Chef Ejecutivo',
    hireDate: '2020-02-01',
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: 'sch-matutino',
    restDays: [0], // Domingo
    dailySalary: 1200,
    biweeklySalary: 18000,
    monthlySalary: 36000,
    paymentType: 'QUINCENAL',
    bankName: 'Scotiabank',
    biometricId: 'BIO-110',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 20,
    vacationDaysUsed: 5,
    annualBenefitsDaysAvailable: 5,
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    createdAt: '2020-02-01T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'emp-111',
    employeeNumber: 'EMP-1011',
    firstName: 'Ignacio',
    paternalSurname: 'Corona',
    maternalSurname: 'Díaz',
    fullName: 'Ignacio Corona Díaz',
    email: 'i.corona@hotelplayaroyale.com',
    phone: '998-123-4511',
    departmentId: 'dept-ayb',
    departmentName: 'Alimentos y Bebidas',
    positionId: 'pos-10',
    positionName: 'Sous Chef',
    hireDate: '2021-09-01',
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: 'sch-vespertino',
    restDays: [1], // Lunes
    dailySalary: 750,
    biweeklySalary: 11250,
    monthlySalary: 22500,
    paymentType: 'QUINCENAL',
    bankName: 'BBVA México',
    biometricId: 'BIO-111',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 16,
    vacationDaysUsed: 2,
    annualBenefitsDaysAvailable: 5,
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    createdAt: '2021-09-01T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'emp-112',
    employeeNumber: 'EMP-1012',
    firstName: 'Fernando',
    paternalSurname: 'Acosta',
    maternalSurname: 'Silva',
    fullName: 'Fernando Acosta Silva',
    email: 'f.acosta@hotelplayaroyale.com',
    phone: '998-123-4512',
    departmentId: 'dept-ayb',
    departmentName: 'Alimentos y Bebidas',
    positionId: 'pos-11',
    positionName: 'Cocinero A',
    hireDate: '2023-04-10',
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: 'sch-matutino',
    restDays: [2], // Martes
    dailySalary: 480,
    biweeklySalary: 7200,
    monthlySalary: 14400,
    paymentType: 'QUINCENAL',
    bankName: 'Citibanamex',
    biometricId: 'BIO-112',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 14,
    vacationDaysUsed: 0,
    annualBenefitsDaysAvailable: 4,
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    createdAt: '2023-04-10T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'emp-113',
    employeeNumber: 'EMP-1013',
    firstName: 'Rodrigo',
    paternalSurname: 'Montes',
    maternalSurname: 'Cárdenas',
    fullName: 'Rodrigo Montes Cárdenas',
    email: 'r.montes@hotelplayaroyale.com',
    phone: '998-123-4513',
    departmentId: 'dept-ayb',
    departmentName: 'Alimentos y Bebidas',
    positionId: 'pos-12',
    positionName: 'Capitán de Meseros',
    hireDate: '2022-10-15',
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: 'sch-vespertino',
    restDays: [3], // Miércoles
    dailySalary: 550,
    biweeklySalary: 8250,
    monthlySalary: 16500,
    paymentType: 'QUINCENAL',
    bankName: 'Santander',
    biometricId: 'BIO-113',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 14,
    vacationDaysUsed: 4,
    annualBenefitsDaysAvailable: 5,
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2022-10-15T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'emp-114',
    employeeNumber: 'EMP-1014',
    firstName: 'Daniela',
    paternalSurname: 'Pacheco',
    maternalSurname: 'Bravo',
    fullName: 'Daniela Pacheco Bravo',
    email: 'd.pacheco@hotelplayaroyale.com',
    phone: '998-123-4514',
    departmentId: 'dept-ayb',
    departmentName: 'Alimentos y Bebidas',
    positionId: 'pos-13',
    positionName: 'Mesero / Bartender',
    hireDate: '2024-02-01',
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: 'sch-vespertino',
    restDays: [4], // Jueves
    dailySalary: 400,
    biweeklySalary: 6000,
    monthlySalary: 12000,
    paymentType: 'QUINCENAL',
    bankName: 'Banorte',
    biometricId: 'BIO-114',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 12,
    vacationDaysUsed: 0,
    annualBenefitsDaysAvailable: 5,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },

  // 4. Mantenimiento
  {
    id: 'emp-115',
    employeeNumber: 'EMP-1015',
    firstName: 'Esteban',
    paternalSurname: 'Guerrero',
    maternalSurname: 'Ruiz',
    fullName: 'Esteban Guerrero Ruiz',
    email: 'e.guerrero@hotelplayaroyale.com',
    phone: '998-123-4515',
    departmentId: 'dept-man',
    departmentName: 'Mantenimiento y Servicios',
    positionId: 'pos-14',
    positionName: 'Jefe de Mantenimiento',
    hireDate: '2020-08-01',
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: 'sch-matutino',
    restDays: [0], // Domingo
    dailySalary: 950,
    biweeklySalary: 14250,
    monthlySalary: 28500,
    paymentType: 'QUINCENAL',
    bankName: 'BBVA México',
    biometricId: 'BIO-115',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 20,
    vacationDaysUsed: 6,
    annualBenefitsDaysAvailable: 5,
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2020-08-01T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'emp-116',
    employeeNumber: 'EMP-1016',
    firstName: 'Jorge',
    paternalSurname: 'Cabrera',
    maternalSurname: 'Flores',
    fullName: 'Jorge Cabrera Flores',
    email: 'j.cabrera@hotelplayaroyale.com',
    phone: '998-123-4516',
    departmentId: 'dept-man',
    departmentName: 'Mantenimiento y Servicios',
    positionId: 'pos-15',
    positionName: 'Técnico Electromecánico',
    hireDate: '2022-07-15',
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: 'sch-matutino',
    restDays: [1], // Lunes
    dailySalary: 520,
    biweeklySalary: 7800,
    monthlySalary: 15600,
    paymentType: 'QUINCENAL',
    bankName: 'Citibanamex',
    biometricId: 'BIO-116',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 14,
    vacationDaysUsed: 2,
    annualBenefitsDaysAvailable: 3,
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    createdAt: '2022-07-15T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'emp-117',
    employeeNumber: 'EMP-1017',
    firstName: 'Mauricio',
    paternalSurname: 'Salazar',
    maternalSurname: 'Luna',
    fullName: 'Mauricio Salazar Luna',
    email: 'm.salazar@hotelplayaroyale.com',
    phone: '998-123-4517',
    departmentId: 'dept-man',
    departmentName: 'Mantenimiento y Servicios',
    positionId: 'pos-16',
    positionName: 'Técnico de Refrigeración y Climas',
    hireDate: '2023-03-01',
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: 'sch-vespertino',
    restDays: [2], // Martes
    dailySalary: 510,
    biweeklySalary: 7650,
    monthlySalary: 15300,
    paymentType: 'QUINCENAL',
    bankName: 'Santander',
    biometricId: 'BIO-117',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 14,
    vacationDaysUsed: 0,
    annualBenefitsDaysAvailable: 5,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2023-03-01T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },

  // 5. Seguridad y Auditoría Nocturna
  {
    id: 'emp-118',
    employeeNumber: 'EMP-1018',
    firstName: 'Vicente',
    paternalSurname: 'Delgado',
    maternalSurname: 'Reyes',
    fullName: 'Vicente Delgado Reyes',
    email: 'v.delgado@hotelplayaroyale.com',
    phone: '998-123-4518',
    departmentId: 'dept-seg',
    departmentName: 'Seguridad y Auditoría',
    positionId: 'pos-17',
    positionName: 'Jefe de Seguridad',
    hireDate: '2021-01-10',
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: 'sch-matutino',
    restDays: [0], // Domingo
    dailySalary: 880,
    biweeklySalary: 13200,
    monthlySalary: 26400,
    paymentType: 'QUINCENAL',
    bankName: 'BBVA México',
    biometricId: 'BIO-118',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 16,
    vacationDaysUsed: 4,
    annualBenefitsDaysAvailable: 5,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2021-01-10T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'emp-119',
    employeeNumber: 'EMP-1019',
    firstName: 'Arturo',
    paternalSurname: 'Medina',
    maternalSurname: 'Vargas',
    fullName: 'Arturo Medina Vargas',
    email: 'a.medina@hotelplayaroyale.com',
    phone: '998-123-4519',
    departmentId: 'dept-seg',
    departmentName: 'Seguridad y Auditoría',
    positionId: 'pos-18',
    positionName: 'Guardia de Seguridad',
    hireDate: '2023-09-01',
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: 'sch-nocturno',
    scheduleName: 'Turno Nocturno (22:00 - 06:00)',
    restDays: [3], // Miércoles
    dailySalary: 420,
    biweeklySalary: 6300,
    monthlySalary: 12600,
    paymentType: 'QUINCENAL',
    bankName: 'Banorte',
    biometricId: 'BIO-119',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 12,
    vacationDaysUsed: 0,
    annualBenefitsDaysAvailable: 5,
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    createdAt: '2023-09-01T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'emp-120',
    employeeNumber: 'EMP-1020',
    firstName: 'Gonzalo',
    paternalSurname: 'Benítez',
    maternalSurname: 'Fuentes',
    fullName: 'Gonzalo Benítez Fuentes',
    email: 'g.benitez@hotelplayaroyale.com',
    phone: '998-123-4520',
    departmentId: 'dept-seg',
    departmentName: 'Seguridad y Auditoría',
    positionId: 'pos-19',
    positionName: 'Auditor Nocturno',
    hireDate: '2022-11-15',
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: 'sch-nocturno',
    scheduleName: 'Turno Nocturno (22:00 - 06:00)',
    restDays: [4], // Jueves
    dailySalary: 560,
    biweeklySalary: 8400,
    monthlySalary: 16800,
    paymentType: 'QUINCENAL',
    bankName: 'Santander',
    biometricId: 'BIO-120',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 14,
    vacationDaysUsed: 4,
    annualBenefitsDaysAvailable: 5,
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    createdAt: '2022-11-15T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  }
];

export const INITIAL_PAY_PERIODS: PayPeriod[] = [
  {
    id: 'period-2026-q16',
    code: '2026-Q16',
    name: '2da Quincena Agosto 2026 (16 Días)',
    startDate: '2026-08-16',
    endDate: '2026-08-31',
    daysCount: 16,
    year: 2026,
    periodNumber: 16,
    status: 'ABIERTO',
    createdAt: '2026-08-15T12:00:00Z'
  },
  {
    id: 'period-2026-q15',
    code: '2026-Q15',
    name: '1ra Quincena Agosto 2026 (15 Días)',
    startDate: '2026-08-01',
    endDate: '2026-08-15',
    daysCount: 15,
    year: 2026,
    periodNumber: 15,
    status: 'CERRADO',
    createdAt: '2026-07-31T12:00:00Z',
    closedAt: '2026-08-16T18:30:00Z',
    closedBy: 'admin@hotelplayaroyale.com'
  }
];

export const INITIAL_VACATION_REQUESTS: VacationRequest[] = [
  {
    id: 'vac-1',
    employeeId: 'emp-105',
    employeeName: 'Guadalupe Hernández Pérez',
    departmentId: 'dept-ama',
    startDate: '2026-08-24',
    endDate: '2026-08-29',
    returnDate: '2026-08-31',
    daysRequested: 6,
    status: 'APROBADA',
    requestedAt: '2026-08-10T09:00:00Z',
    authorizedBy: 'Lic. Ana López (RH)',
    authorizedAt: '2026-08-11T14:30:00Z',
    reason: 'Vacaciones de aniversario anual'
  },
  {
    id: 'vac-2',
    employeeId: 'emp-113',
    employeeName: 'Rodrigo Montes Cárdenas',
    departmentId: 'dept-ayb',
    startDate: '2026-09-01',
    endDate: '2026-09-05',
    returnDate: '2026-09-07',
    daysRequested: 5,
    status: 'PENDIENTE',
    requestedAt: '2026-08-22T11:15:00Z',
    reason: 'Asuntos familiares programados'
  }
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'leave-1',
    employeeId: 'emp-108',
    employeeName: 'María Elena Torres López',
    departmentId: 'dept-ama',
    type: 'INCAPACIDAD',
    startDate: '2026-08-26',
    endDate: '2026-08-28',
    daysCount: 3,
    reason: 'Incapacidad médica por esguince de tobillo IMSS Folio #492819',
    status: 'APROBADA',
    requestedBy: 'María Elena Torres López',
    authorizedBy: 'Lic. Ana López (RH)',
    authorizedAt: '2026-08-26T08:30:00Z',
    createdAt: '2026-08-26T08:00:00Z'
  },
  {
    id: 'leave-2',
    employeeId: 'emp-103',
    employeeName: 'Carlos Navarro Rios',
    departmentId: 'dept-rec',
    type: 'PERMISO_CON_GOCE',
    startDate: '2026-08-20',
    endDate: '2026-08-20',
    daysCount: 1,
    reason: 'Trámite de titulación universitaria',
    status: 'APROBADA',
    requestedBy: 'Carlos Navarro Rios',
    authorizedBy: 'Alejandro Mendoza (Gerente Recepción)',
    authorizedAt: '2026-08-19T16:00:00Z',
    createdAt: '2026-08-18T10:00:00Z'
  }
];

export const INITIAL_ANNUAL_BENEFITS: AnnualBenefit[] = INITIAL_EMPLOYEES.map(emp => ({
  id: `ben-${emp.id}`,
  employeeId: emp.id,
  employeeName: emp.fullName,
  benefitName: 'Días de Permiso con Goce Anual (Económicos)',
  description: 'Días con goce de sueldo para trámites personales o emergencias familiares',
  annualAllowanceDays: 5,
  usedDays: emp.id === 'emp-103' ? 1 : 0,
  remainingDays: emp.id === 'emp-103' ? 4 : 5,
  periodYear: 2026,
  renewalDate: '2027-01-01'
}));

export const INITIAL_INTEGRATION_CONFIG: IntegrationConfig = {
  id: 'int-hik-01',
  provider: 'HikCentral',
  name: 'Servidor HikCentral Professional Cancún',
  serverUrl: '192.168.10.20',
  port: 443,
  useHttps: true,
  username: 'admin_artemis_api',
  tokenOrPasswordMasked: '••••••••••••••••',
  apiKey: 'artemis_k8y_99218274a7b',
  systemId: 'HIK-HOTEL-CANCUN-01',
  syncIntervalMinutes: 120, // 2 horas de sincronización automática periódica
  autoSync: true,
  lastSyncTimestamp: new Date().toISOString(),
  lastSyncStatus: 'SUCCESS',
  lastSyncEventsCount: 342,
  localAgentToken: 'agt_sec_8849102948123984',
  active: true
};

export const INITIAL_AUTHORIZED_USERS: UserProfile[] = [
  {
    uid: 'user-admin-alopez',
    email: 'alopez@playaassoc.com',
    displayName: 'Lic. Ana López',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'ADMIN',
    active: true,
    firstLoginAt: '2026-01-01T08:00:00Z',
    lastLoginAt: new Date().toISOString()
  },
  {
    uid: 'user-rh-martinez',
    email: 'rh@hotelplayaroyale.com',
    displayName: 'Carlos Martínez (Coord. RH)',
    role: 'RH',
    active: true,
    firstLoginAt: '2026-02-01T08:00:00Z'
  },
  {
    uid: 'user-conta-herrera',
    email: 'contabilidad@hotelplayaroyale.com',
    displayName: 'C.P. Lorena Herrera',
    role: 'CONTABILIDAD',
    active: true,
    firstLoginAt: '2026-03-01T08:00:00Z'
  },
  {
    uid: 'user-gerente-rec',
    email: 'a.mendoza@hotelplayaroyale.com',
    displayName: 'Alejandro Mendoza (Gerente Recepción)',
    role: 'GERENTE_DEPARTAMENTO',
    departmentIds: ['dept-rec'],
    active: true,
    firstLoginAt: '2026-03-15T08:00:00Z'
  },
  {
    uid: 'user-gerente-ama',
    email: 'g.hernandez@hotelplayaroyale.com',
    displayName: 'Guadalupe Hernández (Gerente Ama de Llaves)',
    role: 'GERENTE_DEPARTAMENTO',
    departmentIds: ['dept-ama'],
    active: true,
    firstLoginAt: '2026-03-15T08:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    userId: 'user-admin-alopez',
    userEmail: 'alopez@playaassoc.com',
    userRole: 'ADMIN',
    action: 'SYNC',
    module: 'Integraciones Biométricas',
    recordId: 'int-hik-01',
    recordDescription: 'Sincronización automática de eventos HikCentral',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: 'aud-2',
    userId: 'user-admin-alopez',
    userEmail: 'alopez@playaassoc.com',
    userRole: 'ADMIN',
    action: 'APPROVE',
    module: 'Vacaciones',
    recordId: 'vac-1',
    recordDescription: 'Aprobación de 6 días de vacaciones para Guadalupe Hernández',
    timestamp: '2026-08-11T14:30:00Z'
  },
  {
    id: 'aud-3',
    userId: 'user-gerente-rec',
    userEmail: 'a.mendoza@hotelplayaroyale.com',
    userRole: 'GERENTE_DEPARTAMENTO',
    action: 'CORRECT',
    module: 'Asistencia',
    recordId: 'rec-emp-103-2026-08-18',
    recordDescription: 'Corrección de entrada omitida para Carlos Navarro (08:00)',
    previousValue: { actualIn: null },
    newValue: { actualIn: '08:00', reason: 'Falla temporal en terminal biométrica de lobby' },
    timestamp: '2026-08-18T11:20:00Z'
  }
];

/**
 * Generates sample attendance records for the current pay period
 */
export function generateSampleAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const period = INITIAL_PAY_PERIODS[0]; // 2026-08-16 to 2026-08-31
  const todayStr = '2026-08-27';

  INITIAL_EMPLOYEES.forEach((emp) => {
    // Generate records for each day of current pay period up to today
    for (let day = 16; day <= 27; day++) {
      const dateStr = `2026-08-${day < 10 ? '0' + day : day}`;
      const dateObj = new Date(dateStr + 'T12:00:00');
      const dayOfWeek = dateObj.getDay();
      const isRestDay = emp.restDays.includes(dayOfWeek);

      const recordId = `att-${emp.id}-${dateStr}`;

      // Check vacation for emp-105 (Guadalupe Hernández 24 to 29 Aug)
      if (emp.id === 'emp-105' && day >= 24 && day <= 29) {
        records.push({
          id: recordId,
          employeeId: emp.id,
          employeeName: emp.fullName,
          employeeNumber: emp.employeeNumber,
          departmentId: emp.departmentId,
          departmentName: emp.departmentName,
          date: dateStr,
          scheduledIn: '08:00',
          scheduledOut: '16:30',
          status: 'VACACIONES',
          delayMinutes: 0,
          workedHours: 0,
          overtimeHours: 0,
          isRestDay: false,
          isHoliday: false,
          origin: 'SISTEMA',
          notes: 'Vacaciones programadas',
          createdAt: dateStr + 'T00:00:00Z'
        });
        continue;
      }

      // Check leave for emp-108 (María Elena Torres Incapacidad 26 to 28 Aug)
      if (emp.id === 'emp-108' && (day === 26 || day === 27)) {
        records.push({
          id: recordId,
          employeeId: emp.id,
          employeeName: emp.fullName,
          employeeNumber: emp.employeeNumber,
          departmentId: emp.departmentId,
          departmentName: emp.departmentName,
          date: dateStr,
          scheduledIn: '08:00',
          scheduledOut: '16:30',
          status: 'INCAPACIDAD',
          delayMinutes: 0,
          workedHours: 0,
          overtimeHours: 0,
          isRestDay: false,
          isHoliday: false,
          origin: 'SISTEMA',
          notes: 'Incapacidad médica IMSS',
          createdAt: dateStr + 'T00:00:00Z'
        });
        continue;
      }

      // Check Rest Day
      if (isRestDay) {
        records.push({
          id: recordId,
          employeeId: emp.id,
          employeeName: emp.fullName,
          employeeNumber: emp.employeeNumber,
          departmentId: emp.departmentId,
          departmentName: emp.departmentName,
          date: dateStr,
          scheduledIn: '08:00',
          scheduledOut: '16:30',
          status: 'DESCANSO',
          delayMinutes: 0,
          workedHours: 0,
          overtimeHours: 0,
          isRestDay: true,
          isHoliday: false,
          origin: 'SISTEMA',
          notes: 'Día de descanso asignado',
          createdAt: dateStr + 'T00:00:00Z'
        });
        continue;
      }

      // Regular day punch simulation
      // Introduce realistic variations (some delays, 1 absence on emp-112 on day 21, some overtime)
      let status: any = 'PRESENTE';
      let actualIn = '07:55';
      let actualOut = '16:32';
      let delayMinutes = 0;
      let workedHours = 8;
      let overtimeHours = 0;
      let notes = 'Registro biométrico facial normal';

      if (emp.id === 'emp-103' && (day === 17 || day === 24)) {
        // Delay 18 min
        status = 'RETARDO';
        actualIn = '08:18';
        delayMinutes = 18;
        notes = 'Retardo registrado (18 min)';
      } else if (emp.id === 'emp-107' && day === 25) {
        // Delay 14 min
        status = 'RETARDO';
        actualIn = '08:14';
        delayMinutes = 14;
        notes = 'Retardo registrado (14 min)';
      } else if (emp.id === 'emp-112' && day === 21) {
        // Falta
        status = 'FALTA';
        actualIn = undefined as any;
        actualOut = undefined as any;
        workedHours = 0;
        notes = 'Falta injustificada / Sin checada';
      } else if (emp.id === 'emp-119' || emp.id === 'emp-120') {
        // Night shift 22:00 -> 06:00
        actualIn = '21:55';
        actualOut = '06:02';
        workedHours = 7.5;
        notes = 'Turno nocturno completado';
      } else if (emp.id === 'emp-115' && day === 22) {
        // Overtime 2 hours in maintenance
        actualIn = '07:50';
        actualOut = '18:35';
        workedHours = 10;
        overtimeHours = 2;
        notes = 'Tiempo extra autorizado por reparación de chillers';
      }

      records.push({
        id: recordId,
        employeeId: emp.id,
        employeeName: emp.fullName,
        employeeNumber: emp.employeeNumber,
        departmentId: emp.departmentId,
        departmentName: emp.departmentName,
        date: dateStr,
        scheduledIn: emp.scheduleId === 'sch-nocturno' ? '22:00' : '08:00',
        scheduledOut: emp.scheduleId === 'sch-nocturno' ? '06:00' : '16:30',
        actualIn,
        actualOut,
        status,
        delayMinutes,
        workedHours,
        overtimeHours,
        isRestDay: false,
        isHoliday: false,
        origin: 'BIOMETRICO',
        notes,
        createdAt: dateStr + 'T08:00:00Z'
      });
    }
  });

  return records;
}
