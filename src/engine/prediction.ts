import { SimulationParams, PredictionPoint } from '../data/types';
import { calcProduction, calcReservoirTemperature, calcPumpEfficiency } from './formulas';

type Horizon = '24h' | '3d' | '7d' | '30d';

const HORIZON_HOURS: Record<Horizon, number> = {
  '24h': 24,
  '3d': 72,
  '7d': 168,
  '30d': 720,
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function generatePrediction(
  params: SimulationParams,
  baseValue: number,
  horizon: Horizon,
  trend: number = -0.001, // slight decline by default
  volatility: number = 0.03
): PredictionPoint[] {
  const hours = HORIZON_HOURS[horizon];
  const points: PredictionPoint[] = [];
  const now = new Date();
  const step = Math.max(1, Math.floor(hours / 100)); // max 100 points
  
  for (let h = 0; h <= hours; h += step) {
    const t = h / hours;
    const trendValue = baseValue * (1 + trend * h);
    const noise = (seededRandom(h * 17 + baseValue * 7) - 0.5) * 2 * volatility * baseValue;
    const value = Math.max(0, trendValue + noise);
    const uncertainty = baseValue * volatility * (1 + t * 2); // uncertainty grows with time
    
    const timestamp = new Date(now.getTime() + h * 3600000).toISOString();
    points.push({
      timestamp,
      value: Math.round(value * 10) / 10,
      lower: Math.round((value - uncertainty) * 10) / 10,
      upper: Math.round((value + uncertainty) * 10) / 10,
      confidence: Math.round((1 - t * 0.3) * 100) / 100,
    });
  }
  return points;
}

export function generateProductionPrediction(params: SimulationParams, horizon: Horizon): PredictionPoint[] {
  return generatePrediction(params, calcProduction(params), horizon, -0.0008, 0.04);
}

export function generateTemperaturePrediction(params: SimulationParams, horizon: Horizon): PredictionPoint[] {
  return generatePrediction(params, calcReservoirTemperature(params), horizon, -0.002, 0.02);
}

export function generateWaterPrediction(params: SimulationParams, horizon: Horizon): PredictionPoint[] {
  const waterBase = calcProduction(params) * 0.35;
  return generatePrediction(params, waterBase, horizon, 0.001, 0.05);
}

export function generateEfficiencyPrediction(params: SimulationParams, horizon: Horizon): PredictionPoint[] {
  return generatePrediction(params, calcPumpEfficiency(params), horizon, -0.001, 0.02);
}

export function generateSteamPrediction(params: SimulationParams, horizon: Horizon): PredictionPoint[] {
  return generatePrediction(params, params.steamRate, horizon, 0.0005, 0.03);
}

export function generateRiskPrediction(params: SimulationParams, horizon: Horizon): PredictionPoint[] {
  const riskBase = 25; // base risk score
  return generatePrediction(params, riskBase, horizon, 0.002, 0.04);
}
