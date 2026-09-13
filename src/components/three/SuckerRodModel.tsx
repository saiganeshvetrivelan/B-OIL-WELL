import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  srpSpeed: number;
  strokeLength: number;
  wellDepth?: number;
  isActive?: boolean;
}

export default function SuckerRodModel({ 
  srpSpeed, 
  strokeLength, 
  wellDepth = 32,
  isActive = true 
}: Props) {
  const rodGroup = useRef<THREE.Group>(null);
  const currentAngle = useRef(0);

  // Synchronized vertical reciprocation with surface pumping beam
  useFrame((_, delta) => {
    const spm = isActive ? Math.max(0, srpSpeed) : 0;
    if (spm > 0) {
      const angularVelocity = spm * ((Math.PI * 2) / 60);
      currentAngle.current += delta * angularVelocity;
    }

    // Exact match with surface carrier bar displacement
    const stroke3D = Math.max(0.4, Math.min(1.4, (strokeLength || 2.0) * 0.4));
    const rodLift = - (stroke3D / 2) * Math.cos(currentAngle.current);

    if (rodGroup.current) {
      rodGroup.current.position.y = rodLift;
    }
  });

  const rodSteel = { color: '#e2e8f0', metalness: 0.95, roughness: 0.2 };
  const couplingSteel = { color: '#94a3b8', metalness: 0.9, roughness: 0.25 };

  // Couplings spaced every 3.5m along the sucker rod string
  const couplingDepths = [];
  for (let y = -2; y >= -wellDepth; y -= 3.5) {
    couplingDepths.push(y);
  }

  return (
    <group position={[-1.5, 0, 0]}>
      <group ref={rodGroup}>
        {/* Continuous Solid Steel Sucker Rod (Extending from Surface +2.8 to Pump Depth) */}
        <mesh position={[0, (-wellDepth + 2.8) / 2, 0]}>
          <cylinderGeometry args={[0.035, 0.035, wellDepth + 2.8, 12]} />
          <meshStandardMaterial {...rodSteel} />
        </mesh>

        {/* API Threaded Rod Couplings (Box-and-Pin Joint Sleeves) */}
        {couplingDepths.map((y) => (
          <mesh key={`coup-${y}`} position={[0, y, 0]}>
            <cylinderGeometry args={[0.065, 0.065, 0.24, 12]} />
            <meshStandardMaterial {...couplingSteel} />
          </mesh>
        ))}

        {/* Valve Rod / Plunger Connector Pin at bottom */}
        <mesh position={[0, -wellDepth, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.4, 12]} />
          <meshStandardMaterial {...couplingSteel} />
        </mesh>
      </group>
    </group>
  );
}
