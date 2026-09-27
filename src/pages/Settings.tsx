import React, { useState } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { useSimulationStore } from '../stores/simulationStore';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  RotateCcw,
  ShieldCheck,
  Database,
  Check,
  Cpu,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';
import { DEFAULT_PARAMS } from '../utils/constants';
import {
  getOpenRouterApiKey,
  setOpenRouterApiKey,
  getOpenRouterModel,
  setOpenRouterModel,
  testOpenRouterConnection
} from '../services/aiInferenceService';

export default function Settings() {
  const { theme, toggleTheme } = useThemeStore();
  const { setParams } = useSimulationStore();

  // AI Inference State
  const [apiKeyInput, setApiKeyInput] = useState<string>(getOpenRouterApiKey());
  const [modelInput, setModelInput] = useState<string>(getOpenRouterModel());
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs: number; message: string } | null>(null);
  const [savedConfigMessage, setSavedConfigMessage] = useState<boolean>(false);

  const handleSaveAiConfig = () => {
    setOpenRouterApiKey(apiKeyInput);
    setOpenRouterModel(modelInput);
    setSavedConfigMessage(true);
    setTimeout(() => setSavedConfigMessage(false), 2500);
  };

  const handleResetToDefaultKey = () => {
    const defaultKey = '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';
    const defaultModel = 'qwen/qwen3.8-27b';
    setApiKeyInput(defaultKey);
    setModelInput(defaultModel);
    setOpenRouterApiKey(defaultKey);
    setOpenRouterModel(defaultModel);
    setSavedConfigMessage(true);
    setTimeout(() => setSavedConfigMessage(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testOpenRouterConnection(apiKeyInput, modelInput);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        latencyMs: 0,
        message: err.message || 'Connection test failed',
      });
    } finally {
      setIsTesting(false);
    }
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
            Environment, Theme & AI Inference Model Configuration
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* 1. Theme Configuration */}
        <section className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>Interface Theme</span>
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Switch between Dark and Light mode
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

        {/* 2. OpenRouter AI Inference Configuration */}
        <section className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Cpu className="w-4 h-4" />
                </span>
                <span>AI Inference Engine (OpenRouter)</span>
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Surveillance LLM for concise, formal petroleum engineering telemetry inference
              </p>
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" />
                Qwen 3.8 27B
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                OpenRouter Model ID
              </label>
              <input
                type="text"
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                placeholder="qwen/qwen3.8-27b"
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Configured: <span className="font-mono text-cyan-400 font-semibold">qwen/qwen3.8-27b</span>
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                API Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs transition-colors shrink-0"
                  title={showKey ? 'Hide API key' : 'Show API key'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Stored in local secure context and environment configuration
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveAiConfig}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm shadow-amber-500/20 flex items-center gap-1.5"
              >
                {savedConfigMessage ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{savedConfigMessage ? 'Saved Successfully!' : 'Save Configuration'}</span>
              </button>
              <button
                type="button"
                onClick={handleResetToDefaultKey}
                className="px-3 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] border border-[var(--border-color)] text-xs transition-colors"
              >
                Reset Default
              </button>
            </div>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--border-color)] text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing Model...' : 'Test Connection'}</span>
            </button>
          </div>

          {/* Ping Test Result Banner */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
              <div className="flex items-center gap-2">
                {testResult.success ? <Check className="w-4 h-4 shrink-0" /> : <ShieldCheck className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-bold shrink-0 ml-2">
                Latency: {testResult.latencyMs}ms
              </span>
            </div>
          )}
        </section>

        {/* 3. Asset & Organization Metadata */}
        <section className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] space-y-1.5 font-mono">
          <div className="flex justify-between">
            <span>Asset:</span>
            <span className="text-[var(--text-primary)] font-bold">Baghewala Heavy Oil Well (BGW-01)</span>
          </div>
          <div className="flex justify-between">
            <span>Organization:</span>
            <span className="text-[var(--text-primary)]">Oil India Limited (OIL)</span>
          </div>
          <div className="flex justify-between">
            <span>Thermal Recovery Method:</span>
            <span className="text-[var(--text-primary)]">Cyclic Steam Stimulation (CSS) + Sucker Rod Pump (SRP)</span>
          </div>
          <div className="flex justify-between">
            <span>AI Surveillance Model:</span>
            <span className="text-cyan-400 font-bold">Qwen 3.8 27B</span>
          </div>
        </section>
      </div>
    </div>
  );
}
