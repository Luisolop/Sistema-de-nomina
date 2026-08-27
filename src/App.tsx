import React, { useState } from 'react';
import { AppProvider, useApp } from './services/store';
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { EmployeesView } from './components/EmployeesView';
import { AttendanceView } from './components/AttendanceView';
import { CorrectionsView } from './components/CorrectionsView';
import { SchedulesView } from './components/SchedulesView';
import { VacationsView } from './components/VacationsView';
import { LeavesView } from './components/LeavesView';
import { BenefitsView } from './components/BenefitsView';
import { HolidaysView } from './components/HolidaysView';
import { PayrollView } from './components/PayrollView';
import { ReportsView } from './components/ReportsView';
import { IntegrationsView } from './components/IntegrationsView';
import { AuditView } from './components/AuditView';
import { SettingsView } from './components/SettingsView';
import { AttendanceRecord } from './types';
import { Menu, ShieldAlert } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, authLoading, currentRole } = useApp();
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedCorrectionRecord, setSelectedCorrectionRecord] = useState<AttendanceRecord | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 gap-3">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-wide text-slate-700">Cargando Portal RH Hotel...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView />;
  }

  const handleRequestCorrectionFromAttendance = (record: AttendanceRecord) => {
    setSelectedCorrectionRecord(record);
    setCurrentTab('corrections');
  };

  const handleSearchSelect = (item: any) => {
    if (item.employeeNumber) {
      setCurrentTab('employees');
    } else if (item.code) {
      setCurrentTab('schedules');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-800 selection:text-white">
      
      {/* Top Header */}
      <Header onSearchSelect={handleSearchSelect} />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Responsive Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/80 p-4 sm:p-6 lg:p-8">
          
          {/* Mobile Menu Toggle Bar */}
          <div className="lg:hidden flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 flex items-center gap-2 text-xs font-semibold shadow-xs"
            >
              <Menu className="w-4 h-4 text-slate-600" />
              <span>Menú de Navegación</span>
            </button>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              {currentTab}
            </span>
          </div>

          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && <DashboardView onNavigate={setCurrentTab} />}
            {currentTab === 'employees' && <EmployeesView />}
            {currentTab === 'attendance' && <AttendanceView onRequestCorrection={handleRequestCorrectionFromAttendance} />}
            {currentTab === 'corrections' && (
              <CorrectionsView
                preloadedRecord={selectedCorrectionRecord}
                onClearPreloaded={() => setSelectedCorrectionRecord(null)}
              />
            )}
            {currentTab === 'schedules' && <SchedulesView />}
            {currentTab === 'vacations' && <VacationsView />}
            {currentTab === 'leaves' && <LeavesView />}
            {currentTab === 'benefits' && <BenefitsView />}
            {currentTab === 'holidays' && <HolidaysView />}
            {currentTab === 'payroll' && <PayrollView />}
            {currentTab === 'reports' && <ReportsView />}
            {currentTab === 'integrations' && <IntegrationsView />}
            {currentTab === 'audit' && <AuditView />}
            {currentTab === 'settings' && <SettingsView />}
          </div>

        </main>
      </div>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
