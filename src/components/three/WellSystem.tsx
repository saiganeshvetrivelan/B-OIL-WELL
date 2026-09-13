import React from 'react';
import ReservoirModel from './ReservoirModel';
import WellboreModel from './WellboreModel';
import WellheadModel from './WellheadModel';
import SurfacePumpModel from './SurfacePumpModel';
import SuckerRodModel from './SuckerRodModel';
import DownholePumpModel from './DownholePumpModel';
import SteamVisualization from './SteamVisualization';
import HeatVisualization from './HeatVisualization';
import FloatingTelemetry from './FloatingTelemetry';
import { useUiStore } from '../../stores/uiStore';

interface Props {
  params: {
    steamRate: number;
    steamTemperature: number;
    soakDuration: number;
    srpSpeed: number;
    strokeLength: number;
    fluidLevel: number;
    pumpCondition: string;
  };
  output: {
    production: number;
    reservoirTemperature: number;
    pumpEfficiency: number;
    steamRequirement: number;
    energyConsumption: number;
    equipmentRisk: string;
    equipmentRiskScore: number;
  };
  cssPhase: string;
  showTelemetry?: boolean;
  status?: string;
  onObjectClick?: (name: string, data: any) => void;
}

export default function WellSystem({
  params,
  output,
  cssPhase,
  showTelemetry = true,
  status,
  onObjectClick
}: Props) {
  
  const handleObjectClick = (name: string, data: any) => {
    if (onObjectClick) onObjectClick(name, data);
  };

  const isWorkPaused = useUiStore((s) => s.isWorkPaused);
  const isPumping = cssPhase === 'production' && !isWorkPaused;

  return (
    <group>
      {/* 1. Surface Ground Sliced Pad */}
      <group position={[0, -0.05, 0]}>
        <mesh position={[0, 0, -8]} receiveShadow>
          <boxGeometry args={[32, 0.1, 16]} />
          <meshStandardMaterial color="#475569" roughness={0.9} metalness={0.1} />
        </mesh>
      </group>

      {/* 2. Subsurface Geological Strata Cutaway (Overburden, Caprock, Bitumen Pay Zone) */}
      <ReservoirModel
        temperature={output.reservoirTemperature}
        steamRate={params.steamRate}
        cssPhase={cssPhase}
      />
      
      {/* 3. Steel Casing & Production Tubing */}
      <WellboreModel
        depth={35}
        fluidLevel={params.fluidLevel}
      />
      
      {/* 4. Surface Christmas Tree Wellhead */}
      <WellheadModel
        onClick={() => handleObjectClick('Surface Wellhead', {
          type: 'Christmas Tree Assembly',
          pressure: '450 psi (31 bar)',
          status: 'Operating Normal',
          temperature: `${(output.reservoirTemperature * 0.55).toFixed(1)} °C`,
          flowRate: `${output.production.toFixed(1)} bbl/d`,
        })}
      />
      
      {/* 5. Surface Beam Pumping Unit (Motor, Gearbox, Samson Post, Walking Beam, Horsehead) */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          handleObjectClick('Surface Pumping Unit', {
            type: 'Beam Pumping Unit (API Conventional)',
            speed: `${params.srpSpeed} SPM`,
            stroke: `${params.strokeLength} m`,
            status: isPumping ? 'Reciprocating' : 'Standby / Shut-in',
            motorLoad: isPumping ? `${(params.srpSpeed * 3.5 + params.strokeLength * 2).toFixed(1)} kW` : '0.0 kW',
            rodStress: isPumping ? `${(params.srpSpeed * 4 + params.strokeLength * 10).toFixed(1)} kN` : '0.0 kN',
          });
        }}
      >
        <SurfacePumpModel
          srpSpeed={params.srpSpeed}
          strokeLength={params.strokeLength}
          isActive={isPumping}
        />
      </group>
      
      {/* 6. Reciprocating Sucker Rod String */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          handleObjectClick('Sucker Rod String', {
            type: 'Continuous High-Tensile Steel String',
            depth: '1,050 m (Normalized: 32m)',
            diameter: '1.0 inch (25.4 mm)',
            peakTension: isPumping ? `${(params.srpSpeed * 4.2 + params.strokeLength * 12).toFixed(1)} kN` : 'Static Tension',
            status: 'Intact · No Fatigue Detected',
          });
        }}
      >
        <SuckerRodModel
          srpSpeed={params.srpSpeed}
          strokeLength={params.strokeLength}
          wellDepth={32}
          isActive={isPumping}
        />
      </group>
      
      {/* 7. API Downhole Insert Sucker Rod Pump */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          handleObjectClick('Downhole Insert Pump', {
            type: 'Stationary Barrel Sucker Rod Pump',
            efficiency: `${output.pumpEfficiency.toFixed(1)}%`,
            fluidLevel: `${params.fluidLevel} m`,
            condition: params.pumpCondition.toUpperCase(),
            valveStatus: isPumping ? 'Standing & Traveling Ball Valves Active' : 'Valves Closed (Static)',
          });
        }}
      >
        <DownholePumpModel
          srpSpeed={params.srpSpeed}
          strokeLength={params.strokeLength}
          pumpEfficiency={output.pumpEfficiency}
          isActive={isPumping}
        />
      </group>
      
      {/* 8. Active Steam Injection / Thermal Inflow Fluid Streams */}
      <SteamVisualization
        steamRate={params.steamRate}
        cssPhase={cssPhase}
        steamTemperature={params.steamTemperature}
        soakDuration={params.soakDuration}
        srpSpeed={params.srpSpeed}
        isActive={!isWorkPaused}
      />
      
      {/* 9. Thermal Conduction Dispersion Ring */}
      <HeatVisualization
        temperature={output.reservoirTemperature}
        steamRate={params.steamRate}
        soakDuration={params.soakDuration}
        cssPhase={cssPhase}
      />

      {/* 10. Spatial HUD Telemetry Overlays */}
      {showTelemetry && (
        <FloatingTelemetry 
          production={output.production}
          temperature={output.reservoirTemperature}
          srpSpeed={params.srpSpeed}
          pumpEfficiency={output.pumpEfficiency}
          steamRate={params.steamRate}
          status={status}
        />
      )}
    </group>
  );
}
