import React, { useState } from 'react';
import {
  X,
  User,
  Activity,
  Calendar,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  Clock,
  Building2,
  FileText,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Scale,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Paciente, CentroExcelencia } from '../types/clinical';

interface PatientDetailModalProps {
  paciente: Paciente | null;
  centro?: CentroExcelencia | null;
  onClose: () => void;
  onOpenWhatsAppForPatient: (paciente: Paciente) => void;
  onResolveAlert: (pacienteId: string, alertaId: string) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  paciente,
  centro,
  onClose,
  onOpenWhatsAppForPatient,
  onResolveAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'clinico' | 'sociodemografico' | 'controles'>('clinico');

  if (!paciente) return null;

  const hasAlert = paciente.alertas.length > 0;

  // Timeline de controles asistenciales del Centro de Excelencia
  const timeline = [
    {
      etapa: 'Ingreso al Centro',
      fecha: paciente.fechaIngreso,
      estado: 'Completado',
      nota: `Derivación vía ${paciente.viaAcceso}. Valoración inicial y asignación a ciclo ${paciente.ciclo}.`,
    },
    {
      etapa: 'Control 1 mes',
      fecha: '2026-06-15',
      estado: hasAlert && paciente.alertas.some((a) => a.texto.includes('control 1 mes')) ? 'Vencido' : 'Completado',
      nota: 'Evaluación post-tratamiento, adherencia y tamizaje de factores de riesgo.',
    },
    {
      etapa: 'Control 3 meses',
      fecha: '2026-08-20',
      estado: hasAlert && paciente.alertas.some((a) => a.texto.includes('control 3 meses')) ? 'Vencido' : 'Completado',
      nota: 'Seguimiento de metas clínicas FCV y ajuste de medicación.',
    },
    {
      etapa: 'Control 6 meses / Anual',
      fecha: paciente.proximoControl?.includes('Vencido') ? 'Pendiente agendar' : paciente.proximoControl || '2026-12-10',
      estado: paciente.proximoControl?.includes('Vencido') ? 'Vencido' : 'Programado',
      nota: 'Control multidisciplinario con enfermería clínica y especialista.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-[#ececf1] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[94vh] sm:max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header de la Ficha Clínica */}
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-[#ececf1] bg-gradient-to-r from-slate-50 via-white to-violet-50/30">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
              {paciente.paciente.charAt(0)}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 break-words">
                  {paciente.paciente}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    paciente.estado === 'Activo'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {paciente.estado}
                </span>
                <span className="px-2 py-0.5 bg-violet-100 text-violet-800 rounded font-semibold text-xs">
                  Ciclo {paciente.ciclo}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono flex-wrap">
                <span>{paciente.documento}</span>
                <span>·</span>
                <span>ID Cliente: {paciente.idCliente}</span>
                <span>·</span>
                <span>{paciente.edad} años ({paciente.sexo})</span>
                {centro && (
                  <>
                    <span>·</span>
                    <span className="text-violet-700 font-medium">
                      {centro.nombre}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button aria-label="Cerrar ficha del paciente"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner de alerta activa si existe */}
        {hasAlert && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-xl bg-[#fffbeb] border border-[#fef3c7] text-[#92400e] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <strong className="font-semibold">Alerta clínica activa:</strong>{' '}
                {paciente.alertas.map((a) => a.texto).join(' | ')}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {paciente.alertas.map((a) => (
                <button
                  key={a.id}
                  onClick={() => onResolveAlert(paciente.idCliente, a.id)}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100/60 border border-amber-300 text-amber-800 rounded-lg text-xs font-medium transition-colors"
                >
                  Resolver alerta
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selector de pestañas */}
        <div className="flex items-center gap-2 overflow-x-auto px-4 sm:px-6 pt-4 border-b border-[#ececf1] bg-white text-xs whitespace-nowrap custom-scrollbar">
          <button aria-pressed={activeTab === 'clinico'}
            onClick={() => setActiveTab('clinico')}
            className={`pb-2.5 font-semibold transition-colors border-b-2 ${
              activeTab === 'clinico'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Perfil Clínico & Antropometría
          </button>
          <button aria-pressed={activeTab === 'controles'}
            onClick={() => setActiveTab('controles')}
            className={`pb-2.5 font-semibold transition-colors border-b-2 ${
              activeTab === 'controles'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Trayectoria de Controles ({timeline.length})
          </button>
          <button aria-pressed={activeTab === 'sociodemografico'}
            onClick={() => setActiveTab('sociodemografico')}
            className={`pb-2.5 font-semibold transition-colors border-b-2 ${
              activeTab === 'sociodemografico'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Datos Sociodemográficos & Contacto
          </button>
        </div>

        {/* Contenido de la Ficha */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {activeTab === 'clinico' && (
            <div className="space-y-4">
              {/* Tarjetas resumen de parámetros */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
                    Peso & Talla
                  </span>
                  <div className="text-base font-bold text-slate-900 mt-1 tabular-nums">
                    {paciente.pesoKg} kg · {paciente.tallaCm} cm
                  </div>
                  <span className="text-[11px] text-slate-400">Medición validada</span>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
                    IMC & Nutrición
                  </span>
                  <div className="text-base font-bold text-slate-900 mt-1 tabular-nums">
                    {paciente.imc}{' '}
                    <span className="text-xs font-normal text-slate-600">
                      ({paciente.estadoNutricional})
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    Clasificación FCV
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
                    Grupo Sanguíneo (RH)
                  </span>
                  <div className="text-base font-bold text-slate-900 mt-1 font-mono">
                    {paciente.rh}
                  </div>
                  <span className="text-[11px] text-slate-400">Historia clínica</span>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
                    Vía de acceso
                  </span>
                  <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                    {paciente.viaAcceso}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Ingreso {paciente.fechaIngreso}
                  </span>
                </div>
              </div>

              {/* Antecedentes Clínicos */}
              <div className="bg-white border border-[#ececf1] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <FileText className="w-4 h-4 text-violet-600" />
                  <span>Antecedentes y comorbilidades reportadas</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {paciente.antecedentes}
                </p>
              </div>

              {/* Observaciones del equipo asistencial */}
              <div className="bg-white border border-[#ececf1] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Activity className="w-4 h-4 text-violet-600" />
                  <span>Observaciones y plan de seguimiento clínico FCV</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {paciente.observacionesClinicas}
                </p>
                <div className="pt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100">
                  <span>Último control registrado: {paciente.ultimoControl || '—'}</span>
                  <span>Próximo control previsto: {paciente.proximoControl || '—'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'controles' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Trayectoria cronológica del protocolo asistencial para {centro?.nombre || 'el Centro de Excelencia'}.
              </p>

              <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 py-2">
                {timeline.map((item, idx) => (
                  <div key={idx} className="relative pl-6 group">
                    {/* Bullet marker */}
                    <div
                      className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                        item.estado === 'Vencido'
                          ? 'border-amber-500 bg-amber-50'
                          : item.estado === 'Completado'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.estado === 'Vencido'
                            ? 'bg-amber-600'
                            : item.estado === 'Completado'
                            ? 'bg-emerald-600'
                            : 'bg-slate-400'
                        }`}
                      />
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1 hover:border-slate-200 transition-all">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{item.etapa}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.estado === 'Vencido'
                              ? 'bg-amber-100 text-amber-800'
                              : item.estado === 'Completado'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {item.estado}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        Fecha: {item.fecha}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{item.nota}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sociodemografico' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Afiliación y Seguridad Social */}
              <div className="bg-white border border-[#ececf1] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
                  <Building2 className="w-4 h-4 text-violet-600" />
                  <span>Aseguramiento & EPS</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">EPS:</span>
                    <span className="font-semibold text-slate-900">{paciente.eps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Régimen:</span>
                    <span className="font-medium text-slate-800">{paciente.regimen}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Plan:</span>
                    <span className="font-medium text-slate-800">{paciente.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tipo Afiliación:</span>
                    <span className="font-medium text-slate-800">{paciente.afiliacion}</span>
                  </div>
                </div>
              </div>

              {/* Ubicación y Residencia */}
              <div className="bg-white border border-[#ececf1] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
                  <MapPin className="w-4 h-4 text-violet-600" />
                  <span>Ubicación y Vivienda</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Zona:</span>
                    <span className="font-semibold text-slate-900">{paciente.zona}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dirección:</span>
                    <span className="font-medium text-slate-800 text-right">{paciente.direccion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Conviven:</span>
                    <span className="font-medium text-slate-800">{paciente.conviven}</span>
                  </div>
                </div>
              </div>

              {/* Canales de Contacto */}
              <div className="bg-white border border-[#ececf1] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
                  <Phone className="w-4 h-4 text-violet-600" />
                  <span>Canales de Contacto</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Teléfono Móvil:</span>
                    <span className="font-mono font-medium text-slate-900">{paciente.telMovil}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Teléfono Casa:</span>
                    <span className="font-mono text-slate-700">{paciente.telCasa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Correo Electrónico:</span>
                    <span className="font-mono text-slate-700">{paciente.email}</span>
                  </div>
                </div>
              </div>

              {/* Perfil Sociodemográfico */}
              <div className="bg-white border border-[#ececf1] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
                  <User className="w-4 h-4 text-violet-600" />
                  <span>Datos Socioculturales</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estado Civil:</span>
                    <span className="font-medium text-slate-800">{paciente.estadoCivil}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Escolaridad:</span>
                    <span className="font-medium text-slate-800">{paciente.escolaridad}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ocupación:</span>
                    <span className="font-medium text-slate-800">{paciente.ocupacion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Etnia / Religión:</span>
                    <span className="font-medium text-slate-800">{paciente.etnia} · {paciente.religion}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con acciones clínicas */}
        <div className="p-4 bg-slate-50 border-t border-[#ececf1] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            Registro confidencial · Ley 1581 de 2012 · Fundación Cardiovascular de Colombia
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenWhatsAppForPatient(paciente);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0f766e] bg-[#f0fdfa] border border-[#0d9488]/30 rounded-lg shadow-sm hover:bg-[#ccfbf1] transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Enviar WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-[#e5e5e5] rounded-lg shadow-sm hover:bg-slate-100 transition-colors"
            >
              Cerrar ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
