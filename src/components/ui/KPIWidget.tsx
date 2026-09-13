import React, { useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { ConnectionStatus } from '../../hooks/useWellTelemetry';

interface KPIWidgetProps {
  label: string;
  value: string | number;
  unit: string;
  trend?: number;
  status?: string;
  dataStatus?: ConnectionStatus;
  highlight?: 'amber' | 'cyan' | 'emerald' | 'red' | 'orange';
}

const highlightMap = {
  amber:   'text-amber-400',
  cyan:    'text-cyan-400',
  emerald: 'text-emerald-400',
  red:     'text-red-400',
  orange:  'text-orange-400',
};

export default function KPIWidget({
  label,
  value,
  unit,
  trend,
  status,
  dataStatus = 'simulation',
  highlight,
}: KPIWidgetProps) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(value);

  // Flash animation when value changes (live data update)
  useEffect(() => {
    if (prevValue.current !== value && valueRef.current && dataStatus === 'live') {
      valueRef.current.classList.remove('kpi-flash');
      void valueRef.current.offsetWidth; // reflow
      valueRef.current.classList.add('kpi-flash');
    }
    prevValue.current = value;
  }, [value, dataStatus]);

  const isLive = dataStatus === 'live';
  const valueClass = highlight ? highlightMap[highlight] : 'text-[var(--text-primary)]';

  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-3.5 hover:border-amber-500/30 transition-all duration-200 flex flex-col justify-between min-w-[110px] group">
      {/* Label row */}
      <div className="flex justify-between items-start mb-1.5">
        <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold leading-tight">
          {label}
        </span>
        {isLive && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live-pulse shrink-0 mt-0.5" />
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 my-1">
        <span
          ref={valueRef}
          className={`text-xl font-bold font-mono ${valueClass}`}
        >
          {value}
        </span>
        <span className="text-xs text-[var(--text-muted)]">{unit}</span>
      </div>

      {/* Trend / Status */}
      <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-[var(--border-subtle)]">
        {trend !== undefined ? (
          <div
            className={`flex items-center text-[10px] font-mono font-semibold ${
              Math.abs(trend) < 0.001
                ? 'text-[var(--text-muted)]'
                : trend > 0
                ? 'text-emerald-400'
                : 'text-red-400'
            }`}
          >
            {Math.abs(trend) < 0.001
              ? <Minus className="w-3 h-3 mr-0.5" />
              : trend > 0
              ? <ArrowUp className="w-3 h-3 mr-0.5" />
              : <ArrowDown className="w-3 h-3 mr-0.5" />}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        ) : (
          <span />
        )}
        {status && (
          <span className={`text-[10px] font-mono font-bold ${
            status.toLowerCase() === 'critical' ? 'text-red-400' :
            status.toLowerCase() === 'high'     ? 'text-orange-400' :
            status.toLowerCase() === 'medium'   ? 'text-amber-400' :
                                                  'text-emerald-400'
          }`}>
            {status.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}
