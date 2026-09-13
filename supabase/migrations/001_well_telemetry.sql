-- ============================================================
-- Baghewala Digital Twin — Well Telemetry Table
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS well_telemetry (
  id                  BIGSERIAL PRIMARY KEY,
  well_id             TEXT NOT NULL DEFAULT 'BGW-01',
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Sucker Rod Pump (SRP) Parameters
  srp_speed           NUMERIC(6,2),        -- strokes per minute (SPM)
  stroke_length       NUMERIC(6,3),        -- meters

  -- Production Data
  oil_rate            NUMERIC(8,2),        -- bbl/d
  water_cut           NUMERIC(5,1),        -- % water in produced fluid
  gas_rate            NUMERIC(8,2),        -- Mscfd

  -- Downhole & Pump State
  pump_efficiency     NUMERIC(5,1),        -- %
  pump_condition      TEXT DEFAULT 'good' CHECK (pump_condition IN ('excellent','good','fair','poor')),
  fluid_level         NUMERIC(6,1),        -- dynamic fluid level, meters

  -- Wellhead
  wellhead_pressure   NUMERIC(7,1),        -- psi

  -- Thermal / CSS Parameters
  steam_rate          NUMERIC(6,1),        -- tonnes per cycle
  steam_temperature   NUMERIC(6,1),        -- °C
  soak_duration       NUMERIC(5,2),        -- days
  reservoir_temp      NUMERIC(6,1),        -- °C
  css_phase           TEXT DEFAULT 'production' CHECK (css_phase IN ('injection','soaking','production'))
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_well_telemetry_well_recorded
  ON well_telemetry (well_id, recorded_at DESC);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE well_telemetry ENABLE ROW LEVEL SECURITY;

-- Allow public read (anon key can SELECT)
CREATE POLICY "Public read well_telemetry"
  ON well_telemetry FOR SELECT
  USING (true);

-- Allow authenticated writes (from your SCADA/data ingestion service)
CREATE POLICY "Authenticated insert well_telemetry"
  ON well_telemetry FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- ── Enable Real-Time Replication ─────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE well_telemetry;

-- ============================================================
-- SEED — Insert sample real-time telemetry rows for BGW-01
-- Run after creating the table to test live updates
-- ============================================================

INSERT INTO well_telemetry (
  well_id, srp_speed, stroke_length, oil_rate, water_cut, gas_rate,
  pump_efficiency, pump_condition, fluid_level, wellhead_pressure,
  steam_rate, steam_temperature, soak_duration, reservoir_temp, css_phase
) VALUES
  ('BGW-01', 6.5,  2.1, 285.4, 22.1, 0.8, 82.3, 'good',      52.0, 463.0, 85.0, 285.0, 3.0, 143.0, 'production'),
  ('BGW-01', 7.0,  2.2, 291.1, 21.8, 0.9, 83.5, 'good',      50.5, 468.0, 85.0, 285.0, 3.0, 146.0, 'production'),
  ('BGW-01', 7.5,  2.2, 298.7, 21.2, 1.0, 84.1, 'excellent', 49.0, 471.0, 85.0, 285.0, 3.0, 149.0, 'production'),
  ('BGW-01', 5.0,  1.8,  12.0, 15.0, 0.1, 60.0, 'good',      45.0, 350.0, 90.0, 295.0, 3.0, 110.0, 'injection'),
  ('BGW-01', 5.0,  1.8,   5.0, 10.0, 0.0, 55.0, 'good',      42.0, 310.0, 0.0,  0.0,   3.5, 165.0, 'soaking'),
  ('BGW-01', 8.0,  2.3, 310.2, 20.5, 1.1, 85.9, 'excellent', 47.5, 478.0, 85.0, 285.0, 3.0, 152.0, 'production');
