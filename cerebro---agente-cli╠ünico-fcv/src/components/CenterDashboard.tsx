import React, { useMemo } from 'react';
import {
  Users,
  AlertTriangle,
  CalendarCheck,
  Building2,
  Activity,
  Heart,
  HelpCircle,
} from 'lucide-react';
import { Paciente, CentroExcelencia } from '../types/clinical';
import { DonutChart, DonutDataItem } from './DonutChart';

interface CenterDashboardProps {
  centro: CentroExcelencia;
  pacientes: Paciente[];
  selectedEpsFilter: string | null;
  onSelectEpsFilter: (eps: string | null) => void;
  selectedNutritionFilter: string | null;
  onSelectNutritionFilter: (nutri: string | null) => void;
  selectedRenalStageFilter: string | null;
  onSelectRenalStageFilter: (stage: string | null) => void;
}

export const CenterDashboard: React.FC<CenterDashboardProps> = ({
  centro,
  pacientes,
  selectedEpsFilter,
  onSelectEpsFilter,
  selectedNutritionFilter,
  onSelectNutritionFilter,
  selectedRenalStageFilter,
  onSelectRenalStageFilter,
}) => {
  const analysisPatients = useMemo(
    () => selectedRenalStageFilter
      ? pacientes.filter((patient) => patient.antecedentes.includes(selectedRenalStageFilter))
      : pacientes,
    [pacientes, selectedRenalStageFilter]
  );

  // Total activos en el centro
  const activos = useMemo(() => analysisPatients.filter((p) => p.estado === 'Activo'), [analysisPatients]);
  const pacientesConAlerta = useMemo(() => analysisPatients.filter((p) => p.alertas.length > 0), [analysisPatients]);

  // 2. Sexo Data
  const sexoData = useMemo<DonutDataItem[]>(() => {
    const counts = { Femenino: 0, Masculino: 0 };
    analysisPatients.forEach((p) => {
      if (p.sexo === 'Femenino') counts.Femenino++;
      else counts.Masculino++;
    });
    return [
      { label: 'Femenino', value: counts.Femenino, color: '#ec4899' },
      { label: 'Masculino', value: counts.Masculino, color: '#3b82f6' },
    ];
  }, [analysisPatients]);

  // 3. Zona Data
  const zonaData = useMemo<DonutDataItem[]>(() => {
    const counts = { Urbana: 0, Rural: 0 };
    analysisPatients.forEach((p) => {
      if (p.zona === 'Rural') counts.Rural++;
      else counts.Urbana++;
    });
    return [
      { label: 'Urbana', value: counts.Urbana, color: '#8b5cf6' },
      { label: 'Rural', value: counts.Rural, color: '#10b981' },
    ];
  }, [analysisPatients]);

  // 4. Régimen Data
  const regimenData = useMemo<DonutDataItem[]>(() => {
    const map: Record<string, number> = {};
    analysisPatients.forEach((p) => {
      map[p.regimen] = (map[p.regimen] || 0) + 1;
    });
    const palette = ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#64748b'];
    return Object.entries(map).map(([label, value], idx) => ({
      label,
      value,
      color: palette[idx % palette.length],
    }));
  }, [analysisPatients]);

  // 5. Vía de acceso
  const viaAccesoData = useMemo<DonutDataItem[]>(() => {
    const map: Record<string, number> = {};
    analysisPatients.forEach((p) => {
      map[p.viaAcceso] = (map[p.viaAcceso] || 0) + 1;
    });
    const palette = ['#0284c7', '#f97316', '#a855f7', '#64748b'];
    return Object.entries(map).map(([label, value], idx) => ({
      label,
      value,
      color: palette[idx % palette.length],
    }));
  }, [analysisPatients]);

  // 6. Estado Nutricional (IMC)
  const nutricionalData = useMemo<DonutDataItem[]>(() => {
    const map: Record<string, number> = {
      Normal: 0,
      Sobrepeso: 0,
      Obesidad: 0,
      Delgadez: 0,
    };
    analysisPatients.forEach((p) => {
      if (map[p.estadoNutricional] !== undefined) {
        map[p.estadoNutricional]++;
      }
    });

    return [
      { label: 'Normal / Adecuado', value: map.Normal, color: '#10b981' },
      { label: 'Sobrepeso', value: map.Sobrepeso, color: '#f59e0b' },
      { label: 'Obesidad', value: map.Obesidad, color: '#ef4444' },
      { label: 'Delgadez', value: map.Delgadez, color: '#06b6d4' },
    ];
  }, [analysisPatients]);

  const normalPct = useMemo(() => {
    const total = analysisPatients.length;
    if (total === 0) return 0;
    const normalCount = nutricionalData.find((d) => d.label.includes('Normal'))?.value || 0;
    return Math.round((normalCount / total) * 100);
  }, [analysisPatients, nutricionalData]);

  // 7. Grupo Etario
  const ageGroups = useMemo(() => {
    const groups = [
      { label: '<18', count: 0 },
      { label: '18-35', count: 0 },
      { label: '36-50', count: 0 },
      { label: '51-65', count: 0 },
      { label: '66-80', count: 0 },
      { label: '>80', count: 0 },
    ];

    analysisPatients.forEach((p) => {
      if (p.edad < 18) groups[0].count++;
      else if (p.edad <= 35) groups[1].count++;
      else if (p.edad <= 50) groups[2].count++;
      else if (p.edad <= 65) groups[3].count++;
      else if (p.edad <= 80) groups[4].count++;
      else groups[5].count++;
    });

    const maxCount = Math.max(...groups.map((g) => g.count), 1);
    return groups.map((g) => ({
      ...g,
      percentage: Math.round((g.count / (analysisPatients.length || 1)) * 100),
      heightPercent: Math.round((g.count / maxCount) * 100),
    }));
  }, [analysisPatients]);

  // Distribución específica para los registros de manejo conservador ERC.
  const renalStageData = useMemo(() => {
    if (centro.id !== 15) return [];

    const stages = ['N18.2', 'N18.3', 'N18.4'];
    const colors = ['#10b981', '#f59e0b', '#ef4444'];
    const counts = stages.map((stage) =>
      pacientes.filter((p) => p.antecedentes.includes(stage)).length
    );
    const maxCount = Math.max(...counts, 1);

    return stages.map((stage, index) => ({
      stage,
      count: counts[index],
      percent: Math.round((counts[index] / (pacientes.length || 1)) * 100),
      width: Math.round((counts[index] / maxCount) * 100),
      color: colors[index],
    }));
  }, [centro.id, pacientes]);

  // 8. EPS Ranking
  const epsRanking = useMemo(() => {
    const map: Record<string, number> = {};
    analysisPatients.forEach((p) => {
      map[p.eps] = (map[p.eps] || 0) + 1;
    });

    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const topEps = entries.slice(0, 5);
    const otherCount = entries.slice(5).reduce((acc, curr) => acc + curr[1], 0);

    const total = analysisPatients.length || 1;

    const list = topEps.map(([name, count], index) => {
      const colors = ['#7c3aed', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];
      return {
        name,
        count,
        percent: Math.round((count / total) * 100),
        color: colors[index % colors.length],
        isFilterable: true,
      };
    });

    if (otherCount > 0) {
      list.push({
        name: 'Otras (agrupado · no filtrable)',
        count: otherCount,
        percent: Math.round((otherCount / total) * 100),
        color: '#94a3b8',
        isFilterable: false,
      });
    }

    return list;
  }, [analysisPatients]);

  return (
    <div className="page-enter space-y-4">
      {/* Grid Bento Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Tarjeta "Pacientes" - Destacada Morada FCV */}
        <div className="bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[170px]">
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-violet-100 text-xs font-medium">
                <Users className="w-4 h-4" />
                <span>Pacientes</span>
              </div>
              <div className="text-4xl lg:text-5xl font-extrabold tracking-tight mt-2 tabular-nums">
                {selectedRenalStageFilter ? activos.length : centro.pacientesActivos}
              </div>
              <p className="text-xs text-violet-100 mt-1">
                activos en el centro de excelencia
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="relative z-10 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-violet-100">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-300" />
              <strong className="text-white tabular-nums">{pacientesConAlerta.length}</strong> con alertas
            </span>
            <span className="text-violet-200 text-[11px]">
              {analysisPatients.length} en base local
            </span>
          </div>

          {/* Decorative subtle circles in background */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none blur-xl" />
        </div>

        {/* 2. Tarjeta "Sexo" */}
        <div className="bg-white border border-[#ececf1] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
              Sexo
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Total: {analysisPatients.length}
            </span>
          </div>
          <DonutChart data={sexoData} centerLabel={`${analysisPatients.length}`} centerSublabel="PACIENTES" />
        </div>

        {/* 3. Tarjeta "Zona" */}
        <div className="bg-white border border-[#ececf1] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
              Zona de residencia
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Geografía</span>
          </div>
          <DonutChart data={zonaData} centerLabel={`${zonaData[0]?.value || 0}`} centerSublabel="URBANA" />
        </div>

        {/* 4. Tarjeta "Seguridad social" */}
        <div className="bg-white border border-[#ececf1] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
              Seguridad social
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Régimen de afiliación</span>
          </div>
          <DonutChart data={regimenData} centerLabel={`${analysisPatients.length}`} centerSublabel="PACIENTES" />
        </div>

        {/* 5. Tarjeta "Vía de acceso" */}
        <div className="bg-white border border-[#ececf1] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
              Vía de acceso (primera atención)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Ingreso</span>
          </div>
          <DonutChart data={viaAccesoData} centerLabel={`${analysisPatients.length}`} centerSublabel="INGRESOS" />
        </div>

        {/* 6. Tarjeta "Estado Nutricional (IMC)" */}
        <div className="bg-white border border-[#ececf1] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
              Estado nutricional (IMC)
            </h3>
            {selectedNutritionFilter && (
              <button
                onClick={() => onSelectNutritionFilter(null)}
                className="text-[10px] text-violet-600 hover:underline"
              >
                Limpiar
              </button>
            )}
          </div>
          <DonutChart
            data={nutricionalData}
            centerLabel={`${normalPct}%`}
            centerSublabel="ADECUADO"
            activeFilter={selectedNutritionFilter}
            onItemClick={(item) => {
              const clean = item.label.split('/')[0].trim();
              onSelectNutritionFilter(selectedNutritionFilter === clean ? null : clean);
            }}
          />
          <p className="text-[10px] text-slate-400 mt-2 border-t border-[#f1f1f4] pt-1.5 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-slate-300 shrink-0" />
            <span>Basado en mediciones validadas FCV · Clic para filtrar tabla</span>
          </p>
        </div>

        {/* 7. Tarjeta "Edad" (Gráfico de barras verticales) */}
        <div className="bg-white border border-[#ececf1] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
              Edad
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Distribución etaria</span>
          </div>

          <div className="h-32 flex items-end justify-between gap-2 pt-4 pb-1">
            {ageGroups.map((g) => (
              <div
                key={g.label}
                className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
              >
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap z-20">
                  {g.count} pacientes ({g.percentage}%)
                </div>

                <span className="text-[10px] font-semibold text-slate-600 tabular-nums">
                  {g.count}
                </span>

                <div className="w-full bg-slate-100 rounded-t-md h-20 flex items-end overflow-hidden">
                  <div
                    className="w-full bg-violet-500 group-hover:bg-violet-600 transition-all rounded-t-md"
                    style={{ height: `${Math.max(g.heightPercent, 8)}%` }}
                  />
                </div>

                <span className="text-[11px] font-medium text-slate-500">
                  {g.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-[#f1f1f4] pt-2 mt-1">
            <span>Rango de edad del centro</span>
            <span className="font-mono text-slate-600">FCV Colombia</span>
          </div>
        </div>

        {/* 8. Tarjeta "Distribución por EPS" (Interactive Progress Ranking) */}
        <div className="bg-white border border-[#ececf1] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
                Distribución por EPS
              </h3>
            </div>
            {selectedEpsFilter ? (
              <button
                onClick={() => onSelectEpsFilter(null)}
                className="text-[11px] text-violet-600 font-medium hover:underline"
              >
                Limpiar ({selectedEpsFilter})
              </button>
            ) : (
              <span className="text-[10px] text-slate-400">Clic para filtrar</span>
            )}
          </div>

          <div className="space-y-2 flex-1">
            {epsRanking.map((eps) => {
              const isSelected = selectedEpsFilter === eps.name;

              return (
                <div
                  key={eps.name}
                  onClick={() => {
                    if (eps.isFilterable) {
                      onSelectEpsFilter(isSelected ? null : eps.name);
                    }
                  }}
                  className={`group rounded-lg p-1 transition-all ${
                    eps.isFilterable ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default opacity-80'
                  } ${isSelected ? 'bg-violet-50 ring-1 ring-violet-400' : ''}`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span
                      className={`truncate max-w-[150px] font-medium ${
                        isSelected ? 'text-violet-900 font-bold' : 'text-slate-700'
                      }`}
                    >
                      {eps.name}
                    </span>
                    <div className="flex items-center gap-2 tabular-nums text-[11px]">
                      <span className="text-slate-800 font-semibold">{eps.count}</span>
                      <span className="text-slate-400 w-7 text-right font-mono">
                        {eps.percent}%
                      </span>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${eps.percent}%`,
                        backgroundColor: eps.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-400 pt-2 border-t border-[#f1f1f4] flex justify-between">
            <span>Aseguradoras en red</span>
            <span className="font-mono">PBS & Planes FCV</span>
          </div>
        </div>

        {/* 9. Gráfico de barras de estadio ERC, visible solo en la unidad renal */}
        {renalStageData.length > 0 && (
          <div className="bg-white border border-[#ececf1] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
                  Estadio de la enfermedad renal
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Pacientes en manejo conservador · CIE-10
                </p>
              </div>
              {selectedRenalStageFilter ? (
                <button
                  onClick={() => onSelectRenalStageFilter(null)}
                  className="text-[11px] text-violet-600 font-medium hover:underline"
                >
                  Limpiar {selectedRenalStageFilter}
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 font-mono">n = {pacientes.length}</span>
              )}
            </div>

            <div className="space-y-3.5 flex-1">
              {renalStageData.map((item) => {
                const isSelected = selectedRenalStageFilter === item.stage;

                return (
                <button
                  type="button"
                  key={item.stage}
                  onClick={() => onSelectRenalStageFilter(isSelected ? null : item.stage)}
                  aria-pressed={isSelected}
                  className={`w-full text-left space-y-1.5 rounded-lg p-1.5 -mx-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    isSelected ? 'bg-violet-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={isSelected ? 'font-bold text-violet-900' : 'font-semibold text-slate-700'}>{item.stage}</span>
                    <span className="tabular-nums text-slate-600">
                      <strong className="text-slate-900">{item.count}</strong> pacientes · {item.percent}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${item.width}%`, backgroundColor: item.color }}
                    />
                  </div>
                </button>
                );
              })}
            </div>

            <p className="text-[10px] text-slate-400 pt-3 mt-3 border-t border-[#f1f1f4]">
              Clic en una barra para actualizar todo el panel y la tabla.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
