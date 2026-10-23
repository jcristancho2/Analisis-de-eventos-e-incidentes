import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Users,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Check,
  RotateCcw,
  ExternalLink,
  FilterX,
  Lock,
} from 'lucide-react';
import { Paciente, ColumnDefinition } from '../types/clinical';
import { AVAILABLE_COLUMNS } from '../data/mockClinicalData';

interface PatientsTableProps {
  pacientes: Paciente[];
  onSelectPatient: (paciente: Paciente) => void;
  epsFilter: string | null;
  onClearEpsFilter: () => void;
  nutritionFilter: string | null;
  onClearNutritionFilter: () => void;
  renalStageFilter: string | null;
  onClearRenalStageFilter: () => void;
}

export const PatientsTable: React.FC<PatientsTableProps> = ({
  pacientes,
  onSelectPatient,
  epsFilter,
  onClearEpsFilter,
  nutritionFilter,
  onClearNutritionFilter,
  renalStageFilter,
  onClearRenalStageFilter,
}) => {
  // Toggle "Solo activos"
  const [onlyActive, setOnlyActive] = useState<boolean>(true);

  // Search input: "Buscar por nombre o documento..."
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Column Selector state
  const defaultSelectedColumns = useMemo(() => {
    return [
      'documento',
      'idCliente',
      'paciente',
      'alertas',
      'ciclo',
      'edad',
      'sexo',
      'pesoKg',
      'tallaCm',
      'imc',
      'estadoNutricional',
      'antecedentes',
      'eps',
      'plan',
      'viaAcceso',
      'regimen',
      'telMovil',
      'estado',
    ];
  }, []);

  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultSelectedColumns);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState<boolean>(false);
  const columnDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (columnDropdownRef.current && !columnDropdownRef.current.contains(e.target as Node)) {
        setIsColumnDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter patients
  const filteredPatients = useMemo(() => {
    return pacientes.filter((p) => {
      if (onlyActive && p.estado !== 'Activo') return false;

      if (epsFilter && p.eps !== epsFilter) return false;

      if (nutritionFilter && !p.estadoNutricional.toLowerCase().includes(nutritionFilter.toLowerCase())) {
        return false;
      }

      if (renalStageFilter && !p.antecedentes.includes(renalStageFilter)) return false;

      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesName = p.paciente.toLowerCase().includes(query);
        const matchesDoc = p.documento.toLowerCase().includes(query);
        const matchesId = p.idCliente.toLowerCase().includes(query);
        const matchesEps = p.eps.toLowerCase().includes(query);
        return matchesName || matchesDoc || matchesId || matchesEps;
      }

      return true;
    });
  }, [pacientes, onlyActive, epsFilter, nutritionFilter, renalStageFilter, searchTerm]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredPatients.length / pageSize) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPatients.slice(start, start + pageSize);
  }, [filteredPatients, currentPage, pageSize]);

  // Alertas en página actual
  const alertsOnCurrentPage = useMemo(() => {
    return paginatedPatients.filter((p) => p.alertas.length > 0).length;
  }, [paginatedPatients]);

  const toggleColumn = (key: string) => {
    // Si es columna fija no se puede ocultar
    const colDef = AVAILABLE_COLUMNS.find((c) => c.key === key);
    if (colDef?.isSticky) return;

    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectAllColumns = () => {
    setVisibleColumns(AVAILABLE_COLUMNS.map((c) => c.key as string));
  };

  const resetDefaultColumns = () => {
    setVisibleColumns(defaultSelectedColumns);
  };

  return (
    <div className="page-enter page-enter-delayed space-y-3">
      {/* Encabezado y Barra de Controles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-4">
        {/* Encabezado: Ícono + "Pacientes del centro" (h2) + subtítulo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Pacientes del centro
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold tabular-nums">
                {filteredPatients.length} de {pacientes.length}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Listado clínico sincronizado y auditoría de controles asistenciales
            </p>
          </div>
        </div>

        {/* Active Filters Badges */}
        {(epsFilter || nutritionFilter || renalStageFilter) && (
          <div className="flex items-center gap-2 flex-wrap">
            {epsFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg text-xs font-medium">
                <span>EPS: {epsFilter}</span>
                <button
                  onClick={onClearEpsFilter}
                  className="hover:text-violet-900 text-sm font-bold leading-none"
                >
                  ×
                </button>
              </span>
            )}
            {nutritionFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-medium">
                <span>Nutrición: {nutritionFilter}</span>
                <button
                  onClick={onClearNutritionFilter}
                  className="hover:text-amber-900 text-sm font-bold leading-none"
                >
                  ×
                </button>
              </span>
            )}
            {renalStageFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium">
                <span>Estadio: {renalStageFilter}</span>
                <button
                  onClick={onClearRenalStageFilter}
                  className="hover:text-rose-900 text-sm font-bold leading-none"
                  aria-label={`Quitar filtro ${renalStageFilter}`}
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                onClearEpsFilter();
                onClearNutritionFilter();
                onClearRenalStageFilter();
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Quitar filtros
            </button>
          </div>
        )}

        {/* Barra de Controles (Alineada a la derecha) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle "Solo activos" (switch morado on/off) */}
          <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-[#ececf1] shadow-sm select-none">
            <span className="text-xs font-medium text-slate-700">Solo activos</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(e) => setOnlyActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-violet-600"></div>
            </div>
          </label>

          {/* Botón "Columnas" con contador + Dropdown checklist */}
          <div className="relative" ref={columnDropdownRef}>
            <button
              onClick={() => setIsColumnDropdownOpen((prev) => !prev)}
              className="btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-[#e5e5e5] rounded-lg shadow-sm hover:bg-[#f3f3f3] transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Columnas</span>
              <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[11px] font-mono font-semibold text-slate-800">
                {visibleColumns.length}
              </span>
            </button>

            {/* Dropdown checklist */}
            {isColumnDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white border border-[#ececf1] rounded-xl shadow-xl z-50 p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">
                    Columnas visibles ({visibleColumns.length}/{AVAILABLE_COLUMNS.length})
                  </span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      onClick={selectAllColumns}
                      className="text-violet-600 hover:text-violet-700 font-medium"
                    >
                      Todas
                    </button>
                    <span>·</span>
                    <button
                      onClick={resetDefaultColumns}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      Restablecer
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {AVAILABLE_COLUMNS.map((col) => {
                    const isVisible = visibleColumns.includes(col.key as string);
                    const isFixed = col.isSticky;

                    return (
                      <label
                        key={col.key as string}
                        className={`flex items-center justify-between px-2 py-1 rounded text-xs select-none transition-colors ${
                          isFixed ? 'opacity-70 cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isVisible}
                            disabled={isFixed}
                            onChange={() => toggleColumn(col.key as string)}
                            className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 w-3.5 h-3.5"
                          />
                          <span className={isVisible ? 'font-medium text-slate-900' : 'text-slate-500'}>
                            {col.label}
                          </span>
                        </div>
                        {isFixed && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-slate-500 bg-slate-200/60 px-1 rounded">
                            <Lock className="w-2.5 h-2.5" /> fija
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Buscador "Buscar por nombre o documento…" */}
          <div className="relative w-64 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por nombre o documento…"
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#ececf1] rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Barra de Alertas (Section 6.2) */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-white border border-[#ececf1] rounded-xl text-xs shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-[11px] text-slate-500 tracking-wider uppercase">
            Alertas
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fffbeb] text-[#d97706] border border-amber-200/60 font-semibold text-xs tabular-nums">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {alertsOnCurrentPage} con alerta
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          página actual ({paginatedPatients.length} registros)
        </span>
      </div>

      {/* Tabla de Pacientes */}
      <div className="bg-white border border-[#ececf1] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            {/* Encabezados */}
            <thead>
              <tr className="bg-[#fcfcfd] border-b border-[#ececf1]">
                {AVAILABLE_COLUMNS.filter((col) => visibleColumns.includes(col.key as string)).map(
                  (col) => {
                    const isSticky = col.isSticky;
                    return (
                      <th
                        key={col.key as string}
                        style={{ minWidth: col.minWidth }}
                        className={`text-[#9ca3af] text-[11px] font-bold uppercase tracking-wider py-2.5 px-3 select-none ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        } ${isSticky ? 'sticky left-0 bg-[#fcfcfd] z-20 shadow-[1px_0_0_0_#ececf1]' : ''}`}
                      >
                        {col.label}
                      </th>
                    );
                  }
                )}
              </tr>
            </thead>

            {/* Filas */}
            <tbody className="divide-y divide-[#f1f1f4]">
              {paginatedPatients.length > 0 ? (
                paginatedPatients.map((paciente) => {
                  const hasAlert = paciente.alertas.length > 0;

                  return (
                    <tr
                      key={paciente.idCliente}
                      onClick={() => onSelectPatient(paciente)}
                      className={`cursor-pointer transition-colors duration-100 ${
                        hasAlert
                          ? 'bg-[#fffdf5] hover:bg-[#fff7e6]'
                          : 'bg-white hover:bg-[#f8fafc]'
                      }`}
                    >
                      {/* Celdas según visibleColumns */}
                      {visibleColumns.includes('documento') && (
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-900 whitespace-nowrap sticky left-0 bg-inherit z-10 shadow-[1px_0_0_0_#ececf1]">
                          {paciente.documento}
                        </td>
                      )}

                      {visibleColumns.includes('idCliente') && (
                        <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                          {paciente.idCliente}
                        </td>
                      )}

                      {visibleColumns.includes('paciente') && (
                        <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="hover:text-violet-700 transition-colors">
                              {paciente.paciente}
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100" />
                          </div>
                        </td>
                      )}

                      {visibleColumns.includes('alertas') && (
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {hasAlert ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {paciente.alertas.map((alt) => (
                                <span
                                  key={alt.id}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fffbeb] text-[#d97706] border border-amber-200 text-[11px] font-medium"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  <span>{alt.texto}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">
                              Al día
                            </span>
                          )}
                        </td>
                      )}

                      {visibleColumns.includes('ciclo') && (
                        <td className="py-2.5 px-3 text-center whitespace-nowrap font-semibold text-slate-700">
                          {paciente.ciclo}
                        </td>
                      )}

                      {visibleColumns.includes('edad') && (
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                          {paciente.edad}
                        </td>
                      )}

                      {visibleColumns.includes('sexo') && (
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-700">
                          {paciente.sexo}
                        </td>
                      )}

                      {visibleColumns.includes('pesoKg') && (
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 whitespace-nowrap">
                          {paciente.pesoKg} <span className="text-slate-400 text-[10px]">kg</span>
                        </td>
                      )}

                      {visibleColumns.includes('tallaCm') && (
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-700 whitespace-nowrap">
                          {paciente.tallaCm} <span className="text-slate-400 text-[10px]">cm</span>
                        </td>
                      )}

                      {visibleColumns.includes('imc') && (
                        <td className="py-2.5 px-3 text-right tabular-nums font-mono text-slate-800">
                          {paciente.imc}
                        </td>
                      )}

                      {visibleColumns.includes('estadoNutricional') && (
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              paciente.estadoNutricional === 'Normal'
                                ? 'bg-emerald-50 text-emerald-700'
                                : paciente.estadoNutricional === 'Sobrepeso'
                                ? 'bg-amber-50 text-amber-700'
                                : paciente.estadoNutricional === 'Obesidad'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-cyan-50 text-cyan-700'
                            }`}
                          >
                            {paciente.estadoNutricional}
                          </span>
                        </td>
                      )}

                      {visibleColumns.includes('antecedentes') && (
                        <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={paciente.antecedentes}>
                          {paciente.antecedentes}
                        </td>
                      )}

                      {visibleColumns.includes('eps') && (
                        <td className="py-2.5 px-3 text-slate-800 font-medium whitespace-nowrap">
                          {paciente.eps}
                        </td>
                      )}

                      {visibleColumns.includes('plan') && (
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {paciente.plan}
                        </td>
                      )}

                      {visibleColumns.includes('viaAcceso') && (
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {paciente.viaAcceso}
                        </td>
                      )}

                      {visibleColumns.includes('regimen') && (
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {paciente.regimen}
                        </td>
                      )}

                      {visibleColumns.includes('telMovil') && (
                        <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                          {paciente.telMovil}
                        </td>
                      )}

                      {visibleColumns.includes('estado') && (
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              paciente.estado === 'Activo'
                                ? 'bg-emerald-50 text-emerald-700'
                                : paciente.estado === 'En seguimiento'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {paciente.estado}
                          </span>
                        </td>
                      )}

                      {visibleColumns.includes('fNac') && (
                        <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                          {paciente.fNac}
                        </td>
                      )}

                      {visibleColumns.includes('rh') && (
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                          {paciente.rh}
                        </td>
                      )}

                      {visibleColumns.includes('estadoCivil') && (
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {paciente.estadoCivil}
                        </td>
                      )}

                      {visibleColumns.includes('zona') && (
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {paciente.zona}
                        </td>
                      )}

                      {visibleColumns.includes('escolaridad') && (
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {paciente.escolaridad}
                        </td>
                      )}

                      {visibleColumns.includes('etnia') && (
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {paciente.etnia}
                        </td>
                      )}

                      {visibleColumns.includes('ocupacion') && (
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {paciente.ocupacion}
                        </td>
                      )}

                      {visibleColumns.includes('religion') && (
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {paciente.religion}
                        </td>
                      )}

                      {visibleColumns.includes('afiliacion') && (
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {paciente.afiliacion}
                        </td>
                      )}

                      {visibleColumns.includes('conviven') && (
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {paciente.conviven}
                        </td>
                      )}

                      {visibleColumns.includes('telCasa') && (
                        <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                          {paciente.telCasa}
                        </td>
                      )}

                      {visibleColumns.includes('email') && (
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                          {paciente.email}
                        </td>
                      )}

                      {visibleColumns.includes('direccion') && (
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {paciente.direccion}
                        </td>
                      )}

                      {visibleColumns.includes('fechaIngreso') && (
                        <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                          {paciente.fechaIngreso}
                        </td>
                      )}

                      {visibleColumns.includes('ultimoControl') && (
                        <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                          {paciente.ultimoControl || '—'}
                        </td>
                      )}

                      {visibleColumns.includes('proximoControl') && (
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={
                              paciente.proximoControl?.includes('Vencido')
                                ? 'text-amber-700 font-semibold'
                                : 'font-mono text-slate-600'
                            }
                          >
                            {paciente.proximoControl || '—'}
                          </span>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={visibleColumns.length}
                    className="py-12 text-center text-slate-400 bg-slate-50/50"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <FilterX className="w-8 h-8 text-slate-300" />
                      <p className="font-medium text-slate-700 text-sm">
                        No se encontraron pacientes
                      </p>
                      <p className="text-xs text-slate-500">
                        Intenta ajustar la búsqueda, activar pacientes inactivos o remover filtros de EPS/Nutrición.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación y Resumen */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-[#fcfcfd] border-t border-[#ececf1] text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Mostrar</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-[#ececf1] rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium"
            >
              <option value={10}>10 pacientes</option>
              <option value={25}>25 pacientes</option>
              <option value={50}>50 pacientes</option>
            </select>
            <span className="text-slate-400">·</span>
            <span className="tabular-nums">
              Mostrando {filteredPatients.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} a{' '}
              {Math.min(currentPage * pageSize, filteredPatients.length)} de{' '}
              <strong className="text-slate-900">{filteredPatients.length}</strong> pacientes
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="btn px-2.5 py-1 text-slate-700 bg-white border border-[#e5e5e5] rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-mono text-slate-800 tabular-nums">
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="btn px-2.5 py-1 text-slate-700 bg-white border border-[#e5e5e5] rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
