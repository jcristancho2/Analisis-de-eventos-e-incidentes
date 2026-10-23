import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { Header } from './components/Header';
import { CentrosGrid } from './components/CentrosGrid';
import { CenterDashboard } from './components/CenterDashboard';
import { PatientsTable } from './components/PatientsTable';
import { WhatsAppModal } from './components/WhatsAppModal';
import { PatientDetailModal } from './components/PatientDetailModal';
import { DashboardLab } from './components/DashboardLab';
import {
  CENTROS_EXCELENCIA,
  generateSyntheticPatients,
  INITIAL_MESSAGES,
  RENAL_CONSERVATIVE_TEST_PATIENTS,
} from './data/mockClinicalData';
import {
  CentroExcelencia,
  Paciente,
  MensajeWhatsApp,
  FichaEmpalme,
} from './types/clinical';
import { exportPatientsToExcel } from './utils/exportExcel';
import { Loader2, CheckCircle2, Shield, HeartPulse } from 'lucide-react';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('cerebro-theme') === 'dark');
  const [centros, setCentros] = useState<CentroExcelencia[]>(CENTROS_EXCELENCIA);
  const [selectedCentro, setSelectedCentro] = useState<CentroExcelencia | null>(null);
  const [currentView, setCurrentView] = useState<'centros' | 'detalle' | 'laboratorio'>('centros');

  // Loading state when opening a center (Section 7)
  const [isLoadingCenter, setIsLoadingCenter] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // Patients dataset cache per center
  const [patientsByCenter, setPatientsByCenter] = useState<Record<number, Paciente[]>>({
    3: generateSyntheticPatients(3, 40), // Reemplazo de Cadera default sample
    2: generateSyntheticPatients(2, 36), // Asma en Pediatría
    15: RENAL_CONSERVATIVE_TEST_PATIENTS, // ERC: fuente sintética de manejo conservador
  });

  // Current patients of selected center
  const currentPatients = useMemo(() => {
    if (!selectedCentro) return [];
    if (!patientsByCenter[selectedCentro.id]) {
      return [];
    }
    return patientsByCenter[selectedCentro.id];
  }, [selectedCentro, patientsByCenter]);

  // Dashboard Filters passed to Table
  const [selectedEpsFilter, setSelectedEpsFilter] = useState<string | null>(null);
  const [selectedNutritionFilter, setSelectedNutritionFilter] = useState<string | null>(null);
  const [selectedRenalStageFilter, setSelectedRenalStageFilter] = useState<string | null>(null);

  // WhatsApp Messages Bitácora
  const [mensajes, setMensajes] = useState<MensajeWhatsApp[]>(INITIAL_MESSAGES);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState<boolean>(false);
  const [whatsAppPreselectedPatient, setWhatsAppPreselectedPatient] = useState<Paciente | null>(null);

  // Patient Detail Drawer / Modal
  const [detailPatient, setDetailPatient] = useState<Paciente | null>(null);

  // Sync state
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdatedMinutes, setLastUpdatedMinutes] = useState<number>(4);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', isDarkMode);
    localStorage.setItem('cerebro-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Select Center with realistic loading transition (Section 7)
  const handleSelectCentro = (centro: CentroExcelencia) => {
    setIsLoadingCenter(true);
    setSelectedEpsFilter(null);
    setSelectedNutritionFilter(null);
    setSelectedRenalStageFilter(null);

    // If patients for this center are not cached yet, generate them
    if (!patientsByCenter[centro.id]) {
      const generated = generateSyntheticPatients(centro.id, 35);
      setPatientsByCenter((prev) => ({ ...prev, [centro.id]: generated }));
    }

    setTimeout(() => {
      startTransition(() => {
        setSelectedCentro(centro);
        setCurrentView('detalle');
        setIsLoadingCenter(false);
      });
    }, 380);
  };

  const handleBackToCentros = () => {
    setCurrentView('centros');
    setSelectedCentro(null);
    setSelectedEpsFilter(null);
    setSelectedNutritionFilter(null);
    setSelectedRenalStageFilter(null);
  };

  const handlePublishFicha = (ficha: FichaEmpalme) => {
    const nextId = Math.max(...centros.map((centro) => centro.id), 0) + 1;
    const nuevoCentro: CentroExcelencia = {
      id: nextId,
      codigo: ficha.codigo,
      nombre: ficha.nombreCentro,
      categoria: ficha.categoria,
      descripcion: ficha.descripcion,
      pacientesActivos: ficha.volumenEstimado,
      pacientesTotales: ficha.volumenEstimado,
      alertasActivas: 0,
      colorIcono: 'violet',
      iconoNombre: 'Sparkles',
    };
    setCentros((prev) => [...prev, nuevoCentro]);
    setPatientsByCenter((prev) => ({ ...prev, [nextId]: generateSyntheticPatients(nextId, ficha.volumenEstimado) }));
    setSelectedCentro(nuevoCentro);
    setCurrentView('detalle');
    showToast(`Tablero de ${ficha.nombreCentro} creado desde la ficha de empalme.`);
  };

  // Refresh sync with FCV
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdatedMinutes(0);
      showToast('Sincronización completa con historia clínica FCV.');
    }, 700);
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!selectedCentro) return;
    exportPatientsToExcel(currentPatients, selectedCentro.nombre);
    showToast(`Archivo Excel descargado para ${selectedCentro.nombre}.`);
  };

  // Send WhatsApp Message in test mode
  const handleSendWhatsAppMessage = (
    nuevo: Omit<MensajeWhatsApp, 'id' | 'fechaHora'>
  ) => {
    const id = `MSG-${(mensajes.length + 1).toString().padStart(3, '0')}`;
    const now = new Date();
    const fechaHora = `${now.toISOString().split('T')[0]} ${now
      .toTimeString()
      .split(' ')[0]}`;

    const item: MensajeWhatsApp = {
      ...nuevo,
      id,
      fechaHora,
    };

    setMensajes((prev) => [item, ...prev]);
    showToast(`Mensaje registrado en bitácora de pruebas para ${nuevo.nombrePaciente}.`);
  };

  // Resolve Alert for a patient
  const handleResolveAlert = (pacienteId: string, alertaId: string) => {
    if (!selectedCentro) return;

    setPatientsByCenter((prev) => {
      const currentList = prev[selectedCentro.id] || [];
      const updated = currentList.map((p) => {
        if (p.idCliente === pacienteId) {
          return {
            ...p,
            alertas: p.alertas.filter((a) => a.id !== alertaId),
            ultimoControl: new Date().toISOString().split('T')[0],
            proximoControl: 'Programado (al día)',
          };
        }
        return p;
      });
      return { ...prev, [selectedCentro.id]: updated };
    });

    if (detailPatient && detailPatient.idCliente === pacienteId) {
      setDetailPatient((prev) =>
        prev
          ? {
              ...prev,
              alertas: prev.alertas.filter((a) => a.id !== alertaId),
              ultimoControl: new Date().toISOString().split('T')[0],
              proximoControl: 'Programado (al día)',
            }
          : null
      );
    }

    showToast('Alerta clínica resuelta y control asistencial registrado.');
  };

  return (
    <div className="page-wrapper flex flex-col">
      {/* Top Bar Header */}
      <Header
        currentView={currentView}
        selectedCentro={selectedCentro}
        onBackToCentros={handleBackToCentros}
        onExportExcel={handleExportExcel}
        onOpenMessages={() => {
          setWhatsAppPreselectedPatient(null);
          setIsWhatsAppOpen(true);
        }}
        onRefreshData={handleRefresh}
        isRefreshing={isRefreshing}
        lastUpdatedMinutes={lastUpdatedMinutes}
        messagesCount={mensajes.length}
        onOpenLab={() => setCurrentView('laboratorio')}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((current) => !current)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Loading Spinner State (Section 7) */}
        {isLoadingCenter ? (
          <div className="min-h-[500px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-800">Cargando…</p>
            <p className="text-xs text-slate-500">
              Sincronizando pacientes y agregados del centro FCV
            </p>
          </div>
        ) : currentView === 'laboratorio' ? (
          <DashboardLab onBack={handleBackToCentros} onPublish={handlePublishFicha} />
        ) : currentView === 'centros' ? (
          /* Pantalla 1: Central de Seguimiento (Listado de 37 centros) */
          <CentrosGrid
            centros={centros}
            onSelectCentro={handleSelectCentro}
          />
        ) : selectedCentro ? (
          /* Pantalla 2: Detalle de Centro (Dashboard KPIs + Tabla de Pacientes) */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Dashboard Bento KPIs (Section 6.1) */}
            <CenterDashboard
              centro={selectedCentro}
              pacientes={currentPatients}
              selectedEpsFilter={selectedEpsFilter}
              onSelectEpsFilter={setSelectedEpsFilter}
              selectedNutritionFilter={selectedNutritionFilter}
              onSelectNutritionFilter={setSelectedNutritionFilter}
              selectedRenalStageFilter={selectedRenalStageFilter}
              onSelectRenalStageFilter={setSelectedRenalStageFilter}
            />

            {/* Separador sutil */}
            <div className="h-px bg-[#ececf1] w-full" />

            {/* Tabla de Pacientes del Centro (Section 6.2 & 6.3) */}
            <PatientsTable
              pacientes={currentPatients}
              onSelectPatient={(paciente) => setDetailPatient(paciente)}
              epsFilter={selectedEpsFilter}
              onClearEpsFilter={() => setSelectedEpsFilter(null)}
              nutritionFilter={selectedNutritionFilter}
              onClearNutritionFilter={() => setSelectedNutritionFilter(null)}
              renalStageFilter={selectedRenalStageFilter}
              onClearRenalStageFilter={() => setSelectedRenalStageFilter(null)}
            />
          </div>
        ) : null}
      </main>

      {/* Modal Bitácora WhatsApp (Section 6.4) */}
      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => {
          setIsWhatsAppOpen(false);
          setWhatsAppPreselectedPatient(null);
        }}
        mensajes={mensajes}
        pacientes={currentPatients.length > 0 ? currentPatients : generateSyntheticPatients(1, 10)}
        onSendMessage={handleSendWhatsAppMessage}
        preselectedPatient={whatsAppPreselectedPatient}
      />

      {/* Modal / Drawer Ficha Paciente */}
      <PatientDetailModal
        paciente={detailPatient}
        centro={selectedCentro}
        onClose={() => setDetailPatient(null)}
        onOpenWhatsAppForPatient={(paciente) => {
          setWhatsAppPreselectedPatient(paciente);
          setIsWhatsAppOpen(true);
        }}
        onResolveAlert={handleResolveAlert}
      />

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs py-2.5 px-4 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer corporativo FCV sobrio */}
      <footer className="border-t border-[#ececf1] bg-white py-4 px-4 md:px-8 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Cerebro FCV</span>
            <span>·</span>
            <span>Plataforma de Centros de Excelencia en Salud</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Datos sintéticos de demostración · Ley 1581 de 2012</span>
            <span>Fundación Cardiovascular de Colombia</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
