import React, { useState } from 'react';

export interface DonutDataItem {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutDataItem[];
  centerLabel?: string;
  centerSublabel?: string;
  size?: number;
  thickness?: number;
  showLegend?: boolean;
  onItemClick?: (item: DonutDataItem) => void;
  activeFilter?: string | null;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  centerLabel,
  centerSublabel,
  size = 140,
  thickness = 22,
  showLegend = true,
  onItemClick,
  activeFilter,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
      {/* SVG Donut Circle */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {/* Background track circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f1f1f4"
            strokeWidth={thickness}
          />

          {total > 0 &&
            data.map((item, index) => {
              if (item.value === 0) return null;
              const percent = item.value / total;
              const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
              const strokeDashoffset = -circumference * accumulatedPercent;
              accumulatedPercent += percent;

              const isHovered = hoveredIndex === index;
              const isSelected = activeFilter === item.label;

              return (
                <circle
                  key={item.label}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered || isSelected ? thickness + 4 : thickness}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  style={{
                    opacity: activeFilter && !isSelected ? 0.4 : 1,
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => onItemClick && onItemClick(item)}
                />
              );
            })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
          {centerLabel !== undefined ? (
            <span className="text-base sm:text-lg font-bold text-slate-900 leading-tight tabular-nums">
              {centerLabel}
            </span>
          ) : (
            <span className="text-base sm:text-lg font-bold text-slate-900 leading-tight tabular-nums">
              {total}
            </span>
          )}
          {centerSublabel && (
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider leading-none mt-0.5">
              {centerSublabel}
            </span>
          )}
        </div>
      </div>

      {/* Aligned Legend Table */}
      {showLegend && (
        <div className="flex-1 min-w-0 w-full space-y-1.5 text-xs">
          {data.map((item, index) => {
            const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
            const isHovered = hoveredIndex === index;
            const isSelected = activeFilter === item.label;

            return (
              <div
                key={item.label}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onItemClick && onItemClick(item)}
                className={`flex items-center justify-between py-1 px-1.5 rounded transition-colors ${
                  onItemClick ? 'cursor-pointer hover:bg-slate-50' : ''
                } ${isSelected ? 'bg-violet-50 font-semibold' : ''}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform"
                    style={{
                      backgroundColor: item.color,
                      transform: isHovered || isSelected ? 'scale(1.25)' : 'scale(1)',
                    }}
                  />
                  <span
                    className={`truncate text-[12px] ${
                      isSelected ? 'text-violet-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 tabular-nums text-[12px]">
                  <span className="text-slate-900 font-medium">{item.value}</span>
                  <span className="text-slate-400 w-8 text-right text-[11px] font-mono">
                    {percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
