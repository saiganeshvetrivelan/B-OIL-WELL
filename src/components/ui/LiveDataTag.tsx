import React from 'react';
import { ConnectionStatus } from '../../hooks/useWellTelemetry';

interface LiveDataTagProps {
  status?: ConnectionStatus;
  lastUpdated?: Date | null;
  label?: string;
}

export default function LiveDataTag({
  status = 'simulation',
  lastUpdated,
  label,
}: LiveDataTagProps) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/25">
        <span className="status-live w-1.5 h-1.5" />
        {label ?? (lastUpdated
          ? `LIVE · ${lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
          : 'LIVE')}
      </span>
    );
  }

  if (status === 'connecting') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/25">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        {label ?? 'CONNECTING...'}
      </span>
    );
  }

  if (status === 'disconnected') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/25">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        {label ?? 'DISCONNECTED'}
      </span>
    );
  }

  // Simulation fallback
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-slate-400/10 px-2 py-0.5 rounded border border-slate-400/20">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
      {label ?? 'SIMULATION'}
    </span>
  );
}
