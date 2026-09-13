import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env — real-time data disabled, running on simulation fallback.'
  );
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ─── Well Telemetry Row Type ──────────────────────────────────────────────────
export interface WellTelemetryRow {
  id: number;
  well_id: string;
  recorded_at: string;
  srp_speed: number | null;
  stroke_length: number | null;
  oil_rate: number | null;
  reservoir_temp: number | null;
  pump_efficiency: number | null;
  wellhead_pressure: number | null;
  steam_rate: number | null;
  css_phase: 'injection' | 'soaking' | 'production' | null;
  fluid_level: number | null;
  water_cut: number | null;
  gas_rate: number | null;
  steam_temperature: number | null;
  soak_duration: number | null;
  pump_condition: 'excellent' | 'good' | 'fair' | 'poor' | null;
}
