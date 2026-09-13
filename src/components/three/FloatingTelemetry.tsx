import React from 'react';
import { Html } from '@react-three/drei';

interface Props {
  production: number;
  temperature: number;
  srpSpeed: number;
  pumpEfficiency: number;
  steamRate: number;
  status?: string;
}

export default function FloatingTelemetry({
  production,
  temperature,
  srpSpeed,
  pumpEfficiency,
  steamRate,
  status = 'live'
}: Props) {

  const isLive = status === 'live';

  const Label = ({ 
    title, 
    value, 
    unit, 
    position 
  }: { 
    title: string; 
    value: string | number; 
    unit: string; 
    position: [number, number, number]; 
  }) => (
    <Html position={position} center distanceFactor={22}>
      <div className="bg-slate-900/95 backdrop-blur-md rounded-lg px-2.5 py-1.5 border border-slate-700/80 shadow-xl min-w-[110px] pointer-events-none select-none">
        <div className="text-[9px] uppercase text-slate-400 font-bold tracking-wider mb-0.5 flex justify-between items-center gap-1.5">
          <span>{title}</span>
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-[7px] font-mono text-slate-300 font-bold tracking-wider">
              {isLive ? 'LIVE' : 'SCADA'}
            </span>
          </span>
        </div>
        <div className="flex items-baseline gap-1 font-mono">
          <span className="text-sm font-black text-amber-400">{value}</span>
          <span className="text-[10px] text-slate-400 font-sans">{unit}</span>
        </div>
      </div>
    </Html>
  );

  return (
    <group>
      {/* 1. Surface Wellhead Telemetry */}
      <Label title="SURFACE FLOW" value={production.toFixed(1)} unit="bbl/d" position={[-3.6, 2.2, 0]} />
      
      {/* 2. Pumping Unit SPM */}
      <Label title="SRP STROKE" value={srpSpeed.toFixed(1)} unit="SPM" position={[4.6, 5.4, 0]} />
      
      {/* 3. Subsurface Reservoir Temperature */}
      <Label title="RES. TEMP" value={temperature.toFixed(1)} unit="°C" position={[5.2, -26.0, 0]} />
      
      {/* 4. Downhole Pump Efficiency */}
      <Label title="PUMP EFF." value={pumpEfficiency.toFixed(1)} unit="%" position={[-4.2, -31.5, 0]} />
      
      {/* 5. Steam Injection Rate */}
      <Label title="STEAM FLUX" value={steamRate.toFixed(0)} unit="t/cyc" position={[5.2, -30.5, 0]} />
    </group>
  );
}
