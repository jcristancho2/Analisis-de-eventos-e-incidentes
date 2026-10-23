import React, { useState, useMemo } from 'react';
import {
  X,
  MessageSquare,
  Search,
  AlertTriangle,
  Send,
  CheckCheck,
  Check,
  Clock,
  Phone,
  Sparkles,
} from 'lucide-react';
import { MensajeWhatsApp, Paciente } from '../types/clinical';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  mensajes: MensajeWhatsApp[];
  pacientes: Paciente[];
  onSendMessage: (nuevoMensaje: Omit<MensajeWhatsApp, 'id' | 'fechaHora'>) => void;
  preselectedPatient?: Paciente | null;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  mensajes,
  pacientes,
  onSendMessage,
  preselectedPatient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<
    'recordatorio_control' | 'alerta_vencimiento' | 'confirmacion_asistencia' | 'educacion_paciente'
  >('recordatorio_control');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    preselectedPatient?.idCliente || (pacientes[0]?.idCliente ?? '')
  );
  const [customText, setCustomText] = useState('');
  const [showSendForm, setShowSendForm] = useState(false);

  // Template presets
  const templates = {
    recordatorio_control:
      'Hola {nombre}, desde la Fundación Cardiovascular de Colombia (FCV) te recordamos tu próximo control clínico asistencial programado. Por favor confirma tu asistencia respondiendo a este mensaje.',
    alerta_vencimiento:
      'Estimado(a) {nombre}, identificamos en Cerebro FCV que tienes pendiente un control clínico en el Centro de Excelencia. Comunícate al PBX 607 638 4000 o responde este mensaje para agendar tu cita prioritaria.',
    confirmacion_asistencia:
      '{nombre}, tu cita en el Centro de Excelencia FCV ha sido confirmada satisfactoriamente. Te esperamos con tu documento de identidad y exámenes previos.',
    educacion_paciente:
      '{nombre}, te compartimos las recomendaciones de cuidado y adherencia farmacológica del equipo médico de la FCV.',
  };

  const selectedPatientObj = useMemo(() => {
    return pacientes.find((p) => p.idCliente === selectedPatientId) || pacientes[0];
  }, [pacientes, selectedPatientId]);

  const filteredMessages = useMemo(() => {
    if (!searchTerm.trim()) return mensajes;
    const q = searchTerm.toLowerCase();
    return mensajes.filter(
      (m) =>
        m.nombrePaciente.toLowerCase().includes(q) ||
        m.documento.toLowerCase().includes(q) ||
        m.mensaje.toLowerCase().includes(q)
    );
  }, [mensajes, searchTerm]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientObj) return;

    const textToSend =
      customText.trim() ||
      templates[selectedTemplate].replace('{nombre}', selectedPatientObj.paciente);

    onSendMessage({
      pacienteId: selectedPatientObj.idCliente,
      nombrePaciente: selectedPatientObj.paciente,
      documento: selectedPatientObj.documento,
      telefonoDestino: '+57 300 000 0000 [Pruebas]',
      mensaje: textToSend,
      tipoPlantilla: selectedTemplate,
      canal: 'WhatsApp Business API',
      estado: 'Entregado',
    });

    setCustomText('');
    setShowSendForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-[#ececf1] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header (Section 6.4) */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-4 border-b border-[#ececf1]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#f0fdfa] text-[#0f766e] border border-[#0d9488]/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900">
                Mensajes enviados
              </h2>
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700 tabular-nums">
                  {mensajes.length}
                </span>{' '}
                mensajes en la bitácora de WhatsApp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button aria-label={showSendForm ? 'Ver historial de mensajes' : 'Crear un nuevo mensaje'}
              onClick={() => setShowSendForm((prev) => !prev)}
              className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{showSendForm ? 'Ver historial' : 'Nuevo mensaje'}</span>
            </button>

            <button aria-label="Cerrar mensajes"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Banner ámbar (Modo prueba) */}
        <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-xl bg-[#fffbeb] border border-[#fef3c7] text-[#92400e] text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold">Modo prueba activo:</strong> todo se
            envía a un único número de pruebas centralizado de la FCV (+57 300 000
            0000), garantizando que ningún mensaje real llegue al paciente durante
            auditorías o simulaciones.
          </div>
        </div>

        {/* Send Test Message Form (Toggleable) */}
        {showSendForm ? (
          <form onSubmit={handleSend} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Paciente destinatario:
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {pacientes.map((p) => (
                  <option key={p.idCliente} value={p.idCliente}>
                    {p.paciente} ({p.documento}) - ID {p.idCliente}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Plantilla aprobada WhatsApp Business:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'recordatorio_control', label: 'Recordatorio Control' },
                  { key: 'alerta_vencimiento', label: 'Alerta Control Vencido' },
                  { key: 'confirmacion_asistencia', label: 'Confirmación Asistencia' },
                  { key: 'educacion_paciente', label: 'Educación & Cuidado' },
                ].map((tpl) => (
                  <button
                    key={tpl.key}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(tpl.key as any);
                      if (selectedPatientObj) {
                        setCustomText(
                          templates[tpl.key as keyof typeof templates].replace(
                            '{nombre}',
                            selectedPatientObj.paciente
                          )
                        );
                      }
                    }}
                    className={`p-2 text-xs text-left rounded-lg border transition-all ${
                      selectedTemplate === tpl.key
                        ? 'border-emerald-600 bg-emerald-50/70 font-semibold text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Contenido del mensaje:
              </label>
              <textarea
                rows={3}
                value={
                  customText ||
                  (selectedPatientObj
                    ? templates[selectedTemplate].replace(
                        '{nombre}',
                        selectedPatientObj.paciente
                      )
                    : '')
                }
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSendForm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar a número de pruebas</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 p-6 space-y-4">
            {/* Buscador "Buscar por nombre o documento…" */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o documento…"
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-[#ececf1] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Lista de Mensajes o Estado Vacío */}
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 max-h-[400px]">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2 hover:bg-white hover:border-slate-200 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {msg.nombrePaciente}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {msg.documento}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{msg.fechaHora}</span>
                      </div>
                    </div>

                    <p className="text-slate-700 text-xs leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                      {msg.mensaje}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-mono">{msg.telefonoDestino}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full font-medium text-[10px]">
                          {msg.tipoPlantilla.replace('_', ' ')}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            msg.estado === 'Leído'
                              ? 'text-sky-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {msg.estado === 'Leído' ? (
                            <CheckCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>{msg.estado}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                /* Estado Vacío (Section 6.4) */
                <div className="py-12 text-center text-slate-400 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-300">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">
                    Todavía no se ha enviado ningún mensaje.
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Los recordatorios asistenciales programados o manuales aparecerán
                    registrados aquí en tiempo real.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-[#ececf1] flex items-center justify-between text-[11px] text-slate-500">
          <span>Servicio WhatsApp Business API FCV</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-100 text-slate-700 font-medium"
          >
            Cerrar bitácora
          </button>
        </div>
      </div>
    </div>
  );
};
