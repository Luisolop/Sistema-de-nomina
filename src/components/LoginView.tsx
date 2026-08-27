import React from 'react';
import { Building2, ShieldCheck, AlertOctagon, CheckCircle, ArrowRight, Lock } from 'lucide-react';
import { useApp } from '../services/store';
import { UserRole } from '../types';

export const LoginView: React.FC = () => {
  const { loginWithGoogle, authLoading, authError, switchDemoRole, settings } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background visual backdrop */}
      <div 
        className="absolute inset-0 opacity-5 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&auto=format&fit=crop&q=80")'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-md border border-slate-700">
            <Building2 className="w-9 h-9" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {settings.hotelName || 'Grand Playa Resort & Spa'}
        </h2>
        <p className="mt-1 text-center text-xs text-slate-700 font-semibold tracking-wider uppercase">
          SISTEMA DE RECURSOS HUMANOS, ASISTENCIA Y PRENÓMINA
        </p>
        <p className="text-center text-xs text-slate-500 mt-1">
          {settings.companyName}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-slate-200 sm:px-10">
          
          {/* Security Banner */}
          <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <ShieldCheck className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Acceso Corporativo Seguro:</span> Inicio de sesión exclusivo mediante cuenta institucional de Google y verificación contra el padrón autorizado.
            </div>
          </div>

          {/* Auth Error / Rejection Screen */}
          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-shake">
              <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-rose-900 text-sm mb-0.5">Acceso denegado</div>
                <div>{authError}</div>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={loginWithGoogle}
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm shadow-2xs hover:shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{authLoading ? 'Verificando autorización...' : 'Continuar con Google'}</span>
          </button>

          {/* Quick Demo Access Roles */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-center text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              O explorar perfiles de demostración
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => switchDemoRole('ADMIN')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-left border border-slate-200 transition group shadow-2xs"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-black">Administrador</div>
                <div className="text-[10px] text-slate-500">Acceso total al sistema</div>
              </button>
              <button
                onClick={() => switchDemoRole('RH')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-left border border-slate-200 transition group shadow-2xs"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-black">Recursos Humanos</div>
                <div className="text-[10px] text-slate-500">Expedientes y control</div>
              </button>
              <button
                onClick={() => switchDemoRole('CONTABILIDAD')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-left border border-slate-200 transition group shadow-2xs"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-black">Contabilidad</div>
                <div className="text-[10px] text-slate-500">Prenómina y salarios</div>
              </button>
              <button
                onClick={() => switchDemoRole('GERENTE_DEPARTAMENTO')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-left border border-slate-200 transition group shadow-2xs"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-black">Gerente de Depto</div>
                <div className="text-[10px] text-slate-500">Sólo su personal</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-600" />
            <span>Encriptación TLS y Firestore Security Rules</span>
          </div>

        </div>
      </div>
    </div>
  );
};
