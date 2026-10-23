import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  HelpCircle,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  ClasificacionPrevenibilidad,
  EventoSeguridadPaciente,
} from '../types/clinical';
import { MOCK_SAFETY_EVENTS } from '../data/mockSafetyEvents';
import { DonutChart, DonutDataItem } from './DonutChart';

type SafetyFilter = 'Todos' | ClasificacionPrevenibilidad;

const FILTERS: { value: SafetyFilter; label: string }[] = [
  { value: 'Todos', label: 'Todos los casos' },
  { value: 'Prevenible', label: 'Prevenibles' },
  { value: 'No prevenible', label: 'No prevenibles' },
  { value: 'Pendiente de validación', label: 'Pendientes' },
];

const classificationStyles: Record<ClasificacionPrevenibilidad, string> = {
  Prevenible: 'bg-rose-50 text-rose-700 border-rose-100',
  'No prevenible': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Pendiente de validación': 'bg-amber-50 text-amber-700 border-amber-100',
};

const classificationIcons: Record<ClasificacionPrevenibilidad, React.ReactNode> = {
  Prevenible: <AlertTriangle className="w-3.5 h-3.5" />,
  'No prevenible': <CheckCircle2 className="w-3.5 h-3.5" />,
  'Pendiente de validación': <HelpCircle className="w-3.5 h-3.5" />,
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`));
}

function getClassificationCount(
  events: EventoSeguridadPaciente[],
  classification: ClasificacionPrevenibilidad
) {
  return events.filter((event) => event.clasificacion === classification).length;
}

export const SafetyEventsCard: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<SafetyFilter>('Todos');
  const [selectedEvent, setSelectedEvent] = useState<EventoSeguridadPaciente | null>(null);

  const filteredEvents = useMemo(
    () => activeFilter === 'Todos'
      ? MOCK_SAFETY_EVENTS
      : MOCK_SAFETY_EVENTS.filter((event) => event.clasificacion === activeFilter),
    [activeFilter]
  );

  const sexoData = useMemo<DonutDataItem[]>(() => {
    const counts = { Femenino: 0, Masculino: 0 };
    MOCK_SAFETY_EVENTS.forEach((event) => {
      counts[event.sexo]++;
    });
    return [
      { label: 'Femenino', value: counts.Femenino, color: '#ec4899' },
      { label: 'Masculino', value: counts.Masculino, color: '#3b82f6' },
    ];
  }, []);

  const seguridadSocialData = useMemo<DonutDataItem[]>(() => {
    const counts: Record<string, number> = {};
    MOCK_SAFETY_EVENTS.forEach((event) => {
      counts[event.regimen] = (counts[event.regimen] || 0) + 1;
    });
    const colors = ['#6366f1', '#06b6d4', '#f59e0b', '#10b981'];
    return Object.entries(counts).map(([label, value], index) => ({
      label,
      value,
      color: colors[index % colors.length],
    }));
  }, []);

  const ageGroups = useMemo(() => {
    const groups = [
      { label: '<18', count: 0 },
      { label: '18-35', count: 0 },
      { label: '36-50', count: 0 },
      { label: '51-65', count: 0 },
      { label: '>65', count: 0 },
    ];

    MOCK_SAFETY_EVENTS.forEach((event) => {
      if (event.edad < 18) groups[0].count++;
      else if (event.edad <= 35) groups[1].count++;
      else if (event.edad <= 50) groups[2].count++;
      else if (event.edad <= 65) groups[3].count++;
      else groups[4].count++;
    });

    const maxCount = Math.max(...groups.map((group) => group.count), 1);
    return groups.map((group) => ({
      ...group,
      percentage: Math.round((group.count / MOCK_SAFETY_EVENTS.length) * 100),
      heightPercent: Math.round((group.count / maxCount) * 100),
    }));
  }, []);

  return (
    <section className="bg-white border border-[#ececf1] rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 md:p-6 border-b border-[#f1f1f4]">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs font-bold uppercase tracking-wider text-sky-700">
                  Seguridad del paciente
                </p>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                  Borrador asistido
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-1">
                Análisis de eventos e incidentes
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Clasificación preliminar basada en hechos y evidencias disponibles. La metodología institucional y el equipo responsable validan el resultado final.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 shrink-0">
            <FileSearch className="w-3.5 h-3.5 text-sky-600" />
            Reportes anonimizados de muestra
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-5">
          <SummaryMetric label="Casos analizados" value={MOCK_SAFETY_EVENTS.length} tone="slate" />
          <SummaryMetric label="Prevenibles" value={getClassificationCount(MOCK_SAFETY_EVENTS, 'Prevenible')} tone="rose" />
          <SummaryMetric label="No prevenibles" value={getClassificationCount(MOCK_SAFETY_EVENTS, 'No prevenible')} tone="emerald" />
          <SummaryMetric label="Pendientes" value={getClassificationCount(MOCK_SAFETY_EVENTS, 'Pendiente de validación')} tone="amber" />
        </div>
      </div>

      <div className="p-5 md:p-6 border-b border-[#f1f1f4] bg-slate-50/40">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Perfil de los eventos reportados</h3>
            <p className="text-xs text-slate-500 mt-1">Distribución demográfica de los casos anonimizados incluidos en el análisis.</p>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">n = {MOCK_SAFETY_EVENTS.length}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          <DemographicChart title="Sexo" subtitle="Distribución por sexo">
            <DonutChart data={sexoData} centerLabel={`${MOCK_SAFETY_EVENTS.length}`} centerSublabel="CASOS" size={126} />
          </DemographicChart>

          <DemographicChart title="Seguridad social" subtitle="Régimen de afiliación">
            <DonutChart data={seguridadSocialData} centerLabel={`${MOCK_SAFETY_EVENTS.length}`} centerSublabel="CASOS" size={126} />
          </DemographicChart>

          <DemographicChart title="Edad" subtitle="Distribución por grupo etario">
            <div className="h-[126px] flex items-end justify-between gap-2 pt-4 pb-1">
              {ageGroups.map((group) => (
                <div key={group.label} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap z-10">
                    {group.count} casos ({group.percentage}%)
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 tabular-nums">{group.count}</span>
                  <div className="w-full bg-slate-100 rounded-t-md h-20 flex items-end overflow-hidden">
                    <div className="w-full bg-sky-500 group-hover:bg-sky-600 transition-all rounded-t-md" style={{ height: `${Math.max(group.heightPercent, 8)}%` }} />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500">{group.label}</span>
                </div>
              ))}
            </div>
          </DemographicChart>
        </div>
      </div>

      <div className="p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                aria-pressed={isActive}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap border transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-[#ececf1] hover:bg-slate-50'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {filteredEvents.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => setSelectedEvent(event)}
              className="w-full text-left rounded-xl border border-[#ececf1] p-3.5 hover:border-sky-200 hover:bg-sky-50/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-2 md:w-28 shrink-0">
                  <span className="font-mono text-[11px] text-slate-400">{event.id}</span>
                  <span className="text-[11px] text-slate-400">{formatDate(event.fecha)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-900">{event.resumen}</p>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">
                      {event.tipo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{event.servicio} · {event.dano}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 w-fit text-[11px] font-semibold border rounded-full px-2.5 py-1 ${classificationStyles[event.clasificacion]}`}>
                  {classificationIcons[event.clasificacion]}
                  {event.clasificacion}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 leading-relaxed">
          <ClipboardCheck className="w-3.5 h-3.5 text-sky-600 mt-0.5 shrink-0" />
          <p>
            <strong className="text-slate-700">Regla de clasificación:</strong> prevenible cuando existe una desviación o barrera ausente que pudo evitar el evento; no prevenible cuando ocurrió pese a controles adecuados; si falta evidencia, queda pendiente.
          </p>
        </div>
      </div>

      {selectedEvent && (
        <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </section>
  );
};

function SummaryMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'slate' | 'rose' | 'emerald' | 'amber';
}) {
  const toneClasses = {
    slate: 'bg-slate-50 text-slate-900 border-slate-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
  };

  return (
    <div className={`rounded-xl border px-3.5 py-3 ${toneClasses[tone]}`}>
      <p className="text-2xl font-bold tabular-nums leading-none">{value}</p>
      <p className="text-[11px] font-medium mt-1.5 opacity-80">{label}</p>
    </div>
  );
}

function DemographicChart({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#ececf1] rounded-xl p-3.5 min-h-[190px]">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-800">{title}</h4>
        <span className="text-[10px] text-slate-400">{subtitle}</span>
      </div>
      {children}
    </div>
  );
}

function EventDetail({
  event,
  onClose,
}: {
  event: EventoSeguridadPaciente;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 bg-slate-900/30 p-4 flex items-center justify-center" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="safety-event-title"
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200"
        onClick={(eventClick) => eventClick.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 py-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] text-slate-400">{event.id} · {formatDate(event.fecha)}</p>
            <h3 id="safety-event-title" className="text-lg font-bold text-slate-900 mt-1">{event.resumen}</h3>
            <p className="text-xs text-slate-500 mt-1">{event.servicio} · {event.tipo} · {event.dano}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar detalle" className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className={`rounded-xl border px-4 py-3 ${classificationStyles[event.clasificacion]}`}>
            <p className="text-[11px] font-bold uppercase tracking-wide">Clasificación preliminar</p>
            <div className="flex items-start gap-2 mt-1">
              {classificationIcons[event.clasificacion]}
              <p className="text-sm font-semibold">{event.clasificacion}</p>
            </div>
            <p className="text-xs mt-1.5 leading-relaxed">{event.justificacion}</p>
          </div>

          <DetailList title="Hechos confirmados" items={event.hechosConfirmados} emptyLabel="No hay hechos confirmados registrados." />
          <DetailList title="Pendientes de validar" items={event.pendientes} emptyLabel="No hay pendientes registrados." />
          <DetailList title="Evidencias disponibles" items={event.evidencias} emptyLabel="No hay evidencias registradas." />

          <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-4">
            <span className="text-slate-500">Estado de investigación</span>
            <span className="font-semibold text-slate-700">{event.estadoInvestigacion}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Este resultado no aprueba ni cierra el caso. Debe ser revisado contra el procedimiento institucional vigente y validado por el equipo responsable.
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailList({ title, items, emptyLabel }: { title: string; items: string[]; emptyLabel: string }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h4>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-400">{emptyLabel}</p>
      )}
    </div>
  );
}
