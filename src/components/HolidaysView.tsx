import React, { useState } from 'react';
import { 
  CalendarDays, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  AlertCircle, 
  X,
  Sparkles
} from 'lucide-react';
import { useApp } from '../services/store';
import { Holiday } from '../types';

export const HolidaysView: React.FC = () => {
  const { holidays, addHoliday, updateHoliday, deleteHoliday, currentRole } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);

  const [formData, setFormData] = useState<Partial<Holiday>>({
    name: '',
    date: '2026-09-16',
    isMandatoryRest: true,
    specialCompensationRate: 3.0, // Salario del día + doble por laborarlo = triple
    notes: '',
    active: true
  });

  const canEdit = currentRole === 'ADMIN' || currentRole === 'RH';

  const handleOpenAdd = () => {
    setEditingHoliday(null);
    setFormData({
      name: '',
      date: '2026-09-16',
      isMandatoryRest: true,
      specialCompensationRate: 3.0,
      notes: '',
      active: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (h: Holiday) => {
    setEditingHoliday(h);
    setFormData({ ...h });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date) return;

    const payload: any = {
      name: formData.name,
      date: formData.date,
      isMandatoryRest: !!formData.isMandatoryRest,
      specialCompensationRate: Number(formData.specialCompensationRate || 3.0),
      notes: formData.notes || '',
      active: true
    };

    if (editingHoliday) {
      updateHoliday(editingHoliday.id, payload);
    } else {
      addHoliday(payload);
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-slate-700" />
            <span>Calendario de Días Festivos Oficiales (LFT Art. 74)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Días de descanso obligatorio por ley en México y factor de compensación salarial para colaboradores que laboran
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Agregar Día Festivo</span>
          </button>
        )}
      </div>

      {/* Holidays List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {holidays.map(h => (
          <div 
            key={h.id} 
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 hover:border-slate-300 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300">
                  {h.date}
                </span>
                {h.isMandatoryRest && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Descanso Obligatorio LFT
                  </span>
                )}
              </div>

              <h3 className="font-bold text-slate-900 text-base mt-2">{h.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{h.notes}</p>

              <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <span className="text-slate-600">Compensación por laborar:</span>
                <span className="font-mono font-bold text-slate-900">
                  {h.specialCompensationRate || 3.0}x Salario (Pago Triple)
                </span>
              </div>
            </div>

            {canEdit && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                <button
                  onClick={() => handleOpenEdit(h)}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => deleteHoliday(h.id)}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-300 hover:border-rose-200 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add / Edit Holiday Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-slate-700" />
                <span>{editingHoliday ? 'Editar Día Festivo' : 'Nuevo Día Festivo Oficial'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Nombre de la Festividad *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  placeholder="Ej. Día de la Independencia de México"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Fecha Oficial (AAAA-MM-DD) *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Factor de Pago por Laborar (Multiplicador)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="5"
                  value={formData.specialCompensationRate || 3.0}
                  onChange={(e) => setFormData({ ...formData, specialCompensationRate: parseFloat(e.target.value) || 3.0 })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  LFT Art. 75 estipula salario normal + salario doble adicional = 3.0x.
                </span>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Descripción / Ley</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  placeholder="LFT Art. 74 Fracc..."
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
                  Guardar Festivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
