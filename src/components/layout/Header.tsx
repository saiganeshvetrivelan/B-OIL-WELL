import React from 'react';
import ThemeToggle from '../ui/ThemeToggle';
import LiveDataTag from '../ui/LiveDataTag';
import { useUiStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { useTelemetryContext } from '../../context/TelemetryContext';
import { ShieldCheck, LogOut, Database, Clock, Play, Pause } from 'lucide-react';

export default function Header() {
  const { sidebarCollapsed, isWorkPaused, toggleWorkPaused } = useUiStore();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { status, lastUpdated } = useTelemetryContext();

  const lastUpdatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    : null;

  return (
    <header
      className="fixed top-0 right-0 z-30 h-[52px] bg-[var(--bg-panel)]/95 backdrop-blur-md border-b border-[var(--border-color)] flex items-center justify-between px-4 transition-all duration-300"
      style={{ left: sidebarCollapsed ? '60px' : '220px' }}
    >
      {/* Left — Title */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <h1 className="font-black tracking-[0.1em] text-[12px] text-[var(--text-primary)] uppercase leading-none">
            Baghewala Digital Twin
          </h1>
          <span className="text-[9px] text-[var(--text-muted)] tracking-widest uppercase leading-none mt-0.5 hidden lg:block">
            CSS & SRP Heavy Oil Asset
          </span>
        </div>
      </div>

      {/* Center — Telemetry Status Row */}
      <div className="hidden md:flex items-center gap-3 text-[11px]">
        {/* Well identity chip */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)]">
          <span className="text-[var(--text-muted)] font-medium">WELL</span>
          <span className="font-mono font-bold text-[var(--text-primary)]">BGW-01</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Supabase connection status */}
        <LiveDataTag status={status} />

        {/* Last updated timestamp */}
        {lastUpdatedStr && status === 'live' && (
          <div className="hidden xl:flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-muted)]">
            <Clock className="w-3 h-3" />
            <span>{lastUpdatedStr}</span>
          </div>
        )}

        {/* Physics engine tag */}
        <div className="hidden xl:flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span></span>
        </div>

        {/* Supabase indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)]">
          <Database className="w-3 h-3" />
          <span></span>
        </div>
      </div>

      {/* Right — Controls & Profile */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggleWorkPaused}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${isWorkPaused
            ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30'
            : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-[var(--text-primary)]'
            }`}
          title={isWorkPaused ? "Resume 3D well motion and pumping" : "Pause 3D well motion and pumping"}
        >
          {isWorkPaused ? <Play className="w-3 h-3 text-amber-400 fill-current" /> : <Pause className="w-3 h-3 text-slate-400 fill-current" />}
          <span>{isWorkPaused ? 'WORK: PAUSED' : 'WORK: ACTIVE'}</span>
        </button>

        <ThemeToggle />
        <div className="h-4 w-px bg-[var(--border-color)]" />

        {isAuthenticated && user ? (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[11px] font-bold text-[var(--text-primary)] truncate max-w-[120px]">
                {user.name}
              </span>
              <span className="text-[9px] text-[var(--text-muted)] truncate max-w-[120px]">
                {user.role}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-red-500/10 hover:text-red-500 text-[var(--text-muted)] border border-[var(--border-color)] transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-[10px] flex items-center justify-center tracking-wider">
              OIL
            </div>
            <span className="text-[11px] font-semibold text-[var(--text-secondary)] hidden sm:inline">
              Engineering Ops
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
