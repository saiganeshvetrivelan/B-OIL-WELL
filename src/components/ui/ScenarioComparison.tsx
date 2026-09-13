import React from 'react';
import { SimulationOutput } from '../../data/types';
import { ArrowRight } from 'lucide-react';

interface ScenarioComparisonProps {
  current: SimulationOutput;
  scenario: SimulationOutput;
  currentLabel?: string;
  scenarioLabel?: string;
}

export default function ScenarioComparison({ 
  current, 
  scenario, 
  currentLabel = 'CURRENT', 
  scenarioLabel = 'SCENARIO' 
}: ScenarioComparisonProps) {
  
  const renderRow = (label: string, curVal: number, scnVal: number, unit: string, inverseDelta: boolean = false) => {
    const delta = scnVal - curVal;
    const isPositive = delta > 0;
    const isGood = inverseDelta ? !isPositive : isPositive;
    
    return (
      <div className="grid grid-cols-12 gap-2 py-2 items-center border-b dark:border-gray-800 border-gray-200 text-sm last:border-0">
        <div className="col-span-4 text-gray-500 text-xs font-medium uppercase">{label}</div>
        <div className="col-span-3 text-right font-mono">
          {curVal.toFixed(1)} <span className="text-[10px] text-gray-500">{unit}</span>
        </div>
        <div className="col-span-1 flex justify-center text-gray-600">
          <ArrowRight className="w-3 h-3" />
        </div>
        <div className="col-span-3 text-right font-mono">
          {scnVal.toFixed(1)} <span className="text-[10px] text-gray-500">{unit}</span>
        </div>
        <div className={`col-span-1 text-right font-mono text-xs ${delta === 0 ? 'text-gray-500' : isGood ? 'text-emerald-500' : 'text-red-500'}`}>
          {delta > 0 ? '+' : ''}{delta.toFixed(1)}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800 border-gray-200 p-4">
      <div className="grid grid-cols-12 gap-2 pb-2 border-b dark:border-gray-700 border-gray-300 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
        <div className="col-span-4">Metric</div>
        <div className="col-span-3 text-right">{currentLabel}</div>
        <div className="col-span-1"></div>
        <div className="col-span-3 text-right text-amber-500">{scenarioLabel}</div>
        <div className="col-span-1 text-right">Δ</div>
      </div>
      
      {renderRow('Production', current.production, scenario.production, 'bbl')}
      {renderRow('Res Temp', current.reservoirTemperature, scenario.reservoirTemperature, '°C')}
      {renderRow('Steam Req', current.steamRequirement, scenario.steamRequirement, 'u', true)}
      {renderRow('Energy', current.energyConsumption, scenario.energyConsumption, 'kWh', true)}
      {renderRow('Pump Eff', current.pumpEfficiency, scenario.pumpEfficiency, '%')}
      {renderRow('Eqp Risk', current.equipmentRiskScore * 100, scenario.equipmentRiskScore * 100, '%', true)}
    </div>
  );
}
