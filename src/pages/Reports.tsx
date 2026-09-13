import React, { useState } from 'react';
import { useSimulationStore } from '../stores/simulationStore';
import SimulatedTag from '../components/ui/SimulatedTag';
import { FileText, Download, Printer, CheckCircle, ShieldAlert } from 'lucide-react';

const REPORT_TYPES = [
  'Well Performance & Telemetry Report',
  'CSS Thermal Recovery Cycle Report',
  'SRP Artificial Lift Mechanical Diagnostics',
  'Multi-Objective Optimization Summary',
];

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState(REPORT_TYPES[0]);
  const { output, params, cssPhase } = useSimulationStore();
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    setExported(true);
    setTimeout(() => {
      window.print();
      setExported(false);
    }, 400);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[var(--border-color)] pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-500" />
            <span>ENGINEERING REPORTS</span>
            <SimulatedTag label="PROTOTYPE DATA" />
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Export standardized Oil India engineering decision-support summaries
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
        >
          {exported ? <CheckCircle className="w-3.5 h-3.5" /> : <Printer className="w-3.5 h-3.5" />}
          <span>{exported ? 'PREPARING PRINT...' : 'PRINT / EXPORT REPORT'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left: Report Type Selector */}
        <div className="md:col-span-1 space-y-2">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
            Available Reports
          </span>
          {REPORT_TYPES.map((rt) => (
            <button
              key={rt}
              onClick={() => setSelectedReport(rt)}
              className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all border ${
                selectedReport === rt
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-sm'
                  : 'bg-[var(--bg-panel)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-amber-500/40'
              }`}
            >
              {rt}
            </button>
          ))}
        </div>

        {/* Right: Printable Report Sheet Preview */}
        <div className="md:col-span-3 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          {/* Report Document Header */}
          <div className="border-b-2 border-[var(--text-primary)] pb-4 flex justify-between items-end">
            <div>
              <div className="text-xs font-mono font-bold tracking-widest text-amber-500">OIL INDIA LIMITED</div>
              <h2 className="text-lg md:text-xl font-black text-[var(--text-primary)] uppercase tracking-tight mt-1">
                {selectedReport}
              </h2>
              <div className="text-[11px] text-[var(--text-muted)]">Baghewala Field Asset Management · Decision-Support Prototype</div>
            </div>

            <div className="text-right text-xs font-mono">
              <div className="font-bold text-[var(--text-primary)]">WELL: BGW-DEMO-01</div>
              <div className="text-[var(--text-muted)] text-[10px]">{new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Section 1: Executive Engineering Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-1.5">
              1. Operating Well Telemetry Summary
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] font-sans block">Oil Production Rate</span>
                <span className="font-bold text-amber-500 text-sm">{output.production.toFixed(1)} bbl/d</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] font-sans block">Reservoir Temperature</span>
                <span className="font-bold text-orange-400 text-sm">{output.reservoirTemperature.toFixed(1)} °C</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] font-sans block">Steam Requirement</span>
                <span className="font-bold text-[var(--text-primary)] text-sm">{output.steamRequirement.toFixed(0)} t</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] font-sans block">Pump Efficiency</span>
                <span className="font-bold text-emerald-500 text-sm">{output.pumpEfficiency.toFixed(1)}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] font-sans block">Total Energy</span>
                <span className="font-bold text-[var(--text-primary)] text-sm">{output.energyConsumption.toFixed(0)} kWh</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] font-sans block">Equipment Risk</span>
                <span className="font-bold text-[var(--text-primary)] text-sm uppercase">{output.equipmentRisk}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Operational Parameters Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-1.5">
              2. Configured Operating Regime
            </h3>

            <div className="divide-y divide-[var(--border-subtle)] text-xs">
              <div className="grid grid-cols-2 py-1.5">
                <span className="text-[var(--text-muted)]">CSS Cycle Phase:</span>
                <span className="font-mono font-bold uppercase text-amber-500">{cssPhase}</span>
              </div>
              <div className="grid grid-cols-2 py-1.5">
                <span className="text-[var(--text-muted)]">Steam Injection Flux:</span>
                <span className="font-mono text-[var(--text-primary)]">{params.steamRate} t/cycle @ {params.steamTemperature} °C</span>
              </div>
              <div className="grid grid-cols-2 py-1.5">
                <span className="text-[var(--text-muted)]">Soaking Time Duration:</span>
                <span className="font-mono text-[var(--text-primary)]">{params.soakDuration} days</span>
              </div>
              <div className="grid grid-cols-2 py-1.5">
                <span className="text-[var(--text-muted)]">SRP Pumping Speed & Stroke:</span>
                <span className="font-mono text-[var(--text-primary)]">{params.srpSpeed} SPM | {params.strokeLength} m stroke length</span>
              </div>
              <div className="grid grid-cols-2 py-1.5">
                <span className="text-[var(--text-muted)]">Downhole Pump Condition:</span>
                <span className="font-mono capitalize text-[var(--text-primary)]">{params.pumpCondition}</span>
              </div>
            </div>
          </div>

          {/* Report Footer Disclaimer */}
          <div className="pt-4 border-t border-[var(--border-color)] text-[10px] text-[var(--text-muted)] flex items-center justify-between">
            <span>BAGHEWALA DIGITAL TWIN · PROTOTYPE ENGINEERING SYSTEM</span>
            <span className="italic">Data status: SIMULATED / REQUIRES FIELD VALIDATION</span>
          </div>
        </div>
      </div>
    </div>
  );
}
