import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import TelemetryBar from './TelemetryBar';
import { useUiStore } from '../../stores/uiStore';
import { TelemetryProvider } from '../../context/TelemetryContext';

export default function AppLayout() {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <TelemetryProvider>
      <div className="h-screen w-screen flex overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)]">
        <Sidebar />
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-[60px]' : 'ml-[220px]'
          }`}
        >
          <Header />
          <main className="flex-1 overflow-auto pt-[52px] pb-[36px]">
            <Outlet />
          </main>
          <TelemetryBar />
        </div>
      </div>
    </TelemetryProvider>
  );
}
