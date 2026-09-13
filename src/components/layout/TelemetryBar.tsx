import React from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { useUiStore } from '../../stores/uiStore';
import { useTelemetryContext } from '../../context/TelemetryContext';
import LiveDataTag from '../ui/LiveDataTag';

export default function TelemetryBar() {
  const { output, cssPhase, params } = useSimulationStore();
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const { status, lastUpdated } = useTelemetryContext();

  return (
    <div
      className="fixed bottom-0 right-0 z-30 h-[36px] bg-[var(--bg-panel)]/98 border-t border-[var(--border-color)] text-[var(--text-secondary)] flex items-center justify-between px-4 text-[11px] font-mono select-none transition-all duration-300"
      style={{ left: sidebarCollapsed ? '60px' : '220px' }}
    >
      {/* Telemetry Strip */}
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[var(--text-muted)] text-[10px]">WELL</span>
          <span className="text-amber-400 font-bold tracking-wider">BGW-DEMO-01</span>
        </div>

        <div className="h-3 w-px bg-[var(--border-color)] shrink-0" />

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[var(--text-muted)] text-[10px]">CSS</span>
          <span className="text-amber-400 font-bold uppercase">{cssPhase}</span>
        </div>

        <div className="h-3 w-px bg-[var(--border-color)] shrink-0" />

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[var(--text-muted)] text-[10px]">SRP</span>
          <span className="text-emerald-400 font-bold">{params.srpSpeed} SPM</span>
        </div>

        <div className="h-3 w-px bg-[var(--border-color)] shrink-0" />

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[var(--text-muted)] text-[10px]">PROD</span>
          <span className="text-cyan-400 font-bold">{output.production.toFixed(1)} bbl/d</span>
        </div>

        <div className="h-3 w-px bg-[var(--border-color)] shrink-0" />

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[var(--text-muted)] text-[10px]">TEMP</span>
          <span className="text-orange-400 font-bold">{output.reservoirTemperature.toFixed(0)} °C</span>
        </div>

        <div className="h-3 w-px bg-[var(--border-color)] shrink-0" />

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[var(--text-muted)] text-[10px]">EFF</span>
          <span className="text-sky-400 font-bold">{output.pumpEfficiency.toFixed(0)}%</span>
        </div>

        <div className="h-3 w-px bg-[var(--border-color)] shrink-0" />

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[var(--text-muted)] text-[10px]">RISK</span>
          <span className={
            output.equipmentRisk === 'critical' ? 'text-red-400 font-bold' :
            output.equipmentRisk === 'high'     ? 'text-orange-400 font-bold' :
            output.equipmentRisk === 'medium'   ? 'text-amber-400 font-bold' :
                                                  'text-emerald-400 font-bold'
          }>
            {output.equipmentRisk.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Right — Supabase Status */}
      <div className="hidden lg:flex items-center gap-3 shrink-0">
        <LiveDataTag status={status} lastUpdated={lastUpdated} />
        <span className="text-[10px] text-[var(--text-muted)]">OIL INDIA LIMITED</span>
      </div>
    </div>
  );
}
