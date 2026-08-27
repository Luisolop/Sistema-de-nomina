import React, { useState } from 'react';
import { 
  FileText, 
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
  HeartPulse, 
  Briefcase, 
  X,
  Sparkles
} from 'lucide-react';
import { useApp } from '../services/store';
import { LeaveRequest, LeaveType } from '../types';

export const LeavesView: React.FC = () => {
  const { 
    leaves, 
    accessibleEmployees, 
    accessibleDepartments, 
    requestLeave, 
    approveLeave, 
    rejectLeave, 
    currentRole, 
    currentUser 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState<{
    employeeId: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
    notes: string;
    documentUrl: string;
  }>({
    employeeId: accessibleEmployees[0]?.id || '',
    type: 'PERMISO_CON_GOCE',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    notes: '',
    documentUrl: ''
  });

  const canAuthorize = currentRole === 'ADMIN' || currentRole === 'RH';

  const filteredLeaves = leaves.filter(l => {
    const matchesSearch = 
      l.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = selectedDept === 'ALL' || l.departmentId === selectedDept;
    const matchesType = selectedType === 'ALL' || l.type === selectedType;

    return matchesSearch && matchesDept && matchesType;
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = accessibleEmployees.find(e => e.id === formData.employeeId);
    if (!emp) return;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    requestLeave({
      employeeId: emp.id,
      employeeName: emp.fullName,
      departmentId: emp.departmentId,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      daysCount,
      reason: formData.reason,
      notes: formData.notes,
      documentUrl: formData.documentUrl,
      requestedBy: currentUser?.displayName || currentUser?.email || 'Usuario'
    });

    setShowModal(false);
    setFormData({
      employeeId: accessibleEmployees[0]?.id || '',
      type: 'PERMISO_CON_GOCE',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      reason: '',
      notes: '',
      documentUrl: ''
    });
  };

  const getLeaveTypeBadge = (type: LeaveType) => {
    switch (type) {
      case 'INCAPACIDAD':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <HeartPulse className="w-3 h-3" />
            <span>Incapacidad IMSS</span>
          </span>
        );
      case 'PERMISO_CON_GOCE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Con Goce de Sueldo
          </span>
        );
      case 'PERMISO_SIN_GOCE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Sin Goce de Sueldo
          </span>
        );
      case 'PERMISO_MEDICO':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            Permiso Médico
          </span>
        );
      case 'PATERNIDAD':
      case 'MATERNIDAD':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Maternidad / Paternidad LFT
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            {type}
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
            <HeartPulse className="w-5 h-5 text-slate-700" />
            <span>Permisos e Incapacidades Médicas IMSS</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro, dictaminación y seguimiento de licencias médicas, permisos con/sin goce y certificados IMSS
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Registrar Permiso / Incapacidad</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por colaborador o motivo del permiso..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-400 cursor-pointer flex-1 md:flex-none"
          >
            <option value="ALL">Todos los Tipos</option>
            <option value="INCAPACIDAD">Incapacidad IMSS</option>
            <option value="PERMISO_CON_GOCE">Con Goce de Sueldo</option>
            <option value="PERMISO_SIN_GOCE">Sin Goce de Sueldo</option>
            <option value="PERMISO_MEDICO">Médico</option>
            <option value="PATERNIDAD">Paternidad</option>
            <option value="MATERNIDAD">Maternidad</option>
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-400 cursor-pointer flex-1 md:flex-none"
          >
            <option value="ALL">Todos los Deptos</option>
            {accessibleDepartments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeaves.map(leave => (
          <div 
            key={leave.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {getLeaveTypeBadge(leave.type)}
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  leave.status === 'APROBADA' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  leave.status === 'RECHAZADA' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {leave.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{leave.employeeName}</h3>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-600" />
                  <span>{leave.startDate} al {leave.endDate}</span>
                  <span className="text-slate-700 font-bold">({leave.daysCount} días)</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="text-slate-500 font-semibold block">Motivo:</span>
                <p className="text-slate-800">{leave.reason}</p>
                {leave.notes && (
                  <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
                    Obs: {leave.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Approval Controls */}
            {leave.status === 'PENDIENTE' && canAuthorize && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => rejectLeave(leave.id)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-200 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Rechazar</span>
                </button>
                <button
                  onClick={() => approveLeave(leave.id, currentUser?.displayName || 'RH')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Aprobar Permiso</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-slate-700" />
                <span>Registrar Permiso o Incapacidad IMSS</span>
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
                      {emp.fullName} ({emp.employeeNumber}) - {emp.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Tipo de Permiso / Incapacidad *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as LeaveType })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                >
                  <option value="INCAPACIDAD">Incapacidad Médica IMSS</option>
                  <option value="PERMISO_CON_GOCE">Permiso con Goce de Sueldo</option>
                  <option value="PERMISO_SIN_GOCE">Permiso sin Goce de Sueldo</option>
                  <option value="PERMISO_MEDICO">Consulta / Permiso Médico</option>
                  <option value="PATERNIDAD">Permiso de Paternidad (5 días LFT)</option>
                  <option value="MATERNIDAD">Licencia de Maternidad (84 días LFT)</option>
                  <option value="DEFUNCION">Permiso por Defunción Familiar</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Fecha de Inicio *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Fecha de Fin *</label>
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
                <label className="block text-slate-600 font-medium mb-1">Motivo / Diagnóstico / Justificación *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Detallar causa del permiso o diagnóstico del certificado..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Folio IMSS / Enlace al Documento</label>
                <input
                  type="text"
                  value={formData.documentUrl}
                  onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                  placeholder="Folio IMSS o URL de comprobante digital"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
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
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
