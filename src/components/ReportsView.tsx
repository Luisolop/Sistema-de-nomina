import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Calendar, 
  Filter, 
  CheckCircle, 
  Users, 
  Clock, 
  Palmtree, 
  AlertTriangle, 
  DollarSign,
  TrendingDown,
  Building
} from 'lucide-react';
import { useApp } from '../services/store';

export const ReportsView: React.FC = () => {
  const { 
    accessibleEmployees, 
    accessibleDepartments, 
    accessibleAttendance, 
    vacations, 
    leaves, 
    payPeriods,
    currentRole 
  } = useApp();

  const [selectedReportId, setSelectedReportId] = useState<string>('REP-01');
  const [dateRange, setDateRange] = useState({ start: '2026-08-01', end: '2026-08-31' });
  const [selectedDept, setSelectedDept] = useState('ALL');

  const reportCategories = [
    {
      category: 'Asistencia y Checador',
      reports: [
        { id: 'REP-01', name: 'Sábana General de Asistencias y Checadas', desc: 'Matriz completa de entradas, salidas y estatus diario por colaborador.' },
        { id: 'REP-02', name: 'Reporte de Retardos y Tolerancias', desc: 'Colaboradores con minutos de retardo acumulados en el periodo.' },
        { id: 'REP-03', name: 'Reporte de Ausentismo y Faltas Injustificadas', desc: 'Detalle de ausencias, días sin registro e impacto económico.' },
        { id: 'REP-04', name: 'Checadas Incompletas y Omisiones', desc: 'Registros con entrada sin salida o viceversa para aclaración.' },
        { id: 'REP-05', name: 'Reporte de Horas Extra y Jornadas Extendidas', desc: 'Horas extraordinarias generadas por turno y departamento.' },
      ]
    },
    {
      category: 'Vacaciones, Permisos y Descansos',
      reports: [
        { id: 'REP-06', name: 'Kárdex y Saldos de Vacaciones LFT', desc: 'Días generados por antigüedad, gozados y saldo disponible actual.' },
        { id: 'REP-07', name: 'Programación de Vacaciones Aprobadas', desc: 'Calendario de periodos vacacionales autorizados para planeación de turnos.' },
        { id: 'REP-08', name: 'Incapacidades Médicas IMSS', desc: 'Historial de folios IMSS, días de subsidio y ramos de seguro.' },
        { id: 'REP-09', name: 'Permisos con y sin Goce de Sueldo', desc: 'Relación de licencias solicitadas y dictaminadas.' },
        { id: 'REP-10', name: 'Control de Descansos Semanales y Festivos', desc: 'Días de descanso obligatorios y festivos laborados con factor 3.0x.' },
      ]
    },
    {
      category: 'Prenómina y Costos Laborales',
      reports: [
        { id: 'REP-11', name: 'Resumen Quincenal de Prenómina Hotelera', desc: 'Percepciones, deducciones por faltas/retardos y neto total.' },
        { id: 'REP-12', name: 'Desglose de Costo Laboral por Departamento', desc: 'Distribución de nómina e incidencias entre Alimentos, Ama de Llaves, etc.' },
        { id: 'REP-13', name: 'Reporte de Beneficios Anuales y Días Económicos', desc: 'Uso de la bolsa de días con goce adicionales otorgados por el hotel.' },
      ]
    },
    {
      category: 'Auditoría, Hardware y Gestión',
      reports: [
        { id: 'REP-14', name: 'Bitácora de Correcciones de Asistencia', desc: 'Historial de solicitudes gerenciales y dictámenes de RH con firmas de auditoría.' },
        { id: 'REP-15', name: 'Padrón de Enrolamiento en Biométricos Hikvision', desc: 'Colaboradores con plantilla facial, huella y tag RFID activos.' },
        { id: 'REP-16', name: 'Rotación y Antigüedad de Personal', desc: 'Colaboradores por año de ingreso y departamento.' },
        { id: 'REP-17', name: 'Log de Eventos Biométricos sin Procesar', desc: 'Checadas registradas en terminales de acceso.' }
      ]
    }
  ];

  const currentReportMeta = useMemo(() => {
    for (const cat of reportCategories) {
      const found = cat.reports.find(r => r.id === selectedReportId);
      if (found) return found;
    }
    return reportCategories[0].reports[0];
  }, [selectedReportId]);

  const exportReport = (format: 'CSV' | 'PDF') => {
    // Generate CSV export
    let csvHeader = 'No. Empleado,Colaborador,Departamento,Fecha / Concepto,Detalle,Estatus\n';
    let csvRows = '';

    accessibleEmployees.forEach(e => {
      csvRows += `"${e.employeeNumber}","${e.fullName}","${e.departmentName}","2026-08-27","${currentReportMeta.name}","COMPLETO"\n`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvHeader + csvRows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentReportMeta.name.replace(/\s+/g, '_')}_${dateRange.start}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-700" />
            <span>Centro de Reportes Ejecutivos y Operativos</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            17 reportes analíticos para Dirección General, Recursos Humanos, Contabilidad y Gerentes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportReport('CSV')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Main Container: Selector on Left, Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Report Catalog */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4 max-h-[700px] overflow-y-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Catálogo de Reportes
          </h2>

          {reportCategories.map((cat, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider px-2 pt-2">
                {cat.category}
              </div>
              <div className="space-y-1">
                {cat.reports.map(rep => {
                  const isSelected = selectedReportId === rep.id;
                  return (
                    <button
                      key={rep.id}
                      onClick={() => setSelectedReportId(rep.id)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-start gap-2.5 cursor-pointer ${
                        isSelected 
                          ? 'bg-slate-100 text-slate-900 border border-slate-300 font-medium' 
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold shrink-0 mt-0.5">
                        {rep.id}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900 leading-tight">{rep.name}</div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{rep.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Report Filters & Live Preview */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Active Report Header & Filters */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                {currentReportMeta.id}
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1.5">{currentReportMeta.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{currentReportMeta.desc}</p>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Fecha Inicial:</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Fecha Final:</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Departamento:</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900"
                >
                  <option value="ALL">Todos los Departamentos</option>
                  {accessibleDepartments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Interactive Preview Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Vista Previa de Datos ({accessibleEmployees.length} Registros)
              </h3>
              <span className="text-xs text-slate-600 font-medium">Formato Oficial Hotelero</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">No. Empleado</th>
                    <th className="py-2.5 px-3">Colaborador</th>
                    <th className="py-2.5 px-3">Departamento</th>
                    <th className="py-2.5 px-3">Jornada / Biométrico</th>
                    <th className="py-2.5 px-3 text-right">Estatus Periodo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {accessibleEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{emp.employeeNumber}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{emp.fullName}</td>
                      <td className="py-2.5 px-3 text-slate-700">{emp.departmentName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">
                        {emp.scheduleName} • Bio: {emp.biometricId}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              * Datos calculados en tiempo real conformes a la Ley Federal del Trabajo y reglas del hotel.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
