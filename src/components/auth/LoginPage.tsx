import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  Sun, 
  Moon, 
  KeyRound,
  Activity,
  Box
} from 'lucide-react';
import SimulatedTag from '../ui/SimulatedTag';

interface Props {
  onSuccess?: () => void;
}

export default function LoginPage({ onSuccess }: Props) {
  const { login, demoLogin } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [username, setUsername] = useState('Er. Rajesh Sharma');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(username, password);
      setIsLoading(false);
      if (onSuccess) onSuccess();
    }, 600);
  };

  const handleQuickDemo = (role: 'engineer' | 'manager' | 'operator') => {
    setIsLoading(true);
    setTimeout(() => {
      demoLogin(role);
      setIsLoading(false);
      if (onSuccess) onSuccess();
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[var(--bg-app)] text-[var(--text-primary)] select-none transition-colors duration-200">
      
      {/* Top Header */}
      <header className="h-14 border-b border-[var(--border-color)] bg-[var(--bg-panel)] px-4 sm:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-extrabold text-xs">
            OIL
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black tracking-wider text-[var(--text-primary)]">
                OIL INDIA LIMITED
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold">
                BAGHEWALA FIELD
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] tracking-tight">
              Enterprise Petroleum Digital Twin Gateway
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SimulatedTag label="AUTH PORTAL" />

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title={theme === 'dark' ? 'Switch to Light Cream Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </header>

      {/* Main Login Workspace */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
          
          {/* Brand & Title */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm shadow-amber-500/20">
              <Lock className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>SECURE ACCESS PORTAL</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)] uppercase">
              Baghewala Digital Twin
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Sign in to access real-time CSS & SRP optimization workflows, 3D telemetry, and SCADA overview.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-primary)] uppercase flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span>Engineer ID / Username</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. OIL-BGW-5502 or Er. Rajesh Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] focus:border-amber-500 focus:outline-none text-xs font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-primary)] uppercase flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                <span>Security Token / Password</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] focus:border-amber-500 focus:outline-none text-xs font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 uppercase tracking-wider mt-2"
            >
              {isLoading ? (
                <span>AUTHENTICATING WITH OIL SERVER...</span>
              ) : (
                <>
                  <span>LOGIN TO WORKSPACE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Fast Demo Credentials */}
          <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2.5">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block text-center">
              — Quick 1-Click Demo Profiles —
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('engineer')}
                className="p-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-left transition-all text-xs space-y-0.5"
              >
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block truncate">
                  Petroleum Engineer
                </span>
                <span className="text-[9px] text-[var(--text-muted)] block">Er. Rajesh Sharma</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('manager')}
                className="p-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-left transition-all text-xs space-y-0.5"
              >
                <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 block truncate">
                  Asset Manager
                </span>
                <span className="text-[9px] text-[var(--text-muted)] block">P. K. Goswami</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('operator')}
                className="p-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-left transition-all text-xs space-y-0.5"
              >
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block truncate">
                  SCADA Operator
                </span>
                <span className="text-[9px] text-[var(--text-muted)] block">R. S. Bhati</span>
              </button>
            </div>
          </div>

          {/* Compliance & Security Footer */}
          <div className="pt-2 text-center text-[10px] text-[var(--text-muted)] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Oil India Limited Internal Prototype · SIH 2026 Smart Automation</span>
          </div>

        </div>
      </main>
    </div>
  );
}
