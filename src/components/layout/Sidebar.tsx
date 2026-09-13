import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  Activity,
  FlaskConical,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Droplets,
} from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';
import { useTelemetryContext } from '../../context/TelemetryContext';

const navItems = [
  { path: '/app/overview', label: 'SCADA OVERVIEW', icon: LayoutDashboard },
  { path: '/app/digital-twin', label: '3D DIGITAL TWIN', icon: Box },
  { path: '/app/operations', label: 'CSS & SRP OPERATIONS', icon: Activity },
  { path: '/app/simulation', label: 'WHAT-IF & OPTIMIZATION', icon: FlaskConical },
  { path: '/app/reports', label: 'ENGINEERING REPORTS', icon: FileText },
  { path: '/app/settings', label: 'SETTINGS', icon: Settings },
];

export default function Sidebar() {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const { status } = useTelemetryContext();

  const statusColor =
    status === 'live' ? 'bg-emerald-500' :
      status === 'connecting' ? 'bg-amber-500 animate-pulse' :
        status === 'disconnected' ? 'bg-red-500' :
          'bg-slate-500';
  const statusLabel =
    status === 'live' ? 'LIVE DATA' :
      status === 'connecting' ? 'CONNECTING' :
        status === 'disconnected' ? 'OFFLINE' :
          'SIMULATION';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[var(--bg-panel)] border-r border-[var(--border-color)] transition-all duration-300 select-none ${sidebarCollapsed ? 'w-[60px]' : 'w-[220px]'
        }`}
    >
      {/* Brand Header */}
      <div className="flex items-center h-[52px] border-b border-[var(--border-color)] shrink-0 px-3 overflow-hidden">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2.5 w-full">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Droplets className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-black tracking-[0.15em] text-amber-400 uppercase leading-none">
                QUANTAM QUESTERS
              </span>
              <span className="text-[9px] font-medium text-[var(--text-muted)] tracking-widest uppercase leading-none mt-0.5">
                Baghewala Field
              </span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Droplets className="w-4 h-4 text-amber-400" />
          </div>
        )}
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/40 shrink-0">
        <div className={`w-2 h-2 rounded-full shrink-0 ${statusColor}`} />
        {!sidebarCollapsed && (
          <span className="text-[10px] font-bold tracking-wider uppercase text-[var(--text-muted)] truncate">
            {statusLabel}
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 flex flex-col gap-0.5 px-2 no-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-2.5 py-2 rounded-lg text-[11px] font-semibold tracking-wider transition-all duration-150 group ${isActive
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25 nav-active-glow'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
              }`
            }
            title={sidebarCollapsed ? item.label : undefined}
          >
            <item.icon
              className={`w-4 h-4 shrink-0 ${sidebarCollapsed ? 'mx-auto' : 'mr-2.5'}`}
            />
            {!sidebarCollapsed && (
              <span className="whitespace-nowrap truncate">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Well Info (expanded only) */}
      {!sidebarCollapsed && (
        <div className="mx-2 mb-2 p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] shrink-0">
          <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
            Active Asset
          </div>
          <div className="text-[11px] font-bold text-[var(--text-primary)] font-mono">BGW 1</div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Wifi className="w-3 h-3 text-[var(--text-muted)]" />
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-[var(--border-color)] shrink-0">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors text-xs font-medium"
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {sidebarCollapsed
            ? <ChevronRight className="w-4 h-4" />
            : <div className="flex items-center gap-1.5"><ChevronLeft className="w-4 h-4" /><span>Collapse</span></div>
          }
        </button>
      </div>
    </aside>
  );
}
