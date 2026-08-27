import React, { useState } from 'react';
import { 
  CalendarRange, 
  PlusCircle, 
  Clock, 
  Moon, 
  Sun, 
  Sunset, 
  RefreshCw, 
  Edit3, 
  CheckCircle, 
  AlertCircle, 
  X,
  Users
} from 'lucide-react';
import { useApp } from '../services/store';
import { WorkSchedule, ShiftType } from '../types';

export const SchedulesView: React.FC = () => {
  const { schedules, addSchedule, updateSchedule, deleteSchedule, currentRole, employees } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);
  
  const [formData, setFormData] = useState<Partial<WorkSchedule>>({
    name: '',
    code: '',
    description: '',
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
  });

  const canEdit = currentRole === 'ADMIN' || currentRole === 'RH';

  const handleOpenAdd = () => {
    setEditingSchedule(null);
    setFormData({
      name: '',
      code: `TUR-${schedules.length + 1}`,
      description: '',
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
    });
    setShowModal(true);
  };

  const handleOpenEdit = (sch: WorkSchedule) => {
    setEditingSchedule(sch);
    setFormData({ ...sch });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.checkInTime || !formData.checkOutTime) return;

    // Check if shift crosses midnight (e.g. 22:00 -> 06:00)
    const [inH] = formData.checkInTime.split(':').map(Number);
    const [outH] = formData.checkOutTime.split(':').map(Number);
    const crosses = outH < inH;

    const payload: any = {
      ...formData,
      crossesMidnight: crosses || formData.crossesMidnight,
      workHoursPerDay: Number(formData.workHoursPerDay || 8),
      toleranceMinutes: Number(formData.toleranceMinutes || 10),
      delayLimitMinutes: Number(formData.delayLimitMinutes || 30),
      absenceLimitMinutes: Number(formData.absenceLimitMinutes || 31),
      mealDurationMinutes: Number(formData.mealDurationMinutes || 30)
    };

    if (editingSchedule) {
      updateSchedule(editingSchedule.id, payload);
    } else {
      addSchedule(payload);
    }

    setShowModal(false);
  };

  const getShiftIcon = (type: ShiftType) => {
    switch (type) {
      case 'DIURNA': return <Sun className="w-5 h-5 text-amber-400" />;
      case 'MIXTA': return <Sunset className="w-5 h-5 text-orange-400" />;
      case 'NOCTURNA': return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'ROTATIVA': return <RefreshCw className="w-5 h-5 text-teal-400" />;
      default: return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-slate-700" />
            <span>Jornadas, Turnos y Horarios Hoteleros</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configuración de turnos diurnos, mixtos, nocturnos con cruce de medianoche, tolerancias y descansos
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Crear Nueva Jornada</span>
          </button>
        )}
      </div>

      {/* Schedules Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {schedules.map(sch => {
          const assignedCount = employees.filter(e => e.scheduleId === sch.id).length;
          return (
            <div
              key={sch.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    {getShiftIcon(sch.shiftType)}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 font-mono">
                    {sch.code}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mt-3">{sch.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sch.description}</p>

                {/* Times & midnight flag */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Horario:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {sch.checkInTime} - {sch.checkOutTime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Jornada Laboral:</span>
                    <span className="font-mono text-slate-800 font-semibold">{sch.workHoursPerDay} horas/día</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Tolerancia de Entrada:</span>
                    <span className="font-mono text-amber-700 font-semibold">{sch.toleranceMinutes} min</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Límite de Retardo:</span>
                    <span className="font-mono text-amber-700 font-semibold">{sch.delayLimitMinutes} min (luego falta)</span>
                  </div>
                  {sch.crossesMidnight && (
                    <div className="pt-1.5 border-t border-slate-200 flex items-center gap-1.5 text-[10px] text-indigo-700 font-semibold">
                      <Moon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Cruza medianoche (Salida al día siguiente)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-500">
                  <Users className="w-3.5 h-3.5 text-slate-600" />
                  <span>{assignedCount} colaboradores</span>
                </div>

                {canEdit && (
                  <button
                    onClick={() => handleOpenEdit(sch)}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-slate-700" />
                <span>{editingSchedule ? 'Editar Jornada' : 'Crear Nueva Jornada'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Nombre de la Jornada *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    placeholder="Ej. Turno Matutino Front Desk"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Código *</label>
                  <input
                    type="text"
                    required
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                    placeholder="MAT-01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Tipo de Turno</label>
                  <select
                    value={formData.shiftType}
                    onChange={(e) => setFormData({ ...formData, shiftType: e.target.value as ShiftType })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="DIURNA">Diurna</option>
                    <option value="MIXTA">Mixta</option>
                    <option value="NOCTURNA">Nocturna</option>
                    <option value="ROTATIVA">Rotativa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Hora Entrada *</label>
                  <input
                    type="time"
                    required
                    value={formData.checkInTime}
                    onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Hora Salida *</label>
                  <input
                    type="time"
                    required
                    value={formData.checkOutTime}
                    onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Tolerancia Entrada (min)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={formData.toleranceMinutes}
                    onChange={(e) => setFormData({ ...formData, toleranceMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Límite Retardo (min)</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={formData.delayLimitMinutes}
                    onChange={(e) => setFormData({ ...formData, delayLimitMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Horas Diarias</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.workHoursPerDay}
                    onChange={(e) => setFormData({ ...formData, workHoursPerDay: parseFloat(e.target.value) || 8 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="crossesMidnightCheck"
                  checked={formData.crossesMidnight}
                  onChange={(e) => setFormData({ ...formData, crossesMidnight: e.target.checked })}
                  className="rounded text-slate-900 focus:ring-slate-400 w-4 h-4"
                />
                <label htmlFor="crossesMidnightCheck" className="text-slate-800 font-medium cursor-pointer">
                  Este turno cruza la medianoche (ej. 22:00 a 06:00 del día siguiente)
                </label>
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
                  Guardar Jornada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
