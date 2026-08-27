import React, { useState } from 'react';
import { 
  Settings, 
  Building, 
  Clock, 
  Users, 
  ShieldCheck, 
  PlusCircle, 
  Trash2, 
  CheckCircle, 
  Palmtree, 
  Save,
  UserCheck
} from 'lucide-react';
import { useApp } from '../services/store';
import { SystemSettings, UserProfile, UserRole } from '../types';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    authorizedUsers, 
    addAuthorizedUser, 
    updateAuthorizedUser, 
    deleteAuthorizedUser, 
    departments 
  } = useApp();

  const [formSettings, setFormSettings] = useState<SystemSettings>({ ...settings });
  const [saveToast, setSaveToast] = useState(false);

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('GERENTE_DEPARTAMENTO');
  const [newUserDept, setNewUserDept] = useState(departments[0]?.id || '');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail) return;

    addAuthorizedUser({
      email: newUserEmail.toLowerCase().trim(),
      displayName: newUserName || newUserEmail.split('@')[0],
      role: newUserRole,
      departmentIds: newUserRole === 'GERENTE_DEPARTAMENTO' ? [newUserDept] : undefined,
      active: true
    });

    setNewUserEmail('');
    setNewUserName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" />
            <span>Configuración General del Hotel y Padrón de Usuarios</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Razón social, reglas de checador, tabuladores y control de acceso con cuentas de Google
          </p>
        </div>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Configuración guardada correctamente en Firestore.</span>
        </div>
      )}

      {/* Tabs / Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Company & Hotel Information */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-700" />
            <span>Datos de la Empresa y Hotel</span>
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Nombre Comercial del Hotel *</label>
              <input
                type="text"
                value={formSettings.hotelName}
                onChange={(e) => setFormSettings({ ...formSettings, hotelName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Razón Social *</label>
                <input
                  type="text"
                  value={formSettings.companyName}
                  onChange={(e) => setFormSettings({ ...formSettings, companyName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">RFC Fiscal *</label>
                <input
                  type="text"
                  value={formSettings.rfc}
                  onChange={(e) => setFormSettings({ ...formSettings, rfc: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Sucursal / Complejo</label>
                <input
                  type="text"
                  value={formSettings.branchName}
                  onChange={(e) => setFormSettings({ ...formSettings, branchName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Zona Horaria</label>
                <select
                  value={formSettings.timezone}
                  onChange={(e) => setFormSettings({ ...formSettings, timezone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-slate-400"
                >
                  <option value="America/Cancun">America/Cancun (Quintana Roo UTC-5)</option>
                  <option value="America/Mexico_City">America/Mexico_City (Centro UTC-6)</option>
                  <option value="America/Tijuana">America/Tijuana (Noroeste UTC-8)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Datos del Hotel</span>
              </button>
            </div>
          </form>
        </div>

        {/* Global Attendance Rules */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-700" />
            <span>Reglas Generales de Asistencia y Tolerancia</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Tolerancia Estándar Entrada (min)</label>
                <input
                  type="number"
                  value={formSettings.defaultToleranceMinutes}
                  onChange={(e) => setFormSettings({ ...formSettings, defaultToleranceMinutes: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Límite para Retardo (min)</label>
                <input
                  type="number"
                  value={formSettings.defaultDelayLimitMinutes}
                  onChange={(e) => setFormSettings({ ...formSettings, defaultDelayLimitMinutes: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Límite para Falta Injustificada (min)</label>
              <input
                type="number"
                value={formSettings.defaultAbsenceLimitMinutes}
                onChange={(e) => setFormSettings({ ...formSettings, defaultAbsenceLimitMinutes: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-slate-400"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Si un colaborador llega después de este tiempo se cataloga como FALTA por checada tardía.
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Actualizar Reglas</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Authorized Google Accounts & Whitelist (RBAC) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-700" />
              <span>Padrón de Cuentas de Google Autorizadas (Control de Acceso)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sólo las direcciones de correo aquí registradas podrán iniciar sesión en el portal.
            </p>
          </div>
        </div>

        {/* Add User Form */}
        <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Correo Google (Gmail / Workspace) *</label>
            <input
              type="email"
              required
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="usuario@hotelplayaroyale.com"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Nombre Completo</label>
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Lic. Laura Méndez"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Rol Asignado *</label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as UserRole)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-400"
            >
              <option value="ADMIN">ADMINISTRADOR</option>
              <option value="RH">RECURSOS HUMANOS</option>
              <option value="CONTABILIDAD">CONTABILIDAD</option>
              <option value="GERENTE_DEPARTAMENTO">GERENTE DE DEPARTAMENTO</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Autorizar Correo</span>
            </button>
          </div>
        </form>

        {/* Authorized Users List */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Usuario Autorizado</th>
                <th className="py-2.5 px-3">Correo Google</th>
                <th className="py-2.5 px-3">Rol</th>
                <th className="py-2.5 px-3">Departamento Asignado</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {authorizedUsers.map(u => {
                const dept = departments.find(d => u.departmentIds?.includes(d.id));
                return (
                  <tr key={u.uid} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{u.displayName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{u.email}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        u.role === 'ADMIN' ? 'bg-slate-100 text-slate-800 border-slate-300' :
                        u.role === 'RH' ? 'bg-sky-50 text-sky-800 border-sky-200' :
                        u.role === 'CONTABILIDAD' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {u.role === 'GERENTE_DEPARTAMENTO' ? (dept?.name || 'Todos') : 'Acceso Global'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => deleteAuthorizedUser(u.uid)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
