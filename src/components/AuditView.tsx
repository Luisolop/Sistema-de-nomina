import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Clock, 
  User, 
  ShieldCheck, 
  Layers,
  FileCode
} from 'lucide-react';
import { useApp } from '../services/store';

export const AuditView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');

  const filtered = auditLogs.filter(log => {
    const matchesSearch = 
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.recordId && log.recordId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesModule = selectedModule === 'ALL' || log.module === selectedModule;

    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-slate-700" />
            <span>Bitácora de Auditoría y Trazabilidad Inmutable</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro cronológico inmodificable de todas las operaciones, correcciones y cambios de nómina
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por usuario, acción o ID de registro..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-400 cursor-pointer w-full md:w-auto"
        >
          <option value="ALL">Todos los Módulos</option>
          <option value="ASISTENCIA">Asistencia</option>
          <option value="CORRECCIONES">Correcciones</option>
          <option value="PRENOMINA">Prenómina</option>
          <option value="COLABORADORES">Colaboradores</option>
          <option value="VACACIONES">Vacaciones</option>
          <option value="PERMISOS">Permisos</option>
          <option value="BIOMETRICOS">Biométricos</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-3">Usuario / Rol</th>
                <th className="py-3 px-3">Módulo</th>
                <th className="py-3 px-3">Acción Realizada</th>
                <th className="py-3 px-3">ID Registro</th>
                <th className="py-3 px-4">Detalle / Valores Modificados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-mono">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('es-MX')}
                  </td>

                  <td className="py-3 px-3 font-sans">
                    <div className="font-semibold text-slate-900">{log.userEmail}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{log.userRole}</div>
                  </td>

                  <td className="py-3 px-3 font-sans">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                      {log.module}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-sans font-bold text-slate-800">
                    {log.action}
                  </td>

                  <td className="py-3 px-3 text-slate-500 text-[11px]">
                    {log.recordId}
                  </td>

                  <td className="py-3 px-4 text-[11px] text-slate-600 font-mono max-w-xs truncate font-sans">
                    {log.newValue ? JSON.stringify(log.newValue) : log.previousValue ? `Prev: ${JSON.stringify(log.previousValue)}` : 'Operación ejecutada con éxito'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
