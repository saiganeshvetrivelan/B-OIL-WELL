import { useSimulationStore } from '../../stores/simulationStore';
import { useUiStore } from '../../stores/uiStore';
import SliderControl from './SliderControl';
import { Flame, ArrowUpDown, Settings, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CSSPhase } from '../../data/types';

const CSS_PHASES: { value: CSSPhase; label: string; color: string }[] = [
  { value: 'injection', label: 'INJECTION', color: 'bg-red-500' },
  { value: 'soaking', label: 'SOAKING', color: 'bg-amber-500' },
  { value: 'production', label: 'PRODUCTION', color: 'bg-emerald-500' },
];

export default function TwinControls() {
  const { params, setParam, cssPhase, setCSSPhase } = useSimulationStore();
  const { rightPanelOpen, toggleRightPanel } = useUiStore();

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={toggleRightPanel}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 dark:bg-gray-800 bg-gray-200 p-1.5 rounded-l-lg border dark:border-gray-700 border-gray-300 border-r-0 hover:bg-amber-500/20 transition-colors"
        aria-label="Toggle controls"
      >
        {rightPanelOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Panel */}
      <div
        className={`fixed right-0 top-[48px] bottom-[32px] w-[280px] dark:bg-gray-900/95 bg-white/95 backdrop-blur-sm border-l dark:border-gray-800 border-gray-200 z-30 transition-transform duration-300 overflow-y-auto ${
          rightPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 space-y-5">
          {/* Title */}
          <div className="flex items-center gap-2">
            <Settings size={14} className="text-amber-500" />
            <h3 className="text-xs font-semibold tracking-widest uppercase dark:text-gray-300 text-gray-700">
              Twin Controls
            </h3>
          </div>

          {/* CSS Parameters */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Flame size={12} className="text-amber-500" />
              <span className="text-[10px] font-semibold tracking-widest uppercase dark:text-gray-400 text-gray-500">
                CSS Parameters
              </span>
            </div>

            <SliderControl
              label="Steam Injection Rate"
              value={params.steamRate}
              min={60}
              max={120}
              step={5}
              unit="units"
              onChange={(v) => setParam('steamRate', v)}
            />
            <SliderControl
              label="Steam Temperature"
              value={params.steamTemperature}
              min={200}
              max={350}
              step={10}
              unit="°C"
              onChange={(v) => setParam('steamTemperature', v)}
            />
            <SliderControl
              label="Soaking Duration"
              value={params.soakDuration}
              min={2}
              max={5}
              step={0.5}
              unit="days"
              onChange={(v) => setParam('soakDuration', v)}
            />
          </div>

          {/* SRP Parameters */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown size={12} className="text-cyan-400" />
              <span className="text-[10px] font-semibold tracking-widest uppercase dark:text-gray-400 text-gray-500">
                SRP Parameters
              </span>
            </div>

            <SliderControl
              label="SRP Speed"
              value={params.srpSpeed}
              min={4}
              max={10}
              step={0.5}
              unit="SPM"
              onChange={(v) => setParam('srpSpeed', v)}
            />
            <SliderControl
              label="Stroke Length"
              value={params.strokeLength}
              min={1.5}
              max={3.0}
              step={0.1}
              unit="m"
              onChange={(v) => setParam('strokeLength', v)}
            />
            <SliderControl
              label="Fluid Level"
              value={params.fluidLevel}
              min={20}
              max={80}
              step={1}
              unit="m"
              onChange={(v) => setParam('fluidLevel', v)}
            />
          </div>

          {/* Equipment */}
          <div className="space-y-3">
            <span className="text-[10px] font-semibold tracking-widest uppercase dark:text-gray-400 text-gray-500">
              Equipment
            </span>
            <div>
              <label className="text-xs dark:text-gray-400 text-gray-500 mb-1 block">
                Pump Condition
              </label>
              <select
                value={params.pumpCondition}
                onChange={(e) => setParam('pumpCondition', e.target.value as any)}
                className="w-full text-sm dark:bg-gray-800 bg-gray-100 border dark:border-gray-700 border-gray-300 rounded-lg px-3 py-2 dark:text-gray-200 text-gray-800 outline-none focus:border-amber-500 transition-colors"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          {/* CSS Phase */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold tracking-widest uppercase dark:text-gray-400 text-gray-500">
              CSS Phase
            </span>
            <div className="grid grid-cols-3 gap-1">
              {CSS_PHASES.map((phase) => (
                <button
                  key={phase.value}
                  onClick={() => setCSSPhase(phase.value)}
                  className={`text-[10px] font-semibold py-1.5 rounded-md transition-all ${
                    cssPhase === phase.value
                      ? `${phase.color} text-white`
                      : 'dark:bg-gray-800 bg-gray-100 dark:text-gray-400 text-gray-500 hover:opacity-80'
                  }`}
                >
                  {phase.label}
                </button>
              ))}
            </div>
          </div>

          {/* Run Simulation */}
          <button
            className="w-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Play size={14} />
            RUN SIMULATION
          </button>

          <p className="text-[9px] text-center dark:text-gray-600 text-gray-400 uppercase tracking-wider">
            Prototype · Demo Mode
          </p>
        </div>
      </div>
    </>
  );
}
