import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  Search, 
  Filter, 
  UserCheck, 
  AlertTriangle, 
  PlusCircle, 
  Edit, 
  CheckCircle, 
  X, 
  Cpu, 
  RefreshCw,
  Eye
} from 'lucide-react';
import { useApp } from '../services/store';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { AttendanceCalculationService } from '../services/attendanceEngine';

export const AttendanceView: React.FC<{ onRequestCorrection?: (record: AttendanceRecord) => void }> = ({ onRequestCorrection }) => {
  const { 
    accessibleAttendance, 
    accessibleDepartments, 
    accessibleEmployees, 
    schedules, 
    holidays, 
    vacations, 
    leaves, 
    addAttendanceRecord, 
    updateAttendanceRecord, 
    syncBiometricsNow,
    currentRole 
  } = useApp();

  const [selectedDate, setSelectedDate] = useState('2026-08-27');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState<{
    employeeId: string;
    date: string;
    checkIn: string;
    checkOut: string;
    notes: string;
  }>({
    employeeId: accessibleEmployees[0]?.id || '',
    date: '2026-08-27',
    checkIn: '08:00',
    checkOut: '16:30',
    notes: 'Registro manual autorizado por supervisor'
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Filtered records for the chosen date
  const filteredAttendance = useMemo(() => {
    return accessibleAttendance.filter(a => {
      const matchesDate = a.date === selectedDate;
      const matchesDept = selectedDept === 'ALL' || a.departmentId === selectedDept;
      const matchesStatus = selectedStatus === 'ALL' || a.status === selectedStatus;
      const matchesSearch = 
        !searchQuery.trim() ||
        (a.employeeName && a.employeeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.employeeNumber && a.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesDate && matchesDept && matchesStatus && matchesSearch;
    });
  }, [accessibleAttendance, selectedDate, selectedDept, selectedStatus, searchQuery]);

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = accessibleEmployees.find(emp => emp.id === manualForm.employeeId);
    if (!emp) return;

    const sch = schedules.find(s => s.id === emp.scheduleId) || schedules[0];
    const dayOfWeek = new Date(manualForm.date + 'T12:00:00').getDay();

    const calculated = AttendanceCalculationService.evaluateDailyAttendance({
      employee: emp,
      dateStr: manualForm.date,
      dayOfWeek,
      schedule: sch,
      actualCheckIn: manualForm.checkIn,
      actualCheckOut: manualForm.checkOut,
      holidays,
      approvedVacations: vacations,
      approvedLeaves: leaves
    });

    addAttendanceRecord({
      ...calculated,
      origin: 'MANUAL',
      notes: manualForm.notes || 'Registro manual por supervisor'
    });

    setShowManualModal(false);
  };

  const handleQuickSync = async () => {
    setIsSyncing(true);
    await syncBiometricsNow();
    setIsSyncing(false);
  };

  const getStatusBadge = (status: AttendanceStatus, delayMinutes: number) => {
    switch (status) {
      case 'PRESENTE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            PRESENTE
          </span>
        );
      case 'RETARDO':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            RETARDO ({delayMinutes} min)
          </span>
        );
      case 'FALTA':
      case 'SIN_REGISTRO':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            FALTA
          </span>
        );
      case 'DESCANSO':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 w-fit">
            DESCANSO
          </span>
        );
      case 'VACACIONES':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1 w-fit">
            VACACIONES
          </span>
        );
      case 'PERMISO_CON_GOCE':
      case 'PERMISO_SIN_GOCE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 w-fit">
            PERMISO
          </span>
        );
      case 'INCAPACIDAD':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1 w-fit">
            INCAPACIDAD IMSS
          </span>
        );
      case 'FESTIVO':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 w-fit">
            FESTIVO OFICIAL
          </span>
        );
      case 'CORRECCION_PENDIENTE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1 w-fit">
            CORRECCIÓN PENDIENTE
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 w-fit">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-700" />
            <span>Control de Asistencia y Checador</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro diario de checadas biométricas Hikvision, tolerancias, cálculo de retardos y turnos hoteleros
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleQuickSync}
            disabled={isSyncing}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-700 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sincronizar Biométricos</span>
          </button>

          {(currentRole === 'ADMIN' || currentRole === 'RH' || currentRole === 'GERENTE_DEPARTAMENTO') && (
            <button
              onClick={() => setShowManualModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Registro Manual</span>
            </button>
          )}
        </div>
      </div>

      {/* Date & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3 shadow-xs">
        
        {/* Date Picker */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Calendar className="w-4 h-4 text-slate-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-400 focus:outline-none cursor-pointer"
          />
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por colaborador o no. de empleado..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        {/* Department Filter */}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer w-full md:w-auto"
        >
          <option value="ALL">Todos los Departamentos</option>
          {accessibleDepartments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer w-full md:w-auto"
        >
          <option value="ALL">Todos los Estatus</option>
          <option value="PRESENTE">Presentes</option>
          <option value="RETARDO">Retardos</option>
          <option value="FALTA">Faltas</option>
          <option value="DESCANSO">Descansos</option>
          <option value="VACACIONES">Vacaciones</option>
          <option value="INCAPACIDAD">Incapacidades</option>
        </select>

      </div>

      {/* Attendance Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-3">Departamento</th>
                <th className="py-3 px-3">Horario Asignado</th>
                <th className="py-3 px-3">Entrada Real</th>
                <th className="py-3 px-3">Salida Real</th>
                <th className="py-3 px-3">Hrs Trabajadas</th>
                <th className="py-3 px-3">Estatus</th>
                <th className="py-3 px-3">Origen</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No se encontraron registros de asistencia para la fecha y filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition">
                    
                    {/* Employee Name */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 text-sm">{record.employeeName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{record.employeeNumber}</div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-3 text-slate-600 font-medium">{record.departmentName}</td>

                    {/* Scheduled Time */}
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {record.scheduledIn} - {record.scheduledOut}
                    </td>

                    {/* Actual In */}
                    <td className="py-3 px-3 font-mono">
                      {record.actualIn ? (
                        <span className={record.delayMinutes > 0 ? 'text-amber-600 font-bold' : 'text-emerald-700 font-semibold'}>
                          {record.actualIn}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">--:--</span>
                      )}
                    </td>

                    {/* Actual Out */}
                    <td className="py-3 px-3 font-mono">
                      {record.actualOut ? (
                        <span className="text-emerald-700 font-semibold">{record.actualOut}</span>
                      ) : (
                        <span className="text-slate-400 italic">--:--</span>
                      )}
                    </td>

                    {/* Worked Hours */}
                    <td className="py-3 px-3 font-mono">
                      {record.workedHours > 0 ? (
                        <span className="font-bold text-slate-900">{record.workedHours.toFixed(1)} hrs</span>
                      ) : (
                        <span className="text-slate-400">0 hrs</span>
                      )}
                      {record.overtimeHours > 0 && (
                        <span className="block text-[10px] text-blue-600 font-bold">+{record.overtimeHours}h extra</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      {getStatusBadge(record.status, record.delayMinutes)}
                    </td>

                    {/* Origin */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        record.origin === 'BIOMETRICO' 
                          ? 'bg-slate-50 text-slate-700 border-slate-300' 
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {record.origin}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      {onRequestCorrection && (
                        <button
                          onClick={() => onRequestCorrection(record)}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-md text-[11px] font-medium transition cursor-pointer"
                        >
                          Corregir
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Check-in Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-slate-700" />
                <span>Captura Manual de Asistencia</span>
              </h3>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Colaborador *</label>
                <select
                  required
                  value={manualForm.employeeId}
                  onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                >
                  {accessibleEmployees.map(e => (
                    <option key={e.id} value={e.id}>{e.fullName} ({e.employeeNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Fecha *</label>
                <input
                  type="date"
                  required
                  value={manualForm.date}
                  onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Entrada Real (HH:mm) *</label>
                  <input
                    type="time"
                    required
                    value={manualForm.checkIn}
                    onChange={(e) => setManualForm({ ...manualForm, checkIn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Salida Real (HH:mm) *</label>
                  <input
                    type="time"
                    required
                    value={manualForm.checkOut}
                    onChange={(e) => setManualForm({ ...manualForm, checkOut: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Motivo / Observaciones *</label>
                <textarea
                  rows={2}
                  required
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  placeholder="Justificación del registro manual..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold"
                >
                  Guardar Checada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
