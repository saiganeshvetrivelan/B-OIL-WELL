import React, { useState, useEffect, useCallback, useTransition } from 'react';
import {
  Brain,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Gauge,
  Zap,
  Thermometer,
  ChevronDown,
  ChevronUp,
  Terminal,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import {
  generateTelemetryInference,
  AIInferenceResult,
  TelemetryInferenceInput,
  getOpenRouterModel
} from '../../services/aiInferenceService';

interface AIInferenceCardProps {
  telemetryInput: TelemetryInferenceInput;
  className?: string;
}

export default function AIInferenceCard({ telemetryInput, className = '' }: AIInferenceCardProps) {
  const [result, setResult] = useState<AIInferenceResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [showPayload, setShowPayload] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchInference = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await generateTelemetryInference(telemetryInput, { forceRefresh });
      setResult(res);
    } catch (err: any) {
      console.error('[AIInferenceCard] fetch error:', err);
      setErrorMsg(err.message || 'Failed to fetch AI inference');
    } finally {
      setIsLoading(false);
    }
  }, [telemetryInput]);

  // Initial fetch on mount or when key telemetry metrics significantly change
  useEffect(() => {
    fetchInference(false);
  }, [
    telemetryInput.oilRate,
    telemetryInput.reservoirTemp,
    telemetryInput.pumpEfficiency,
    telemetryInput.cssPhase,
    telemetryInput.equipmentRisk,
  ]);

  const handleCopy = () => {
    if (!result) return;
    const text = `=== WELL BGW-01 AI SURVEILLANCE ASSESSMENT ===
Model: ${result.model}
Timestamp: ${new Date(result.timestamp).toLocaleString()}
Regime: ${result.regime} (Status: ${result.statusLevel})
Confidence: ${result.confidenceScore}%

EXECUTIVE ASSESSMENT:
${result.assessment}

ENGINEERING DIRECTIVES:
${result.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

TELEMETRY SNAPSHOT:
• Oil Rate: ${telemetryInput.oilRate.toFixed(1)} bbl/d
• Reservoir Temp: ${telemetryInput.reservoirTemp.toFixed(1)} °C
• Pump Efficiency: ${telemetryInput.pumpEfficiency.toFixed(1)}%
• SRP Speed: ${telemetryInput.srpSpeed.toFixed(1)} SPM
• Fluid Level: ${telemetryInput.fluidLevel.toFixed(1)} m
• CSS Phase: ${telemetryInput.cssPhase.toUpperCase()}
• Risk: ${telemetryInput.equipmentRisk.toUpperCase()}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: AIInferenceResult['statusLevel'] | undefined) => {
    switch (status) {
      case 'OPTIMAL':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case 'STABLE':
        return {
          bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
          dot: 'bg-cyan-400',
          icon: <Activity className="w-3.5 h-3.5 text-cyan-400" />,
        };
      case 'ATTENTION':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        };
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400',
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
        };
      default:
        return {
          bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
          dot: 'bg-cyan-400',
          icon: <Activity className="w-3.5 h-3.5 text-cyan-400" />,
        };
    }
  };

  const statusStyle = getStatusBadge(result?.statusLevel);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-panel)] shadow-lg transition-all ${className}`}
    >
      {/* Subtle background ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-40 bg-gradient-to-b from-amber-500/5 to-cyan-500/5 blur-3xl pointer-events-none" />

      {/* ── Top Header Bar ────────────────────────────────────────────────────── */}
      <div className="px-5 py-3.5 border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-surface)]/60">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-sm shadow-amber-500/20">
            <Brain className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <span>AI Engineering Surveillance</span>

              </h2>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-medium">
              Autonomous telemetry diagnostic inference & operational setpoint directives
            </p>
          </div>
        </div>

        {/* Badges & Actions */}
        <div className="flex items-center gap-2">
          {/* Model Badge */}





          {/* Copy Report Button */}
          <button
            onClick={handleCopy}
            disabled={!result || isLoading}
            title="Copy formal inference report to clipboard"
            className="p-1.5 rounded-lg bg-[var(--bg-panel)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] text-xs transition-all disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Re-evaluate Button */}
          <button
            onClick={() => fetchInference(true)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLoading ? 'Evaluating...' : 'Re-evaluate'}</span>
          </button>
        </div>
      </div>

      {/* ── Main Content Area ─────────────────────────────────────────────────── */}
      <div className="p-4 md:p-5 space-y-4">
        {isLoading ? (
          /* High-Tech Loading Skeleton / Scan State */
          <div className="space-y-3.5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-48 rounded bg-slate-800/80 animate-pulse" />
              <div className="h-6 w-24 rounded bg-slate-800/60 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-slate-800/70 animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-slate-800/50 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="h-16 rounded-lg bg-slate-800/40 animate-pulse" />
              <div className="h-16 rounded-lg bg-slate-800/40 animate-pulse" />
            </div>
            <div className="flex items-center justify-center gap-2 pt-2 text-xs font-mono text-amber-400/80">
              <Activity className="w-3.5 h-3.5 animate-spin" />
              <span>Synthesizing SCADA stream telemetry ....</span>
            </div>
          </div>
        ) : errorMsg && !result ? (
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => fetchInference(true)}
              className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold"
            >
              Retry
            </button>
          </div>
        ) : result ? (
          <>
            {/* Status & Regime Header Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold font-mono tracking-wide ${statusStyle.bg}`}>
                  {statusStyle.icon}
                  <span>{result.regime}</span>
                </span>

                <span className="text-[11px] font-mono text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)]">
                  Status: <strong className="text-[var(--text-primary)]">{result.statusLevel}</strong>
                </span>


              </div>

              <div className="text-[10px] font-mono text-[var(--text-muted)]">
                Inference Generated: {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                {result.cached && <span className="ml-1 text-amber-400/80">(Cached)</span>}
              </div>
            </div>

            {/* Executive Assessment Statement */}
            <div className="p-4 rounded-xl bg-[var(--bg-surface)]/80 border border-[var(--border-color)] relative">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Executive Diagnostic Assessment</span>
              </div>
              <p className="text-xs md:text-sm text-[var(--text-primary)] leading-relaxed font-normal">
                {result.assessment}
              </p>
            </div>

            {/* Recommended Engineering Setpoints / Action Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-start gap-3 hover:border-amber-500/30 transition-all"
                >
                  <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5 text-amber-400 font-mono text-xs font-bold">
                    {idx === 0 ? <Gauge className="w-3.5 h-3.5" /> : <Thermometer className="w-3.5 h-3.5" />}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      {idx === 0 ? 'Artificial Lift Directive' : 'Thermal & Reservoir Surveillance'}
                    </span>
                    <p className="text-xs text-[var(--text-primary)] leading-snug">
                      {rec}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Evaluated Telemetry Parameter Strip */}
            <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[var(--text-muted)]">
                <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] font-sans">
                  SCADA Evaluated:
                </span>
                <span>
                  Oil: <strong className="text-amber-400 font-bold">{telemetryInput.oilRate.toFixed(1)}</strong> bbl/d
                </span>
                <span>
                  Temp: <strong className="text-orange-400 font-bold">{telemetryInput.reservoirTemp.toFixed(0)}</strong> °C
                </span>
                <span>
                  Efficiency: <strong className="text-emerald-400 font-bold">{telemetryInput.pumpEfficiency.toFixed(0)}</strong>%
                </span>
                <span>
                  Speed: <strong className="text-cyan-400 font-bold">{telemetryInput.srpSpeed.toFixed(1)}</strong> SPM
                </span>
                <span>
                  Fluid Lvl: <strong className="text-sky-400 font-bold">{telemetryInput.fluidLevel.toFixed(0)}</strong> m
                </span>
                <span>
                  Phase: <strong className="text-[var(--text-primary)] font-bold uppercase">{telemetryInput.cssPhase}</strong>
                </span>
              </div>

              {/* Toggle Payload Details */}

            </div>

            {/* Collapsible Telemetry JSON Payload */}
            {showPayload && (
              <div className="mt-2 p-3 rounded-lg bg-black/50 border border-[var(--border-color)] text-[10px] font-mono text-emerald-400/90 overflow-x-auto">
                <pre>{JSON.stringify({
                  telemetryStream: {
                    wellId: telemetryInput.wellId || 'BGW-01',
                    cssPhase: telemetryInput.cssPhase,
                    cycle: telemetryInput.cycleNumber || 14,
                    oilRate_bbld: telemetryInput.oilRate,
                    reservoirTemp_C: telemetryInput.reservoirTemp,
                    pumpEfficiency_pct: telemetryInput.pumpEfficiency,
                    srpSpeed_spm: telemetryInput.srpSpeed,
                    strokeLength_m: telemetryInput.strokeLength,
                    fluidLevel_m: telemetryInput.fluidLevel,
                    equipmentRisk: telemetryInput.equipmentRisk,
                    source: telemetryInput.isRealTelemetry ? 'SUPABASE_REALTIME' : 'SIMULATION_STATE'
                  },
                  modelInference: {
                    model: result.model,
                    latencyMs: result.latencyMs,
                    confidence: `${result.confidenceScore}%`,
                    statusLevel: result.statusLevel,
                    regime: result.regime,
                  }
                }, null, 2)}</pre>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
