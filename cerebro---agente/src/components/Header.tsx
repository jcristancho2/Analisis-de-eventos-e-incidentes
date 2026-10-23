import React from 'react';
import {
  ArrowLeft,
  Clock,
  Download,
  MessageSquare,
  RefreshCw,
  Activity,
  Wind,
  Bone,
  HeartPulse,
  ShieldAlert,
  GitCommit,
  Flame,
  Brain,
  Heart,
  Zap,
  HeartHandshake,
  Gauge,
  ShieldCheck,
  Scale,
  Crosshair,
  Shield,
  Sparkles,
  Baby,
  Droplets,
  Smile,
  Droplet,
  Cpu,
  Layers,
  Moon,
  AlertTriangle,
  Sun,
} from 'lucide-react';
import { CentroExcelencia } from '../types/clinical';

interface HeaderProps {
  currentView: 'centros' | 'detalle' | 'laboratorio';
  selectedCentro?: CentroExcelencia | null;
  onBackToCentros: () => void;
  onExportExcel: () => void;
  onOpenMessages: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  lastUpdatedMinutes: number;
  messagesCount: number;
  onOpenLab: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const getIconComponent = (iconName: string, className = 'w-5 h-5') => {
  switch (iconName) {
    case 'Activity': return <Activity className={className} />;
    case 'Wind': return <Wind className={className} />;
    case 'Bone': return <Bone className={className} />;
    case 'HeartPulse': return <HeartPulse className={className} />;
    case 'ShieldAlert': return <ShieldAlert className={className} />;
    case 'GitCommit': return <GitCommit className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'Brain': return <Brain className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'HeartHandshake': return <HeartHandshake className={className} />;
    case 'Gauge': return <Gauge className={className} />;
    case 'ShieldCheck': return <ShieldCheck className={className} />;
    case 'Scale': return <Scale className={className} />;
    case 'Crosshair': return <Crosshair className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Baby': return <Baby className={className} />;
    case 'Droplets': return <Droplets className={className} />;
    case 'Smile': return <Smile className={className} />;
    case 'Droplet': return <Droplet className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    case 'Layers': return <Layers className={className} />;
    case 'Moon': return <Moon className={className} />;
    case 'AlertTriangle': return <AlertTriangle className={className} />;
    case 'Sun': return <Sun className={className} />;
    default: return <Activity className={className} />;
  }
};

export const getColorClasses = (color: string) => {
  switch (color) {
    case 'violet':
      return { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' };
    case 'cyan':
      return { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' };
    case 'rose':
      return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' };
    case 'amber':
      return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' };
    case 'orange':
      return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' };
    case 'teal':
      return { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' };
    case 'emerald':
      return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' };
    case 'blue':
      return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
    default:
      return { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' };
  }
};

export const Header: React.FC<HeaderProps> = ({
  currentView,
  selectedCentro,
  onBackToCentros,
  onExportExcel,
  onOpenMessages,
  onRefreshData,
  isRefreshing,
  lastUpdatedMinutes,
  messagesCount,
  onOpenLab,
  isDarkMode,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#ececf1] px-4 md:px-8 py-3 transition-colors">
      <div className="max-w-[1440px] mx-auto flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
        {/* Left Side: Navigation & Brand/Center Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {currentView === 'detalle' ? (
            <>
              <button
                onClick={onBackToCentros}
                className="btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-[#e5e5e5] rounded-lg shadow-sm hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Centros</span>
              </button>

              <div className="h-4 w-px bg-slate-200 shrink-0" />

              {selectedCentro && (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      getColorClasses(selectedCentro.colorIcono).bg
                    } ${getColorClasses(selectedCentro.colorIcono).text}`}
                  >
                    {getIconComponent(selectedCentro.iconoNombre, 'w-4 h-4')}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-sm md:text-base font-bold text-slate-900 truncate">
                      {selectedCentro.nombre}
                    </h1>
                    <span className="text-[11px] text-slate-500 font-mono">
                      FCV · {selectedCentro.codigo}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center shadow-sm shrink-0">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-900 tracking-tight">
                    Cerebro
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded bg-violet-50 text-violet-700 font-medium border border-violet-100">
                    Agente Clínico FCV
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Central de seguimiento · Centros de Excelencia
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Detalle Actions or Global Info */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-auto">
          <button
            onClick={onToggleTheme}
            aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="theme-toggle w-10 h-10 inline-grid place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {currentView === 'detalle' ? (
            <>
              {/* Sync timestamp indicator */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 tabular-nums">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Actualizado hace {lastUpdatedMinutes === 0 ? 'un momento' : `${lastUpdatedMinutes} min`}
                </span>
              </div>

              {/* Botón verde "Exportar Excel" */}
              <button
                onClick={onExportExcel}
                title="Exportar listado actual a archivo compatible con Excel"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#15803d] bg-[#f0fdf4] border border-[#16a34a]/30 rounded-lg shadow-sm hover:bg-[#dcfce7] active:bg-[#bbf7d0] transition-colors whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exportar Excel</span>
                <span className="sm:hidden">Excel</span>
              </button>

              {/* Botón teal "Mensajes" (WhatsApp) */}
              <button
                onClick={onOpenMessages}
                title="Ver bitácora de mensajes de WhatsApp enviados"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0f766e] bg-[#f0fdfa] border border-[#0d9488]/30 rounded-lg shadow-sm hover:bg-[#ccfbf1] active:bg-[#99f6e4] transition-colors whitespace-nowrap"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Mensajes</span>
                {messagesCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-teal-200/60 text-[#0f766e] rounded-full text-[10px] font-semibold tabular-nums">
                    {messagesCount}
                  </span>
                )}
              </button>

              {/* Botón neutro "Refrescar" */}
              <button
                onClick={onRefreshData}
                disabled={isRefreshing}
                title="Refrescar sincronización con la base clínica FCV"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-[#e5e5e5] rounded-lg shadow-sm hover:bg-[#f3f3f3] active:bg-slate-200 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-violet-600' : 'text-slate-500'}`}
                />
                <span className="hidden sm:inline">Refrescar</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {currentView === 'centros' && (
                <button onClick={onOpenLab} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100">
                  <Sparkles className="w-3.5 h-3.5" /> Laboratorio
                </button>
              )}
              <span className="hidden md:inline-block text-xs text-slate-500 font-mono">
                Fundación Cardiovascular de Colombia
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-500" title="Sistema en línea" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
