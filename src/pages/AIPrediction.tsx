import React, { useState, useMemo } from 'react';
import { useSimulationStore } from '../stores/simulationStore';
import { 
  generateProductionPrediction, 
  generateTemperaturePrediction, 
  generateWaterPrediction, 
  generateEfficiencyPrediction, 
  generateSteamPrediction, 
  generateRiskPrediction 
} from '../engine/prediction';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import SimulatedTag from '../components/ui/SimulatedTag';

type Horizon = '24h' | '3d' | '7d' | '30d';

const horizons: { label: string; value: Horizon }[] = [
  { label: '24 HOURS', value: '24h' },
  { label: '3 DAYS', value: '3d' },
  { label: '7 DAYS', value: '7d' },
  { label: '30 DAYS', value: '30d' },
];

export default function AIPrediction() {
  const { params } = useSimulationStore();
  const [horizon, setHorizon] = useState<Horizon>('7d');

  const productionData = useMemo(() => generateProductionPrediction(params, horizon), [params, horizon]);
  const tempData = useMemo(() => generateTemperaturePrediction(params, horizon), [params, horizon]);
  const waterData = useMemo(() => generateWaterPrediction(params, horizon), [params, horizon]);
  const efficiencyData = useMemo(() => generateEfficiencyPrediction(params, horizon), [params, horizon]);
  const steamData = useMemo(() => generateSteamPrediction(params, horizon), [params, horizon]);
  const riskData = useMemo(() => generateRiskPrediction(params, horizon), [params, horizon]);

  const formatDate = (ts: string) => {
    try {
      const d = new Date(ts);
      return horizon === '24h' 
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return ts;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg shadow-xl text-xs space-y-1">
          <p className="text-gray-400 font-mono">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => {
            if (entry.dataKey === 'lower' || entry.dataKey === 'upper') return null;
            return (
              <p key={index} style={{ color: entry.color }} className="font-semibold text-sm">
                {entry.name}: {Number(entry.value).toFixed(1)} {entry.unit}
              </p>
            );
          })}
          {payload[0]?.payload?.confidence && (
            <p className="text-[10px] text-cyan-400 pt-1 border-t border-gray-800">
              Confidence: {Math.round(payload[0].payload.confidence * 100)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const ChartCard = ({ 
    title, 
    data, 
    color, 
    dataKey = 'value', 
    unit = '', 
    avgConfidence = 88 
  }: { 
    title: string; 
    data: any[]; 
    color: string; 
    dataKey?: string; 
    unit?: string;
    avgConfidence?: number;
  }) => (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col h-72 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">{title}</h3>
          <span className="text-[10px] font-mono text-cyan-500 bg-cyan-500/10 px-1.5 py-0.5 rounded">
            ±{avgConfidence}% conf
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded tracking-wider">
          PREDICTED
        </span>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} vertical={false} />
            <XAxis dataKey="timestamp" tickFormatter={formatDate} stroke="#666" tick={{ fill: '#888', fontSize: 10 }} />
            <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 10 }} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            
            <Area 
              type="monotone" 
              dataKey="upper" 
              stroke="none" 
              fill={color} 
              fillOpacity={0.15} 
              activeDot={false}
            />
            <Area 
              type="monotone" 
              dataKey="lower" 
              stroke="none" 
              fill={color} 
              fillOpacity={0.05} 
              activeDot={false}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2}
              fill="none" 
              name={title}
              unit={unit}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                AI WELL BEHAVIOR PREDICTION
                <SimulatedTag label="DEMO AI MODEL" />
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Physics-informed predictive forecasting with dynamic uncertainty boundaries
              </p>
            </div>
          </div>
        </div>

        {/* Horizon Selector */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-800">
          {horizons.map((h) => (
            <button
              key={h.value}
              onClick={() => setHorizon(h.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wider transition-all ${
                horizon === h.value
                  ? 'bg-amber-500 text-gray-950 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-3 text-xs text-amber-500 dark:text-amber-400">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>
          <strong>Decision Support Notice:</strong> Prediction confidence is illustrative until trained and validated against field-measured Baghewala telemetry.
        </span>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ChartCard title="Oil Production Forecast" data={productionData} color="#f59e0b" unit="bbl/d" avgConfidence={92} />
        <ChartCard title="Reservoir Temperature" data={tempData} color="#22d3ee" unit="°C" avgConfidence={88} />
        <ChartCard title="Water Production Trend" data={waterData} color="#3b82f6" unit="bbl/d" avgConfidence={84} />
        <ChartCard title="SRP Pump Efficiency" data={efficiencyData} color="#10b981" unit="%" avgConfidence={89} />
        <ChartCard title="Steam Cycle Requirement" data={steamData} color="#f97316" unit="units" avgConfidence={86} />
        <ChartCard title="Equipment Risk Index" data={riskData} color="#ef4444" unit="pts" avgConfidence={80} />
      </div>
    </div>
  );
}
