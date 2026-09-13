import { create } from 'zustand';
import { SimulationParams, SimulationOutput, CSSPhase, OptimizationWeights, OptimizationResult } from '../data/types';
import { DEFAULT_PARAMS } from '../utils/constants';

// Internal simulation engine logic
const runSimulation = (params: SimulationParams): SimulationOutput => {
  const { steamRate, steamTemperature, soakDuration, srpSpeed, strokeLength, fluidLevel, pumpCondition } = params;

  let pumpConditionMultiplier = 1.0;
  let pumpBonus = 0;
  let pumpPenalty = 5;

  switch (pumpCondition) {
    case 'excellent':
      pumpConditionMultiplier = 1.15;
      pumpBonus = 8;
      pumpPenalty = 0;
      break;
    case 'good':
      pumpConditionMultiplier = 1.0;
      pumpBonus = 0;
      pumpPenalty = 5;
      break;
    case 'fair':
      pumpConditionMultiplier = 0.8;
      pumpBonus = -10;
      pumpPenalty = 20;
      break;
    case 'poor':
      pumpConditionMultiplier = 0.55;
      pumpBonus = -25;
      pumpPenalty = 45;
      break;
  }

  let production = (steamRate * 0.35 + srpSpeed * 12 + strokeLength * 15 - fluidLevel * 0.3) * pumpConditionMultiplier * (steamTemperature / 280) * (1 - soakDuration * 0.02);
  let reservoirTemperature = 60 + steamTemperature * 0.18 + steamRate * 0.12 - soakDuration * 2;
  let pumpEfficiency = 90 - srpSpeed * 1.5 + strokeLength * 5 - (fluidLevel - 40) * 0.3 + pumpBonus;
  
  production = Math.max(50, Math.min(500, production));
  reservoirTemperature = Math.max(80, Math.min(200, reservoirTemperature));
  pumpEfficiency = Math.max(30, Math.min(98, pumpEfficiency));

  const energyConsumption = steamRate * 2.5 + srpSpeed * 8 + steamTemperature * 0.15;
  const steamRequirement = steamRate * (1 + (steamTemperature - 250) / 200);
  
  const equipmentRiskScore = srpSpeed * 5 + (3 - strokeLength) * 10 + (100 - pumpEfficiency) * 0.5 + pumpPenalty;
  
  let equipmentRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (equipmentRiskScore < 25) equipmentRisk = 'low';
  else if (equipmentRiskScore < 50) equipmentRisk = 'medium';
  else if (equipmentRiskScore < 75) equipmentRisk = 'high';
  else equipmentRisk = 'critical';

  return {
    production,
    reservoirTemperature,
    steamRequirement,
    energyConsumption,
    pumpEfficiency,
    equipmentRiskScore,
    equipmentRisk
  };
};

type PredictionHorizon = '24h' | '3d' | '7d' | '30d';

interface SimulationState {
  params: SimulationParams;
  output: SimulationOutput;
  cssPhase: CSSPhase;
  scenarioParams: SimulationParams | null;
  scenarioOutput: SimulationOutput | null;
  optimizationWeights: OptimizationWeights;
  optimizationResults: OptimizationResult[];
  predictionHorizon: PredictionHorizon;
  isSimulating: boolean;
  isOptimizing: boolean;
  
  setParam: <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => void;
  setParams: (params: SimulationParams) => void;
  setCSSPhase: (phase: CSSPhase) => void;
  runScenario: (params: SimulationParams) => void;
  clearScenario: () => void;
  setOptimizationWeights: (weights: OptimizationWeights) => void;
  runOptimization: () => void;
  setPredictionHorizon: (horizon: PredictionHorizon) => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  params: DEFAULT_PARAMS,
  output: runSimulation(DEFAULT_PARAMS),
  cssPhase: 'production',
  scenarioParams: null,
  scenarioOutput: null,
  optimizationWeights: {
    production: 0.4,
    steamEfficiency: 0.2,
    energyEfficiency: 0.2,
    equipmentReliability: 0.2
  },
  optimizationResults: [],
  predictionHorizon: '7d',
  isSimulating: false,
  isOptimizing: false,

  setParam: (key, value) => set((state) => {
    const newParams = { ...state.params, [key]: value };
    return {
      params: newParams,
      output: runSimulation(newParams)
    };
  }),

  setParams: (params) => set({
    params,
    output: runSimulation(params)
  }),

  setCSSPhase: (phase) => set({ cssPhase: phase }),

  runScenario: (params) => {
    set({ isSimulating: true });
    // Simulate async network request
    setTimeout(() => {
      set({
        scenarioParams: params,
        scenarioOutput: runSimulation(params),
        isSimulating: false
      });
    }, 800);
  },

  clearScenario: () => set({ scenarioParams: null, scenarioOutput: null }),

  setOptimizationWeights: (weights) => set({ optimizationWeights: weights }),

  runOptimization: () => {
    set({ isOptimizing: true });
    
    setTimeout(() => {
      const state = get();
      const results: OptimizationResult[] = [];
      
      // Generate some dummy optimization variations
      for(let i=0; i<3; i++) {
        const testParams = { ...state.params, srpSpeed: state.params.srpSpeed + (i-1)*1.5, strokeLength: state.params.strokeLength + (i-1)*0.2 };
        const testOutput = runSimulation(testParams);
        
        // Simple score calculation
        const prodScore = (testOutput.production / 500) * state.optimizationWeights.production;
        const energyScore = (1 - testOutput.energyConsumption / 1000) * state.optimizationWeights.energyEfficiency;
        const score = prodScore + energyScore; // simplified
        
        results.push({
          params: testParams,
          output: testOutput,
          score: score * 100,
          rank: i + 1
        });
      }
      
      results.sort((a, b) => b.score - a.score);
      results.forEach((r, idx) => r.rank = idx + 1);

      set({
        optimizationResults: results,
        isOptimizing: false
      });
    }, 1500);
  },

  setPredictionHorizon: (horizon) => set({ predictionHorizon: horizon })
}));
