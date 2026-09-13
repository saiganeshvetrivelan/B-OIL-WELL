import { SimulationParams, Well, CameraMode } from '../data/types';

export const APP_TITLE = 'Baghewala Digital Twin';
export const APP_VERSION = 'v1.0.0 (SIMULATED)';
export const TAGLINE = 'AI-Powered CSS + SRP Operations';

export const DEFAULT_PARAMS: SimulationParams = {
  steamRate: 85,
  steamTemperature: 280,
  soakDuration: 3,
  srpSpeed: 6,
  strokeLength: 2.0,
  fluidLevel: 42,
  pumpCondition: 'good'
};

export const PARAM_RANGES = {
  steamRate: { min: 60, max: 120, step: 1 },
  steamTemperature: { min: 200, max: 350, step: 5 },
  soakDuration: { min: 2, max: 5, step: 0.1 },
  srpSpeed: { min: 4, max: 10, step: 0.1 },
  strokeLength: { min: 1.5, max: 3.0, step: 0.1 },
  fluidLevel: { min: 20, max: 80, step: 1 }
};

export const DEMO_WELL: Well = {
  id: 'BGW-DEMO-01',
  name: 'BGW-DEMO-01',
  field: 'Baghewala',
  status: 'online'
};

export const CAMERA_POSITIONS: Record<CameraMode, { position: [number, number, number], target: [number, number, number] }> = {
  full: { position: [15, 10, 15], target: [0, -5, 0] },
  surface: { position: [8, 5, 8], target: [0, 0, 0] },
  wellbore: { position: [5, -5, 5], target: [0, -10, 0] },
  reservoir: { position: [10, -20, 10], target: [0, -25, 0] },
  css: { position: [0, -25, 15], target: [0, -25, 0] },
  srp: { position: [5, 2, 5], target: [0, 1, 0] }
};

export const CSS_PHASE_COLORS = {
  injection: '#ef4444', // red-500
  soaking: '#f59e0b',   // amber-500
  production: '#10b981' // emerald-500
};

export const SEVERITY_COLORS = {
  info: '#3b82f6',     // blue-500
  warning: '#f59e0b',  // amber-500
  critical: '#ef4444'  // red-500
};

export const RISK_COLORS = {
  low: '#10b981',      // emerald-500
  medium: '#f59e0b',   // amber-500
  high: '#ea580c',     // orange-600
  critical: '#ef4444'  // red-500
};
