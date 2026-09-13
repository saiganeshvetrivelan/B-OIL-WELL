import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase, WellTelemetryRow } from '../lib/supabase';
import { useSimulationStore } from '../stores/simulationStore';

export type ConnectionStatus = 'connecting' | 'live' | 'disconnected' | 'simulation';

export interface LiveTelemetry {
  srpSpeed: number;
  strokeLength: number;
  oilRate: number;
  reservoirTemp: number;
  pumpEfficiency: number;
  wellheadPressure: number;
  steamRate: number;
  cssPhase: 'injection' | 'soaking' | 'production';
  fluidLevel: number;
  waterCut: number;
  gasRate: number;
  steamTemperature: number;
  soakDuration: number;
  pumpCondition: 'excellent' | 'good' | 'fair' | 'poor';
  recordedAt: string | null;
}

interface UseWellTelemetryOptions {
  wellId?: string;
  historyLimit?: number;
}

const DEFAULT_WELL_ID = 'BGW-01';

function rowToLiveTelemetry(row: WellTelemetryRow): LiveTelemetry {
  return {
    srpSpeed: row.srp_speed ?? 6,
    strokeLength: row.stroke_length ?? 2.0,
    oilRate: row.oil_rate ?? 0,
    reservoirTemp: row.reservoir_temp ?? 120,
    pumpEfficiency: row.pump_efficiency ?? 75,
    wellheadPressure: row.wellhead_pressure ?? 450,
    steamRate: row.steam_rate ?? 80,
    cssPhase: row.css_phase ?? 'production',
    fluidLevel: row.fluid_level ?? 50,
    waterCut: row.water_cut ?? 20,
    gasRate: row.gas_rate ?? 0,
    steamTemperature: row.steam_temperature ?? 280,
    soakDuration: row.soak_duration ?? 3,
    pumpCondition: row.pump_condition ?? 'good',
    recordedAt: row.recorded_at,
  };
}

export function useWellTelemetry(options: UseWellTelemetryOptions = {}) {
  const { wellId = DEFAULT_WELL_ID, historyLimit = 50 } = options;
  const { setParams, setCSSPhase } = useSimulationStore();

  const [latest, setLatest] = useState<LiveTelemetry | null>(null);
  const [history, setHistory] = useState<LiveTelemetry[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>(supabase ? 'connecting' : 'simulation');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null);

  // Push live telemetry row into simulation store so 3D model + KPIs update
  const syncToStore = useCallback((t: LiveTelemetry) => {
    setParams({
      srpSpeed: t.srpSpeed,
      strokeLength: t.strokeLength,
      steamRate: t.steamRate,
      steamTemperature: t.steamTemperature,
      soakDuration: t.soakDuration,
      fluidLevel: t.fluidLevel,
      pumpCondition: t.pumpCondition,
    });
    setCSSPhase(t.cssPhase);
  }, [setParams, setCSSPhase]);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setStatus('simulation');
      return;
    }

    // ── 1. Fetch the latest snapshot immediately ──────────────────────────────
    const fetchLatest = async () => {
      const { data, error } = await client
        .from('well_telemetry')
        .select('*')
        .eq('well_id', wellId)
        .order('recorded_at', { ascending: false })
        .limit(historyLimit);

      if (error) {
        console.error('[WellTelemetry] Initial fetch error:', error.message);
        setStatus('disconnected');
        return;
      }

      if (data && data.length > 0) {
        const rows = data as WellTelemetryRow[];
        const telemetryRows = rows.map(rowToLiveTelemetry);
        setHistory(telemetryRows.slice().reverse());
        const newest = telemetryRows[0];
        setLatest(newest);
        syncToStore(newest);
        setLastUpdated(new Date());
        setStatus('live');
      }
    };

    fetchLatest();

    // ── 2. Subscribe to real-time INSERT / UPDATE changes ──────────────────────
    const channel = client
      .channel(`well_telemetry_${wellId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'well_telemetry',
          filter: `well_id=eq.${wellId}`,
        },
        (payload) => {
          const row = payload.new as WellTelemetryRow;
          if (!row || !row.recorded_at) return;

          const t = rowToLiveTelemetry(row);
          setLatest(t);
          setHistory((prev) => {
            const updated = [...prev, t];
            return updated.slice(-historyLimit);
          });
          syncToStore(t);
          setLastUpdated(new Date());
          setStatus('live');
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setStatus('live');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setStatus('disconnected');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        client.removeChannel(channelRef.current);
      }
    };
  }, [wellId, historyLimit, syncToStore]);

  return { latest, history, status, lastUpdated };
}
