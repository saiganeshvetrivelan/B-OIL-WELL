import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  srpSpeed: number;
  strokeLength: number;
  pumpEfficiency: number;
  isActive?: boolean;
}

export default function DownholePumpModel({ 
  srpSpeed, 
  strokeLength, 
  pumpEfficiency,
  isActive = true 
}: Props) {
  const plungerRef = useRef<THREE.Group>(null);
  const currentAngle = useRef(0);

  // Plunger reciprocation inside working barrel
  useFrame((_, delta) => {
    const spm = isActive ? Math.max(0, srpSpeed) : 0;
    if (spm > 0) {
      const angularVelocity = spm * ((Math.PI * 2) / 60);
      currentAngle.current += delta * angularVelocity;
    }

    // Exact match with sucker rod & surface pump stroke
    const stroke3D = Math.max(0.4, Math.min(1.4, (strokeLength || 2.0) * 0.4));
    const plungerTravel = - (stroke3D / 2) * Math.cos(currentAngle.current);

    if (plungerRef.current) {
      plungerRef.current.position.y = plungerTravel;
    }
  });

  const barrelSteel = { color: '#475569', metalness: 0.85, roughness: 0.3 };
  const chromePlunger = { color: '#f1f5f9', metalness: 0.95, roughness: 0.15 };
  const valveBrass = { color: '#d97706', metalness: 0.8, roughness: 0.25 };
  const efficiencyColor = pumpEfficiency < 60 ? '#ef4444' : pumpEfficiency < 75 ? '#f59e0b' : '#10b981';

  return (
    <group position={[-1.5, -31.5, 0]}>
      {/* 1. Heavy-Wall Working Barrel (Outer static cylinder) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 3.2, 20, 1, true]} />
        <meshStandardMaterial {...barrelSteel} transparent opacity={0.7} />
      </mesh>
      {/* Barrel Top & Bottom Collars */}
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.2, 20]} />
        <meshStandardMaterial {...barrelSteel} />
      </mesh>
      <mesh position={[0, -1.6, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.2, 20]} />
        <meshStandardMaterial {...barrelSteel} />
      </mesh>

      {/* 2. Reciprocating Pump Plunger with Traveling Valve Assembly */}
      <group ref={plungerRef}>
        {/* Precision Ground Chrome Plunger Body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.19, 0.19, 1.8, 20]} />
          <meshStandardMaterial {...chromePlunger} />
        </mesh>
        {/* Traveling Valve Cage & Ball */}
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.25, 16]} />
          <meshStandardMaterial {...valveBrass} />
        </mesh>
      </group>

      {/* 3. Stationary Standing Valve Assembly at Base of Barrel */}
      <group position={[0, -1.3, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.35, 16]} />
          <meshStandardMaterial {...valveBrass} />
        </mesh>
        {/* Hardened Tungsten Carbide Ball Valve */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* 4. Intake Strainer / Mud Anchor Screen at Pump Suction */}
      <mesh position={[0, -2.1, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.9, 16]} />
        <meshStandardMaterial color="#334155" wireframe />
      </mesh>

      {/* 5. Health Status Ring indicator */}
      <mesh position={[0, 1.75, 0]}>
        <torusGeometry args={[0.32, 0.04, 12, 32]} />
        <meshBasicMaterial color={efficiencyColor} />
      </mesh>
    </group>
  );
}
