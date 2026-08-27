import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit3, 
  Eye, 
  UserX, 
  Shield, 
  Cpu, 
  Palmtree, 
  Award, 
  Clock, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  X
} from 'lucide-react';
import { useApp } from '../services/store';
import { Employee, ContractType, EmployeeStatus, PaymentFrequency } from '../types';

export const EmployeesView: React.FC = () => {
  const { 
    accessibleEmployees, 
    departments, 
    positions, 
    schedules, 
    addEmployee, 
    updateEmployee, 
    deleteEmployee,
    currentRole 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Employee>>({
    firstName: '',
    paternalSurname: '',
    maternalSurname: '',
    fullName: '',
    email: '',
    phone: '',
    curp: '',
    rfc: '',
    nss: '',
    departmentId: '',
    positionId: '',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVO',
    contractType: 'INDETERMINADO',
    scheduleId: '',
    restDays: [0], // Default Sunday
    dailySalary: 500,
    biweeklySalary: 7500,
    monthlySalary: 15000,
    paymentType: 'QUINCENAL',
    bankName: 'BBVA México',
    clabe: '',
    biometricId: '',
    badgeNumber: '',
    facialTemplateEnrolled: true,
    fingerprintEnrolled: true,
    vacationDaysAvailable: 12,
    vacationDaysUsed: 0,
    annualBenefitsDaysAvailable: 5,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    notes: ''
  });

  const [formError, setFormError] = useState<string | null>(null);

  const canViewSalaries = currentRole === 'ADMIN' || currentRole === 'RH' || currentRole === 'CONTABILIDAD';
  const canEditEmployees = currentRole === 'ADMIN' || currentRole === 'RH';

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return accessibleEmployees.filter(emp => {
      const matchesSearch = 
        emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.biometricId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.curp && emp.curp.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDept = selectedDepartment === 'ALL' || emp.departmentId === selectedDepartment;
      const matchesStatus = selectedStatus === 'ALL' || emp.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [accessibleEmployees, searchQuery, selectedDepartment, selectedStatus]);

  const handleOpenAdd = () => {
    const nextEmpNum = `EMP-${1000 + accessibleEmployees.length + 1}`;
    const nextBioId = `BIO-${100 + accessibleEmployees.length + 1}`;
    const defaultDept = departments[0]?.id || '';
    const defaultPos = positions.find(p => p.departmentId === defaultDept)?.id || positions[0]?.id || '';
    const defaultSch = schedules[0]?.id || '';

    setEditingEmployee(null);
    setFormData({
      firstName: '',
      paternalSurname: '',
      maternalSurname: '',
      fullName: '',
      email: '',
      phone: '',
      curp: '',
      rfc: '',
      nss: '',
      employeeNumber: nextEmpNum,
      departmentId: defaultDept,
      positionId: defaultPos,
      hireDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVO',
      contractType: 'INDETERMINADO',
      scheduleId: defaultSch,
      restDays: [0], // Obligatorio
      dailySalary: 480,
      biweeklySalary: 7200,
      monthlySalary: 14400,
      paymentType: 'QUINCENAL',
      bankName: 'BBVA México',
      clabe: '',
      biometricId: nextBioId,
      badgeNumber: `BDG-${1000 + accessibleEmployees.length + 1}`,
      facialTemplateEnrolled: true,
      fingerprintEnrolled: true,
      vacationDaysAvailable: 12,
      vacationDaysUsed: 0,
      annualBenefitsDaysAvailable: 5,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      notes: ''
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({ ...emp });
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Strict Validations
    if (!formData.firstName || !formData.paternalSurname) {
      setFormError('Nombre y apellido paterno son campos obligatorios.');
      return;
    }
    if (!formData.departmentId) {
      setFormError('Debes asignar un departamento.');
      return;
    }
    if (!formData.scheduleId) {
      setFormError('Debes asignar una jornada/horario de trabajo.');
      return;
    }
    if (!formData.restDays || formData.restDays.length === 0) {
      setFormError('Es OBLIGATORIO seleccionar al menos un día de descanso semanal.');
      return;
    }
    if (!formData.biometricId) {
      setFormError('El ID de empleado en el biométrico Hikvision es obligatorio.');
      return;
    }

    const dept = departments.find(d => d.id === formData.departmentId);
    const pos = positions.find(p => p.id === formData.positionId);
    const sch = schedules.find(s => s.id === formData.scheduleId);

    const compiledFullName = `${formData.firstName.trim()} ${formData.paternalSurname.trim()} ${(formData.maternalSurname || '').trim()}`.trim();

    const empPayload: any = {
      ...formData,
      fullName: compiledFullName,
      departmentName: dept?.name || 'General',
      positionName: pos?.name || 'Colaborador',
      scheduleName: sch?.name || 'Horario Estándar',
      dailySalary: Number(formData.dailySalary || 0),
      biweeklySalary: Number((formData.dailySalary || 0) * 15),
      monthlySalary: Number((formData.dailySalary || 0) * 30),
      vacationDaysAvailable: Number(formData.vacationDaysAvailable || 12),
      annualBenefitsDaysAvailable: Number(formData.annualBenefitsDaysAvailable || 5)
    };

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, empPayload);
    } else {
      addEmployee(empPayload);
    }

    setShowModal(false);
  };

  const toggleRestDay = (dayIdx: number) => {
    const current = formData.restDays || [];
    if (current.includes(dayIdx)) {
      if (current.length === 1) {
        setFormError('El colaborador debe tener al menos un día de descanso asignado.');
        return;
      }
      setFormData({ ...formData, restDays: current.filter(d => d !== dayIdx) });
    } else {
      setFormData({ ...formData, restDays: [...current, dayIdx].sort() });
    }
  };

  const getDayName = (dayIdx: number) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[dayIdx];
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-700" />
            <span>Expediente de Colaboradores</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Padrón activo, contratos, turnos, descansos y vinculación con biométricos Hikvision
          </p>
        </div>

        {canEditEmployees && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Colaborador</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, no. empleado, RFC, CURP o ID biométrico..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
          >
            <option value="ALL">Todos los Departamentos</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
          >
            <option value="ALL">Todos los Estatus</option>
            <option value="ACTIVO">Activos</option>
            <option value="VACACIONES">En Vacaciones</option>
            <option value="INCAPACIDAD">Incapacidad IMSS</option>
            <option value="BAJA">Bajas</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-3">Departamento / Puesto</th>
                <th className="py-3 px-3">Jornada / Descanso</th>
                <th className="py-3 px-3">ID Biométrico</th>
                {canViewSalaries && <th className="py-3 px-3">Salario Diario</th>}
                <th className="py-3 px-3">Vacaciones Disp.</th>
                <th className="py-3 px-3">Estatus</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                  {/* Photo & Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        {emp.photoUrl ? (
                          <img src={emp.photoUrl} alt={emp.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-700">
                            {emp.firstName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{emp.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                          <span>{emp.employeeNumber}</span>
                          <span>•</span>
                          <span>Ingreso: {emp.hireDate}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Dept & Position */}
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-900">{emp.departmentName}</div>
                    <div className="text-[11px] text-slate-500">{emp.positionName}</div>
                  </td>

                  {/* Schedule & Rest Days */}
                  <td className="py-3 px-3">
                    <div className="text-slate-700 font-mono text-[11px]">{emp.scheduleName}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] text-slate-500">Descanso:</span>
                      {emp.restDays.map(d => (
                        <span key={d} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-300">
                          {getDayName(d)}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Biometric ID & status */}
                  <td className="py-3 px-3">
                    <div className="font-mono font-semibold text-slate-900">{emp.biometricId}</div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                      <Cpu className="w-3 h-3 text-slate-600" />
                      <span>{emp.facialTemplateEnrolled ? 'Rostro Enrolado' : 'Tarjeta/Huella'}</span>
                    </div>
                  </td>

                  {/* Salary (Protected) */}
                  {canViewSalaries && (
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                      ${emp.dailySalary?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  )}

                  {/* Vacation Balance */}
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                      {emp.vacationDaysAvailable} días
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    {emp.status === 'ACTIVO' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ACTIVO
                      </span>
                    )}
                    {emp.status === 'VACACIONES' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                        VACACIONES
                      </span>
                    )}
                    {emp.status === 'INCAPACIDAD' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                        INCAPACIDAD
                      </span>
                    )}
                    {emp.status === 'BAJA' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        BAJA
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewingEmployee(emp)}
                        title="Ver Expediente Completo"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {canEditEmployees && (
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          title="Editar Colaborador"
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl text-slate-800">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-700" />
                <span>{editingEmployee ? 'Editar Colaborador' : 'Alta de Nuevo Colaborador'}</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              {/* Personal Data Section */}
              <div className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                1. Datos Personales
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Nombre(s) *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-400 focus:outline-none"
                    placeholder="Ej. Juan Manuel"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Apellido Paterno *</label>
                  <input
                    type="text"
                    required
                    value={formData.paternalSurname || ''}
                    onChange={(e) => setFormData({ ...formData, paternalSurname: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-400 focus:outline-none"
                    placeholder="Ej. Gómez"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Apellido Materno</label>
                  <input
                    type="text"
                    value={formData.maternalSurname || ''}
                    onChange={(e) => setFormData({ ...formData, maternalSurname: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-400 focus:outline-none"
                    placeholder="Ej. Morales"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">No. Empleado *</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeNumber || ''}
                    onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    placeholder="empleado@hotelplayaroyale.com"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    placeholder="998-000-0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">CURP</label>
                  <input
                    type="text"
                    value={formData.curp || ''}
                    onChange={(e) => setFormData({ ...formData, curp: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                    placeholder="18 caracteres"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">RFC</label>
                  <input
                    type="text"
                    value={formData.rfc || ''}
                    onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                    placeholder="13 caracteres"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">NSS (IMSS)</label>
                  <input
                    type="text"
                    value={formData.nss || ''}
                    onChange={(e) => setFormData({ ...formData, nss: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                    placeholder="11 dígitos"
                  />
                </div>
              </div>

              {/* Department & Position */}
              <div className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] pt-2 pb-1 border-b border-slate-200">
                2. Adscripción, Turno y Descansos Obligatorios
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Departamento *</label>
                  <select
                    required
                    value={formData.departmentId || ''}
                    onChange={(e) => {
                      const deptId = e.target.value;
                      const matchedPos = positions.find(p => p.departmentId === deptId);
                      setFormData({ ...formData, departmentId: deptId, positionId: matchedPos?.id || '' });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="">Selecciona Departamento</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Puesto *</label>
                  <select
                    required
                    value={formData.positionId || ''}
                    onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="">Selecciona Puesto</option>
                    {positions
                      .filter(p => !formData.departmentId || p.departmentId === formData.departmentId)
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Jornada / Horario *</label>
                  <select
                    required
                    value={formData.scheduleId || ''}
                    onChange={(e) => setFormData({ ...formData, scheduleId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="">Selecciona Jornada</option>
                    {schedules.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.checkInTime} a {s.checkOutTime})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Fecha de Ingreso</label>
                  <input
                    type="date"
                    required
                    value={formData.hireDate || ''}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Mandatory Rest Days Selection */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Días de Descanso Semanal (OBLIGATORIO) *
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Selecciona el día o días fijos de descanso para que el sistema no marque faltas indebidas.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Domingo (0)', 'Lunes (1)', 'Martes (2)', 'Miércoles (3)', 'Jueves (4)', 'Viernes (5)', 'Sábado (6)'].map((name, idx) => {
                    const isSelected = (formData.restDays || []).includes(idx);
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => toggleRestDay(idx)}
                        className={`px-3 py-1.5 rounded-lg font-medium text-xs transition cursor-pointer border ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Biometric Integration Data */}
              <div className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] pt-2 pb-1 border-b border-slate-200">
                3. Vinculación con Reloj Biométrico Hikvision
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ID de Empleado en Biométrico *</label>
                  <input
                    type="text"
                    required
                    value={formData.biometricId || ''}
                    onChange={(e) => setFormData({ ...formData, biometricId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                    placeholder="Ej. BIO-101"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">No. Tarjeta / Tag RFID</label>
                  <input
                    type="text"
                    value={formData.badgeNumber || ''}
                    onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                    placeholder="Ej. CRD-1001"
                  />
                </div>
              </div>

              {/* Salaries (Only if authorized role) */}
              {canViewSalaries && (
                <>
                  <div className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] pt-2 pb-1 border-b border-slate-200">
                    4. Salarios y Datos Bancarios (Confidencial)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Salario Diario (MXN) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.dailySalary || ''}
                        onChange={(e) => {
                          const daily = parseFloat(e.target.value) || 0;
                          setFormData({
                            ...formData,
                            dailySalary: daily,
                            biweeklySalary: daily * 15,
                            monthlySalary: daily * 30
                          });
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Banco</label>
                      <input
                        type="text"
                        value={formData.bankName || ''}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                        placeholder="Ej. BBVA México"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">CLABE Interbancaria</label>
                      <input
                        type="text"
                        value={formData.clabe || ''}
                        onChange={(e) => setFormData({ ...formData, clabe: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                        placeholder="18 dígitos"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  {editingEmployee ? 'Guardar Cambios' : 'Registrar Colaborador'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* View Employee Dossier Modal */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-xl text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Expediente del Colaborador</h3>
              <button onClick={() => setViewingEmployee(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border border-slate-300">
                {viewingEmployee.photoUrl ? (
                  <img src={viewingEmployee.photoUrl} alt={viewingEmployee.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-700">
                    {viewingEmployee.firstName.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{viewingEmployee.fullName}</h4>
                <p className="text-xs text-slate-500">{viewingEmployee.employeeNumber} • {viewingEmployee.positionName}</p>
                <p className="text-xs text-slate-700 font-semibold">{viewingEmployee.departmentName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Jornada Asignada</span>
                <span className="font-medium text-slate-900">{viewingEmployee.scheduleName}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Día(s) de Descanso</span>
                <span className="font-medium text-slate-900">
                  {viewingEmployee.restDays.map(d => getDayName(d)).join(', ')}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">ID Biométrico Hikvision</span>
                <span className="font-mono font-bold text-slate-900">{viewingEmployee.biometricId}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Vacaciones Disponibles</span>
                <span className="font-bold text-sky-700">{viewingEmployee.vacationDaysAvailable} días</span>
              </div>
            </div>

            {canViewSalaries && (
              <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-600 block font-semibold mb-1">Información Salarial y Bancaria (Confidencial)</span>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div>Salario Diario: <span className="text-slate-900 font-bold">${viewingEmployee.dailySalary} MXN</span></div>
                  <div>Quincenal: <span className="text-slate-900 font-bold">${viewingEmployee.biweeklySalary} MXN</span></div>
                  <div>Banco: <span className="text-slate-700">{viewingEmployee.bankName || 'N/A'}</span></div>
                  <div>CLABE: <span className="text-slate-700">{viewingEmployee.clabe || 'N/A'}</span></div>
                </div>
              </div>
            )}

            <div className="mt-5 text-right">
              <button
                onClick={() => setViewingEmployee(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
