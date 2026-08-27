import React, { useState } from 'react';
import { 
  Palmtree, 
  PlusCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  FileCheck, 
  TrendingUp, 
  Award,
  X,
  Sparkles
} from 'lucide-react';
import { useApp } from '../services/store';
import { VacationRequest } from '../types';

export const VacationsView: React.FC = () => {
  const { 
    vacations, 
    accessibleEmployees, 
    accessibleDepartments, 
    requestVacation, 
    approveVacation, 
    rejectVacation, 
    settings, 
    currentRole, 
    currentUser 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployeeForLedger, setSelectedEmployeeForLedger] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    employeeId: accessibleEmployees[0]?.id || '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    returnDate: new Date().toISOString().split('T')[0],
    reason: '',
    notes: ''
  });

  const canAuthorize = currentRole === 'ADMIN' || currentRole === 'RH';

  const filteredVacations = vacations.filter(v => {
    const matchesSearch = v.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || v.departmentId === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = accessibleEmployees.find(e => e.id === formData.employeeId);
    if (!emp) return;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysRequested = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    requestVacation({
      employeeId: emp.id,
      employeeName: emp.fullName,
      departmentId: emp.departmentId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      returnDate: formData.returnDate,
      daysRequested,
      reason: formData.reason,
      notes: formData.notes
    });

    setShowModal(false);
    setFormData({
      employeeId: accessibleEmployees[0]?.id || '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      returnDate: new Date().toISOString().split('T')[0],
      reason: '',
      notes: ''
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Palmtree className="w-5 h-5 text-slate-700" />
            <span>Módulo de Vacaciones y Tabulador LFT (Reforma 2023)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de solicitudes, cálculo automatizado por antigüedad laboral, kárdex y saldos disponibles
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nueva Solicitud de Vacaciones</span>
        </button>
      </div>

      {/* Vacation Balances & LFT Reform Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Vacation Balances of accessible employees */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-slate-700" />
              <span>Saldos de Vacaciones por Colaborador</span>
            </h2>
            <span className="text-xs text-slate-500">
              {accessibleEmployees.length} colaboradores
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Colaborador</th>
                  <th className="py-2.5 px-3">Antigüedad (Ingreso)</th>
                  <th className="py-2.5 px-3 text-center">Derecho LFT</th>
                  <th className="py-2.5 px-3 text-center">Gozados</th>
                  <th className="py-2.5 px-3 text-right">Saldo Disponible</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {accessibleEmployees.map(emp => {
                  const years = Math.max(1, Math.floor((new Date().getTime() - new Date(emp.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)));
                  const policy = settings.vacationScale.find(p => p.yearsOfSeniority === years) || settings.vacationScale[0];
                  const entitled = policy?.entitledDays || 12;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{emp.fullName}</div>
                        <div className="text-[10px] text-slate-500">{emp.departmentName}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {emp.hireDate} ({years} {years === 1 ? 'año' : 'años'})
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800 font-mono">
                        {entitled} días
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                        {emp.vacationDaysUsed || 0}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                          {emp.vacationDaysAvailable ?? (entitled - (emp.vacationDaysUsed || 0))} días
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Official LFT Scale Table Reference */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">Escala LFT Art. 76 (Vacaciones Dignas)</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Esquema obligatorio vigente en México con prima vacacional del 25% mín.
            </p>

            <div className="mt-3 space-y-1.5 text-xs font-mono">
              {settings.vacationScale.slice(0, 7).map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-700">
                    Año {p.yearsOfSeniority}:
                  </span>
                  <span className="font-bold text-slate-900">{p.entitledDays} días laborables</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-medium">
            Prima Vacacional: +25% sobre el salario diario devengado durante el periodo de vacaciones.
          </div>
        </div>

      </div>

      {/* Vacation Requests Filter & List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Solicitudes de Vacaciones Registradas</h2>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3 shadow-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar solicitud por nombre del colaborador..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-400 cursor-pointer w-full md:w-auto"
          >
            <option value="ALL">Todos los Departamentos</option>
            {accessibleDepartments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Request Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVacations.map(req => (
            <div 
              key={req.id} 
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500">{req.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    req.status === 'APROBADA' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    req.status === 'RECHAZADA' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{req.employeeName}</h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                    <span>{req.startDate} al {req.endDate}</span>
                    <span className="text-slate-900 font-bold">({req.daysRequested} días)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Reincorporación: <span className="font-mono text-slate-800 font-bold">{req.returnDate}</span>
                  </div>
                </div>

                {req.reason && (
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {req.reason}
                  </p>
                )}
              </div>

              {/* Approval Buttons */}
              {req.status === 'PENDIENTE' && canAuthorize && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => rejectVacation(req.id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-200 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Rechazar</span>
                  </button>
                  <button
                    onClick={() => approveVacation(req.id, currentUser?.displayName || 'RH')}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Aprobar Vacaciones</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Palmtree className="w-5 h-5 text-slate-700" />
                <span>Nueva Solicitud de Vacaciones</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Colaborador *</label>
                <select
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                >
                  {accessibleEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeNumber}) - Saldo: {emp.vacationDaysAvailable} días
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Primer Día de Vacaciones *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Último Día de Vacaciones *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Fecha de Regreso a Laborar *</label>
                <input
                  type="date"
                  required
                  value={formData.returnDate}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Motivo o Comentarios</label>
                <textarea
                  rows={2}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  placeholder="Periodo ordinario anual conforme a LFT..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  Registrar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
