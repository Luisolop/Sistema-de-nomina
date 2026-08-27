import React, { useState } from 'react';
import { 
  Award, 
  PlusCircle, 
  Search, 
  Gift, 
  Calendar, 
  CheckCircle, 
  Clock, 
  User, 
  X,
  Sparkles
} from 'lucide-react';
import { useApp } from '../services/store';

export const BenefitsView: React.FC = () => {
  const { employees, updateEmployee, currentRole } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [usedDaysInput, setUsedDaysInput] = useState(1);
  const [benefitReason, setBenefitReason] = useState('Día económico por cumpleaños');

  const filtered = employees.filter(e => 
    e.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApplyBenefit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    const newAvailable = Math.max(0, (selectedEmp.annualBenefitsDaysAvailable || 5) - usedDaysInput);
    updateEmployee(selectedEmp.id, {
      annualBenefitsDaysAvailable: newAvailable
    });

    setShowLogModal(false);
    setSelectedEmp(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-slate-700" />
            <span>Beneficios Anuales y Días Económicos</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de días con goce adicionales otorgados por la cadena hotelera (Días económicos, cumpleaños, puntualidad)
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
        <Gift className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-900">Prestación Hotelera Superior a la Ley:</span> Cada colaborador sindicalizado o de confianza cuenta con una bolsa anual de <strong>5 Días Económicos con goce íntegro de sueldo</strong> para atender compromisos personales sin afectar su nómina ni vacaciones.
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar colaborador por nombre o número de empleado..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>

      {/* Benefits Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-3">Departamento</th>
                <th className="py-3 px-3">Bolsa Anual Total</th>
                <th className="py-3 px-3">Días Disponibles</th>
                <th className="py-3 px-3">Días Gozados</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.map(emp => {
                const available = emp.annualBenefitsDaysAvailable ?? 5;
                const used = 5 - available;
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 text-sm">{emp.fullName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{emp.employeeNumber}</div>
                    </td>

                    <td className="py-3 px-3 text-slate-700 font-medium">{emp.departmentName}</td>

                    <td className="py-3 px-3 font-mono">
                      <span className="text-slate-600">5 días / año</span>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {available} días disponibles
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-500">
                      {used} días utilizados
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedEmp(emp);
                          setShowLogModal(true);
                        }}
                        className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-800 hover:text-slate-900 border border-slate-300 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                      >
                        Registrar Uso
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Use Benefit Modal */}
      {showLogModal && selectedEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-slate-700" />
                <span>Aplicar Día Económico</span>
              </h3>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyBenefit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 block text-[11px]">Colaborador Seleccionado:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedEmp.fullName}</span>
                <div className="text-[11px] text-amber-800 font-medium mt-1 font-mono">
                  Saldo actual: {selectedEmp.annualBenefitsDaysAvailable ?? 5} días
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Días a Descontar *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedEmp.annualBenefitsDaysAvailable ?? 5}
                  required
                  value={usedDaysInput}
                  onChange={(e) => setUsedDaysInput(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Concepto / Motivo *</label>
                <input
                  type="text"
                  required
                  value={benefitReason}
                  onChange={(e) => setBenefitReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  placeholder="Ej. Día de cumpleaños / Asunto escolar"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  Aplicar Beneficio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
