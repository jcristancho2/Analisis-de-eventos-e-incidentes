import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, Users, AlertCircle, Sparkles } from 'lucide-react';
import { CentroExcelencia, CategoriaCentro } from '../types/clinical';
import { getIconComponent, getColorClasses } from './Header';
import { SafetyEventsCard } from './SafetyEventsCard';

interface CentrosGridProps {
  centros: CentroExcelencia[];
  onSelectCentro: (centro: CentroExcelencia) => void;
}

export const CentrosGrid: React.FC<CentrosGridProps> = ({ centros, onSelectCentro }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');

  const categories: { key: string; label: string }[] = [
    { key: 'todas', label: 'Todos los centros' },
    { key: 'cardiovascular', label: 'Cardiovascular' },
    { key: 'oncologico', label: 'Oncología' },
    { key: 'pediatrico', label: 'Pediatría' },
    { key: 'quirurgico', label: 'Quirúrgico & Ortopedia' },
    { key: 'neurologico', label: 'Neuro & Salud Mental' },
    { key: 'respiratorio', label: 'Respiratorio' },
    { key: 'cronico', label: 'Crónico & Metabólico' },
  ];

  const filteredCentros = useMemo(() => {
    return centros.filter((centro) => {
      const matchesSearch =
        centro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        centro.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        centro.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat =
        selectedCategory === 'todas' || centro.categoria === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [centros, searchTerm, selectedCategory]);

  const totalPacientesActivos = useMemo(() => {
    return centros.reduce((acc, c) => acc + c.pacientesActivos, 0);
  }, [centros]);

  const totalAlertas = useMemo(() => {
    return centros.reduce((acc, c) => acc + c.alertasActivas, 0);
  }, [centros]);

  return (
    <div className="page-enter space-y-6">
      {/* Top Banner & Search Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#ececf1]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-violet-700 tracking-wide uppercase">
              Hospital Internacional de Colombia & Instituto Cardiovascular
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Selecciona un centro
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {centros.length} centros de excelencia disponibles en la red FCV ·{' '}
            <span className="font-semibold text-slate-800 tabular-nums">
              {totalPacientesActivos.toLocaleString()}
            </span>{' '}
            pacientes activos en seguimiento.
          </p>
        </div>

        {/* Buscador */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar centro o código..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#ececf1] rounded-xl text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
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

      {/* Categorías filtro rápido */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-[#ececf1]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Grid de 37 Tarjetas de Centros */}
      {filteredCentros.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredCentros.map((centro) => {
            const colors = getColorClasses(centro.colorIcono);

            return (
              <button
                key={centro.id}
                onClick={() => onSelectCentro(centro)}
                className="group text-left bg-white border border-[#ececf1] rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-[#d8c9f5] hover:-translate-y-0.5 transition-all duration-150 flex flex-col justify-between gap-3 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                {/* Fila superior: Ícono de categoría 40x40 + Flecha */}
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.bg} ${colors.text} transition-transform group-hover:scale-105`}
                  >
                    {getIconComponent(centro.iconoNombre, 'w-5 h-5')}
                  </div>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-violet-600 group-hover:bg-violet-50 transition-colors">
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Nombre del centro y descripción */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h2 className="text-[15px] font-bold text-slate-900 leading-snug group-hover:text-violet-700 transition-colors line-clamp-1">
                    {centro.nombre}
                  </h2>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {centro.descripcion}
                  </p>
                </div>

                {/* Fila inferior: Pacientes activos badge + ID monospace */}
                <div className="pt-2 border-t border-[#f1f1f4] flex items-center justify-between w-full text-xs">
                  {centro.pacientesActivos > 0 ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="tabular-nums font-semibold text-slate-900">
                        {centro.pacientesActivos}
                      </span>{' '}
                      activos
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Sin pacientes</span>
                  )}

                  <div className="flex items-center gap-2">
                    {centro.alertasActivas > 0 && (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium"
                        title={`${centro.alertasActivas} alertas pendientes`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="tabular-nums">{centro.alertasActivas}</span>
                      </span>
                    )}
                    <span className="font-mono text-[11px] text-slate-400">
                      ID {centro.id}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#ececf1] rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            No se encontraron centros
          </h3>
          <p className="text-xs text-slate-500">
            No hay ningún centro que coincida con "{searchTerm}" en la categoría seleccionada.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('todas');
            }}
            className="text-xs font-medium text-violet-700 hover:text-violet-800 underline underline-offset-2"
          >
            Limpiar filtros de búsqueda
          </button>
        </div>
      )}

      <SafetyEventsCard />
    </div>
  );
};
