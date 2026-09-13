import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../stores/themeStore';
import { useUiStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { useSimulationStore } from '../../stores/simulationStore';
import DigitalTwinScene from '../three/DigitalTwinScene';
import CinematicIntro from '../CinematicIntro';
import LoginPage from '../auth/LoginPage';
import SimulatedTag from '../ui/SimulatedTag';
import {
  ReservoirConditions,
  CSSParameters,
  SRPParameters,
  AIFieldConditions,
  calculateTrialAndErrorResults,
  calculateAIRecommendations,
  SimulationResultOutputs,
  AIRecommendedSettings
} from '../../engine/petroleumEngine';
import { 
  Sparkles, 
  FlaskConical, 
  ArrowRight, 
  RotateCcw, 
  Play, 
  Pause, 
  SkipForward, 
  Info, 
  Flame, 
  Clock, 
  Activity, 
  Gauge, 
  Layers,
  ChevronLeft,
  Moon,
  Sun,
  Thermometer,
  Zap,
  Droplets,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  TrendingDown,
  LayoutDashboard,
  Box,
  FileText,
  LogOut,
  UserCheck
} from 'lucide-react';

type JourneyStep = 'home' | 'input' | 'ai-recommendation-preview' | 'animation' | 'results';
type AppMode = 'ai' | 'trial';
type CSSPhase = 'injection' | 'soaking' | 'production';

export default function DigitalTwinJourney() {
  const { theme, toggleTheme } = useThemeStore();
  const { setParams: setGlobalParams } = useSimulationStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const isDark = theme === 'dark';

  // Navigation State
  const [step, setStep] = useState<JourneyStep>('home');
  const [mode, setMode] = useState<AppMode>('ai');

  // =========================================================================
  // 1. AI ANALYTICS MODE INPUTS (Current Field Conditions)
  // =========================================================================
  const [aiField, setAiField] = useState<AIFieldConditions>({
    oilViscosity: 4500,        // cP
    reservoirTemp: 52,          // °C
    reservoirPressure: 38,      // bar
    currentOilProduction: 32,   // bbl/d
  });

  const [aiRecommendation, setAiRecommendation] = useState<{
    recommendedSettings: AIRecommendedSettings;
    simulatedOutput: SimulationResultOutputs;
  } | null>(null);

  // =========================================================================
  // 2. TRIAL & ERROR MODE INPUTS (3 Separated Categories)
  // =========================================================================
  // Category 1: Reservoir & Oil Conditions
  const [resConditions, setResConditions] = useState<ReservoirConditions>({
    oilViscosity: 4500,        // cP
    reservoirTemp: 52,          // °C
    reservoirPressure: 38,      // bar
    permeability: 850,          // mD
  });

  // Category 2: Cyclic Steam Stimulation (CSS)
  const [cssParams, setCssParams] = useState<CSSParameters>({
    steamTemperature: 280,     // °C
    steamInjectionRate: 85,    // tons/day
    steamPressure: 55,         // bar
    steamInjectionTime: 48,    // hours
    soakingTime: 72,           // hours (3.0 days)
  });

  // Category 3: Sucker Rod Pump (SRP)
  const [srpParams, setSrpParams] = useState<SRPParameters>({
    pumpSpeed: 6.0,            // SPM
    strokeLength: 2.4,         // m
    pumpEfficiency: 80,        // %
  });

  // Active Simulation Results
  const [simResults, setSimResults] = useState<SimulationResultOutputs | null>(null);

  // 3D Animation State
  const [currentPhase, setCurrentPhase] = useState<CSSPhase>('injection');
  const [phaseTime, setPhaseTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [animSpeed, setAnimSpeed] = useState<1 | 2>(1);

  // 3D Scene Active Parameters
  const active3DParams = {
    steamRate: mode === 'ai' && aiRecommendation ? aiRecommendation.recommendedSettings.css.steamInjectionRate : cssParams.steamInjectionRate,
    steamTemperature: mode === 'ai' && aiRecommendation ? aiRecommendation.recommendedSettings.css.steamTemperature : cssParams.steamTemperature,
    soakDuration: mode === 'ai' && aiRecommendation ? aiRecommendation.recommendedSettings.css.soakingTimeDays : (cssParams.soakingTime / 24),
    srpSpeed: mode === 'ai' && aiRecommendation ? aiRecommendation.recommendedSettings.srp.pumpSpeed : srpParams.pumpSpeed,
    strokeLength: mode === 'ai' && aiRecommendation ? aiRecommendation.recommendedSettings.srp.strokeLength : srpParams.strokeLength,
    fluidLevel: 42,
    pumpCondition: 'good' as const,
  };

  const active3DOutput = {
    production: simResults ? simResults.productionRate : 245,
    reservoirTemperature: simResults ? simResults.finalReservoirTemp : 120,
    pumpEfficiency: mode === 'ai' && aiRecommendation ? aiRecommendation.recommendedSettings.srp.pumpEfficiency : srpParams.pumpEfficiency,
    steamRequirement: simResults ? simResults.steamUsed : 85,
    energyConsumption: simResults ? simResults.estimatedEnergyConsumption : 280,
    equipmentRisk: 'low' as const,
    equipmentRiskScore: 22,
  };

  // Run AI Field Analysis
  const handleRunAIAnalysis = () => {
    const results = calculateAIRecommendations(aiField);
    setAiRecommendation(results);
    setSimResults(results.simulatedOutput);
    setGlobalParams({
      steamRate: results.recommendedSettings.css.steamInjectionRate,
      steamTemperature: results.recommendedSettings.css.steamTemperature,
      soakDuration: results.recommendedSettings.css.soakingTimeDays,
      srpSpeed: results.recommendedSettings.srp.pumpSpeed,
      strokeLength: results.recommendedSettings.srp.strokeLength,
      fluidLevel: 42,
      pumpCondition: 'good',
    });
    setStep('ai-recommendation-preview');
  };

  // Run Trial & Error Simulation
  const handleRunTrialSimulation = () => {
    const results = calculateTrialAndErrorResults(resConditions, cssParams, srpParams);
    setSimResults(results);
    setGlobalParams({
      steamRate: cssParams.steamInjectionRate,
      steamTemperature: cssParams.steamTemperature,
      soakDuration: cssParams.soakingTime / 24,
      srpSpeed: srpParams.pumpSpeed,
      strokeLength: srpParams.strokeLength,
      fluidLevel: 42,
      pumpCondition: 'good',
    });
    setStep('animation');
    setCurrentPhase('injection');
    setPhaseTime(0);
    setIsPlaying(true);
  };

  // Start 3D Animation from AI preview
  const handleStartAIAnimation = () => {
    setStep('animation');
    setCurrentPhase('injection');
    setPhaseTime(0);
    setIsPlaying(true);
  };

  // Auto-advance animation timer
  useEffect(() => {
    if (step !== 'animation' || !isPlaying) return;

    const interval = setInterval(() => {
      setPhaseTime((prev) => {
        const next = prev + 0.1 * animSpeed;
        if (next < 3.5) {
          if (currentPhase !== 'injection') setCurrentPhase('injection');
          return next;
        } else if (next < 7.5) {
          if (currentPhase !== 'soaking') setCurrentPhase('soaking');
          return next;
        } else if (next < 12.0) {
          if (currentPhase !== 'production') setCurrentPhase('production');
          return next;
        } else {
          setStep('results');
          return 0;
        }
      });
    }, 100);

    return () => clearInterval(interval);
  }, [step, isPlaying, currentPhase, animSpeed]);

  const handleJumpToPhase = (phase: CSSPhase) => {
    setCurrentPhase(phase);
    if (phase === 'injection') setPhaseTime(0);
    if (phase === 'soaking') setPhaseTime(3.5);
    if (phase === 'production') setPhaseTime(7.5);
  };

  // If not authenticated, render Login Page (with intro on start)
  if (!isAuthenticated) {
    return (
      <>
        <CinematicIntro />
        <LoginPage onSuccess={() => setStep('home')} />
      </>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-200 select-none">
      {/* Cinematic Intro Animation Overlay */}
      <CinematicIntro />

      {/* =========================================================================
          GLOBAL HEADER
          ========================================================================= */}
      <header className="h-14 border-b border-[var(--border-color)] bg-[var(--bg-panel)] px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-sm">
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
              Heavy Oil CSS & SRP Digital Twin
            </p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setStep('home')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              step === 'home' || step === 'input' || step === 'ai-recommendation-preview'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>SIMULATION MODES</span>
          </button>

          <a
            href="/app/digital-twin"
            className="px-3 py-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all flex items-center gap-1.5"
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D DIGITAL TWIN</span>
          </a>

          <a
            href="/app/overview"
            className="px-3 py-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>SCADA OVERVIEW</span>
          </a>

          <a
            href="/app/operations"
            className="px-3 py-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>OPERATIONS</span>
          </a>

          <a
            href="/app/reports"
            className="px-3 py-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>REPORTS</span>
          </a>
        </nav>

        {/* Right User & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title={theme === 'dark' ? 'Switch to Light Cream Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-color)]">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[11px] font-bold text-[var(--text-primary)] truncate max-w-[120px]">
                {user?.name || 'Engineer'}
              </span>
              <span className="text-[9px] text-[var(--text-muted)] font-mono truncate max-w-[120px]">
                {user?.employeeId || 'OIL-BGW'}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-red-500/10 hover:text-red-500 text-[var(--text-muted)] border border-[var(--border-color)] transition-colors"
              title="Logout from Gateway"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN APPLICATION STAGE
          ========================================================================= */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 max-w-6xl w-full mx-auto">
        
        {/* =======================================================================
            1. HOME / MODE SELECTION & WORKSPACE HUB
            ======================================================================= */}
        {step === 'home' && (
          <div className="w-full max-w-5xl py-4 space-y-8 animate-fadeIn">
            
            {/* Project Header Banner */}
            <div className="text-center space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>SIH 2026 · SMART AUTOMATION · OIL INDIA LIMITED</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)] uppercase">
                DIGITAL TWIN <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400">
                  FOR HEAVY-OIL WELL OPTIMIZATION
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
                Simulate and optimize Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) operations using a Digital Twin.
              </p>
            </div>

            {/* TWO PRIMARY GUIDED SIMULATION MODES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Option 1: AI ANALYTICS */}
              <div 
                onClick={() => { setMode('ai'); setStep('input'); }}
                className="group relative cursor-pointer bg-[var(--bg-panel)] hover:bg-[var(--bg-surface)] border-2 border-[var(--border-color)] hover:border-amber-500/60 rounded-2xl p-6 sm:p-8 transition-all duration-200 shadow-sm hover:shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] group-hover:text-amber-500 transition-colors uppercase">
                      AI ANALYTICS
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Analyze current field conditions and determine suitable CSS and SRP operating parameters.
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                    ANALYZE FIELD →
                  </span>
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Option 2: TRIAL & ERROR */}
              <div 
                onClick={() => { setMode('trial'); setStep('input'); }}
                className="group relative cursor-pointer bg-[var(--bg-panel)] hover:bg-[var(--bg-surface)] border-2 border-[var(--border-color)] hover:border-cyan-500/60 rounded-2xl p-6 sm:p-8 transition-all duration-200 shadow-sm hover:shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500">
                    <FlaskConical className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] group-hover:text-cyan-500 transition-colors uppercase">
                      TRIAL & ERROR
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Experiment with reservoir, CSS and SRP parameters and observe the simulated outcome.
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform">
                    RUN SIMULATION →
                  </span>
                  <div className="w-8 h-8 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

            </div>

            {/* SEPARATE VISUAL SECTIONS FOR COMPLETE UNIFIED WORKSPACE */}
            <div className="pt-4 border-t border-[var(--border-subtle)] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-wider text-[var(--text-primary)] uppercase flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-500" />
                  <span>DEDICATED OPERATIONS & DASHBOARD WORKSPACES</span>
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">ALL IN ONE SYSTEM</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. 3D Digital Twin */}
                <a
                  href="/app/digital-twin"
                  className="p-4 rounded-xl bg-[var(--bg-panel)] hover:bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-amber-500/50 transition-all space-y-2 group shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Box className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition-colors block uppercase">
                        3D Digital Twin
                      </span>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Interactive well cutaway, camera shortcuts, component diagnostics.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-2">
                    <span>EXPLORE 3D</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </a>

                {/* 2. SCADA Overview */}
                <a
                  href="/app/overview"
                  className="p-4 rounded-xl bg-[var(--bg-panel)] hover:bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-cyan-500/50 transition-all space-y-2 group shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-cyan-500 transition-colors block uppercase">
                        SCADA Overview
                      </span>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Operational status, 6 core KPIs, 7-day production history.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 pt-2">
                    <span>VIEW SCADA</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </a>

                {/* 3. CSS & SRP Operations */}
                <a
                  href="/app/operations"
                  className="p-4 rounded-xl bg-[var(--bg-panel)] hover:bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-emerald-500/50 transition-all space-y-2 group shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors block uppercase">
                        CSS & SRP Operations
                      </span>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Dynacard diagnostics, thermal cycles, artificial lift kinematics.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-2">
                    <span>OPEN OPERATIONS</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </a>

                {/* 4. Engineering Reports */}
                <a
                  href="/app/reports"
                  className="p-4 rounded-xl bg-[var(--bg-panel)] hover:bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-amber-500/50 transition-all space-y-2 group shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition-colors block uppercase">
                        Engineering Reports
                      </span>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Standardized executive summaries, print and export ready.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-2">
                    <span>PRINT REPORTS</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </a>

              </div>
            </div>

          </div>
        )}

        {/* =======================================================================
            2. AI ANALYTICS MODE: CURRENT FIELD CONDITIONS INPUT
            ======================================================================= */}
        {step === 'input' && mode === 'ai' && (
          <div className="w-full max-w-2xl bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-md space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <button
                onClick={() => setStep('home')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>BACK TO HOME</span>
              </button>

              <span className="px-2.5 py-1 rounded text-xs font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                AI ANALYTICS MODE
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase">
                CURRENT FIELD CONDITIONS
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Enter measured reservoir state. The AI engine will determine optimal CSS thermal parameters and SRP lifting settings.
              </p>
            </div>

            {/* 4 Field Condition Inputs */}
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-amber-500" />
                    <span>1. CRUDE OIL / OIL VISCOSITY</span>
                  </span>
                  <span className="font-mono font-black text-amber-500 text-sm">
                    {aiField.oilViscosity.toLocaleString()} cP
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={12000}
                  step={500}
                  value={aiField.oilViscosity}
                  onChange={(e) => setAiField(prev => ({ ...prev, oilViscosity: Number(e.target.value) }))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-300 dark:bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
                  <span>1,000 cP (Moderate)</span>
                  <span>12,000 cP (Extra-Heavy Bitumen)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    <span>2. RESERVOIR TEMPERATURE</span>
                  </span>
                  <span className="font-mono font-black text-orange-500 text-sm">
                    {aiField.reservoirTemp} °C
                  </span>
                </div>
                <input
                  type="range"
                  min={35}
                  max={80}
                  step={1}
                  value={aiField.reservoirTemp}
                  onChange={(e) => setAiField(prev => ({ ...prev, reservoirTemp: Number(e.target.value) }))}
                  className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-300 dark:bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
                  <span>35 °C (Cold Reservoir)</span>
                  <span>80 °C (Semi-Warm)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-cyan-500" />
                    <span>3. RESERVOIR PRESSURE</span>
                  </span>
                  <span className="font-mono font-black text-cyan-500 text-sm">
                    {aiField.reservoirPressure} bar
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={60}
                  step={1}
                  value={aiField.reservoirPressure}
                  onChange={(e) => setAiField(prev => ({ ...prev, reservoirPressure: Number(e.target.value) }))}
                  className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-300 dark:bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
                  <span>20 bar (Depleted)</span>
                  <span>60 bar (Initial Pressure)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <span>4. CURRENT OIL PRODUCTION</span>
                  </span>
                  <span className="font-mono font-black text-emerald-500 text-sm">
                    {aiField.currentOilProduction} bbl/day
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={80}
                  step={2}
                  value={aiField.currentOilProduction}
                  onChange={(e) => setAiField(prev => ({ ...prev, currentOilProduction: Number(e.target.value) }))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-300 dark:bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
                  <span>10 bbl/d (Low Primary Flow)</span>
                  <span>80 bbl/d (Moderate)</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleRunAIAnalysis}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Sparkles className="w-4 h-4" />
                <span>ANALYZE FIELD</span>
              </button>
            </div>
          </div>
        )}

        {/* =======================================================================
            2.1. AI ANALYSIS: RECOMMENDED OPERATING SCENARIO PREVIEW
            ======================================================================= */}
        {step === 'ai-recommendation-preview' && aiRecommendation && (
          <div className="w-full max-w-3xl bg-[var(--bg-panel)] border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 uppercase">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>RECOMMENDED OPERATING SCENARIO</span>
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  AI-determined parameters for Cyclic Steam Stimulation and Sucker Rod Pumping
                </p>
              </div>
              <SimulatedTag label="AI OPTIMIZED" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase border-b border-[var(--border-subtle)] pb-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>RECOMMENDED CSS SETTINGS</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)] font-sans">Steam Temperature:</span>
                    <span className="font-bold text-[var(--text-primary)]">{aiRecommendation.recommendedSettings.css.steamTemperature} °C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)] font-sans">Steam Injection Rate:</span>
                    <span className="font-bold text-[var(--text-primary)]">{aiRecommendation.recommendedSettings.css.steamInjectionRate} tons/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)] font-sans">Steam Pressure:</span>
                    <span className="font-bold text-[var(--text-primary)]">{aiRecommendation.recommendedSettings.css.steamPressure} bar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)] font-sans">Soaking Time:</span>
                    <span className="font-bold text-amber-500">{aiRecommendation.recommendedSettings.css.soakingTime} hours ({aiRecommendation.recommendedSettings.css.soakingTimeDays} days)</span>
                  </div>
                </div>

                <p className="text-[11px] text-[var(--text-secondary)] font-sans leading-relaxed pt-2 border-t border-[var(--border-subtle)]">
                  The recommended soaking period represents the simulated time required to allow injected heat to transfer through the reservoir before production.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase border-b border-[var(--border-subtle)] pb-2">
                  <Activity className="w-4 h-4 text-cyan-500" />
                  <span>RECOMMENDED SRP SETTINGS</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)] font-sans">Pump Speed:</span>
                    <span className="font-bold text-[var(--text-primary)]">{aiRecommendation.recommendedSettings.srp.pumpSpeed} SPM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)] font-sans">Stroke Length:</span>
                    <span className="font-bold text-[var(--text-primary)]">{aiRecommendation.recommendedSettings.srp.strokeLength} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)] font-sans">Pump Efficiency:</span>
                    <span className="font-bold text-emerald-500">{aiRecommendation.recommendedSettings.srp.pumpEfficiency}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] font-sans mt-3">
                  Optimal lifting frequency matched to mobilized heavy-oil inflow rate.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep('input')}
                className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                MODIFY FIELD CONDITIONS
              </button>

              <button
                onClick={handleStartAIAnimation}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 uppercase"
              >
                <span>RUN 3D DIGITAL TWIN SIMULATION</span>
                <Play className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        )}

        {/* =======================================================================
            3. TRIAL & ERROR MODE: 3 VISUALLY SEPARATED INPUT CATEGORIES
            ======================================================================= */}
        {step === 'input' && mode === 'trial' && (
          <div className="w-full max-w-4xl bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-md space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <button
                onClick={() => setStep('home')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>BACK TO HOME</span>
              </button>

              <span className="px-2.5 py-1 rounded text-xs font-bold uppercase bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                TRIAL & ERROR MODE
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase">
                EXPERIMENT WITH WELL OPERATING REGIME
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Manually adjust reservoir parameters, CSS thermal stimulation, and SRP lifting specifications.
              </p>
            </div>

            {/* 3 Visually Separated Categories */}
            <div className="space-y-6 pt-2">
              
              {/* Category 1: Reservoir & Oil Conditions */}
              <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                  <h3 className="text-xs font-black tracking-wider text-[var(--text-primary)] uppercase flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-500" />
                    <span>CATEGORY 1: RESERVOIR & OIL CONDITIONS</span>
                  </h3>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">FORMATION PROPERTIES</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[var(--text-primary)]">Oil Viscosity</span>
                      <span className="font-mono font-bold text-amber-500">{resConditions.oilViscosity.toLocaleString()} cP</span>
                    </div>
                    <input
                      type="range"
                      min={500}
                      max={12000}
                      step={500}
                      value={resConditions.oilViscosity}
                      onChange={(e) => setResConditions(prev => ({ ...prev, oilViscosity: Number(e.target.value) }))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg"
                    />
                    <p className="text-[10px] text-[var(--text-muted)] leading-tight">
                      Viscosity of the heavy oil. Higher viscosity means the oil is more resistant to flow.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[var(--text-primary)]">Reservoir Temperature</span>
                      <span className="font-mono font-bold text-orange-500">{resConditions.reservoirTemp} °C</span>
                    </div>
                    <input
                      type="range"
                      min={35}
                      max={80}
                      step={1}
                      value={resConditions.reservoirTemp}
                      onChange={(e) => setResConditions(prev => ({ ...prev, reservoirTemp: Number(e.target.value) }))}
                      className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg"
                    />
                    <p className="text-[10px] text-[var(--text-muted)] leading-tight">
                      Initial in-situ pay zone temperature before thermal stimulation.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[var(--text-primary)]">Reservoir Pressure</span>
                      <span className="font-mono font-bold text-cyan-500">{resConditions.reservoirPressure} bar</span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={60}
                      step={1}
                      value={resConditions.reservoirPressure}
                      onChange={(e) => setResConditions(prev => ({ ...prev, reservoirPressure: Number(e.target.value) }))}
                      className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg"
                    />
                    <p className="text-[10px] text-[var(--text-muted)] leading-tight">
                      Pore fluid static pressure inside the Baghewala formation.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[var(--text-primary)]">Permeability</span>
                      <span className="font-mono font-bold text-emerald-500">{resConditions.permeability} mD</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={2500}
                      step={50}
                      value={resConditions.permeability}
                      onChange={(e) => setResConditions(prev => ({ ...prev, permeability: Number(e.target.value) }))}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg"
                    />
                    <p className="text-[10px] text-[var(--text-muted)] leading-tight">
                      Permeability indicates how easily fluids can flow through the reservoir rock.
                    </p>
                  </div>
                </div>
              </div>

              {/* Category 2: Cyclic Steam Stimulation (CSS) */}
              <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                  <h3 className="text-xs font-black tracking-wider text-[var(--text-primary)] uppercase flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>CATEGORY 2: CYCLIC STEAM STIMULATION (CSS)</span>
                  </h3>
                  <span className="text-[10px] text-amber-500 font-mono font-semibold">THERMAL INJECTION</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[var(--text-primary)]">Steam Temp</span>
                      <span className="font-mono font-bold text-orange-500">{cssParams.steamTemperature} °C</span>
                    </div>
                    <input
                      type="range"
                      min={220}
                      max={340}
                      step={5}
                      value={cssParams.steamTemperature}
                      onChange={(e) => setCssParams(prev => ({ ...prev, steamTemperature: Number(e.target.value) }))}
                      className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[var(--text-primary)]">Injection Rate</span>
                      <span className="font-mono font-bold text-amber-500">{cssParams.steamInjectionRate} t/d</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={130}
                      step={5}
                      value={cssParams.steamInjectionRate}
                      onChange={(e) => setCssParams(prev => ({ ...prev, steamInjectionRate: Number(e.target.value) }))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[var(--text-primary)]">Steam Pressure</span>
                      <span className="font-mono font-bold text-cyan-500">{cssParams.steamPressure} bar</span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={90}
                      step={2}
                      value={cssParams.steamPressure}
                      onChange={(e) => setCssParams(prev => ({ ...prev, steamPressure: Number(e.target.value) }))}
                      className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[var(--text-primary)]">Injection Time</span>
                      <span className="font-mono font-bold text-[var(--text-primary)]">{cssParams.steamInjectionTime} hrs</span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={96}
                      step={6}
                      value={cssParams.steamInjectionTime}
                      onChange={(e) => setCssParams(prev => ({ ...prev, steamInjectionTime: Number(e.target.value) }))}
                      className="w-full accent-slate-500 cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg"
                    />
                  </div>
                </div>

                {/* PROMINENT SOAKING TIME INPUT */}
                <div className="p-4 rounded-xl bg-amber-500/5 border-2 border-amber-500/30 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>SOAKING TIME (CRITICAL CSS PARAMETER)</span>
                    </span>
                    <span className="font-mono font-black text-amber-500 text-sm">
                      {cssParams.soakingTime} hours ({(cssParams.soakingTime / 24).toFixed(1)} Days)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={24}
                    max={120}
                    step={12}
                    value={cssParams.soakingTime}
                    onChange={(e) => setCssParams(prev => ({ ...prev, soakingTime: Number(e.target.value) }))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-300 dark:bg-slate-700 rounded-lg"
                  />
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Time allowed for injected heat to transfer through the reservoir and reduce heavy-oil viscosity before production.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)] flex items-center justify-between">
                  <span>Steam Temp + Rate + Pressure + Time</span>
                  <span className="text-amber-500 font-bold">→ HEAT DELIVERED TO RESERVOIR</span>
                </div>
              </div>

              {/* Category 3: Sucker Rod Pump (SRP) */}
              <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                  <h3 className="text-xs font-black tracking-wider text-[var(--text-primary)] uppercase flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-500" />
                    <span>CATEGORY 3: SUCKER ROD PUMP (SRP)</span>
                  </h3>
                  <span className="text-[10px] text-cyan-500 font-mono font-semibold">MECHANICAL LIFT</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[var(--text-primary)]">Pump Speed</span>
                      <span className="font-mono font-bold text-cyan-500">{srpParams.pumpSpeed.toFixed(1)} SPM</span>
                    </div>
                    <input
                      type="range"
                      min={3.0}
                      max={10.0}
                      step={0.5}
                      value={srpParams.pumpSpeed}
                      onChange={(e) => setSrpParams(prev => ({ ...prev, pumpSpeed: Number(e.target.value) }))}
                      className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[var(--text-primary)]">Stroke Length</span>
                      <span className="font-mono font-bold text-emerald-500">{srpParams.strokeLength.toFixed(1)} m</span>
                    </div>
                    <input
                      type="range"
                      min={1.2}
                      max={3.2}
                      step={0.1}
                      value={srpParams.strokeLength}
                      onChange={(e) => setSrpParams(prev => ({ ...prev, strokeLength: Number(e.target.value) }))}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[var(--text-primary)]">Pump Efficiency</span>
                      <span className="font-mono font-bold text-amber-500">{srpParams.pumpEfficiency}%</span>
                    </div>
                    <input
                      type="range"
                      min={45}
                      max={95}
                      step={1}
                      value={srpParams.pumpEfficiency}
                      onChange={(e) => setSrpParams(prev => ({ ...prev, pumpEfficiency: Number(e.target.value) }))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)] flex items-center justify-between">
                  <span>Pump Speed + Stroke Length + Efficiency</span>
                  <span className="text-cyan-500 font-bold">→ PRODUCTION / ENERGY RESPONSE</span>
                </div>
              </div>

            </div>

            <div className="pt-2">
              <button
                onClick={handleRunTrialSimulation}
                className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>RUN SIMULATION</span>
              </button>
            </div>
          </div>
        )}

        {/* =======================================================================
            4. 3D DIGITAL TWIN ANIMATION
            ======================================================================= */}
        {step === 'animation' && (
          <div className="w-full h-[76vh] flex flex-col bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-2xl relative animate-fadeIn">
            <div className="px-4 py-3 bg-[var(--bg-surface)]/90 border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 z-20">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider text-[var(--text-primary)] uppercase">
                  SIMULATION STAGES:
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleJumpToPhase('injection')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      currentPhase === 'injection'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-[var(--bg-panel)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                    }`}
                  >
                    1. STEAM INJECTION
                  </button>

                  <button
                    onClick={() => handleJumpToPhase('soaking')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      currentPhase === 'soaking'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-[var(--bg-panel)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                    }`}
                  >
                    2. SOAKING
                  </button>

                  <button
                    onClick={() => handleJumpToPhase('production')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      currentPhase === 'production'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-[var(--bg-panel)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                    }`}
                  >
                    3. PRODUCTION (SRP)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-color)] text-xs font-bold flex items-center gap-1.5"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'PAUSE' : 'RESUME'}</span>
                </button>

                <button
                  onClick={() => setAnimSpeed(animSpeed === 1 ? 2 : 1)}
                  className="px-2 py-1 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-color)] text-xs font-mono font-bold"
                >
                  {animSpeed}x
                </button>

                <button
                  onClick={() => setStep('results')}
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm uppercase"
                >
                  <span>VIEW RESULTS</span>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="absolute top-16 left-4 z-10 max-w-sm p-4 rounded-xl bg-[var(--bg-panel)]/90 backdrop-blur-md border border-[var(--border-color)] shadow-lg space-y-1.5 pointer-events-none">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 font-bold">
                  {mode === 'ai' ? 'AI RECOMMENDED SIMULATION' : 'TRIAL & ERROR SIMULATION'}
                </span>
                <span className="text-[10px] font-bold text-[var(--text-muted)] font-mono">
                  {currentPhase === 'injection' && 'STAGE 1/3'}
                  {currentPhase === 'soaking' && 'STAGE 2/3'}
                  {currentPhase === 'production' && 'STAGE 3/3'}
                </span>
              </div>

              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase">
                {currentPhase === 'injection' && '🔥 PHASE 1: STEAM INJECTION'}
                {currentPhase === 'soaking' && `⏳ PHASE 2: SOAKING (${mode === 'ai' && aiRecommendation ? aiRecommendation.recommendedSettings.css.soakingTime : cssParams.soakingTime} HOURS)`}
                {currentPhase === 'production' && `⚙️ PHASE 3: SRP CRUDE OIL PRODUCTION`}
              </h3>

              <div className="text-[11px] text-[var(--text-secondary)] space-y-1">
                {currentPhase === 'injection' && (
                  <p>Superheated steam enters the reservoir rock. Heat spreads through the heavy oil formation based on injection temperature ({active3DParams.steamTemperature}°C) and rate ({active3DParams.steamRate} t/d).</p>
                )}
                {currentPhase === 'soaking' && (
                  <p>Steam injection stops. The well remains shut. Injected heat diffuses widely through the reservoir rock, drastically reducing heavy oil viscosity.</p>
                )}
                {currentPhase === 'production' && (
                  <p>Surface beam pumping unit reciprocates. Sucker rods drive the downhole plunger to lift heated, mobilized crude oil up the wellbore to surface.</p>
                )}
              </div>
            </div>

            <div className="absolute bottom-4 left-4 z-10 p-2 rounded-lg bg-[var(--bg-panel)]/80 backdrop-blur-sm border border-[var(--border-color)] text-[10px] text-[var(--text-muted)] font-mono space-y-0.5 pointer-events-none">
              <div>🖱️ Left Drag: Rotate 360° | Scroll: Zoom | Right Drag: Pan</div>
            </div>

            <div className="flex-1 w-full h-full">
              <DigitalTwinScene
                params={active3DParams}
                output={active3DOutput}
                cssPhase={currentPhase}
                cameraMode={currentPhase === 'production' ? 'surface' : 'reservoir'}
                isDark={isDark}
                showTelemetry={true}
              />
            </div>
          </div>
        )}

        {/* =======================================================================
            5. FINAL RESULTS SCREEN
            ======================================================================= */}
        {step === 'results' && simResults && (
          <div className="w-full max-w-4xl bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] uppercase">
                    {mode === 'ai' ? 'AI SIMULATION RESULT' : 'SIMULATION RESULT'}
                  </h2>
                  <SimulatedTag label="DEMO MODEL" />
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Deterministic petroleum engineering response of the Baghewala heavy oil reservoir system
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-[var(--bg-surface)] text-[10px] font-mono text-[var(--text-muted)] border border-[var(--border-color)]">
                SIMULATED DATA · NOT FIELD VALIDATED
              </span>
            </div>

            {/* 6 MAIN OUTPUTS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">
                  1. FINAL RESERVOIR TEMPERATURE
                </span>
                <div className="text-xl font-mono font-black text-orange-500">
                  {simResults.finalReservoirTemp.toFixed(1)} °C
                </div>
                <span className="text-[10px] text-[var(--text-muted)]">Thermal Front Expansion</span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">
                  2. REDUCED OIL VISCOSITY
                </span>
                <div className="text-xl font-mono font-black text-emerald-500 flex items-center gap-1.5">
                  <span>{simResults.reducedOilViscosity.toFixed(1)} cP</span>
                  <TrendingDown className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Mobilized Heavy Oil</span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">
                  3. HEAT DELIVERED / STEAM USED
                </span>
                <div className="text-xl font-mono font-black text-amber-500">
                  {simResults.heatDelivered.toFixed(1)} GJ
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                  {simResults.steamUsed.toFixed(1)} tons steam
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">
                  4. HEAT RETAINED
                </span>
                <div className="text-xl font-mono font-black text-[var(--text-primary)]">
                  {simResults.heatRetained.toFixed(1)} GJ
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                  {simResults.heatRetentionPercentage.toFixed(1)}% retained
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">
                  5. SOAKING TIME USED
                </span>
                <div className="text-xl font-mono font-black text-amber-500">
                  {simResults.soakingTimeHours} hrs
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                  ({(simResults.soakingTimeHours / 24).toFixed(1)} Days Soaking)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">
                  6. ESTIMATED ENERGY CONSUMPTION
                </span>
                <div className="text-xl font-mono font-black text-[var(--text-primary)]">
                  {simResults.estimatedEnergyConsumption.toLocaleString()} kWh
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                  Production: {simResults.productionRate.toFixed(1)} bbl/d
                </span>
              </div>
            </div>

            {mode === 'ai' && (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>AI RECOMMENDATION</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Based on the supplied field conditions, the model recommends the following simulated CSS and SRP operating point.
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setStep('input')}
                className="px-5 py-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--border-color)] text-[var(--text-primary)] border border-[var(--border-color)] text-xs font-bold transition-all flex items-center gap-2 uppercase"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{mode === 'ai' ? 'MODIFY CONDITIONS' : 'MODIFY INPUTS'}</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setStep('animation'); setCurrentPhase('injection'); setPhaseTime(0); setIsPlaying(true); }}
                  className="px-4 py-2.5 rounded-xl border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-xs font-bold transition-all flex items-center gap-1.5 uppercase"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>REPLAY 3D ANIMATION</span>
                </button>

                <button
                  onClick={() => setStep('home')}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 uppercase"
                >
                  <span>{mode === 'ai' ? 'RUN ANOTHER ANALYSIS' : 'RUN ANOTHER SIMULATION'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
