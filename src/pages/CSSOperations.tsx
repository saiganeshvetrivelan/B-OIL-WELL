import React, { useMemo } from 'react';
import { useSimulationStore } from '../stores/simulationStore';
import { useThemeStore } from '../stores/themeStore';
import SimulatedTag from '../components/ui/SimulatedTag';
import { DEMO_CSS_CYCLES } from '../data/mockCSS';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Legend } from 'recharts';

export default function CSSOperations() {
  const { params, output, cssPhase } = useSimulationStore();
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  const chartColors = {
    primary: '#f59e0b', // amber-500
    secondary: '#22d3ee', // cyan-400
    tertiary: '#ec4899', // pink-500
    grid: isDark ? '#334155' : '#e2e8f0',
    text: isDark ? '#94a3b8' : '#64748b',
    bg: isDark ? '#1e293b' : '#ffffff'
  };

  // Mock data generators for charts
  const tempVsTime = useMemo(() => Array.from({length: 30}).map((_, i) => ({
    time: `Day ${i+1}`,
    temp: output.reservoirTemperature + (Math.sin(i/2) * 10) - (i * 0.5)
  })), [output.reservoirTemperature]);

  const steamVsProd = useMemo(() => Array.from({length: 12}).map((_, i) => ({
    month: `M${i+1}`,
    steam: 1000 + Math.random() * 500,
    prod: output.production * (0.8 + Math.random() * 0.4)
  })), [output.production]);

  const declineCurve = useMemo(() => Array.from({length: 20}).map((_, i) => ({
    time: `Day ${i*10}`,
    rate: output.production * Math.exp(-0.02 * i)
  })), [output.production]);

  const cycleData = useMemo(() => DEMO_CSS_CYCLES.slice(-8).map(c => ({
    name: `Cycle ${c.cycleNumber}`,
    oil: c.oilProduced,
    sor: c.steamVolume / Math.max(1, c.oilProduced)
  })), []);

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 gap-6 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      
      {/* Top Status Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex justify-between items-center shadow-sm shrink-0">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-3">
            CSS Operations Engineering
            <SimulatedTag label="PROTOTYPE" />
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Cyclic Steam Stimulation Monitoring & Analysis</p>
        </div>
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase font-semibold">Current Phase</span>
            <span className="text-lg font-bold text-amber-500 uppercase">{cssPhase}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase font-semibold">Active Cycle</span>
            <span className="text-lg font-bold">14</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase font-semibold">Steam Rate</span>
            <span className="text-lg font-bold">{params.steamRate} <span className="text-sm font-normal text-gray-500">t/d</span></span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left Column: Charts */}
        <div className="flex-[6] grid grid-cols-2 grid-rows-2 gap-4 overflow-y-auto pr-2 custom-scrollbar">
          
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold mb-4">Temperature vs Time (Current Cycle)</h3>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tempVsTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="time" stroke={chartColors.text} fontSize={10} />
                  <YAxis stroke={chartColors.text} fontSize={10} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: chartColors.bg, borderColor: chartColors.grid }} />
                  <Line type="monotone" dataKey="temp" stroke={chartColors.primary} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold mb-4">Steam Injection vs Production</h3>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={steamVsProd}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="month" stroke={chartColors.text} fontSize={10} />
                  <YAxis yAxisId="left" stroke={chartColors.text} fontSize={10} />
                  <YAxis yAxisId="right" orientation="right" stroke={chartColors.text} fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: chartColors.bg, borderColor: chartColors.grid }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar yAxisId="left" dataKey="steam" name="Steam (t)" fill={chartColors.secondary} opacity={0.6} />
                  <Line yAxisId="right" type="monotone" dataKey="prod" name="Prod (bbl)" stroke={chartColors.primary} strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold mb-4">Cycle Performance & SOR</h3>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={cycleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="name" stroke={chartColors.text} fontSize={10} />
                  <YAxis yAxisId="left" stroke={chartColors.text} fontSize={10} />
                  <YAxis yAxisId="right" orientation="right" stroke={chartColors.text} fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: chartColors.bg, borderColor: chartColors.grid }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar yAxisId="left" dataKey="oil" name="Oil Produced" fill={chartColors.primary} />
                  <Line yAxisId="right" type="stepAfter" dataKey="sor" name="SOR" stroke={chartColors.tertiary} strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold mb-4">Production Decline Curve</h3>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={declineCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="time" stroke={chartColors.text} fontSize={10} />
                  <YAxis stroke={chartColors.text} fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: chartColors.bg, borderColor: chartColors.grid }} />
                  <Area type="monotone" dataKey="rate" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: Parameters & Timeline */}
        <div className="flex-[4] flex flex-col gap-4 overflow-hidden">
          
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold mb-4 uppercase text-gray-500 tracking-wider">CSS Parameters</h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-gray-600 dark:text-gray-400">Steam Temp</span>
                <span className="font-mono font-bold">{params.steamTemperature} °C</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-gray-600 dark:text-gray-400">Steam Rate</span>
                <span className="font-mono font-bold">{params.steamRate} units</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-gray-600 dark:text-gray-400">Soak Duration</span>
                <span className="font-mono font-bold">{params.soakDuration} days</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-gray-600 dark:text-gray-400">SRP Speed</span>
                <span className="font-mono font-bold">{params.srpSpeed} SPM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Est. Heat Loss</span>
                <span className="font-mono font-bold text-amber-500">12.4 %</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm flex-1 overflow-y-auto">
            <h3 className="text-sm font-bold mb-4 uppercase text-gray-500 tracking-wider">Cycle Timeline</h3>
            <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-6">
              
              {/* Current Phase */}
              <div className="relative pl-6">
                <div className="absolute w-4 h-4 bg-amber-500 rounded-full -left-[9px] top-1 border-4 border-white dark:border-gray-900"></div>
                <h4 className="font-bold text-amber-500">Cycle 14 - Production</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Day 12 of estimated 45. Stable decline observed.</p>
              </div>

              {/* Past Phase */}
              <div className="relative pl-6 opacity-60">
                <div className="absolute w-4 h-4 bg-gray-400 rounded-full -left-[9px] top-1 border-4 border-white dark:border-gray-900"></div>
                <h4 className="font-bold">Cycle 14 - Soak</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Completed. 7 days duration. Peak temp 210°C.</p>
              </div>

              {/* Past Phase */}
              <div className="relative pl-6 opacity-60">
                <div className="absolute w-4 h-4 bg-gray-400 rounded-full -left-[9px] top-1 border-4 border-white dark:border-gray-900"></div>
                <h4 className="font-bold">Cycle 14 - Injection</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Completed. 15 days. 2,500t steam injected.</p>
              </div>

              {/* Previous Cycle */}
              <div className="relative pl-6 pt-4 opacity-40">
                <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[7px] top-5"></div>
                <h4 className="font-bold">Cycle 13 Complete</h4>
                <p className="text-sm text-gray-500 mt-1">Total oil: 1,450 bbl. SOR: 1.8</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
