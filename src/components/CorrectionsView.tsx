import React, { useState } from 'react';
import { 
  CalendarCheck, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  AlertCircle, 
  ShieldAlert, 
  X,
  FileCheck
} from 'lucide-react';
import { useApp } from '../services/store';
import { AttendanceCorrection, AttendanceRecord } from '../types';

export const CorrectionsView: React.FC<{ preloadedRecord?: AttendanceRecord | null; onClearPreloaded?: () => void }> = ({
  preloadedRecord,
  onClearPreloaded
}) => {
  const { 
    corrections, 
    accessibleEmployees, 
    departments, 
    requestCorrection, 
    approveCorrection, 
    rejectCorrection, 
    currentUser, 
    currentRole 
  } = useApp();

  const [showRequestModal, setShowRequestModal] = useState(!!preloadedRecord);
  const [formData, setFormData] = useState<{
    employeeId: string;
    recordId: string;
    date: string;
    originalIn: string;
    originalOut: string;
    newIn: string;
    newOut: string;
    reason: string;
  }>({
    employeeId: preloadedRecord?.employeeId || accessibleEmployees[0]?.id || '',
    recordId: preloadedRecord?.id || `att-${accessibleEmployees[0]?.id}-2026-08-27`,
    date: preloadedRecord?.date || '2026-08-27',
    originalIn: preloadedRecord?.actualIn || '',
    originalOut: preloadedRecord?.actualOut || '',
    newIn: '08:00',
    newOut: '16:30',
    reason: 'El colaborador olvidó registrar checada de entrada en la terminal del lobby.'
  });

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'>('ALL');

  const canApprove = currentRole === 'ADMIN' || currentRole === 'RH';

  const filteredCorrections = corrections.filter(c => {
    return filterStatus === 'ALL' || c.status === filterStatus;
  });

  const handleOpenNew = () => {
    const defaultEmp = accessibleEmployees[0];
    setFormData({
      employeeId: defaultEmp?.id || '',
      recordId: `att-${defaultEmp?.id}-2026-08-27`,
      date: '2026-08-27',
      originalIn: '',
      originalOut: '',
      newIn: '08:00',
      newOut: '16:30',
      reason: ''
    });
    setShowRequestModal(true);
  };

  const handleSaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = accessibleEmployees.find(e => e.id === formData.employeeId);
    if (!emp) return;

    requestCorrection({
      recordId: formData.recordId || `att-${emp.id}-${formData.date}`,
      employeeId: emp.id,
      employeeName: emp.fullName,
      departmentId: emp.departmentId,
      date: formData.date,
      originalIn: formData.originalIn || undefined,
      originalOut: formData.originalOut || undefined,
      newIn: formData.newIn,
      newOut: formData.newOut,
      reason: formData.reason,
      requestedBy: currentUser?.displayName || 'Supervisor',
      requestedByEmail: currentUser?.email || 'gerente@hotelplayaroyale.com'
    });

    setShowRequestModal(false);
    if (onClearPreloaded) onClearPreloaded();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-slate-700" />
            <span>Corrección y Aclaración de Asistencias</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Flujo de solicitud gerencial y autorización de RH para checadas omitidas o ajustes con bitácora inmutable
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Solicitar Corrección</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {(['ALL', 'PENDIENTE', 'APROBADA', 'RECHAZADA'] as const).map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterStatus === st
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {st === 'ALL' ? 'Todas' : st === 'PENDIENTE' ? 'Pendientes de Autorización' : st === 'APROBADA' ? 'Aprobadas' : 'Rechazadas'}
          </button>
        ))}
      </div>

      {/* Corrections List */}
      {filteredCorrections.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-3 shadow-xs">
          <FileCheck className="w-10 h-10 text-slate-400" />
          <div>
            <div className="text-sm font-semibold text-slate-700">No hay correcciones en esta vista</div>
            <p className="text-slate-500 mt-1">Todas las asistencias y registros se encuentran dictaminados.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCorrections.map(corr => (
            <div 
              key={corr.id} 
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 hover:border-slate-300 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{corr.employeeName}</h3>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>Fecha: {corr.date}</span>
                    <span>•</span>
                    <span>Solicitado por: {corr.requestedBy}</span>
                  </div>
                </div>

                <div>
                  {corr.status === 'PENDIENTE' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      PENDIENTE
                    </span>
                  )}
                  {corr.status === 'APROBADA' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      APROBADA
                    </span>
                  )}
                  {corr.status === 'RECHAZADA' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      RECHAZADA
                    </span>
                  )}
                </div>
              </div>

              {/* Time comparison */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg text-xs font-mono border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">Checada Original:</span>
                  <div className="text-slate-600">
                    E: {corr.originalIn || 'Sin registro'} | S: {corr.originalOut || 'Sin registro'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-700 block font-sans font-medium">Checada Corregida:</span>
                  <div className="text-slate-900 font-bold">
                    E: {corr.newIn} | S: {corr.newOut}
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-semibold block text-[10px] mb-0.5">Motivo / Justificación:</span>
                <p className="italic">"{corr.reason}"</p>
              </div>

              {/* Approval status / Action buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                {corr.approvedBy && (
                  <span className="text-[11px] text-slate-500">
                    Dictaminado por: <strong className="text-slate-800">{corr.approvedBy}</strong>
                  </span>
                )}

                {corr.status === 'PENDIENTE' && canApprove && (
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => rejectCorrection(corr.id, currentUser?.displayName || 'RH', 'Justificación insuficiente')}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold transition cursor-pointer"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => approveCorrection(corr.id, currentUser?.displayName || 'Lic. Ana López (RH)')}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs transition cursor-pointer"
                    >
                      Aprobar Corrección
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Request Correction Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-slate-700" />
                <span>Solicitud de Corrección de Asistencia</span>
              </h3>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Colaborador *</label>
                <select
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                >
                  {accessibleEmployees.map(e => (
                    <option key={e.id} value={e.id}>{e.fullName} ({e.employeeNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Fecha de la Asistencia *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Hora de Entrada Correcta *</label>
                  <input
                    type="time"
                    required
                    value={formData.newIn}
                    onChange={(e) => setFormData({ ...formData, newIn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Hora de Salida Correcta *</label>
                  <input
                    type="time"
                    required
                    value={formData.newOut}
                    onChange={(e) => setFormData({ ...formData, newOut: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Motivo Detallado (Auditoría) *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  placeholder="Ej. Colaborador cubrió turno en área de albercas y olvidó checar en lobby..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  Enviar para Dictamen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
