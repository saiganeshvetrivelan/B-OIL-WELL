import React from 'react';
import { useThemeStore } from '../stores/themeStore';
import { useUiStore } from '../stores/uiStore';
import { useSimulationStore } from '../stores/simulationStore';
import { Settings as SettingsIcon, Moon, Sun, RotateCcw, ShieldCheck, Database, Check } from 'lucide-react';
import { DEFAULT_PARAMS } from '../utils/constants';

export default function Settings() {
  const { theme, toggleTheme } = useThemeStore();
  const { setParams } = useSimulationStore();
  const [resetMessage, setResetMessage] = React.useState(false);

  const handleResetScenario = () => {
    setParams(DEFAULT_PARAMS);
    setResetMessage(true);
    setTimeout(() => setResetMessage(false), 2500);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
        <SettingsIcon className="w-6 h-6 text-amber-500" />
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            SYSTEM SETTINGS
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Environment, Theme & Simulation Configuration
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* 1. Theme Configuration */}
        <section className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>Interface Theme</span>
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Switch between Industrial Dark (Command Center) and Engineering Workstation (Light Cream)
              </p>
            </div>

            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--border-color)] text-[var(--text-primary)] border border-[var(--border-color)] text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
            </button>
          </div>
        </section>

        {/* 2. Data Mode & Real-World Integration Notice */}
        <section className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-500" />
              <span>Data Mode & Backend Connectivity</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Source of telemetry feeds, reservoir properties, and SCADA sensor streams
            </p>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--text-primary)]">Simulated Prototype Mode</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 text-[10px] font-mono font-semibold border border-cyan-500/20">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-1 max-w-xl">
                Field data integration (Oil India SCADA / IoT OPC-UA historians) can replace demo data in a production deployment without altering front-end visualization architecture.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Base Scenario Reset */}
        <section className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[var(--text-muted)]" />
                <span>Reset Simulation Parameters</span>
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Reset Steam Rate (85t), Soak Time (3d), and SRP Speed (6 SPM) back to baseline
              </p>
            </div>

            <button
              onClick={handleResetScenario}
              className="px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              {resetMessage ? <Check className="w-4 h-4 text-emerald-500" /> : <RotateCcw className="w-3.5 h-3.5" />}
              <span>{resetMessage ? 'RESET COMPLETE!' : 'RESET TO BASE'}</span>
            </button>
          </div>
        </section>

        {/* 4. Asset & Organization Metadata */}
        <section className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] space-y-1 font-mono">
          <div className="flex justify-between">
            <span>Asset:</span>
            <span className="text-[var(--text-primary)] font-bold">Baghewala Heavy Oil Well (BGW-DEMO-01)</span>
          </div>
          <div className="flex justify-between">
            <span>Organization:</span>
            <span className="text-[var(--text-primary)]">Oil India Limited (OIL)</span>
          </div>
          <div className="flex justify-between">
            <span>System:</span>
            <span className="text-[var(--text-primary)]">Baghewala Digital Twin · SIH 2026 Smart Automation</span>
          </div>
        </section>
      </div>
    </div>
  );
}
