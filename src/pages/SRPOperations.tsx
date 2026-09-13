import { useMemo } from 'react';
import { useSimulationStore } from '../stores/simulationStore';
import { useThemeStore } from '../stores/themeStore';
import SimulatedTag from '../components/ui/SimulatedTag';
import DigitalTwinScene from '../components/three/DigitalTwinScene';
import { generateDynacardData, generateTimeSeries } from '../engine/simulation';
import { LineChart, Line, AreaChart, Area, ScatterChart, Scatter, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ArrowUpDown, Activity, Gauge, AlertTriangle } from 'lucide-react';

export default function SRPOperations() {
  const { params, output, cssPhase } = useSimulationStore();
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  const dynacardData = useMemo(() => generateDynacardData(params), [params]);
  const timeSeries = useMemo(() => generateTimeSeries(params, 72), [params]);

  const efficiencyData = timeSeries.map((d, i) => ({ hour: d.hour, efficiency: d.pumpEfficiency, rodLoad: params.srpSpeed * 4 + params.strokeLength * 10 + (Math.sin(i * 0.2) * 2) }));

  const spmVsProd = [4, 5, 6, 7, 8, 9, 10].map(spm => ({
    spm,
    production: (params.steamRate * 0.35 + spm * 12 + params.strokeLength * 15 - params.fluidLevel * 0.3) * (params.steamTemperature / 280),
  }));

  const chartStyle = {
    grid: isDark ? '#333' : '#e5e7eb',
    text: isDark ? '#888' : '#666',
    tooltip: { backgroundColor: isDark ? '#1a1a2e' : '#fff', border: '1px solid #333', borderRadius: '8px' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <ArrowUpDown size={20} className="text-cyan-400" />
          <h1 className="text-xl font-semibold tracking-wide">SRP OPERATIONS</h1>
        </div>
        <p className="text-sm dark:text-gray-400 text-gray-500">Sucker Rod Pump monitoring and analysis</p>
      </div>

      {/* Status Bar */}
      <div className="flex flex-wrap gap-6 dark:bg-gray-900/60 bg-white border dark:border-gray-800 border-gray-200 rounded-lg p-4 text-sm">
        <div><span className="text-gray-500">SPM: </span><span className="font-mono text-cyan-400">{params.srpSpeed}</span></div>
        <div><span className="text-gray-500">Stroke: </span><span className="font-mono">{params.strokeLength} m</span></div>
        <div><span className="text-gray-500">Efficiency: </span><span className="font-mono text-amber-500">{output.pumpEfficiency.toFixed(1)}%</span></div>
        <div><span className="text-gray-500">Rod Load: </span><span className="font-mono">{(params.srpSpeed * 4 + params.strokeLength * 10).toFixed(1)} kN</span></div>
        <div><span className="text-gray-500">Condition: </span><span className="font-mono text-emerald-500">{output.equipmentRisk === 'low' ? 'NORMAL' : output.equipmentRisk.toUpperCase()}</span></div>
        <SimulatedTag />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Charts - Left 60% */}
        <div className="lg:col-span-3 space-y-6">
          {/* Dynacard */}
          <div className="dark:bg-gray-900/60 bg-white border dark:border-gray-800 border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold tracking-widest uppercase dark:text-gray-400 text-gray-500">SIMULATED SURFACE DYNACARD</h3>
              <SimulatedTag label="DEMO" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} />
                <XAxis dataKey="position" name="Position" tick={{ fill: chartStyle.text, fontSize: 11 }} label={{ value: 'Position (%)', position: 'bottom', fill: chartStyle.text, fontSize: 11 }} />
                <YAxis dataKey="load" name="Load" tick={{ fill: chartStyle.text, fontSize: 11 }} label={{ value: 'Load (kN)', angle: -90, position: 'left', fill: chartStyle.text, fontSize: 11 }} />
                <Tooltip contentStyle={chartStyle.tooltip} />
                <Scatter data={dynacardData} fill="#f59e0b" line={{ stroke: '#f59e0b', strokeWidth: 2 }} lineType="joint" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Pump Efficiency */}
          <div className="dark:bg-gray-900/60 bg-white border dark:border-gray-800 border-gray-200 rounded-lg p-5">
            <h3 className="text-xs font-semibold tracking-widest uppercase dark:text-gray-400 text-gray-500 mb-4">PUMP EFFICIENCY vs TIME</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} />
                <XAxis dataKey="hour" tick={{ fill: chartStyle.text, fontSize: 11 }} />
                <YAxis tick={{ fill: chartStyle.text, fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={chartStyle.tooltip} />
                <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Rod Load */}
          <div className="dark:bg-gray-900/60 bg-white border dark:border-gray-800 border-gray-200 rounded-lg p-5">
            <h3 className="text-xs font-semibold tracking-widest uppercase dark:text-gray-400 text-gray-500 mb-4">ROD LOAD vs TIME</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} />
                <XAxis dataKey="hour" tick={{ fill: chartStyle.text, fontSize: 11 }} />
                <YAxis tick={{ fill: chartStyle.text, fontSize: 11 }} />
                <Tooltip contentStyle={chartStyle.tooltip} />
                <Area type="monotone" dataKey="rodLoad" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* SPM vs Production */}
          <div className="dark:bg-gray-900/60 bg-white border dark:border-gray-800 border-gray-200 rounded-lg p-5">
            <h3 className="text-xs font-semibold tracking-widest uppercase dark:text-gray-400 text-gray-500 mb-4">SPM vs PRODUCTION</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={spmVsProd}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} />
                <XAxis dataKey="spm" tick={{ fill: chartStyle.text, fontSize: 11 }} label={{ value: 'SPM', position: 'bottom', fill: chartStyle.text }} />
                <YAxis tick={{ fill: chartStyle.text, fontSize: 11 }} />
                <Tooltip contentStyle={chartStyle.tooltip} />
                <Line type="monotone" dataKey="production" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 40% - SRP info + 3D */}
        <div className="lg:col-span-2 space-y-6">
          <div className="dark:bg-gray-900/60 bg-white border dark:border-gray-800 border-gray-200 rounded-lg p-5 space-y-3">
            <h3 className="text-xs font-semibold tracking-widest uppercase dark:text-gray-400 text-gray-500">SRP PARAMETERS</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">SPM</span><span className="font-mono">{params.srpSpeed}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Stroke Length</span><span className="font-mono">{params.strokeLength} m</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Fluid Level</span><span className="font-mono">{params.fluidLevel} m</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Pump Condition</span><span className="font-mono capitalize">{params.pumpCondition}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Motor Power</span><span className="font-mono">{(params.srpSpeed * 3.5 + params.strokeLength * 2).toFixed(1)} kW</span></div>
            </div>
          </div>

          <div className="dark:bg-gray-900/60 bg-white border dark:border-gray-800 border-gray-200 rounded-lg overflow-hidden">
            <div className="p-3">
              <h3 className="text-xs font-semibold tracking-widest uppercase dark:text-gray-400 text-gray-500">PUMP VISUALIZATION</h3>
            </div>
            <div className="h-[300px]">
              <DigitalTwinScene params={params} output={output} cssPhase={cssPhase} cameraMode="srp" isDark={isDark} compact showTelemetry={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
