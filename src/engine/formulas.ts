import { SimulationParams, SimulationOutput } from '../data/types';

const PUMP_CONDITION_MULTIPLIER: Record<string, number> = {
  excellent: 1.15,
  good: 1.0,
  fair: 0.8,
  poor: 0.55,
};

const PUMP_CONDITION_BONUS: Record<string, number> = {
  excellent: 8,
  good: 0,
  fair: -10,
  poor: -25,
};

const PUMP_CONDITION_PENALTY: Record<string, number> = {
  excellent: 0,
  good: 5,
  fair: 20,
  poor: 45,
};

export function calcProduction(p: SimulationParams): number {
  const mult = PUMP_CONDITION_MULTIPLIER[p.pumpCondition];
  const raw = (p.steamRate * 0.35 + p.srpSpeed * 12 + p.strokeLength * 15 - p.fluidLevel * 0.3) * mult * (p.steamTemperature / 280) * (1 - p.soakDuration * 0.02);
  return Math.max(50, Math.min(500, Math.round(raw * 10) / 10));
}

export function calcReservoirTemperature(p: SimulationParams): number {
  const raw = 60 + p.steamTemperature * 0.18 + p.steamRate * 0.12 - p.soakDuration * 2;
  return Math.max(80, Math.min(200, Math.round(raw * 10) / 10));
}

export function calcPumpEfficiency(p: SimulationParams): number {
  const bonus = PUMP_CONDITION_BONUS[p.pumpCondition];
  const raw = 90 - p.srpSpeed * 1.5 + p.strokeLength * 5 - (p.fluidLevel - 40) * 0.3 + bonus;
  return Math.max(30, Math.min(98, Math.round(raw * 10) / 10));
}

export function calcEnergyConsumption(p: SimulationParams): number {
  const raw = p.steamRate * 2.5 + p.srpSpeed * 8 + p.steamTemperature * 0.15;
  return Math.round(raw * 10) / 10;
}

export function calcSteamRequirement(p: SimulationParams): number {
  const raw = p.steamRate * (1 + (p.steamTemperature - 250) / 200);
  return Math.round(raw * 10) / 10;
}

export function calcEquipmentRiskScore(p: SimulationParams): number {
  const penalty = PUMP_CONDITION_PENALTY[p.pumpCondition];
  const pumpEff = calcPumpEfficiency(p);
  const raw = p.srpSpeed * 5 + (3 - p.strokeLength) * 10 + (100 - pumpEff) * 0.5 + penalty;
  return Math.max(0, Math.min(100, Math.round(raw * 10) / 10));
}

export function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score < 25) return 'low';
  if (score < 50) return 'medium';
  if (score < 75) return 'high';
  return 'critical';
}

export function runSimulation(p: SimulationParams): SimulationOutput {
  const riskScore = calcEquipmentRiskScore(p);
  return {
    production: calcProduction(p),
    reservoirTemperature: calcReservoirTemperature(p),
    steamRequirement: calcSteamRequirement(p),
    energyConsumption: calcEnergyConsumption(p),
    pumpEfficiency: calcPumpEfficiency(p),
    equipmentRisk: getRiskLevel(riskScore),
    equipmentRiskScore: riskScore,
  };
}
