import React, { useMemo, useState } from 'react';
import { useSimulationStore } from '../stores/simulationStore';
import { useThemeStore } from '../stores/themeStore';
import SimulatedTag from '../components/ui/SimulatedTag';
import { DEMO_CSS_CYCLES } from '../data/mockCSS';
import { generateDynacardData, generateTimeSeries } from '../engine/simulation';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Flame, ArrowUpDown, Activity } from 'lucide-react';

export default function Operations() {
  const { params, output, cssPhase, setCSSPhase } = useSimulationStore();
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'all' | 'css' | 'srp'>('all');

  // Chart styling tokens dynamically bound to active theme
  const chartColors = {
    amber: isDark ? '#f59e0b' : '#d97706',
    cyan: isDark ? '#06b6d4' : '#0891b2',
    emerald: isDark ? '#10b981' : '#059669',
    red: isDark ? '#ef4444' : '#dc2626',
    slate: isDark ? '#94A3B8' : '#62625D',
    grid: isDark ? '#243048' : '#DDD8CC',
    tooltipBg: isDark ? '#0F1626' : '#FFFDF7',
    tooltipBorder: isDark ? '#243048' : '#DDD8CC',
  };

  const timeSeries = useMemo(() => generateTimeSeries(params, 48), [params]);
  const dynacardData = useMemo(() => generateDynacardData(params), [params]);

  const cssCyclesData = useMemo(() => {
    return DEMO_CSS_CYCLES.slice(-8).map(c => ({
      cycle: `Cycle ${c.cycleNumber}`,
      oilProduced: c.oilProduced,
      steamVolume: c.steamVolume,
      sor: Number((c.steamVolume / Math.max(1, c.oilProduced)).toFixed(2)),
    }));
  }, []);

  const spmSensitivityData = [4, 5, 6, 7, 8, 9, 10].map(spm => {
    const prod = (params.steamRate * 0.35 + spm * 12 + params.strokeLength * 15 - params.fluidLevel * 0.3) * (params.steamTemperature / 280);
    const load = spm * 4 + params.strokeLength * 10;
    return { spm, production: Math.round(prod), rodLoad: Math.round(load) };
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Section Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-amber-500" />
            <span>WELL OPERATIONS</span>
            <SimulatedTag label="ENGINEERING SCADA" />
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Real-time monitoring of Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) artificial lift
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-[var(--bg-surface)] p-1 rounded-lg border border-[var(--border-color)] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'all'
                ? 'bg-[var(--bg-panel)] text-[var(--text-primary)] shadow-sm font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Combined View
          </button>
          <button
            onClick={() => setActiveTab('css')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'css'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>CSS Thermal</span>
          </button>
          <button
            onClick={() => setActiveTab('srp')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'srp'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>SRP Artificial Lift</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: CYCLIC STEAM STIMULATION (CSS) OPERATIONS
          ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'css') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Cyclic Steam Stimulation (CSS) Performance
              </h2>
            </div>
            
            {/* CSS Phase Badges */}
            <div className="flex items-center gap-1.5 bg-[var(--bg-surface)] p-1 rounded-lg border border-[var(--border-color)] text-[10px] font-bold">
              {(['injection', 'soaking', 'production'] as const).map((phase) => (
                <button
                  key={phase}
                  onClick={() => setCSSPhase(phase)}
                  className={`px-2.5 py-1 rounded transition-all uppercase ${
                    cssPhase === phase
                      ? phase === 'injection'
                        ? 'bg-red-500 text-white'
                        : phase === 'soaking'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-500 text-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {phase}
                </button>
              ))}
            </div>
          </div>

          {/* CSS Metric Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg p-3">
              <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase">Steam Injection Rate</span>
              <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                {params.steamRate} <span className="text-xs font-normal text-[var(--text-muted)]">t/cycle</span>
              </div>
            </div>
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg p-3">
              <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase">Steam Temperature</span>
              <div className="text-base font-bold font-mono text-[var(--text-primary)] mt-0.5">
                {params.steamTemperature} <span className="text-xs font-normal text-[var(--text-muted)]">°C</span>
              </div>
            </div>
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg p-3">
              <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase">Soak Duration</span>
              <div className="text-base font-bold font-mono text-[var(--text-primary)] mt-0.5">
                {params.soakDuration} <span className="text-xs font-normal text-[var(--text-muted)]">days</span>
              </div>
            </div>
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg p-3">
              <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase">Reservoir Temp</span>
              <div className="text-base font-bold font-mono text-orange-500 mt-0.5">
                {output.reservoirTemperature.toFixed(1)} <span className="text-xs font-normal text-[var(--text-muted)]">°C</span>
              </div>
            </div>
          </div>

          {/* CSS Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Chart 1: Reservoir Temperature vs Time */}
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Reservoir Temperature Response (48h SCADA)
                </h3>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">°C vs Hour</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="hour" stroke={chartColors.slate} fontSize={10} tickFormatter={(h) => `h+${h}`} />
                    <YAxis stroke={chartColors.slate} fontSize={10} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, color: chartColors.slate, borderRadius: '8px', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="temperature" name="Res. Temp (°C)" stroke={chartColors.amber} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Historical CSS Cycles Produced vs Steam */}
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  CSS Cycle Oil Recovery vs Steam Injected
                </h3>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">bbl / t</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cssCyclesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="cycle" stroke={chartColors.slate} fontSize={10} />
                    <YAxis stroke={chartColors.slate} fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, color: chartColors.slate, borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="oilProduced" name="Oil Produced (bbl)" fill={chartColors.amber} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="steamVolume" name="Steam Injected (t)" fill={chartColors.cyan} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: SUCKER ROD PUMP (SRP) OPERATIONS
          ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'srp') && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-cyan-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Sucker Rod Pump (SRP) Mechanical Lift Diagnostics
            </h2>
          </div>

          {/* SRP Metric Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg p-3">
              <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase">Pumping Speed</span>
              <div className="text-base font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">
                {params.srpSpeed} <span className="text-xs font-normal text-[var(--text-muted)]">SPM</span>
              </div>
            </div>
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg p-3">
              <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase">Stroke Length</span>
              <div className="text-base font-bold font-mono text-[var(--text-primary)] mt-0.5">
                {params.strokeLength} <span className="text-xs font-normal text-[var(--text-muted)]">m</span>
              </div>
            </div>
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg p-3">
              <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase">Pump Efficiency</span>
              <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {output.pumpEfficiency.toFixed(1)} <span className="text-xs font-normal text-[var(--text-muted)]">%</span>
              </div>
            </div>
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg p-3">
              <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase">Peak Rod Load</span>
              <div className="text-base font-bold font-mono text-[var(--text-primary)] mt-0.5">
                {(params.srpSpeed * 4 + params.strokeLength * 10).toFixed(1)} <span className="text-xs font-normal text-[var(--text-muted)]">kN</span>
              </div>
            </div>
          </div>

          {/* SRP Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Chart 3: Simulated Surface Dynacard Loop */}
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Surface Dynacard Indicator Card (API Standard)
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)]">Polished Rod Position (%) vs Load (kN)</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  NORMAL FULL CARD
                </span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="position" type="number" stroke={chartColors.slate} fontSize={10} domain={[0, 100]} />
                    <YAxis dataKey="load" type="number" stroke={chartColors.slate} fontSize={10} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, color: chartColors.slate, borderRadius: '8px', fontSize: '11px' }} />
                    <Scatter data={dynacardData} fill={chartColors.amber} line={{ stroke: chartColors.amber, strokeWidth: 2 }} lineType="joint" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: SPM Sensitivity vs Production & Rod Stress */}
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Pumping Speed Sensitivity Curve
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)]">SPM vs Production (bbl/d) & Peak Rod Load (kN)</p>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">4-10 SPM</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={spmSensitivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="spm" stroke={chartColors.slate} fontSize={10} tickFormatter={(s) => `${s} SPM`} />
                    <YAxis stroke={chartColors.slate} fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, color: chartColors.slate, borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line type="monotone" dataKey="production" name="Production (bbl/d)" stroke={chartColors.cyan} strokeWidth={2} dot={{ fill: chartColors.cyan, r: 3 }} />
                    <Line type="monotone" dataKey="rodLoad" name="Rod Load (kN)" stroke={chartColors.amber} strokeWidth={2} dot={{ fill: chartColors.amber, r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
