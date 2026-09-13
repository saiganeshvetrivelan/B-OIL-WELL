import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import WellSystem from './WellSystem';
import CameraController from './CameraController';

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
  cameraMode: string;
  isDark?: boolean;
  showTelemetry?: boolean;
  compact?: boolean;
  status?: string;
  onObjectClick?: (name: string, data: any) => void;
}

export default function DigitalTwinScene({
  params,
  output,
  cssPhase,
  cameraMode,
  isDark = true,
  showTelemetry = true,
  compact = false,
  status,
  onObjectClick
}: Props) {
  // Light Mode uses #F7F4EC (Bright Cream Workstation), Dark Mode uses #080C14 (Industrial Control Room)
  const bgColor = isDark ? '#080C14' : '#F7F4EC';
  const gridPrimary = isDark ? '#243048' : '#DDD8CC';
  const gridSecondary = isDark ? '#131B2E' : '#E8E3D7';

  return (
    <div className={`w-full ${compact ? 'h-[360px]' : 'h-full'} overflow-hidden relative select-none`}>
      <Canvas
        camera={{ position: [22, 12, 24], fov: 42, near: 0.1, far: 200 }}
        dpr={[1, 1.75]}
        shadows
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          {/* Background Environment & Fog */}
          <color attach="background" args={[bgColor]} />
          <fog attach="fog" args={[bgColor, 35, 95]} />
          
          {/* Ambient Lighting (Guaranteed high visibility in both Dark & Light modes) */}
          <ambientLight intensity={isDark ? 0.95 : 0.9} />
          
          {/* Key Directional Sun Light */}
          <directionalLight 
            position={[16, 26, 14]} 
            intensity={isDark ? 2.2 : 1.8} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
            shadow-camera-left={-22}
            shadow-camera-right={22}
            shadow-camera-top={22}
            shadow-camera-bottom={-22}
            shadow-bias={-0.0001}
          />
          
          {/* Opposing Cyan Technical Fill Light */}
          <directionalLight 
            position={[-14, 12, -14]} 
            intensity={isDark ? 0.9 : 0.6} 
            color={isDark ? '#38bdf8' : '#e2e8f0'} 
          />

          {/* Golden Rim / Back Light for Crisp Machinery Silhouettes */}
          <directionalLight 
            position={[-10, 20, 16]} 
            intensity={isDark ? 1.1 : 0.5} 
            color={isDark ? '#fbbf24' : '#fef08a'} 
          />
          
          {/* Subsurface Pay Zone Illumination (Ensures subterranean cutaway is bright) */}
          <pointLight 
            position={[-1.5, -29, 2]} 
            intensity={cssPhase === 'injection' ? 2.2 : 1.5} 
            color="#f59e0b" 
            distance={25} 
          />

          {/* Wellbore Mid-Depth Auxiliary Light */}
          <pointLight 
            position={[-1.5, -15, 3]} 
            intensity={isDark ? 1.0 : 0.7} 
            color={isDark ? '#93c5fd' : '#cbd5e1'} 
            distance={20} 
          />

          {/* 3D Well System */}
          <WellSystem
            params={params}
            output={output}
            cssPhase={cssPhase}
            status={status}
            showTelemetry={showTelemetry}
            onObjectClick={onObjectClick}
          />
          
          {/* Mouse Orbit / Pan / Zoom & Camera Preset Controller */}
          <CameraController mode={cameraMode} />
          
          {/* Ground Coordinate Surface Grid */}
          <gridHelper 
            args={[60, 60, gridPrimary, gridSecondary]} 
            position={[0, -0.01, 0]} 
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
