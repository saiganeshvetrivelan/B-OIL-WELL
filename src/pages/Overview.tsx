import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulationStore } from '../stores/simulationStore';
import KPIWidget from '../components/ui/KPIWidget';
import LiveDataTag from '../components/ui/LiveDataTag';
import DigitalTwinScene from '../components/three/DigitalTwinScene';
import { useTelemetryContext } from '../context/TelemetryContext';
import { DEMO_CSS_CYCLES } from '../data/mockCSS';
import { generateProductionHistory } from '../data/mockSensors';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Box, Activity, FlaskConical, ChevronRight, TrendingUp, Zap, Thermometer, Gauge } from 'lucide-react';

export default function Overview() {
  const { output, params, cssPhase } = useSimulationStore();
  const navigate = useNavigate();
  const { status, lastUpdated } = useTelemetryContext();

  const prodHistory = useMemo(() => generateProductionHistory(7), []);

  const cycleData = useMemo(() => {
    return DEMO_CSS_CYCLES.slice(-8).map((c) => ({
      cycle: `C${c.cycleNumber}`,
      oil: c.oilProduced,
      steam: c.steamVolume,
    }));
  }, []);

  const chartColors = {
    primary:      '#F59E0B',
    secondary:    '#06B6D4',
    emerald:      '#10B981',
    grid:         '#1E2D45',
    text:         '#4E6070',
    tooltipBg:    '#0C1220',
    tooltipBorder:'#1E2D45',
  };

  return (
    <div className="p-4 md:p-5 space-y-5 max-w-[1600px] mx-auto">

      {/* ── Top Banner ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl px-5 py-3.5">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-3">
            <h1 className="text-base md:text-lg font-black tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              WELL BGW-DEMO-01
            </h1>
            <LiveDataTag status={status} lastUpdated={lastUpdated} />
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-medium">
            Heavy Oil Asset · Baghewala Field · CSS + SRP · Oil India Limited
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-color)]">
            CSS: <span className="text-amber-400 font-bold uppercase ml-1">{cssPhase}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-color)]">
            SRP: <span className="text-emerald-400 font-bold ml-1">{params.srpSpeed} SPM</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-color)]">
            CYCLE: <span className="text-cyan-400 font-bold ml-1">#14</span>
          </div>
        </div>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPIWidget
          label="OIL PRODUCTION"
          value={output.production.toFixed(1)}
          unit="bbl/d"
          trend={2.3}
          dataStatus={status}
          highlight="amber"
        />
        <KPIWidget
          label="RESERVOIR TEMP"
          value={output.reservoirTemperature.toFixed(0)}
          unit="°C"
          trend={0.5}
          dataStatus={status}
          highlight="orange"
        />
        <KPIWidget
          label="STEAM INJECTION"
          value={params.steamRate.toFixed(0)}
          unit="t/cyc"
          trend={-1.2}
          dataStatus={status}
          highlight="cyan"
        />
        <KPIWidget
          label="PUMP EFFICIENCY"
          value={output.pumpEfficiency.toFixed(0)}
          unit="%"
          trend={-0.8}
          dataStatus={status}
          highlight="emerald"
        />
        <KPIWidget
          label="ENERGY"
          value={output.energyConsumption.toFixed(0)}
          unit="kWh"
          trend={1.1}
          dataStatus={status}
        />
        <KPIWidget
          label="EQUIPMENT RISK"
          value={output.equipmentRisk.toUpperCase()}
          unit=""
          status={output.equipmentRisk}
          dataStatus={status}
        />
      </div>

      {/* ── Row 2: 3D Twin Preview + Well Status ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 3D Viewport (2 cols) */}
        <div className="lg:col-span-2 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-color)] overflow-hidden relative h-[400px] flex flex-col">
          {/* HUD overlay */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
            <div className="bg-[var(--bg-panel)]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[var(--border-color)] flex items-center gap-2">
              <Box className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Live 3D Digital Twin
              </span>
            </div>
            <LiveDataTag status={status} />
          </div>

          <DigitalTwinScene
            params={params}
            output={output}
            cssPhase={cssPhase}
            cameraMode="full"
            isDark={true}
            showTelemetry={false}
            compact={false}
            status={status}
          />

          {/* Explore button */}
          <div className="absolute bottom-3 right-3 z-10">
            <button
              onClick={() => navigate('/app/digital-twin')}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <span>Explore Full 3D Twin</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Well Status Panel (1 col) */}
        <div className="bg-[var(--bg-panel)] rounded-xl border border-[var(--border-color)] p-4 flex flex-col gap-4">
          <div className="border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Operating Well Status
            </h3>
          </div>

          <div className="space-y-2.5 text-[11px] font-mono flex-1">
            {[
              { label: 'CSS Cycle Phase',     value: cssPhase,              color: 'text-amber-400',   icon: <Zap className="w-3 h-3" /> },
              { label: 'Active Cycle',        value: 'Cycle #14',           color: 'text-[var(--text-primary)]', icon: null },
              { label: 'SRP Unit Speed',      value: `${params.srpSpeed} SPM`,   color: 'text-emerald-400', icon: <Gauge className="w-3 h-3" /> },
              { label: 'Stroke Length',       value: `${params.strokeLength} m`,  color: 'text-cyan-400',    icon: null },
              { label: 'Steam Temperature',   value: `${params.steamTemperature} °C`, color: 'text-orange-400', icon: <Thermometer className="w-3 h-3" /> },
              { label: 'Dynamic Fluid Level', value: `${params.fluidLevel} m`,   color: 'text-sky-400',    icon: null },
              { label: 'Pump Condition',      value: params.pumpCondition.toUpperCase(), color: 'text-[var(--text-primary)]', icon: null },
            ].map(({ label, value, color, icon }) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-1.5 text-[var(--text-muted)] font-sans">
                  {icon}
                  <span>{label}</span>
                </div>
                <span className={`font-bold uppercase ${color}`}>{value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => navigate('/app/operations')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-surface)] hover:bg-amber-500/10 hover:border-amber-500/30 border border-[var(--border-color)] text-[var(--text-primary)] text-[11px] font-semibold transition-all"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Operations Diagnostics</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </button>
            <button
              onClick={() => navigate('/app/simulation')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-surface)] hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-[var(--border-color)] text-[var(--text-primary)] text-[11px] font-semibold transition-all"
            >
              <div className="flex items-center gap-2">
                <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
                <span>What-If Simulation</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 3: Charts ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Production History */}
        <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                Oil Production Rate — 7 Day SCADA
              </h3>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Flow Telemetry Stream · bbl/day</p>
            </div>
            <LiveDataTag status={status} />
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={prodHistory.slice(-42)} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={chartColors.primary} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis
                  dataKey="timestamp"
                  stroke={chartColors.text}
                  fontSize={9}
                  tickFormatter={(val) => val ? val.split('T')[0].slice(5) : ''}
                />
                <YAxis stroke={chartColors.text} fontSize={9} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.tooltipBg,
                    borderColor: chartColors.tooltipBorder,
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#F1F5F9',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="oilRate"
                  name="Oil Rate (bbl/d)"
                  stroke={chartColors.primary}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProd)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CSS Cycle Performance */}
        <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                CSS Thermal Cycle — Oil vs Steam
              </h3>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Historical Cycles #7–#14 · bbl / t</p>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">bbl / t</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cycleData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="cycle" stroke={chartColors.text} fontSize={9} />
                <YAxis stroke={chartColors.text} fontSize={9} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.tooltipBg,
                    borderColor: chartColors.tooltipBorder,
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#F1F5F9',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', color: chartColors.text }} />
                <Bar dataKey="oil"   name="Oil Recovered (bbl)" fill={chartColors.primary}   radius={[3, 3, 0, 0]} />
                <Bar dataKey="steam" name="Steam Injected (t)"  fill={chartColors.secondary} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
