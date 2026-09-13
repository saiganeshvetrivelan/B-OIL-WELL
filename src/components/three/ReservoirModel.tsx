import React from 'react';

interface Props {
  temperature: number;
  steamRate: number;
  cssPhase: string;
}

export default function ReservoirModel({ temperature, steamRate, cssPhase }: Props) {
  // Thermal radius scales with steam injection rate and temperature
  const normalizedSteam = Math.max(0.6, Math.min(1.5, steamRate / 85));
  const thermalRadius = 4.5 * normalizedSteam;

  // Temperature color interpolation (80°C = cool dark amber, 180°C+ = intense thermal red/orange)
  const tempRatio = Math.max(0, Math.min(1, (temperature - 80) / 120));
  const thermalCoreColor = tempRatio > 0.6 ? '#ea580c' : tempRatio > 0.3 ? '#f59e0b' : '#d97706';

  return (
    <group position={[-1.5, 0, 0]}>
      {/* =========================================================================
          UNDERGROUND STRATIGRAPHIC CUTAWAY (Sliced at z=0 so wellbore is fully visible)
          ========================================================================= */}

      {/* Layer 1: Alluvium & Near-Surface Sediments (y: 0 to -6m) */}
      <group position={[0, -3, -8]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[32, 6, 16]} />
          <meshStandardMaterial color="#78716c" roughness={0.9} metalness={0.05} opacity={0.88} transparent />
        </mesh>
        {/* Stratum boundary line */}
        <mesh position={[0, -3.01, 8.01]}>
          <boxGeometry args={[32.05, 0.08, 0.1]} />
          <meshBasicMaterial color="#a8a29e" />
        </mesh>
      </group>

      {/* Layer 2: Overburden Shale & Siltstone Formation (y: -6 to -18m) */}
      <group position={[0, -12, -8]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[32, 12, 16]} />
          <meshStandardMaterial color="#57534e" roughness={0.85} metalness={0.1} opacity={0.85} transparent />
        </mesh>
        <mesh position={[0, -6.01, 8.01]}>
          <boxGeometry args={[32.05, 0.08, 0.1]} />
          <meshBasicMaterial color="#78716c" />
        </mesh>
      </group>

      {/* Layer 3: Impermeable Caprock Formation Seal (y: -18 to -24m) */}
      <group position={[0, -21, -8]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[32, 6, 16]} />
          <meshStandardMaterial color="#44403c" roughness={0.7} metalness={0.2} opacity={0.88} transparent />
        </mesh>
        <mesh position={[0, -3.01, 8.01]}>
          <boxGeometry args={[32.05, 0.12, 0.1]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      </group>

      {/* =========================================================================
          Layer 4: BAGHEWALA HEAVY OIL RESERVOIR PAY ZONE (y: -24 to -34m)
          ========================================================================= */}
      <group position={[0, -29, -8]}>
        {/* Main Viscous Bitumen Rock Matrix (Deep dark asphaltic heavy oil formation) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[32, 10, 16]} />
          <meshStandardMaterial 
            color="#1c1917" 
            roughness={0.95} 
            metalness={0.15} 
            opacity={0.82} 
            transparent 
          />
        </mesh>

        {/* Stratum marker line at base of pay zone */}
        <mesh position={[0, -5.01, 8.01]}>
          <boxGeometry args={[32.05, 0.08, 0.1]} />
          <meshBasicMaterial color="#78716c" />
        </mesh>
      </group>

      {/* Layer 5: Basal Aquifer / Sandstone Foundation (y: -34 to -40m) */}
      <group position={[0, -37, -8]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[32, 6, 16]} />
          <meshStandardMaterial color="#292524" roughness={0.9} metalness={0.1} opacity={0.9} transparent />
        </mesh>
      </group>

      {/* =========================================================================
          THERMAL HEAT-AFFECTED RESERVOIR ZONE (Concentric radial heat dispersion)
          ========================================================================= */}
      <group position={[0, -29, 0]}>
        {/* Core Steam/Heat Injection Zone (Perforated interval center) */}
        <mesh>
          <cylinderGeometry args={[thermalRadius * 0.45, thermalRadius * 0.45, 6.5, 24]} />
          <meshStandardMaterial 
            color={thermalCoreColor} 
            emissive={thermalCoreColor} 
            emissiveIntensity={cssPhase === 'injection' ? 0.6 : 0.35} 
            transparent 
            opacity={0.45} 
          />
        </mesh>

        {/* Outer Heat Conduction Halo (Expanding thermal front) */}
        <mesh>
          <cylinderGeometry args={[thermalRadius, thermalRadius, 8.0, 24]} />
          <meshStandardMaterial 
            color="#d97706" 
            emissive="#d97706" 
            emissiveIntensity={0.18} 
            transparent 
            opacity={0.22} 
          />
        </mesh>

        {/* Far-Field Warm Boundary */}
        <mesh>
          <cylinderGeometry args={[thermalRadius * 1.5, thermalRadius * 1.5, 9.2, 24]} />
          <meshStandardMaterial 
            color="#78350f" 
            transparent 
            opacity={0.12} 
          />
        </mesh>
      </group>
    </group>
  );
}
