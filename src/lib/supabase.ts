import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  'https://oxfgfmrdiwmnoewttirq.supabase.co';

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94ZmdmbXJkaXdtbm9ld3R0aXJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTIxNjMxMywiZXhwIjoyMTA0NzkyMzEzfQ.x5jvbYZxbSiawFGF7BFGpU9PhN4M7hPkLRXhxtabnYI';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn(
    '[Supabase] Missing Supabase credentials — real-time data disabled, running on simulation fallback.'
  );
}

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
