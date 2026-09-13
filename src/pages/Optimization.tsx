import React, { useState } from 'react';
import { runOptimization } from '../engine/optimization';
import { useSimulationStore } from '../stores/simulationStore';
import { OptimizationResult, OptimizationWeights } from '../data/types';
import { ArrowDownRight, ArrowUpRight, Target, Loader2 } from 'lucide-react';

export default function Optimization() {
  const { output } = useSimulationStore();
  const [weights, setWeights] = useState<OptimizationWeights>({
    production: 0.4,
    steamEfficiency: 0.3,
    energyEfficiency: 0.2,
    equipmentReliability: 0.1,
  });

  const [results, setResults] = useState<OptimizationResult[] | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleRunOptimization = () => {
    setIsOptimizing(true);
    // Simulate thinking
    setTimeout(() => {
      const optimized = runOptimization(weights, 5);
      setResults(optimized);
      setIsOptimizing(false);
    }, 1500);
  };

  const handleWeightChange = (key: keyof OptimizationWeights, value: number) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col mb-8">
        <div className="flex items-center space-x-3">
          <Target className="w-8 h-8 text-amber-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">OPTIMIZATION ENGINE</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Find a balanced simulated operating point</p>
        <div className="mt-2 inline-block bg-cyan-400/10 border border-cyan-400/20 rounded px-2 py-1">
          <span className="text-cyan-400 text-xs font-semibold tracking-wider">PROTOTYPE · DEMO OPTIMIZATION</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Objective Weights</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Object.entries(weights).map(([key, val]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <span className="text-amber-500 font-bold">{val.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={val}
                onChange={(e) => handleWeightChange(key as keyof OptimizationWeights, parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleRunOptimization}
          disabled={isOptimizing}
          className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-semibold px-8 py-3 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isOptimizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
          <span>{isOptimizing ? 'OPTIMIZING...' : 'RUN OPTIMIZATION'}</span>
        </button>
      </div>

      {results && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Optimization Results</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Steam (t/d)</th>
                    <th className="px-4 py-3">Soak (days)</th>
                    <th className="px-4 py-3">SRP (SPM)</th>
                    <th className="px-4 py-3">Stroke (in)</th>
                    <th className="px-4 py-3">Production (bbl/d)</th>
                    <th className="px-4 py-3">Efficiency</th>
                    <th className="px-4 py-3">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((res, i) => (
                    <tr key={i} className={`border-b dark:border-gray-800 ${i === 0 ? 'bg-amber-500/10' : 'bg-white dark:bg-gray-900'}`}>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                        {i === 0 ? '⭐ 1' : i + 1}
                      </td>
                      <td className="px-4 py-3 text-amber-500 font-semibold">{(res.score * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3">{res.params.steamRate}</td>
                      <td className="px-4 py-3">{res.params.soakDuration}</td>
                      <td className="px-4 py-3">{res.params.srpSpeed}</td>
                      <td className="px-4 py-3">{res.params.strokeLength}</td>
                      <td className="px-4 py-3 text-emerald-500">{res.output.production.toFixed(1)}</td>
                      <td className="px-4 py-3 text-cyan-400">{(res.output.pumpEfficiency * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-red-400">{(res.output.equipmentRiskScore * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Current vs Optimized (Best)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Oil Production', cur: output.production, opt: results[0].output.production, unit: 'bbl/d', higherIsBetter: true },
                { label: 'Pump Efficiency', cur: output.pumpEfficiency * 100, opt: results[0].output.pumpEfficiency * 100, unit: '%', higherIsBetter: true },
                { label: 'Equipment Risk', cur: output.equipmentRiskScore * 100, opt: results[0].output.equipmentRiskScore * 100, unit: '%', higherIsBetter: false }
              ].map((metric, idx) => {
                const diff = metric.opt - metric.cur;
                const isImproved = metric.higherIsBetter ? diff > 0 : diff < 0;
                const isEqual = diff === 0;
                
                return (
                  <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-950 rounded border border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{metric.label}</p>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metric.opt.toFixed(1)}{metric.unit}</span>
                      <span className="text-sm text-gray-400 line-through">{metric.cur.toFixed(1)}</span>
                    </div>
                    {!isEqual && (
                      <div className={`mt-1 flex items-center text-sm ${isImproved ? 'text-emerald-500' : 'text-red-500'}`}>
                        {diff > 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                        {Math.abs(diff).toFixed(1)}{metric.unit}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-8 italic">
        These results are from a prototype simulation model. Do not use as field recommendations without validation.
      </p>
    </div>
  );
}
