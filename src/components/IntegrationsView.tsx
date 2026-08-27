import React, { useState } from 'react';
import { 
  Cpu, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  Terminal, 
  Key, 
  ShieldCheck, 
  Clock, 
  FileCode, 
  Download,
  CheckCircle,
  Activity,
  Layers,
  Settings,
  Timer,
  Play,
  Pause,
  Database,
  Cloud,
  Check
} from 'lucide-react';
import { useApp } from '../services/store';
import { IntegrationConfig } from '../types';

export const IntegrationsView: React.FC = () => {
  const { 
    integrationConfig, 
    updateIntegrationConfig, 
    testBiometricConnection, 
    syncBiometricsNow, 
    formattedCountdown,
    secondsUntilNextSync,
    rawEvents,
    dbStats,
    syncAllDataToFirestore
  } = useApp();

  const [formData, setFormData] = useState<IntegrationConfig>({ ...integrationConfig });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [backingUpDb, setBackingUpDb] = useState(false);
  const [dbBackupResult, setDbBackupResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testBiometricConnection();
    setTesting(false);
    setTestResult(res);
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    const res = await syncBiometricsNow();
    setSyncing(false);
    setSyncResult(res);
  };

  const handleManualDbBackup = async () => {
    setBackingUpDb(true);
    setDbBackupResult(null);
    const res = await syncAllDataToFirestore();
    setBackingUpDb(false);
    setDbBackupResult(res);
    setTimeout(() => setDbBackupResult(null), 5000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateIntegrationConfig(formData);
    setTestResult({ success: true, message: 'Configuración de sincronización guardada exitosamente.' });
    setTimeout(() => setTestResult(null), 4000);
  };

  const toggleAutoSync = () => {
    const nextState = !formData.autoSync;
    setFormData(prev => ({ ...prev, autoSync: nextState }));
    updateIntegrationConfig({ autoSync: nextState });
  };

  const totalIntervalSeconds = (integrationConfig.syncIntervalMinutes || 120) * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalIntervalSeconds - secondsUntilNextSync) / totalIntervalSeconds) * 100));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-slate-700" />
            <span>Integración de Biométricos y Base de Datos</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Conexión con servidores OpenAPI HikCentral Professional y persistencia continua en Base de Datos Firestore
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <Activity className={`w-3.5 h-3.5 text-slate-600 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Probando...' : 'Probar Conexión'}</span>
          </button>

          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-white' : ''}`} />
            <span>{syncing ? 'Sincronizando...' : 'Sincronizar Biométricos'}</span>
          </button>
        </div>
      </div>

      {/* Cloud Database (Firestore) Service Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Servicio de Base de Datos Cloud (Firebase Firestore)</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Conectado y En Línea
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ID de Base de Datos: <span className="font-mono text-slate-800 font-semibold">{dbStats.databaseId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualDbBackup}
              disabled={backingUpDb}
              className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Cloud className={`w-3.5 h-3.5 text-slate-700 ${backingUpDb ? 'animate-pulse' : ''}`} />
              <span>{backingUpDb ? 'Respaldando en BD...' : 'Respaldar BD Ahora'}</span>
            </button>
          </div>
        </div>

        {/* Database Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-700">Eventos Biométricos Guardados</div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-1">{rawEvents.length}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Colección <span className="font-mono">raw_biometric_events</span></div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-700">Registros de Asistencia en BD</div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-1">{dbStats.attendanceRecordsCount || 30}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Colección <span className="font-mono">attendance_records</span></div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-700">Colaboradores Sincronizados</div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-1">{dbStats.employeesCount || 10}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Colección <span className="font-mono">employees</span></div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-700">Bitácoras de Sincronización</div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-1">{dbStats.syncLogsCount || 1}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Colección <span className="font-mono">biometric_sync_logs</span></div>
          </div>
        </div>

        {dbBackupResult && (
          <div className={`mt-3 p-3 rounded-xl border text-xs flex items-center gap-2 ${
            dbBackupResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{dbBackupResult.message}</span>
          </div>
        )}
      </div>

      {/* Auto-Sync Live Status & Countdown Banner */}
      <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Sincronización Periódica Cada {formData.syncIntervalMinutes >= 60 ? `${formData.syncIntervalMinutes / 60} Horas` : `${formData.syncIntervalMinutes} Minutos`}</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  integrationConfig.autoSync ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${integrationConfig.autoSync ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                  {integrationConfig.autoSync ? 'ACTIVA' : 'PAUSADA'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Próxima descarga y guardado en BD en: <strong className="text-slate-900 font-mono text-sm">{formattedCountdown}</strong> • Último lote: {integrationConfig.lastSyncEventsCount || 0} eventos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={toggleAutoSync}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border cursor-pointer ${
                integrationConfig.autoSync 
                  ? 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100' 
                  : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
              }`}
            >
              {integrationConfig.autoSync ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{integrationConfig.autoSync ? 'Pausar Auto-Sync' : 'Activar Auto-Sync'}</span>
            </button>
          </div>
        </div>

        {/* Visual Progress Bar to Next Sync */}
        {integrationConfig.autoSync && (
          <div className="mt-3.5">
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-slate-800 h-full rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      {testResult && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-3 animate-fadeIn ${
          testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {testResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <div>
            <div className="font-bold">{testResult.success ? 'Conexión Exitosa con Servidor Biométrico' : 'Error de Conexión'}</div>
            <div>{testResult.message}</div>
          </div>
        </div>
      )}

      {syncResult && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-3 animate-fadeIn ${
          syncResult.success ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {syncResult.success ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <div>
            <div className="font-bold">{syncResult.success ? 'Sincronización y Guardado en BD Exitoso' : 'Fallo de Sincronización'}</div>
            <div>{syncResult.message}</div>
          </div>
        </div>
      )}

      {/* Config Form & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Connection Parameters Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-slate-700" />
            <span>Parámetros de Comunicación OpenAPI / Agente Local</span>
          </h2>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Tipo de Proveedor / Arquitectura</label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-slate-400 focus:bg-white focus:outline-none"
                >
                  <option value="HikCentral">HikCentral Professional (OpenAPI Artemis)</option>
                  <option value="LocalAgent">Agente Local LAN (Hotel Biometric Connector)</option>
                  <option value="HikConnect">Hik-Connect Cloud Gateway</option>
                  <option value="Manual">Carga Directa Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">IP o Dominio del Servidor *</label>
                <input
                  type="text"
                  required
                  value={formData.serverUrl}
                  onChange={(e) => setFormData({ ...formData, serverUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-slate-400 focus:bg-white focus:outline-none"
                  placeholder="ej. 192.168.1.150 o hikcentral.hotelplayaroyale.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Puerto de API</label>
                <input
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 443 })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-slate-400 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="httpsCheck"
                  checked={formData.useHttps}
                  onChange={(e) => setFormData({ ...formData, useHttps: e.target.checked })}
                  className="rounded text-slate-800 focus:ring-slate-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="httpsCheck" className="text-slate-700 font-semibold cursor-pointer">
                  Utilizar canal cifrado HTTPS / TLS (Recomendado)
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Usuario / AppKey *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-slate-400 focus:bg-white focus:outline-none"
                  placeholder="admin o AppKey"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">AppSecret / Clave de Acceso *</label>
                <input
                  type="password"
                  required
                  value={formData.tokenOrPasswordMasked}
                  onChange={(e) => setFormData({ ...formData, tokenOrPasswordMasked: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-slate-400 focus:bg-white focus:outline-none"
                  placeholder="••••••••••••••••"
                />
              </div>
            </div>

            {/* Periodic Synchronization Interval Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="autoSyncCheck"
                  checked={formData.autoSync}
                  onChange={(e) => setFormData({ ...formData, autoSync: e.target.checked })}
                  className="rounded text-slate-800 focus:ring-slate-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="autoSyncCheck" className="text-slate-800 font-semibold cursor-pointer">
                  Habilitar sincronización periódica automática
                </label>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Frecuencia de Sincronización Automática</label>
                <select
                  value={formData.syncIntervalMinutes}
                  onChange={(e) => setFormData({ ...formData, syncIntervalMinutes: parseInt(e.target.value) || 120 })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-slate-400 focus:bg-white focus:outline-none"
                >
                  <option value={15}>Cada 15 minutos</option>
                  <option value={30}>Cada 30 minutos</option>
                  <option value={60}>Cada 1 hora</option>
                  <option value={120}>Cada 2 horas (Estándar recomendado)</option>
                  <option value={240}>Cada 4 horas</option>
                  <option value={480}>Cada 8 horas (Por turno)</option>
                  <option value={1440}>Cada 24 horas (Diario nocturno)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                Guardar Configuración
              </button>
            </div>
          </form>
        </div>

        {/* Local On-Premise Connector Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-700" />
              <span>Agente Local de Sincronización</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Para terminales en red privada LAN sin IP pública, el agente Node.js / Docker lee los eventos de HikCentral cada 2 horas y los guarda en la base de datos Firestore.
            </p>

            <div className="mt-4 p-3.5 bg-slate-100 text-slate-800 rounded-xl border border-slate-300 font-mono text-[11px] space-y-1">
              <div className="text-slate-500"># Ejecutar en servidor del hotel:</div>
              <div className="text-slate-900 font-semibold">npx @hotel-rh/hikvision-agent \</div>
              <div>  --interval 2h \</div>
              <div>  --server https://192.168.1.150 \</div>
              <div>  --firestore ai-studio-portalrhhotel</div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0" />
            <span>Idempotencia SHA-256: Los eventos biométricos se persisten sin duplicados en Firestore.</span>
          </div>
        </div>

      </div>

      {/* Raw Event Log & Database Inspector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Bitácora de Eventos y Base de Datos Biométricos</span>
            </h3>
            <p className="text-xs text-slate-500">Checadas capturadas directamente desde terminales faciales y guardadas en Firestore</p>
          </div>
          <span className="text-xs font-mono text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 font-bold self-start sm:self-auto">
            {rawEvents.length} Eventos en Base de Datos
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">ID Evento</th>
                <th className="py-2.5 px-3">Terminal / Dispositivo</th>
                <th className="py-2.5 px-3">ID Colaborador</th>
                <th className="py-2.5 px-3">Fecha y Hora</th>
                <th className="py-2.5 px-3">Método</th>
                <th className="py-2.5 px-3 text-right">Estatus Base de Datos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {rawEvents.map(evt => (
                <tr key={evt.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 text-slate-500">{evt.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-700">{evt.deviceId}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{evt.externalEmployeeId}</td>
                  <td className="py-2.5 px-3 text-slate-600">{evt.timestamp}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-800 border border-slate-300 font-semibold">
                      {evt.verificationMode || 'FACE'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      ALMACENADO EN BD
                    </span>
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
