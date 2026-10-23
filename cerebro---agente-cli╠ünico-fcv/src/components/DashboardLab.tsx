import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, ClipboardPaste, FileText, LayoutDashboard, Sparkles } from 'lucide-react';
import { CategoriaCentro, FichaEmpalme } from '../types/clinical';

interface DashboardLabProps {
  onBack: () => void;
  onPublish: (ficha: FichaEmpalme) => void;
}

const CATEGORIES: { value: CategoriaCentro; label: string }[] = [
  { value: 'cardiovascular', label: 'Cardiovascular' },
  { value: 'oncologico', label: 'Oncología' },
  { value: 'pediatrico', label: 'Pediatría' },
  { value: 'quirurgico', label: 'Quirúrgico y ortopedia' },
  { value: 'neurologico', label: 'Neuro y salud mental' },
  { value: 'respiratorio', label: 'Respiratorio' },
  { value: 'cronico', label: 'Crónico y metabólico' },
];

const BASE_FIELDS = ['Identificación', 'Alertas', 'Ciclo', 'Edad', 'Diagnóstico / antecedentes', 'EPS', 'Estado', 'Próximo control'];
const SAMPLE = `Centro: Clínica de falla cardíaca avanzada
Código: CFC-01
Población estimada: 85
Seguimiento: semanal
Campos prioritarios: NYHA, FEVI, Peso, Creatinina, Adherencia farmacológica
Alertas: aumento de peso, descompensación, control vencido`;

function extractValue(text: string, label: string) {
  return text.match(new RegExp(`${label}\\s*:\\s*(.+)`, 'i'))?.[1]?.trim() || '';
}

export const DashboardLab: React.FC<DashboardLabProps> = ({ onBack, onPublish }) => {
  const [rawFicha, setRawFicha] = useState(SAMPLE);
  const [step, setStep] = useState(1);
  const parsed = useMemo(() => {
    const name = extractValue(rawFicha, 'Centro') || 'Nuevo centro de seguimiento';
    const code = extractValue(rawFicha, 'Código') || 'NUEVO-01';
    const volume = Number(extractValue(rawFicha, 'Población estimada').replace(/\D/g, '')) || 30;
    const fields = extractValue(rawFicha, 'Campos prioritarios').split(',').map((item) => item.trim()).filter(Boolean);
    const alerts = extractValue(rawFicha, 'Alertas').split(',').map((item) => item.trim()).filter(Boolean);
    return { name, code, volume, fields, alerts, frequency: extractValue(rawFicha, 'Seguimiento') || 'mensual' };
  }, [rawFicha]);
  const [category, setCategory] = useState<CategoriaCentro>('cronico');

  const ficha: FichaEmpalme = {
    nombreCentro: parsed.name,
    codigo: parsed.code,
    categoria: category,
    descripcion: `Tablero creado desde ficha de empalme · revisión ${parsed.frequency}.`,
    volumenEstimado: parsed.volume,
    camposPrioritarios: parsed.fields.length ? parsed.fields : BASE_FIELDS,
    alertasPrioritarias: parsed.alerts.length ? parsed.alerts : ['control vencido'],
    frecuenciaRevision: parsed.frequency,
  };

  return <section className="page-enter max-w-5xl mx-auto space-y-5 sm:space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-[#ececf1] pb-5">
      <div className="flex gap-3 min-w-0">
        <div className="w-11 h-11 rounded-2xl bg-violet-100 text-violet-700 grid place-items-center"><Sparkles className="w-5 h-5" /></div>
        <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-violet-700">Laboratorio de tableros</p><h1 className="text-xl sm:text-2xl font-bold text-slate-900">Construye un tablero desde el empalme</h1><p className="text-sm text-slate-600 mt-1">La ficha define el foco clínico; la plataforma conserva la estructura segura de seguimiento.</p></div>
      </div>
      <button onClick={onBack} className="inline-flex self-start items-center gap-1.5 min-h-11 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50"><ArrowLeft className="w-3.5 h-3.5" /> Centros</button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-medium">
      {['1. Anexar ficha', '2. Validar configuración', '3. Publicar'].map((label, index) => <div key={label} className={`rounded-lg px-3 py-2 ${step >= index + 1 ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>{label}</div>)}
    </div>

    {step === 1 && <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-5">
      <div className="bg-white rounded-2xl border border-[#ececf1] p-4 sm:p-5 space-y-3"><div className="flex items-center gap-2"><ClipboardPaste className="w-4 h-4 text-violet-600" /><h2 className="font-semibold text-slate-900">Pega la ficha de empalme</h2></div><p className="text-xs text-slate-500">Usa etiquetas simples: Centro, Código, Población estimada, Seguimiento, Campos prioritarios y Alertas.</p><textarea value={rawFicha} onChange={(e) => setRawFicha(e.target.value)} className="w-full min-h-56 sm:min-h-64 p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" aria-label="Ficha de empalme" /><button onClick={() => setStep(2)} className="w-full sm:w-auto min-h-11 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold">Leer y continuar</button></div>
      <aside className="bg-violet-50 border border-violet-100 rounded-2xl p-5 space-y-3"><FileText className="w-5 h-5 text-violet-700" /><h2 className="font-semibold text-slate-900">¿Qué genera?</h2><p className="text-sm text-slate-600">Un centro con indicadores base, tabla de pacientes, alertas y los campos clínicos priorizados en la ficha.</p><p className="text-xs text-slate-500">No incluye datos reales de pacientes. Antes de producción se debe conectar una fuente autorizada y validar el protocolo clínico.</p></aside>
    </div>}

    {step === 2 && <div className="bg-white rounded-2xl border border-[#ececf1] p-4 sm:p-6 space-y-5"><div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-600" /><div><h2 className="font-semibold text-slate-900">Configuración interpretada</h2><p className="text-xs text-slate-500">Revísala con la líder clínica antes de publicar.</p></div></div><div className="grid sm:grid-cols-2 gap-4 text-sm"><label className="space-y-1"><span className="text-xs font-medium text-slate-600">Categoría asistencial</span><select value={category} onChange={(e) => setCategory(e.target.value as CategoriaCentro)} className="w-full min-h-11 border border-slate-200 rounded-lg px-3 py-2 bg-white">{CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><div><p className="text-xs font-medium text-slate-600">Centro</p><p className="font-semibold text-slate-900 break-words">{ficha.nombreCentro} <span className="font-mono text-xs text-slate-500">{ficha.codigo}</span></p><p className="mt-2 text-xs text-slate-600">{ficha.volumenEstimado} pacientes estimados · revisión {ficha.frecuenciaRevision}</p></div></div><div className="grid sm:grid-cols-2 gap-4"><div><p className="text-xs font-semibold text-slate-700 mb-2">Campos a priorizar</p><div className="flex flex-wrap gap-1.5">{ficha.camposPrioritarios.map((x) => <span key={x} className="px-2 py-1 text-xs bg-slate-100 rounded-md text-slate-700 break-words">{x}</span>)}</div></div><div><p className="text-xs font-semibold text-slate-700 mb-2">Alertas de la ficha</p><div className="flex flex-wrap gap-1.5">{ficha.alertasPrioritarias.map((x) => <span key={x} className="px-2 py-1 text-xs bg-rose-50 text-rose-700 rounded-md break-words">{x}</span>)}</div></div></div><div className="flex flex-col sm:flex-row gap-2"><button onClick={() => setStep(1)} className="min-h-11 px-4 py-2 text-sm rounded-lg border border-slate-200">Volver a editar</button><button onClick={() => setStep(3)} className="min-h-11 px-4 py-2 text-sm font-semibold rounded-lg bg-violet-600 text-white">Aprobar configuración</button></div></div>}

    {step === 3 && <div className="bg-white rounded-2xl border border-[#ececf1] p-8 text-center space-y-4"><div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 grid place-items-center"><LayoutDashboard className="w-6 h-6" /></div><h2 className="text-xl font-bold text-slate-900">Listo para crear el tablero</h2><p className="max-w-lg mx-auto text-sm text-slate-600">Se añadirá <strong>{ficha.nombreCentro}</strong> con datos sintéticos de demostración y la configuración derivada de esta ficha.</p><div className="flex justify-center gap-2"><button onClick={() => setStep(2)} className="px-4 py-2 text-sm rounded-lg border border-slate-200">Revisar</button><button onClick={() => onPublish(ficha)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-violet-600 text-white">Crear tablero</button></div></div>}
  </section>;
};
