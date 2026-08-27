import React, { useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  AlertTriangle, 
  Palmtree, 
  FileText, 
  CalendarOff, 
  Cpu, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  ShieldCheck,
  Building,
  RefreshCw,
  Timer
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { useApp } from '../services/store';

export const DashboardView: React.FC<{ onNavigate: (tab: any) => void }> = ({ onNavigate }) => {
  const { 
    currentUser, 
    currentRole, 
    accessibleEmployees, 
    accessibleDepartments, 
    accessibleAttendance,
    corrections,
    vacations,
    leaves,
    integrationConfig,
    formattedCountdown,
    syncBiometricsNow,
    settings 
  } = useApp();

  const todayStr = '2026-08-27';

  // Today's attendance records for accessible scope
  const todayAttendance = useMemo(() => {
    return accessibleAttendance.filter(a => a.date === todayStr);
  }, [accessibleAttendance, todayStr]);

  // Metrics
  const totalEmployees = accessibleEmployees.filter(e => e.status === 'ACTIVO' || e.status === 'VACACIONES').length;
  const presentCount = todayAttendance.filter(a => a.status === 'PRESENTE').length;
  const delayCount = todayAttendance.filter(a => a.status === 'RETARDO').length;
  const absenceCount = todayAttendance.filter(a => a.status === 'FALTA' || a.status === 'SIN_REGISTRO').length;
  const vacationCount = todayAttendance.filter(a => a.status === 'VACACIONES').length;
  const leaveCount = todayAttendance.filter(a => a.status === 'PERMISO_CON_GOCE' || a.status === 'PERMISO_SIN_GOCE' || a.status === 'INCAPACIDAD').length;
  const restCount = todayAttendance.filter(a => a.status === 'DESCANSO').length;
  const incompleteCount = todayAttendance.filter(a => a.status === 'ENTRADA_INCOMPLETA' || a.status === 'SALIDA_INCOMPLETA').length;

  const pendingCorrectionsCount = corrections.filter(c => c.status === 'PENDIENTE').length;

  // Chart data: Attendance by department
  const departmentChartData = useMemo(() => {
    return accessibleDepartments.map(dept => {
      const deptAtt = todayAttendance.filter(a => a.departmentId === dept.id);
      const presentes = deptAtt.filter(a => a.status === 'PRESENTE').length;
      const retardos = deptAtt.filter(a => a.status === 'RETARDO').length;
      const faltas = deptAtt.filter(a => a.status === 'FALTA' || a.status === 'SIN_REGISTRO').length;
      const descansos = deptAtt.filter(a => a.status === 'DESCANSO').length;
      return {
        name: dept.code || dept.name.substring(0, 10),
        fullName: dept.name,
        Presentes: presentes,
        Retardos: retardos,
        Faltas: faltas,
        Descansos: descansos
      };
    });
  }, [accessibleDepartments, todayAttendance]);

  // Incidents requiring immediate attention
  const urgentIncidents = useMemo(() => {
    return todayAttendance.filter(a => 
      a.status === 'RETARDO' || 
      a.status === 'FALTA' || 
      a.status === 'ENTRADA_INCOMPLETA' || 
      a.status === 'SALIDA_INCOMPLETA'
    );
  }, [todayAttendance]);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            <span>{settings.hotelName || 'Grand Playa Resort & Spa'}</span>
            <span>•</span>
            <span>Panel Operativo</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Buenos días, {currentUser?.displayName || 'Colaborador'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {currentRole === 'GERENTE_DEPARTAMENTO' 
              ? `Supervisión de personal para: ${accessibleDepartments.map(d => d.name).join(', ')}`
              : 'Resumen operativo general de asistencia, turnos y prenómina del hotel.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('attendance')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Ver Asistencia de Hoy</span>
          </button>
          {currentRole === 'ADMIN' && (
            <button
              onClick={() => onNavigate('payroll')}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-2xs"
            >
              <TrendingUp className="w-4 h-4 text-slate-700" />
              <span>Prenómina Quincenal</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        
        {/* Total Colaboradores */}
        <div 
          onClick={() => onNavigate('employees')}
          className="bg-white border border-slate-200 rounded-xl p-3.5 hover:border-slate-400 transition cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Personal</span>
            <Users className="w-4 h-4 text-slate-400 group-hover:text-slate-900" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalEmployees}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">En plantilla</div>
        </div>

        {/* Presentes Hoy */}
        <div 
          onClick={() => onNavigate('attendance')}
          className="bg-white border border-emerald-200 rounded-xl p-3.5 hover:border-emerald-400 transition cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-700">Presentes</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{presentCount}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Checadas en orden</div>
        </div>

        {/* Retardos */}
        <div 
          onClick={() => onNavigate('attendance')}
          className="bg-white border border-amber-200 rounded-xl p-3.5 hover:border-amber-400 transition cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-700">Retardos</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{delayCount}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">{'> 10 min tolerancia'}</div>
        </div>

        {/* Faltas */}
        <div 
          onClick={() => onNavigate('attendance')}
          className="bg-white border border-rose-200 rounded-xl p-3.5 hover:border-rose-400 transition cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-700">Faltas</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-2">{absenceCount}</div>
          <div className="text-[10px] text-rose-600 mt-0.5">Sin registro</div>
        </div>

        {/* Vacaciones */}
        <div 
          onClick={() => onNavigate('vacations')}
          className="bg-white border border-sky-200 rounded-xl p-3.5 hover:border-sky-400 transition cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-sky-700">Vacaciones</span>
            <Palmtree className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-sky-700 mt-2">{vacationCount}</div>
          <div className="text-[10px] text-sky-600 mt-0.5">Autorizadas</div>
        </div>

        {/* Permisos / Incapacidad */}
        <div 
          onClick={() => onNavigate('leaves')}
          className="bg-white border border-blue-200 rounded-xl p-3.5 hover:border-blue-400 transition cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-700">Permisos</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-2">{leaveCount}</div>
          <div className="text-[10px] text-blue-600 mt-0.5">Con / Sin goce / IMSS</div>
        </div>

        {/* Descansos */}
        <div 
          onClick={() => onNavigate('attendance')}
          className="bg-white border border-slate-200 rounded-xl p-3.5 hover:border-slate-400 transition cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Descansos</span>
            <CalendarOff className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-700 mt-2">{restCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Día programado</div>
        </div>

        {/* Incompletas / Correcciones */}
        <div 
          onClick={() => onNavigate('corrections')}
          className="bg-white border border-orange-200 rounded-xl p-3.5 hover:border-orange-400 transition cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-orange-700">Correcciones</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-700 mt-2">{pendingCorrectionsCount || incompleteCount}</div>
          <div className="text-[10px] text-orange-600 mt-0.5">Por dictaminar</div>
        </div>

      </div>

      {/* Analytics Charts & Biometrics Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Attendance Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Asistencia de Hoy por Departamento</h3>
              <p className="text-xs text-slate-500">Comparativa de presentes, retardos y ausencias</p>
            </div>
            <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
              {todayStr}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="Presentes" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Retardos" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Faltas" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Descansos" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biometrics Integration Status Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">HikCentral Biométricos</h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Conectado
              </span>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Servidor / LAN:</span>
                <span className="font-mono text-slate-800 font-bold">{integrationConfig.serverUrl}:{integrationConfig.port}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Frecuencia Auto-Sync:</span>
                <span className="text-slate-800 font-bold">Cada 2 horas</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Próxima Sincronización:</span>
                <span className="text-slate-900 font-mono font-bold">{formattedCountdown}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Terminales Activas:</span>
                <span className="text-slate-800 font-bold">4 Relojes Faciales</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Eventos Procesados:</span>
                <span className="text-slate-800 font-bold">{integrationConfig.lastSyncEventsCount || 342} checadas</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200">
            <button
              onClick={() => onNavigate('integrations')}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>Configuración y Registro de Eventos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Immediate Incidents & Pending Attention */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Incidencias de Asistencia del Día</h3>
            <p className="text-xs text-slate-500">Colaboradores con retardo, falta o anomalía de checada</p>
          </div>
          <button
            onClick={() => onNavigate('attendance')}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            <span>Ver listado completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {urgentIncidents.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
            <span>Excelente: No se registran incidencias anómalas en el turno de hoy.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Colaborador</th>
                  <th className="py-2.5 px-3">Departamento</th>
                  <th className="py-2.5 px-3">Horario Programado</th>
                  <th className="py-2.5 px-3">Entrada Real</th>
                  <th className="py-2.5 px-3">Estatus</th>
                  <th className="py-2.5 px-3">Observación</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {urgentIncidents.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-2">
                      <span>{record.employeeName}</span>
                      <span className="text-[10px] text-slate-500 font-normal">({record.employeeNumber})</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{record.departmentName}</td>
                    <td className="py-2.5 px-3 font-mono">{record.scheduledIn} - {record.scheduledOut}</td>
                    <td className="py-2.5 px-3 font-mono">
                      {record.actualIn ? (
                        <span className={record.delayMinutes > 10 ? 'text-amber-700 font-bold' : 'text-slate-800'}>
                          {record.actualIn}
                        </span>
                      ) : (
                        <span className="text-rose-600 italic font-semibold">Sin checada</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {record.status === 'RETARDO' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          RETARDO ({record.delayMinutes} min)
                        </span>
                      )}
                      {record.status === 'FALTA' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          FALTA
                        </span>
                      )}
                      {record.status === 'SALIDA_INCOMPLETA' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-300">
                          SALIDA PENDIENTE
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 truncate max-w-xs">{record.notes}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onNavigate('corrections')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-950 rounded-lg text-[11px] font-bold border border-slate-300 transition cursor-pointer"
                      >
                        Corregir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
