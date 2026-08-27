import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  CalendarCheck, 
  CalendarRange, 
  Palmtree, 
  FileText, 
  Award, 
  CalendarDays, 
  Calculator, 
  BarChart3, 
  Cpu, 
  ShieldAlert, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../services/store';

export type TabType = 
  | 'dashboard'
  | 'employees'
  | 'attendance'
  | 'corrections'
  | 'schedules'
  | 'vacations'
  | 'leaves'
  | 'benefits'
  | 'holidays'
  | 'payroll'
  | 'reports'
  | 'integrations'
  | 'audit'
  | 'settings';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile
}) => {
  const { currentRole, corrections, vacations, leaves } = useApp();

  const pendingCorrections = corrections.filter(c => c.status === 'PENDIENTE').length;
  const pendingVacations = vacations.filter(v => v.status === 'PENDIENTE').length;
  const pendingLeaves = leaves.filter(l => l.status === 'PENDIENTE').length;

  interface NavItem {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    allowedRoles: Array<'ADMIN' | 'RH' | 'CONTABILIDAD' | 'GERENTE_DEPARTAMENTO'>;
    badge?: number;
    section?: string;
  }

  const navItems: NavItem[] = [
    // Operación diaria
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, allowedRoles: ['ADMIN', 'RH', 'CONTABILIDAD', 'GERENTE_DEPARTAMENTO'], section: 'PRINCIPAL' },
    { id: 'employees', label: 'Colaboradores', icon: Users, allowedRoles: ['ADMIN', 'RH', 'CONTABILIDAD', 'GERENTE_DEPARTAMENTO'] },
    { id: 'attendance', label: 'Asistencia y Checador', icon: Clock, allowedRoles: ['ADMIN', 'RH', 'CONTABILIDAD', 'GERENTE_DEPARTAMENTO'] },
    { id: 'corrections', label: 'Corrección Asistencias', icon: CalendarCheck, allowedRoles: ['ADMIN', 'RH', 'GERENTE_DEPARTAMENTO'], badge: pendingCorrections },
    
    // Gestión del Tiempo & Horarios
    { id: 'schedules', label: 'Jornadas y Horarios', icon: CalendarRange, allowedRoles: ['ADMIN', 'RH', 'GERENTE_DEPARTAMENTO'], section: 'GESTIÓN DEL TIEMPO' },
    { id: 'vacations', label: 'Vacaciones', icon: Palmtree, allowedRoles: ['ADMIN', 'RH', 'GERENTE_DEPARTAMENTO'], badge: pendingVacations },
    { id: 'leaves', label: 'Permisos e Incapacidades', icon: FileText, allowedRoles: ['ADMIN', 'RH', 'GERENTE_DEPARTAMENTO'], badge: pendingLeaves },
    { id: 'benefits', label: 'Beneficios Anuales', icon: Award, allowedRoles: ['ADMIN', 'RH'] },
    { id: 'holidays', label: 'Días Festivos (LFT)', icon: CalendarDays, allowedRoles: ['ADMIN', 'RH', 'CONTABILIDAD'] },

    // Nómina & Analítica
    { id: 'payroll', label: 'Prenómina', icon: Calculator, allowedRoles: ['ADMIN', 'RH', 'CONTABILIDAD'], section: 'NÓMINA Y ANÁLISIS' },
    { id: 'reports', label: 'Reportes Ejecutivos', icon: BarChart3, allowedRoles: ['ADMIN', 'RH', 'CONTABILIDAD', 'GERENTE_DEPARTAMENTO'] },

    // Sistema & Dispositivos
    { id: 'integrations', label: 'Biométricos Hikvision', icon: Cpu, allowedRoles: ['ADMIN', 'RH'], section: 'SISTEMA Y HARDWARE' },
    { id: 'audit', label: 'Bitácora de Auditoría', icon: ShieldAlert, allowedRoles: ['ADMIN'] },
    { id: 'settings', label: 'Configuración General', icon: Settings, allowedRoles: ['ADMIN'] },
  ];

  const filteredItems = navItems.filter(item => item.allowedRoles.includes(currentRole));

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out shadow-xs ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {filteredItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const showSection = item.section && (index === 0 || filteredItems[index - 1]?.section !== item.section);

            return (
              <React.Fragment key={item.id}>
                {showSection && (
                  <div className="pt-4 pb-1.5 px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                    {item.section}
                  </div>
                )}
                <button
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800 border border-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-3.5 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between bg-slate-50">
          <span className="font-medium text-slate-600">Portal RH Hotel v1.0</span>
          <span className="text-slate-800 font-bold">Cancún, MX</span>
        </div>
      </aside>
    </>
  );
};
