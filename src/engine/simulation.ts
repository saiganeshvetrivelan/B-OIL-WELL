import { SimulationParams, SimulationOutput, CSSCycle, SRPData } from '../data/types';
import { runSimulation } from './formulas';

export function runSimulationComparison(
  current: SimulationParams,
  scenario: SimulationParams
): { current: SimulationOutput; scenario: SimulationOutput; deltas: Record<string, number> } {
  const currentOut = runSimulation(current);
  const scenarioOut = runSimulation(scenario);
  
  const deltas: Record<string, number> = {
    production: Number((scenarioOut.production - currentOut.production).toFixed(1)),
    reservoirTemperature: Number((scenarioOut.reservoirTemperature - currentOut.reservoirTemperature).toFixed(1)),
    steamRequirement: Number((scenarioOut.steamRequirement - currentOut.steamRequirement).toFixed(1)),
    energyConsumption: Number((scenarioOut.energyConsumption - currentOut.energyConsumption).toFixed(1)),
    pumpEfficiency: Number((scenarioOut.pumpEfficiency - currentOut.pumpEfficiency).toFixed(1)),
    equipmentRiskScore: Number((scenarioOut.equipmentRiskScore - currentOut.equipmentRiskScore).toFixed(1)),
  };
  
  return { current: currentOut, scenario: scenarioOut, deltas };
}

export function generateTimeSeries(
  params: SimulationParams,
  hours: number
): Array<{ hour: number; production: number; temperature: number; pressure: number; pumpEfficiency: number }> {
  const baseOut = runSimulation(params);
  const series = [];
  
  let prod = baseOut.production;
  let temp = baseOut.reservoirTemperature;
  let eff = baseOut.pumpEfficiency;
  let pressure = 450;

  for (let i = 0; i <= hours; i++) {
    prod += (Math.random() - 0.5) * 1.5;
    temp += (Math.random() - 0.5) * 0.8;
    eff += (Math.random() - 0.5) * 0.4;
    pressure += (Math.random() - 0.5) * 4;

    series.push({
      hour: i,
      production: Number(prod.toFixed(1)),
      temperature: Number(temp.toFixed(1)),
      pressure: Number(pressure.toFixed(1)),
      pumpEfficiency: Number(eff.toFixed(1)),
    });
  }
  return series;
}

export function generateCSSCycleData(params: SimulationParams, cycles: number): CSSCycle[] {
  const out: CSSCycle[] = [];
  const baseDate = new Date();
  
  for (let i = 0; i < cycles; i++) {
    const cycleNum = i + 1;
    baseDate.setDate(baseDate.getDate() + 18);
    const endDate = new Date(baseDate);
    endDate.setDate(endDate.getDate() + 18);

    out.push({
      cycleNumber: cycleNum,
      phase: i === cycles - 1 ? 'production' : (i % 3 === 0 ? 'injection' : i % 3 === 1 ? 'soaking' : 'production'),
      steamVolume: params.steamRate * (1 + Math.random() * 0.2),
      steamTemp: params.steamTemperature,
      injectionDuration: 24 + Math.random() * 10,
      soakDuration: params.soakDuration,
      productionDuration: 12 + Math.random() * 4,
      oilProduced: params.steamRate * 10 + Math.random() * 100,
      startDate: baseDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  }
  return out;
}

export function generateSRPData(params: SimulationParams): SRPData {
  const output = runSimulation(params);
  return {
    spm: params.srpSpeed,
    strokeLength: params.strokeLength,
    pumpEfficiency: output.pumpEfficiency,
    rodLoad: params.srpSpeed * 4 + params.strokeLength * 10,
    fluidLevel: params.fluidLevel,
    motorPower: params.srpSpeed * 3.5 + params.strokeLength * 2,
    operatingCondition: output.equipmentRiskScore < 40 ? 'normal' : output.equipmentRiskScore < 70 ? 'warning' : 'critical',
  };
}

export function generateDynacardData(params: SimulationParams): Array<{ position: number; load: number }> {
  const data = [];
  const points = 100;
  const baseLoad = 15 + params.strokeLength * 2;
  const maxLoad = 25 + params.srpSpeed * 1.5;
  
  for (let i = 0; i <= points; i++) {
    const pos = i;
    const phase = (i / points) * Math.PI;
    const upLoad = baseLoad + (maxLoad - baseLoad) * Math.sin(phase) + (Math.random() - 0.5) * 0.5;
    data.push({ position: pos, load: upLoad });
  }
  
  for (let i = points; i >= 0; i--) {
    const pos = i;
    const phase = (i / points) * Math.PI;
    const downLoad = baseLoad * 0.6 + (maxLoad * 0.4) * Math.sin(phase) + (Math.random() - 0.5) * 0.5;
    data.push({ position: pos, load: downLoad });
  }
  return data;
}
