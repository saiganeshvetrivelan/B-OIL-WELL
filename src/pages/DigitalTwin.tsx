import React, { useState } from 'react';
import { useSimulationStore } from '../stores/simulationStore';
import { useUiStore } from '../stores/uiStore';
import DigitalTwinScene from '../components/three/DigitalTwinScene';
import LiveDataTag from '../components/ui/LiveDataTag';
import { useTelemetryContext } from '../context/TelemetryContext';
import {
  Camera, Maximize, Layers, Thermometer, ArrowUpDown,
  X, Activity, Database, Gauge, Radio, Clock, ShieldCheck, Droplets, Zap,
  Play, Pause
} from 'lucide-react';

export default function DigitalTwin() {
  const { params, output, cssPhase } = useSimulationStore();
  const { cameraMode, setCameraMode, isWorkPaused, toggleWorkPaused } = useUiStore();
  const { status, lastUpdated, latest } = useTelemetryContext();

  const [inspectedComponent, setInspectedComponent] = useState<{
    name: string;
    data: Record<string, string>;
  } | null>(null);

  const handleObjectClick = (name: string, data: any) => {
    setInspectedComponent({ name, data });
  };

  const cameraPresets = [
    { id: 'full', label: 'FULL WELL', icon: Maximize },
    { id: 'surface', label: 'SURFACE PUMP', icon: Camera },
    { id: 'wellbore', label: 'WELLBORE', icon: Layers },
    { id: 'reservoir', label: 'RESERVOIR', icon: Thermometer },
  ];

  const isLive = status === 'live';

  // Real-time parameters: strictly prioritize live telemetry readings from database
  const activeParams = {
    srpSpeed: latest?.srpSpeed ?? params.srpSpeed,
    strokeLength: latest?.strokeLength ?? params.strokeLength,
    steamRate: latest?.steamRate ?? params.steamRate,
    steamTemperature: latest?.steamTemperature ?? params.steamTemperature,
    soakDuration: latest?.soakDuration ?? params.soakDuration,
    fluidLevel: latest?.fluidLevel ?? params.fluidLevel,
    pumpCondition: latest?.pumpCondition ?? params.pumpCondition,
  };

  const activeOutput = {
    production: latest?.oilRate ?? output.production,
    reservoirTemperature: latest?.reservoirTemp ?? output.reservoirTemperature,
    pumpEfficiency: latest?.pumpEfficiency ?? output.pumpEfficiency,
    steamRequirement: output.steamRequirement,
    energyConsumption: output.energyConsumption,
    equipmentRisk: output.equipmentRisk,
    equipmentRiskScore: output.equipmentRiskScore,
  };

  const activeCSSPhase = latest?.cssPhase ?? cssPhase;

  return (
    <div className="relative w-full h-[calc(100vh-88px)] flex overflow-hidden bg-[var(--bg-app)] select-none">

      {/* ── LEFT: 3D DIGITAL TWIN VIEWPORT ─────────────────────────────────── */}
      <div className="flex-1 relative h-full">
        <DigitalTwinScene
          params={activeParams}
          output={activeOutput}
          cssPhase={activeCSSPhase}
          cameraMode={cameraMode}
          isDark={true}
          showTelemetry={true}
          compact={false}
          status={status}
          onObjectClick={handleObjectClick}
        />

        {/* Camera Viewport Presets & Work Controls */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[var(--bg-panel)]/95 backdrop-blur-md p-1.5 rounded-xl border border-[var(--border-color)] shadow-lg">
            {cameraPresets.map((preset) => {
              const Icon = preset.icon;
              const isActive = cameraMode === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setCameraMode(preset.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider transition-all ${isActive
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>

          {/* Pause / Resume Well Motion Button */}

        </div>

        {/* Bottom Left — Asset Identity & Live Link */}
        <div className="absolute bottom-4 left-4 z-20 bg-[var(--bg-panel)]/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] text-[11px] font-mono shadow-lg">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLive ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <span className="font-bold text-[var(--text-primary)]">WELL 01</span>
            <span className="text-[var(--text-muted)]">· BAGHEWALA HEAVY OIL</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-[var(--text-muted)]">
            <Database className="w-3 h-3 text-amber-400" />
            <span>
              {isLive ? 'Connected' : 'Not Connected'}
            </span>
          </div>
        </div>

        {/* Bottom Right — Navigation controls hint (Cleanly separated, no overlap) */}
        <div className="hidden lg:flex absolute bottom-4 right-4 z-20 items-center">
          <div className="bg-[var(--bg-panel)]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[var(--border-color)] text-[10px] text-[var(--text-muted)] font-mono flex items-center gap-2.5 shadow-lg">
            <span>🖱️ Orbit: Left-Click</span>
            <span>•</span>
            <span>Pan: Right-Click</span>
            <span>•</span>
            <span>Zoom: Scroll</span>
          </div>
        </div>

        {/* Component Inspection Modal Popup */}
        {inspectedComponent && (
          <div className="absolute top-16 left-4 z-30 w-76 bg-[var(--bg-panel)]/98 backdrop-blur-md border border-amber-500/40 rounded-xl p-4 shadow-2xl">
            <div className="flex justify-between items-start mb-3 border-b border-[var(--border-subtle)] pb-2.5">
              <div>
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  {inspectedComponent.name}
                </h4>
                <p className="text-[10px] text-amber-400 font-mono mt-0.5">
                  Real-Time Kinematic & Telemetry State
                </p>
              </div>
              <button
                onClick={() => setInspectedComponent(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded hover:bg-[var(--bg-surface)] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1.5 text-[11px] font-mono max-h-60 overflow-y-auto no-scrollbar">
              {Object.entries(inspectedComponent.data).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center py-1 border-b border-[var(--border-subtle)]">
                  <span className="text-[var(--text-muted)] capitalize text-[10px] font-sans">{key}:</span>
                  <span className="font-semibold text-[var(--text-primary)] text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL: REAL-TIME SCADA TELEMETRY STREAM ─────────────────────── */}
      <div className="w-[300px] lg:w-[330px] bg-[var(--bg-panel)] border-l border-[var(--border-color)] flex flex-col overflow-y-auto no-scrollbar shrink-0 z-20">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[var(--border-color)] shrink-0 bg-[var(--bg-surface)]/50">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              Live Feed
            </h2>
            <LiveDataTag status={status} />
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{lastUpdated ? `Packet: ${lastUpdated.toLocaleTimeString()}` : 'Connected to OPC-UA / Supabase'}</span>
          </p>
        </div>

        <div className="flex-1 p-4 space-y-4">
          {/* PAUSED BANNER */}


          {/* SECTION 1: PUMP KINEMATICS (DRIVING 3D MODEL) */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
                3D Well Motion Drivers
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${isWorkPaused
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-cyan-500/10 text-cyan-400'
                }`}>
                {isWorkPaused ? 'PAUSED' : 'ACTIVE'}
              </span>
            </div>

            {/* SRP Speed */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] text-[var(--text-muted)]">Pumping Speed (SRP)</p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-lg font-black font-mono tracking-tight ${isWorkPaused ? 'text-amber-500/50 line-through' : 'text-amber-400'
                    }`}>
                    {activeParams.srpSpeed.toFixed(1)} <span className="text-xs text-[var(--text-muted)] font-normal">SPM</span>
                  </p>
                  {isWorkPaused && (
                    <span className="text-[10px] font-mono text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-500/20">
                      FROZEN
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[var(--text-muted)]">Cycle State</p>
                <p className="text-xs font-bold text-[var(--text-primary)] font-mono">
                  {isWorkPaused ? '0.0 s (HOLD)' : `${activeParams.srpSpeed > 0 ? (60 / activeParams.srpSpeed).toFixed(1) : '0.0'} s`}
                </p>
              </div>
            </div>

            {/* Stroke Length */}
            <div className="flex justify-between items-center pt-2 border-t border-[var(--border-subtle)]">
              <div>
                <p className="text-[10px] text-[var(--text-muted)]">Polished Rod Stroke</p>
                <p className="text-base font-bold text-[var(--text-primary)] font-mono">
                  {activeParams.strokeLength.toFixed(2)} <span className="text-xs text-[var(--text-muted)] font-normal">m</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[var(--text-muted)]">Kinematic Link</p>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">1:1 Synced</span>
              </div>
            </div>

            {/* CSS Stage */}
            <div className="flex justify-between items-center pt-2 border-t border-[var(--border-subtle)]">
              <span className="text-[10px] text-[var(--text-muted)]">Thermal CSS Phase:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {activeCSSPhase}
              </span>
            </div>
          </div>

          {/* SECTION 2: PRODUCTION TELEMETRY */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-amber-400" />
                Surface Production
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-subtle)]">
                <p className="text-[9px] text-[var(--text-muted)]">Oil Flow Rate</p>
                <p className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                  {activeOutput.production.toFixed(1)} <span className="text-[9px] text-[var(--text-muted)] font-normal">bbl/d</span>
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-subtle)]">
                <p className="text-[9px] text-[var(--text-muted)]">Wellhead Press.</p>
                <p className="text-sm font-bold text-[var(--text-primary)] font-mono mt-0.5">
                  {latest?.wellheadPressure ?? 450} <span className="text-[9px] text-[var(--text-muted)] font-normal">psi</span>
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-subtle)]">
                <p className="text-[9px] text-[var(--text-muted)]">Water Cut</p>
                <p className="text-sm font-bold text-sky-400 font-mono mt-0.5">
                  {latest?.waterCut ?? 20.0} <span className="text-[9px] text-[var(--text-muted)] font-normal">%</span>
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-subtle)]">
                <p className="text-[9px] text-[var(--text-muted)]">Associated Gas</p>
                <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                  {latest?.gasRate ?? 14.2} <span className="text-[9px] text-[var(--text-muted)] font-normal">Mscfd</span>
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: SUBSURFACE & DOWNHOLE TELEMETRY */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                Downhole Sensor Array
              </span>
            </div>

            <div className="space-y-2 text-[11px] font-mono">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)] font-sans text-[10px]">Reservoir Temp:</span>
                <span className="font-bold text-orange-400">{activeOutput.reservoirTemperature.toFixed(1)} °C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)] font-sans text-[10px]">Pump Efficiency:</span>
                <span className="font-bold text-emerald-400">{activeOutput.pumpEfficiency.toFixed(1)} %</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)] font-sans text-[10px]">Dynamic Fluid Level:</span>
                <span className="font-bold text-[var(--text-primary)]">{activeParams.fluidLevel.toFixed(1)} m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)] font-sans text-[10px]">Steam Injection Flux:</span>
                <span className="font-bold text-amber-400">{activeParams.steamRate.toFixed(0)} t/cyc</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] font-sans text-[10px]">Pump Condition:</span>
                <span className="font-bold text-emerald-400 uppercase text-[10px] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {activeParams.pumpCondition}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: SCADA Network Info */}
        <div className="p-3 border-t border-[var(--border-color)] shrink-0 bg-[var(--bg-surface)]/30 text-[10px] font-mono text-[var(--text-muted)] flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>OPC-UA Channel 1</span>
          </span>
          <span className="text-slate-500">60 FPS Render</span>
        </div>
      </div>
    </div>
  );
}
