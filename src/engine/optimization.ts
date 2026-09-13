import { SimulationParams, SimulationOutput, OptimizationResult, OptimizationWeights } from '../data/types';
import { runSimulation } from './formulas';

function generateCombinations(): SimulationParams[] {
  const combinations: SimulationParams[] = [];
  const steamRates = [60, 70, 80, 90, 100, 110, 120];
  const soakDurations = [2, 3, 4, 5];
  const srpSpeeds = [4, 5, 6, 7, 8, 9, 10];
  const strokeLengths = [1.5, 2.0, 2.5, 3.0];
  
  for (const steamRate of steamRates) {
    for (const soakDuration of soakDurations) {
      for (const srpSpeed of srpSpeeds) {
        for (const strokeLength of strokeLengths) {
          combinations.push({
            steamRate,
            steamTemperature: 280,
            soakDuration,
            srpSpeed,
            strokeLength,
            fluidLevel: 42,
            pumpCondition: 'good',
          });
        }
      }
    }
  }
  return combinations;
}

function calcScore(output: SimulationOutput, weights: OptimizationWeights): number {
  const prodScore = (output.production - 50) / 450; // normalize 50-500 to 0-1
  const steamEffScore = 1 - (output.steamRequirement - 40) / 200; // lower is better
  const energyEffScore = 1 - (output.energyConsumption - 100) / 400; // lower is better
  const reliabilityScore = 1 - output.equipmentRiskScore / 100; // lower risk is better
  
  return (
    prodScore * weights.production +
    steamEffScore * weights.steamEfficiency +
    energyEffScore * weights.energyEfficiency +
    reliabilityScore * weights.equipmentReliability
  );
}

export function runOptimization(weights: OptimizationWeights, topN: number = 10): OptimizationResult[] {
  const combinations = generateCombinations();
  const results: OptimizationResult[] = combinations.map((params) => {
    const output = runSimulation(params);
    const score = calcScore(output, weights);
    return { params, output, score, rank: 0 };
  });
  
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topN).map((r, i) => ({ ...r, rank: i + 1 }));
}
