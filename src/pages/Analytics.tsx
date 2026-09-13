import React, { useState, useMemo } from 'react';
import { generateProductionHistory } from '../data/mockSensors';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function Analytics() {
  const [days, setDays] = useState<number>(30);
  
  const historyData = useMemo(() => {
    // Generate enough data for 90 days, then slice
    const fullData = generateProductionHistory(90);
    return fullData.slice(fullData.length - days);
  }, [days]);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg shadow-xl text-sm">
          <p className="text-gray-400 mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-semibold">
              {entry.name}: {entry.value.toFixed(1)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col mb-4">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-8 h-8 text-amber-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">WELL ANALYTICS</h1>
        </div>
        <div className="mt-3 inline-block bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1 self-start">
          <span className="text-amber-500 text-xs font-semibold tracking-wider">SIMULATED DATA</span>
        </div>
      </div>

      <div className="flex space-x-2 mb-6">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
              days === d 
                ? 'bg-amber-500 text-gray-950' 
                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {d} Days
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Oil Production */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 h-72 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Oil Production vs Time</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="timestamp" tickFormatter={formatDate} stroke="#666" tick={{ fill: '#888', fontSize: 11 }} minTickGap={30} />
                <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="oilRate" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={2} name="Oil (bbl/d)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temperature */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 h-72 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Temperature vs Time</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="timestamp" tickFormatter={formatDate} stroke="#666" tick={{ fill: '#888', fontSize: 11 }} minTickGap={30} />
                <YAxis domain={['auto', 'auto']} stroke="#666" tick={{ fill: '#888', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="temperature" stroke="#22d3ee" strokeWidth={2} dot={false} name="Temp (°C)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Water Rate */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 h-72 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Water Rate vs Time</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="timestamp" tickFormatter={formatDate} stroke="#666" tick={{ fill: '#888', fontSize: 11 }} minTickGap={30} />
                <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="waterRate" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} name="Water (bbl/d)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pressure */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 h-72 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Pressure vs Time</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="timestamp" tickFormatter={formatDate} stroke="#666" tick={{ fill: '#888', fontSize: 11 }} minTickGap={30} />
                <YAxis domain={['auto', 'auto']} stroke="#666" tick={{ fill: '#888', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="pressure" stroke="#10b981" strokeWidth={2} dot={false} name="Pressure (psi)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gas Rate */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 h-72 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Gas Rate vs Time</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="timestamp" tickFormatter={formatDate} stroke="#666" tick={{ fill: '#888', fontSize: 11 }} minTickGap={30} />
                <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="gasRate" stroke="#f97316" fill="#f97316" fillOpacity={0.2} strokeWidth={2} name="Gas (mcf/d)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Combined */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 h-72 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Combined Production</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="timestamp" tickFormatter={formatDate} stroke="#666" tick={{ fill: '#888', fontSize: 11 }} minTickGap={30} />
                <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="oilRate" stroke="#f59e0b" strokeWidth={2} dot={false} name="Oil" />
                <Line type="monotone" dataKey="waterRate" stroke="#3b82f6" strokeWidth={2} dot={false} name="Water" />
                <Line type="monotone" dataKey="gasRate" stroke="#f97316" strokeWidth={2} dot={false} name="Gas" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
