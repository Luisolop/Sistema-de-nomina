import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  RefreshCw, 
  Shield, 
  UserCheck, 
  LogOut, 
  Clock, 
  Bell, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ChevronDown,
  Database
} from 'lucide-react';
import { useApp } from '../services/store';
import { UserRole } from '../types';

interface HeaderProps {
  onSearchSelect?: (item: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchSelect }) => {
  const { 
    currentUser, 
    currentRole, 
    switchDemoRole, 
    logout, 
    settings, 
    integrationConfig, 
    syncBiometricsNow,
    formattedCountdown,
    employees,
    departments,
    dbStats
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ type: string; title: string; subtitle: string; item: any }[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<{ message: string; success: boolean } | null>(null);
  const [timeStr, setTimeStr] = useState('');

  // Live Mexico Time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('es-MX', {
        timeZone: settings.timezone || 'America/Cancun',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).format(now);
      setTimeStr(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [settings.timezone]);

  // Global search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    const results: { type: string; title: string; subtitle: string; item: any }[] = [];

    // Search employees
    employees.forEach(emp => {
      if (
        emp.fullName.toLowerCase().includes(q) ||
        emp.employeeNumber.toLowerCase().includes(q) ||
        emp.biometricId.toLowerCase().includes(q) ||
        (emp.curp && emp.curp.toLowerCase().includes(q))
      ) {
        results.push({
          type: 'Colaborador',
          title: emp.fullName,
          subtitle: `${emp.employeeNumber} • ${emp.departmentName || ''} • Bio: ${emp.biometricId}`,
          item: emp
        });
      }
    });

    // Search departments
    departments.forEach(dept => {
      if (dept.name.toLowerCase().includes(q) || dept.code.toLowerCase().includes(q)) {
        results.push({
          type: 'Departamento',
          title: dept.name,
          subtitle: `Código: ${dept.code}`,
          item: dept
        });
      }
    });

    setSearchResults(results.slice(0, 8));
    setShowSearchDropdown(true);
  }, [searchQuery, employees, departments]);

  const handleSyncClick = async () => {
    setIsSyncing(true);
    const res = await syncBiometricsNow();
    setIsSyncing(false);
    setSyncToast({ message: res.message, success: res.success });
    setTimeout(() => setSyncToast(null), 4000);
  };

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'ADMIN': return 'Administrador';
      case 'RH': return 'Recursos Humanos';
      case 'CONTABILIDAD': return 'Contabilidad';
      case 'GERENTE_DEPARTAMENTO': return 'Gerente de Depto';
      default: return r;
    }
  };

  const getRoleColor = (r: UserRole) => {
    switch (r) {
      case 'ADMIN': return 'bg-slate-900 text-white border-slate-900';
      case 'RH': return 'bg-blue-800 text-white border-blue-800';
      case 'CONTABILIDAD': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'GERENTE_DEPARTAMENTO': return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand & Hotel */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base tracking-tight truncate">
                  {settings.hotelName || 'Grand Playa Resort & Spa'}
                </span>
                <span className="hidden md:inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {settings.branchName || 'Cancún'}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                {settings.companyName}
              </p>
            </div>
          </div>

          {/* Global Search */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                placeholder="Buscar colaborador, número, departamento o ID..."
                className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white focus:border-slate-300 transition-all"
              />
            </div>

            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="p-2.5 text-xs font-semibold uppercase text-slate-700 tracking-wider bg-slate-50 border-b border-slate-200">
                  Resultados ({searchResults.length})
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {searchResults.map((res, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setShowSearchDropdown(false);
                        setSearchQuery('');
                        if (onSearchSelect) onSearchSelect(res.item);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{res.title}</div>
                        <div className="text-xs text-slate-500">{res.subtitle}</div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 font-medium">
                        {res.type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Actions: 2-Hour Auto-Sync Pill, Live Clock, Role Switcher & User */}
          <div className="flex items-center gap-2.5">
            
            {/* Firestore Database Status Badge */}
            <div className="hidden xl:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs" title={`Base de Datos Firestore activa: ${dbStats.databaseId}`}>
              <Database className="w-3.5 h-3.5 text-slate-700" />
              <span className="text-slate-700 font-medium">BD Cloud:</span>
              <span className={`font-semibold ${dbStats.isConnected ? 'text-emerald-700' : 'text-amber-700'}`}>
                {dbStats.isConnected ? 'Firestore Activa' : 'Offline'}
              </span>
            </div>

            {/* Biometric Auto-Sync Status & Countdown */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-700 font-medium">HikCentral:</span>
              <span className="text-emerald-700 font-semibold">Online</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600 font-medium flex items-center gap-1" title="Sincronización automática periódica cada 2 horas">
                <span>Próx:</span>
                <strong className="text-slate-900 font-mono">{formattedCountdown}</strong>
              </span>
              <button
                onClick={handleSyncClick}
                disabled={isSyncing}
                title="Sincronizar eventos biométricos de HikCentral ahora"
                className="ml-1 text-slate-600 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-200 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-slate-800' : ''}`} />
              </button>
            </div>

            {/* Live Mexico Clock */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{timeStr || 'Zona Cancún'}</span>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center gap-1.5">
              <div className="text-xs text-slate-500 hidden xl:inline font-medium">Rol:</div>
              <select
                value={currentRole}
                onChange={(e) => switchDemoRole(e.target.value as UserRole)}
                className={`text-xs font-semibold rounded-xl px-2.5 py-1.5 border focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer shadow-2xs ${getRoleColor(currentRole)}`}
                title="Cambiar rol activo para probar vistas y permisos"
              >
                <option value="ADMIN">ADMINISTRADOR</option>
                <option value="RH">RECURSOS HUMANOS</option>
                <option value="CONTABILIDAD">CONTABILIDAD</option>
                <option value="GERENTE_DEPARTAMENTO">GERENTE DE DEPTO</option>
              </select>
            </div>

            {/* User Avatar & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-800 border border-slate-300">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt={currentUser.displayName} className="w-full h-full object-cover" />
                ) : (
                  currentUser?.displayName?.charAt(0) || 'U'
                )}
              </div>
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Sync Toast Notification */}
      {syncToast && (
        <div className="bg-slate-900 text-white text-xs px-4 py-2 text-center flex items-center justify-center gap-2 animate-fadeIn shadow-sm">
          {syncToast.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span className="font-medium">{syncToast.message}</span>
        </div>
      )}
    </header>
  );
};
