import React, { useState } from 'react';
import { useSimulationStore } from '../stores/simulationStore';
import { useThemeStore } from '../stores/themeStore';
import SimulatedTag from '../components/ui/SimulatedTag';
import SliderControl from '../components/controls/SliderControl';
import { SimulationParams, OptimizationWeights, OptimizationResult } from '../data/types';
import { runSimulation } from '../engine/formulas';
import { runOptimization } from '../engine/optimization';
import { 
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, 
  CartesianGrid, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { FlaskConical, Play, Target, CheckCircle2, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function Simulation() {
  const { params, output, setParams } = useSimulationStore();
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  // 1. What-If Simulation State
  const [scenarioParams, setScenarioParams] = useState<SimulationParams>({ ...params });
  const [scenarioOutput, setScenarioOutput] = useState<ReturnType<typeof runSimulation> | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // 2. Optimization State
  const [weights, setWeights] = useState<OptimizationWeights>({
    production: 0.4,
    steamEfficiency: 0.3,
    energyEfficiency: 0.2,
    equipmentReliability: 0.1,
  });
  const [optResults, setOptResults] = useState<OptimizationResult[] | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Run What-If Simulation
  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setScenarioOutput(runSimulation(scenarioParams));
      setIsSimulating(false);
    }, 600);
  };

  // Run Optimization Search
  const handleRunOptimization = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const results = runOptimization(weights, 3);
      setOptResults(results);
      setIsOptimizing(false);
    }, 800);
  };

  // Apply optimized params to live twin
  const handleApplyParams = (p: SimulationParams) => {
    setParams(p);
    setScenarioParams(p);
    setScenarioOutput(runSimulation(p));
  };

  const chartColors = {
    current: isDark ? '#64748b' : '#94a3b8',
    scenario: '#f59e0b',
    optimized: '#06b6d4',
    grid: isDark ? '#1e293b' : '#e2e8f0',
    text: isDark ? '#94a3b8' : '#64748b',
    tooltipBg: isDark ? '#0f172a' : '#ffffff',
    tooltipBorder: isDark ? '#334155' : '#cbd5e1',
  };

  const comparisonData = scenarioOutput ? [
    { name: 'Production', current: Math.round(output.production), scenario: Math.round(scenarioOutput.production), unit: 'bbl/d' },
    { name: 'Efficiency', current: Math.round(output.pumpEfficiency), scenario: Math.round(scenarioOutput.pumpEfficiency), unit: '%' },
    { name: 'Steam Req', current: Math.round(output.steamRequirement), scenario: Math.round(scenarioOutput.steamRequirement), unit: 't' },
    { name: 'Energy', current: Math.round(output.energyConsumption), scenario: Math.round(scenarioOutput.energyConsumption), unit: 'kWh' },
  ] : [];

  const radarData = scenarioOutput ? [
    { metric: 'Oil Flow', current: output.production / 5, scenario: scenarioOutput.production / 5 },
    { metric: 'Pump Eff', current: output.pumpEfficiency, scenario: scenarioOutput.pumpEfficiency },
    { metric: 'Steam Eff', current: Math.max(0, 100 - output.steamRequirement / 2), scenario: Math.max(0, 100 - scenarioOutput.steamRequirement / 2) },
    { metric: 'Energy Eff', current: Math.max(0, 100 - output.energyConsumption / 5), scenario: Math.max(0, 100 - scenarioOutput.energyConsumption / 5) },
    { metric: 'Reliability', current: Math.max(0, 100 - output.equipmentRiskScore), scenario: Math.max(0, 100 - scenarioOutput.equipmentRiskScore) },
    { metric: 'Thermal Head', current: output.reservoirTemperature / 2, scenario: scenarioOutput.reservoirTemperature / 2 },
  ] : [];

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[var(--border-color)] pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
            <FlaskConical className="w-5 h-5 text-amber-500" />
            <span>WHAT-IF SIMULATION & OPTIMIZATION</span>
            <SimulatedTag label="DETERMINISTIC ENGINE" />
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Evaluate alternative operating scenarios and search for balanced well operating points
          </p>
        </div>
      </div>

      {/* =========================================================================
          PART 1: WHAT-IF SIMULATION WORKSPACE
          ========================================================================= */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
          <span>1. Scenario Parameter Workspace</span>
        </h2>

        {/* 2-Column Parameter Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Current Case (Locked) */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2.5">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Current Case (Base)</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                ACTIVE
              </span>
            </div>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-secondary)]">Steam Injection Rate:</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{params.steamRate} t/cycle</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-secondary)]">Steam Temperature:</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{params.steamTemperature} °C</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-secondary)]">Soaking Time:</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{params.soakDuration} days</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--text-secondary)]">Pumping Speed:</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{params.srpSpeed} SPM</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[var(--text-secondary)]">Stroke Length:</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{params.strokeLength} m</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <div className="text-[9px] text-[var(--text-muted)] uppercase">Production</div>
                <div className="font-mono font-bold text-amber-500">{output.production.toFixed(1)} bbl</div>
              </div>
              <div className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <div className="text-[9px] text-[var(--text-muted)] uppercase">Efficiency</div>
                <div className="font-mono font-bold text-emerald-500">{output.pumpEfficiency.toFixed(1)}%</div>
              </div>
              <div className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <div className="text-[9px] text-[var(--text-muted)] uppercase">Risk Level</div>
                <div className="font-mono font-bold text-[var(--text-secondary)] uppercase">{output.equipmentRisk}</div>
              </div>
            </div>
          </div>

          {/* Simulated Case (Tunable Sliders) */}
          <div className="bg-[var(--bg-panel)] border border-amber-500/30 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2.5">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Simulated Case (What-If Parameters)
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                TUNABLE
              </span>
            </div>

            <SliderControl
              label="Steam Injection Rate"
              value={scenarioParams.steamRate}
              min={60}
              max={120}
              step={5}
              unit="units"
              onChange={(v) => setScenarioParams(p => ({ ...p, steamRate: v }))}
            />
            <SliderControl
              label="Soaking Duration"
              value={scenarioParams.soakDuration}
              min={2}
              max={5}
              step={0.5}
              unit="days"
              onChange={(v) => setScenarioParams(p => ({ ...p, soakDuration: v }))}
            />
            <SliderControl
              label="Pumping Speed"
              value={scenarioParams.srpSpeed}
              min={4}
              max={10}
              step={0.5}
              unit="SPM"
              onChange={(v) => setScenarioParams(p => ({ ...p, srpSpeed: v }))}
            />
            <SliderControl
              label="Stroke Length"
              value={scenarioParams.strokeLength}
              min={1.5}
              max={3.0}
              step={0.1}
              unit="m"
              onChange={(v) => setScenarioParams(p => ({ ...p, strokeLength: v }))}
            />
          </div>
        </div>

        {/* Run Simulation Action Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 text-sm"
          >
            {isSimulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isSimulating ? 'SIMULATING...' : 'RUN SIMULATION'}</span>
          </button>
        </div>

        {/* Simulation Output Comparison */}
        {scenarioOutput && (
          <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
            {/* Comparison Table */}
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3">
                Simulated Output Comparison
              </h3>
              
              <div className="grid grid-cols-4 gap-2 text-xs border-b border-[var(--border-subtle)] pb-2 text-[var(--text-muted)] font-semibold uppercase">
                <div>Parameter</div>
                <div className="text-center">Current Case</div>
                <div className="text-center text-amber-500">Simulated Case</div>
                <div className="text-right">Net Delta</div>
              </div>

              <div className="divide-y divide-[var(--border-subtle)] text-xs">
                {[
                  { name: 'Oil Production', current: output.production, scenario: scenarioOutput.production, unit: 'bbl/d', lowerBetter: false },
                  { name: 'Reservoir Temp', current: output.reservoirTemperature, scenario: scenarioOutput.reservoirTemperature, unit: '°C', lowerBetter: false },
                  { name: 'Steam Requirement', current: output.steamRequirement, scenario: scenarioOutput.steamRequirement, unit: 't/cycle', lowerBetter: true },
                  { name: 'Energy Consumption', current: output.energyConsumption, scenario: scenarioOutput.energyConsumption, unit: 'kWh', lowerBetter: true },
                  { name: 'Pump Efficiency', current: output.pumpEfficiency, scenario: scenarioOutput.pumpEfficiency, unit: '%', lowerBetter: false },
                  { name: 'Equipment Risk Score', current: output.equipmentRiskScore, scenario: scenarioOutput.equipmentRiskScore, unit: 'pts', lowerBetter: true },
                ].map((row) => {
                  const delta = row.scenario - row.current;
                  const isPositive = row.lowerBetter ? delta < 0 : delta > 0;
                  return (
                    <div key={row.name} className="grid grid-cols-4 gap-2 py-2 items-center">
                      <div className="font-medium text-[var(--text-primary)]">{row.name}</div>
                      <div className="text-center font-mono text-[var(--text-secondary)]">
                        {row.current.toFixed(1)} {row.unit}
                      </div>
                      <div className="text-center font-mono font-bold text-amber-500">
                        {row.scenario.toFixed(1)} {row.unit}
                      </div>
                      <div className={`text-right font-mono font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Charts: Bar Delta & Radar Balance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  Operating Parameter Comparison
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                      <XAxis dataKey="name" stroke={chartColors.text} fontSize={10} />
                      <YAxis stroke={chartColors.text} fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, borderRadius: '8px', fontSize: '11px' }} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="current" name="Current" fill={chartColors.current} radius={[3, 3, 0, 0]} />
                      <Bar dataKey="scenario" name="Simulated" fill={chartColors.scenario} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  Operating Envelope Balance (Radar)
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke={chartColors.grid} />
                      <PolarAngleAxis dataKey="metric" stroke={chartColors.text} tick={{ fill: chartColors.text, fontSize: 10 }} />
                      <PolarRadiusAxis tick={false} axisLine={false} />
                      <Radar name="Current" dataKey="current" stroke={chartColors.current} fill={chartColors.current} fillOpacity={0.2} />
                      <Radar name="Simulated" dataKey="scenario" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          PART 2: MULTI-OBJECTIVE OPTIMIZATION SEARCH (Integrated directly)
          ========================================================================= */}
      <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-500" />
              <span>2. Multi-Objective Optimization Engine</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Search simulated parameter combinations to identify the best balanced operating point
            </p>
          </div>
        </div>

        {/* Objective Weights Matrix */}
        <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm space-y-4">
          <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Objective Weights (0.0 to 1.0)</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SliderControl
              label="Production Maximization"
              value={weights.production}
              min={0}
              max={1}
              step={0.1}
              unit=""
              onChange={(v) => setWeights(w => ({ ...w, production: v }))}
            />
            <SliderControl
              label="Steam Efficiency"
              value={weights.steamEfficiency}
              min={0}
              max={1}
              step={0.1}
              unit=""
              onChange={(v) => setWeights(w => ({ ...w, steamEfficiency: v }))}
            />
            <SliderControl
              label="Energy Efficiency"
              value={weights.energyEfficiency}
              min={0}
              max={1}
              step={0.1}
              unit=""
              onChange={(v) => setWeights(w => ({ ...w, energyEfficiency: v }))}
            />
            <SliderControl
              label="Equipment Reliability"
              value={weights.equipmentReliability}
              min={0}
              max={1}
              step={0.1}
              unit=""
              onChange={(v) => setWeights(w => ({ ...w, equipmentReliability: v }))}
            />
          </div>

          <div className="flex justify-start pt-2">
            <button
              onClick={handleRunOptimization}
              disabled={isOptimizing}
              className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2 text-xs"
            >
              {isOptimizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Target className="w-3.5 h-3.5" />}
              <span>{isOptimizing ? 'SEARCHING OPERATING COMBINATIONS...' : 'RUN OPTIMIZATION'}</span>
            </button>
          </div>
        </div>

        {/* Optimization Recommendations Table */}
        {optResults && optResults.length > 0 && (
          <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Top Recommended Simulated Operating Points</span>
              </h3>
              <span className="text-[10px] text-[var(--text-muted)]">PROTOTYPE MULTI-OBJECTIVE SCORE</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] uppercase text-[10px]">
                    <th className="py-2 px-3">Rank</th>
                    <th className="py-2 px-3">Steam</th>
                    <th className="py-2 px-3">Soak</th>
                    <th className="py-2 px-3">SRP Speed</th>
                    <th className="py-2 px-3">Stroke</th>
                    <th className="py-2 px-3">Predicted Prod.</th>
                    <th className="py-2 px-3">Pump Eff.</th>
                    <th className="py-2 px-3">Risk</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                  {optResults.map((r) => (
                    <tr key={r.rank} className={r.rank === 1 ? 'bg-cyan-500/5 dark:bg-cyan-500/10' : ''}>
                      <td className="py-2.5 px-3 font-bold text-cyan-500">#{r.rank}</td>
                      <td className="py-2.5 px-3 text-[var(--text-primary)]">{r.params.steamRate} t</td>
                      <td className="py-2.5 px-3 text-[var(--text-primary)]">{r.params.soakDuration} d</td>
                      <td className="py-2.5 px-3 text-[var(--text-primary)]">{r.params.srpSpeed} SPM</td>
                      <td className="py-2.5 px-3 text-[var(--text-primary)]">{r.params.strokeLength} m</td>
                      <td className="py-2.5 px-3 font-bold text-amber-500">{r.output.production.toFixed(1)} bbl/d</td>
                      <td className="py-2.5 px-3 text-emerald-500">{r.output.pumpEfficiency.toFixed(1)}%</td>
                      <td className="py-2.5 px-3 uppercase text-[10px] text-[var(--text-secondary)]">{r.output.equipmentRisk}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleApplyParams(r.params)}
                          className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 text-[10px] transition-all"
                        >
                          Apply to Twin
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-[var(--text-muted)] italic pt-2">
              * Note: Optimization scores represent simulated trade-offs and decision support. Actual field implementation requires petroleum engineer validation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
