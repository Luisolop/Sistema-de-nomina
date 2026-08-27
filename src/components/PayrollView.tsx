import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Download, 
  Printer, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Search, 
  FileSpreadsheet,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../services/store';
import { PayrollCalculationService } from '../services/payrollEngine';
import { PayPeriod, PayrollItem, PayPeriodStatus } from '../types';

export const PayrollView: React.FC = () => {
  const { 
    payPeriods, 
    accessibleEmployees, 
    attendance, 
    updatePayPeriodStatus,
    currentRole 
  } = useApp();

  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(payPeriods[1]?.id || payPeriods[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const canAuthorize = currentRole === 'ADMIN' || currentRole === 'CONTABILIDAD';

  const currentPeriod = useMemo(() => {
    return payPeriods.find(p => p.id === selectedPeriodId) || payPeriods[0];
  }, [payPeriods, selectedPeriodId]);

  // Compute live prenómina items for the selected period
  const payrollItems: PayrollItem[] = useMemo(() => {
    if (!currentPeriod) return [];
    return PayrollCalculationService.calculateAllPayroll(
      accessibleEmployees,
      currentPeriod,
      attendance
    );
  }, [currentPeriod, accessibleEmployees, attendance]);

  // Filtered by search
  const filteredItems = useMemo(() => {
    return payrollItems.filter(item => 
      item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.departmentName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [payrollItems, searchQuery]);

  // Total Totals
  const totals = useMemo(() => {
    return filteredItems.reduce((acc, item) => ({
      workedDays: acc.workedDays + item.workedDays,
      restDays: acc.restDays + item.restDays,
      vacationDays: acc.vacationDays + item.vacationDays,
      absencesCount: acc.absencesCount + item.absencesCount,
      overtimeHours: acc.overtimeHours + item.overtimeHours,
      grossPay: acc.grossPay + item.totalPerceptions,
      deductions: acc.deductions + item.totalDeductions,
      netPay: acc.netPay + item.calculatedNetPrenomina
    }), {
      workedDays: 0,
      restDays: 0,
      vacationDays: 0,
      absencesCount: 0,
      overtimeHours: 0,
      grossPay: 0,
      deductions: 0,
      netPay: 0
    });
  }, [filteredItems]);

  const handleStatusChange = (newStatus: PayPeriodStatus) => {
    if (!currentPeriod) return;
    updatePayPeriodStatus(currentPeriod.id, newStatus);
    setSuccessToast(`Estatus del periodo actualizado a ${newStatus}`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleRecalculate = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      setIsRecalculating(false);
      setSuccessToast('Prenómina recalculada con los eventos biométricos y autorizaciones más recientes.');
      setTimeout(() => setSuccessToast(null), 3500);
    }, 600);
  };

  const handleExportCSV = () => {
    if (!currentPeriod || filteredItems.length === 0) return;

    const headers = [
      'No. Empleado',
      'Colaborador',
      'Departamento',
      'Puesto',
      'Salario Diario (MXN)',
      'Días Periodo',
      'Días Trabajados',
      'Descansos',
      'Festivos',
      'Vacaciones',
      'Faltas',
      'Retardos (min)',
      'Horas Extra',
      'Percepciones Brutas',
      'Descuento Faltas',
      'Deducciones Totales',
      'Neto a Pagar (MXN)'
    ];

    const rows = filteredItems.map(item => [
      `"${item.employeeNumber}"`,
      `"${item.employeeName}"`,
      `"${item.departmentName}"`,
      `"${item.positionName}"`,
      item.dailySalary.toFixed(2),
      item.periodDays,
      item.workedDays,
      item.restDays,
      item.holidayDays,
      item.vacationDays,
      item.absencesCount,
      item.totalDelayMinutes,
      item.overtimeHours,
      item.totalPerceptions.toFixed(2),
      item.absenceDeductions.toFixed(2),
      item.totalDeductions.toFixed(2),
      item.calculatedNetPrenomina.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Prenomina_${currentPeriod.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (st: PayPeriodStatus) => {
    switch (st) {
      case 'ABIERTO':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">ABIERTO (En Captura)</span>;
      case 'REVISION':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">EN REVISIÓN</span>;
      case 'AUTORIZADO':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">AUTORIZADO POR DIRECCIÓN</span>;
      case 'CERRADO':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">CERRADO / DISPERSADO</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-slate-700" />
            <span>Módulo de Prenómina Quincenal Hotelera</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cálculo automatizado de días laborados, descansos, festivos LFT, faltas, retardos, horas extra e importes netos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>Recalcular Todo</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Period Selector & Workflow Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Periodo de Nómina:</label>
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-400 cursor-pointer"
            >
              {payPeriods.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.startDate} al {p.endDate})
                </option>
              ))}
            </select>
          </div>

          {currentPeriod && (
            <div className="pt-4 lg:pt-0">
              <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Estatus:</label>
              {getStatusBadge(currentPeriod.status)}
            </div>
          )}
        </div>

        {/* Workflow State Transitions */}
        {currentPeriod && canAuthorize && (
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
            {currentPeriod.status === 'ABIERTO' && (
              <button
                onClick={() => handleStatusChange('REVISION')}
                className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Enviar a Revisión de Contabilidad
              </button>
            )}
            {currentPeriod.status === 'REVISION' && (
              <button
                onClick={() => handleStatusChange('AUTORIZADO')}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Autorizar Prenómina
              </button>
            )}
            {currentPeriod.status === 'AUTORIZADO' && (
              <button
                onClick={() => handleStatusChange('CERRADO')}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Cerrar Periodo (Dispersado)
              </button>
            )}
          </div>
        )}

      </div>

      {/* Toast */}
      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Financial KPIs Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">Percepciones Brutas</span>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
            ${totals.grossPay.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400">Sueldo + festivos + vacaciones</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">Deducciones (Faltas/Retardos)</span>
          <div className="text-xl font-bold text-rose-700 mt-1 font-mono">
            -${totals.deductions.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-rose-600">{totals.absencesCount} faltas registradas</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-600 font-medium">Neto Prenómina a Dispersar</span>
          <div className="text-xl font-bold text-emerald-700 mt-1 font-mono">
            ${totals.netPay.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-600">{filteredItems.length} colaboradores</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">Horas Extra Acumuladas</span>
          <div className="text-xl font-bold text-amber-700 mt-1 font-mono">
            {totals.overtimeHours.toFixed(1)} hrs
          </div>
          <span className="text-[10px] text-slate-400">Compensadas al doble/triple</span>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por colaborador, departamento o número de nómina..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>

      {/* Comprehensive Pre-Payroll Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Colaborador</th>
                <th className="py-3 px-3">Puesto / Depto</th>
                <th className="py-3 px-2 text-right">S. Diario</th>
                <th className="py-3 px-2 text-center">Días Trab</th>
                <th className="py-3 px-2 text-center">Desc</th>
                <th className="py-3 px-2 text-center">Fest</th>
                <th className="py-3 px-2 text-center">Vac</th>
                <th className="py-3 px-2 text-center">Faltas</th>
                <th className="py-3 px-2 text-center">Ret (m)</th>
                <th className="py-3 px-2 text-center">Hrs Ext</th>
                <th className="py-3 px-3 text-right">Percepciones</th>
                <th className="py-3 px-3 text-right">Deducciones</th>
                <th className="py-3 px-4 text-right font-bold text-slate-900">Neto Quincena</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredItems.map(item => (
                <tr key={item.employeeId} className="hover:bg-slate-50/70 transition">
                  
                  {/* Name */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{item.employeeName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.employeeNumber}</div>
                  </td>

                  {/* Position */}
                  <td className="py-3 px-3">
                    <div className="text-slate-800 font-medium">{item.positionName}</div>
                    <div className="text-[10px] text-slate-500">{item.departmentName}</div>
                  </td>

                  {/* Daily Salary */}
                  <td className="py-3 px-2 text-right font-mono text-slate-900 font-medium">
                    ${item.dailySalary.toFixed(2)}
                  </td>

                  {/* Worked Days */}
                  <td className="py-3 px-2 text-center font-mono font-bold text-slate-900">
                    {item.workedDays}
                  </td>

                  {/* Rest Days */}
                  <td className="py-3 px-2 text-center font-mono text-slate-600">
                    {item.restDays}
                  </td>

                  {/* Holiday Days */}
                  <td className="py-3 px-2 text-center font-mono">
                    {item.holidayDays > 0 ? (
                      <span className="text-indigo-700 font-bold">{item.holidayDays}</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>

                  {/* Vacation Days */}
                  <td className="py-3 px-2 text-center font-mono">
                    {item.vacationDays > 0 ? (
                      <span className="text-sky-700 font-bold">{item.vacationDays}</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>

                  {/* Absences */}
                  <td className="py-3 px-2 text-center font-mono">
                    {item.absencesCount > 0 ? (
                      <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        {item.absencesCount}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>

                  {/* Delays */}
                  <td className="py-3 px-2 text-center font-mono">
                    {item.totalDelayMinutes > 0 ? (
                      <span className="text-amber-700">{item.totalDelayMinutes}m</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>

                  {/* Overtime */}
                  <td className="py-3 px-2 text-center font-mono">
                    {item.overtimeHours > 0 ? (
                      <span className="text-emerald-700 font-bold">+{item.overtimeHours}h</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>

                  {/* Gross */}
                  <td className="py-3 px-3 text-right font-mono font-medium text-slate-900">
                    ${item.totalPerceptions.toFixed(2)}
                  </td>

                  {/* Deductions */}
                  <td className="py-3 px-3 text-right font-mono text-rose-700">
                    {item.totalDeductions > 0 ? `-$${item.totalDeductions.toFixed(2)}` : '$0.00'}
                  </td>

                  {/* Net Pay */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800 text-sm">
                    ${item.calculatedNetPrenomina.toFixed(2)}
                  </td>

                </tr>
              ))}
            </tbody>
            
            {/* Totals Footer */}
            <tfoot className="bg-slate-50 text-slate-900 font-bold border-t-2 border-slate-200 text-xs">
              <tr>
                <td colSpan={3} className="py-3 px-3 uppercase text-[10px] tracking-wider text-slate-700">
                  TOTALES GENERALES ({filteredItems.length} Colaboradores)
                </td>
                <td className="py-3 px-2 text-center font-mono">{totals.workedDays}</td>
                <td className="py-3 px-2 text-center font-mono">{totals.restDays}</td>
                <td className="py-3 px-2 text-center font-mono">-</td>
                <td className="py-3 px-2 text-center font-mono">{totals.vacationDays}</td>
                <td className="py-3 px-2 text-center font-mono text-rose-700">{totals.absencesCount}</td>
                <td className="py-3 px-2 text-center font-mono">-</td>
                <td className="py-3 px-2 text-center font-mono text-slate-900">{totals.overtimeHours}h</td>
                <td className="py-3 px-3 text-right font-mono text-slate-900">
                  ${totals.grossPay.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-rose-700">
                  -${totals.deductions.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-800 text-sm">
                  ${totals.netPay.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
};
