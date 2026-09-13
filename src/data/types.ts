export interface SimulationParams {
  steamRate: number;
  steamTemperature: number;
  soakDuration: number;
  srpSpeed: number;
  strokeLength: number;
  fluidLevel: number;
  pumpCondition: 'excellent' | 'good' | 'fair' | 'poor' | string;
}

export interface SimulationOutput {
  production: number;
  reservoirTemperature: number;
  steamRequirement: number;
  energyConsumption: number;
  pumpEfficiency: number;
  equipmentRisk: 'low' | 'medium' | 'high' | 'critical';
  equipmentRiskScore: number;
}

export interface OptimizationWeights {
  production: number;
  steamEfficiency: number;
  energyEfficiency: number;
  equipmentReliability: number;
}

export interface OptimizationResult {
  params: SimulationParams;
  output: SimulationOutput;
  score: number;
  rank: number;
}

export interface PredictionPoint {
  timestamp: string;
  value: number;
  lower: number;
  upper: number;
  confidence: number;
}

export interface Well {
  id: string;
  name: string;
  field: string;
  status: 'online' | 'offline' | 'maintenance' | string;
}

export interface Alert {
  id: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical' | string;
  parameter: string;
  title: string;
  description: string;
  suggestedAction: string;
  acknowledged: boolean;
}

export interface CSSCycle {
  cycleNumber: number;
  phase: 'injection' | 'soaking' | 'production';
  steamVolume: number;
  steamTemp: number;
  injectionDuration: number;
  soakDuration: number;
  productionDuration: number;
  oilProduced: number;
  startDate: string;
  endDate: string;
}

export interface ProductionRecord {
  timestamp: string;
  oilRate: number;
  waterRate: number;
  gasRate: number;
  temperature: number;
  pressure: number;
}

export interface SRPData {
  spm: number;
  strokeLength: number;
  pumpEfficiency: number;
  rodLoad: number;
  fluidLevel: number;
  motorPower: number;
  operatingCondition: 'normal' | 'warning' | 'critical';
}

export type CSSPhase = 'injection' | 'soaking' | 'production';
export type CameraMode = 'full' | 'surface' | 'wellbore' | 'reservoir' | 'css' | 'srp';
export type ThemeMode = 'dark' | 'light';
