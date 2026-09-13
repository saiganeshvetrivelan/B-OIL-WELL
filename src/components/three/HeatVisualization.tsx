import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  temperature: number;
  steamRate: number;
  soakDuration?: number;
  cssPhase: string;
}

export default function HeatVisualization({ 
  temperature, 
  steamRate, 
  soakDuration = 3.0, 
  cssPhase 
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const time = useRef(0);

  // Dynamic heat conduction radius scaled by steam injection rate, soaking duration, and reservoir temperature
  const normalizedSteam = Math.max(0.6, Math.min(1.5, steamRate / 85));
  const soakMultiplier = 1 + ((soakDuration - 2.0) / 3.0) * 0.45; // 2.0 to 5.0 days scaling
  
  // During soaking, heat diffuses wider throughout reservoir
  const baseRadius = (3.5 + (temperature / 180) * 3.0) * normalizedSteam * (cssPhase === 'soaking' ? soakMultiplier : 1.0);

  useFrame((_, delta) => {
    time.current += delta;
    if (groupRef.current && cssPhase === 'injection') {
      // Subtle rhythmic thermal pulsation during active high-pressure steam injection
      const scale = 1 + Math.sin(time.current * 3.5) * 0.05;
      groupRef.current.scale.set(scale, 1, scale);
    } else if (groupRef.current && cssPhase === 'soaking') {
      // Slow, wide heat diffusion breathing effect
      const scale = 1 + Math.sin(time.current * 1.5) * 0.03;
      groupRef.current.scale.set(scale * soakMultiplier, 1, scale * soakMultiplier);
    } else if (groupRef.current) {
      groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.05);
    }
  });

  const isHot = temperature > 125;
  const innerColor = new THREE.Color(isHot ? '#ea580c' : '#f59e0b');
  const outerColor = new THREE.Color('#78350f');

  return (
    <group ref={groupRef} position={[-1.5, -29, 0]} rotation={[Math.PI / 2, 0, 0]}>
      {[0, 1, 2, 3, 4].map((i) => {
        const radius = 0.8 + i * (baseRadius / 4.5);
        const ratio = i / 4;
        const color = innerColor.clone().lerp(outerColor, ratio);
        
        return (
          <mesh key={i}>
            <torusGeometry args={[radius, 0.22, 12, 48]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={Math.max(0.08, 0.5 - ratio * 0.35)} 
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
