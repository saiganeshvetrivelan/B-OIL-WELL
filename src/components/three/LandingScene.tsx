import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import WellSystem from './WellSystem';
import { useThemeStore } from '../../stores/themeStore';

const defaultParams = {
  steamRate: 85, 
  steamTemperature: 280, 
  soakDuration: 3,
  srpSpeed: 6.0, 
  strokeLength: 2.0, 
  fluidLevel: 42, 
  pumpCondition: 'good'
};

const defaultOutput = {
  production: 245.0, 
  reservoirTemperature: 118.4, 
  pumpEfficiency: 78.5,
  steamRequirement: 85.0, 
  energyConsumption: 280.0, 
  equipmentRisk: 'low', 
  equipmentRiskScore: 22.0
};

export default function LandingScene() {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  const bgColor = isDark ? '#080C14' : '#F7F4EC';
  const gridPrimary = isDark ? '#243048' : '#DDD8CC';
  const gridSecondary = isDark ? '#131B2E' : '#E8E3D7';

  return (
    <div className="w-full h-full absolute inset-0 select-none pointer-events-auto">
      <Canvas camera={{ position: [26, 11, 26], fov: 38 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <color attach="background" args={[bgColor]} />
          <fog attach="fog" args={[bgColor, 35, 85]} />
          
          <ambientLight intensity={isDark ? 0.9 : 0.8} />
          <directionalLight position={[16, 26, 14]} intensity={isDark ? 2.0 : 1.7} color="#ffffff" />
          <directionalLight position={[-12, 10, -12]} intensity={0.8} color={isDark ? '#38bdf8' : '#94a3b8'} />
          <pointLight position={[-1.5, -29, 2]} intensity={1.5} color="#f59e0b" distance={25} />
          
          <WellSystem
            params={defaultParams}
            output={defaultOutput}
            cssPhase="production"
            showTelemetry={false}
          />
          
          <OrbitControls
            autoRotate
            autoRotateSpeed={0.35}
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            maxPolarAngle={Math.PI * 0.7}
            minPolarAngle={Math.PI * 0.15}
            target={[-1.0, -14.0, 0]}
          />
          
          <gridHelper args={[60, 60, gridPrimary, gridSecondary]} position={[0, -0.01, 0]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
