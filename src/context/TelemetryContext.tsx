import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useWellTelemetry, ConnectionStatus, LiveTelemetry } from '../hooks/useWellTelemetry';

interface TelemetryContextValue {
  status: ConnectionStatus;
  lastUpdated: Date | null;
  latest: LiveTelemetry | null;
}

const TelemetryContext = createContext<TelemetryContextValue>({
  status: 'simulation',
  lastUpdated: null,
  latest: null,
});

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const { status, lastUpdated, latest } = useWellTelemetry({ wellId: 'BGW-01' });
  return (
    <TelemetryContext.Provider value={{ status, lastUpdated, latest }}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetryContext() {
  return useContext(TelemetryContext);
}
