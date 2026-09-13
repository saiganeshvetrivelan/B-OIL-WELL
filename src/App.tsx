import React, { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { useThemeStore } from './stores/themeStore';

const Overview = lazy(() => import('./pages/Overview'));
const DigitalTwin = lazy(() => import('./pages/DigitalTwin'));
const Operations = lazy(() => import('./pages/Operations'));
const Simulation = lazy(() => import('./pages/Simulation'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

function LoadingScreen() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#080C14]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs font-bold text-amber-500 tracking-[0.3em] uppercase">
            Baghewala Digital Twin
          </p>
          <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
            Initializing SCADA Engine...
          </p>
        </div>
      </div>
    </div>
  );
}

function ThemeInitializer() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    // Force dark by default for industry-standard look
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return null;
}

export default function App() {
  return (
    <HashRouter>
      <ThemeInitializer />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Main Application — boots directly into SCADA dashboard */}
          <Route path="/" element={<Navigate to="/app/overview" replace />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="digital-twin" element={<DigitalTwin />} />
            <Route path="operations" element={<Operations />} />
            <Route path="simulation" element={<Simulation />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />

            {/* Legacy route redirects */}
            <Route path="twin" element={<Navigate to="/app/digital-twin" replace />} />
            <Route path="css-operations" element={<Navigate to="/app/operations" replace />} />
            <Route path="srp-operations" element={<Navigate to="/app/operations" replace />} />
            <Route path="optimization" element={<Navigate to="/app/simulation" replace />} />
            <Route path="ai-prediction" element={<Navigate to="/app/simulation" replace />} />
            <Route path="analytics" element={<Navigate to="/app/operations" replace />} />
            <Route path="alerts" element={<Navigate to="/app/overview" replace />} />
            <Route path="architecture" element={<Navigate to="/app/overview" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/app/overview" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
