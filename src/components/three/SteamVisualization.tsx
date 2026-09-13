import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  steamRate: number;
  cssPhase: string;
  steamTemperature: number;
  soakDuration?: number;
  srpSpeed?: number;
  isActive?: boolean;
}

export default function SteamVisualization({ 
  steamRate, 
  cssPhase, 
  steamTemperature, 
  soakDuration = 3.0,
  srpSpeed = 6.0,
  isActive = true 
}: Props) {
  const pointsRef = useRef<THREE.Points>(null);
  const fluidPointsRef = useRef<THREE.Points>(null);

  // 1. Steam particle positions & velocities
  const steamParticleCount = 90;
  const { steamPositions, steamVelocities } = useMemo(() => {
    const pos = new Float32Array(steamParticleCount * 3);
    const vel = new Float32Array(steamParticleCount * 3);

    for (let i = 0; i < steamParticleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.5 + Math.random() * 0.4;
      const y = -29 + (Math.random() - 0.5) * 5;

      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * r;

      const speed = 0.04 + Math.random() * 0.05;
      vel[i * 3] = Math.cos(angle) * speed;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 2] = Math.sin(angle) * speed;
    }
    return { steamPositions: pos, steamVelocities: vel };
  }, [steamParticleCount]);

  // 2. Heavy Crude Oil inflow / lift particles for PRODUCTION phase
  const oilParticleCount = 80;
  const { oilPositions, oilVelocities } = useMemo(() => {
    const pos = new Float32Array(oilParticleCount * 3);
    const vel = new Float32Array(oilParticleCount * 3);

    for (let i = 0; i < oilParticleCount; i++) {
      if (i < 40) {
        // Reservoir inflow particles (viscous crude entering casing perforations)
        const angle = Math.random() * Math.PI * 2;
        const r = 2.5 + Math.random() * 3.5;
        pos[i * 3] = Math.cos(angle) * r;
        pos[i * 3 + 1] = -29 + (Math.random() - 0.5) * 4;
        pos[i * 3 + 2] = Math.sin(angle) * r;
      } else {
        // Vertical wellbore lift particles (traveling up tubing string to surface)
        pos[i * 3] = (Math.random() - 0.5) * 0.15;
        pos[i * 3 + 1] = -29 + Math.random() * 28;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.15;
      }
    }
    return { oilPositions: pos, oilVelocities: vel };
  }, [oilParticleCount]);

  // Dynamic soak diffusion radius
  const soakRadius = 3.6 * (1 + ((soakDuration - 2.0) / 3.0) * 0.5);

  useFrame((_, delta) => {
    if (!isActive) return;

    // A. Animate Steam Injection Particles
    if (pointsRef.current && cssPhase === 'injection') {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const speedMult = Math.max(0.6, steamRate / 85);

      for (let i = 0; i < steamParticleCount; i++) {
        positions[i * 3] += steamVelocities[i * 3] * speedMult * 1.6;
        positions[i * 3 + 1] += steamVelocities[i * 3 + 1] * 0.5;
        positions[i * 3 + 2] += steamVelocities[i * 3 + 2] * speedMult * 1.6;

        // Reset if reached max dispersion radius
        const maxDist = 4.5 * (steamRate / 85);
        const dist = Math.sqrt(positions[i * 3] ** 2 + positions[i * 3 + 2] ** 2);
        if (dist > maxDist) {
          const angle = Math.random() * Math.PI * 2;
          const r = 0.45 + Math.random() * 0.2;
          positions[i * 3] = Math.cos(angle) * r;
          positions[i * 3 + 1] = -29 + (Math.random() - 0.5) * 5;
          positions[i * 3 + 2] = Math.sin(angle) * r;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // B. Animate Crude Oil Inflow & Lift Particles during PRODUCTION phase
    if (fluidPointsRef.current && cssPhase === 'production') {
      const positions = fluidPointsRef.current.geometry.attributes.position.array as Float32Array;
      const liftSpeed = Math.max(2.0, (srpSpeed / 6.0) * 4.5);

      for (let i = 0; i < oilParticleCount; i++) {
        if (i < 40) {
          // Move inward toward wellbore center
          const dx = -positions[i * 3];
          const dz = -positions[i * 3 + 2];
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist > 0.25) {
            positions[i * 3] += (dx / dist) * delta * 1.1;
            positions[i * 3 + 2] += (dz / dist) * delta * 1.1;
          } else {
            // Re-spawn outward in reservoir
            const angle = Math.random() * Math.PI * 2;
            const r = 3.5 + Math.random() * 2.5;
            positions[i * 3] = Math.cos(angle) * r;
            positions[i * 3 + 1] = -29 + (Math.random() - 0.5) * 4;
            positions[i * 3 + 2] = Math.sin(angle) * r;
          }
        } else {
          // Ascend up wellbore tubing toward surface at SRP lift speed
          positions[i * 3 + 1] += delta * liftSpeed;
          if (positions[i * 3 + 1] > 0.8) {
            positions[i * 3 + 1] = -29;
          }
        }
      }
      fluidPointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={[-1.5, 0, 0]}>
      {/* 1. Steam Injection Particle Field */}
      {cssPhase === 'injection' && (
        <points ref={pointsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[steamPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.32}
            color="#ffffff"
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {/* 2. Soaking Phase Thermal Diffusion Halo & Heat Zone */}
      {cssPhase === 'soaking' && (
        <mesh position={[0, -29, 0]}>
          <cylinderGeometry args={[soakRadius, soakRadius, 6.5, 24]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#ea580c"
            emissiveIntensity={0.4}
            transparent
            opacity={0.28}
          />
        </mesh>
      )}

      {/* 3. Production Phase Heavy Oil Inflow & Lift Streams */}
      {cssPhase === 'production' && (
        <points ref={fluidPointsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[oilPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.26}
            color="#f59e0b"
            transparent
            opacity={0.9}
          />
        </points>
      )}
    </group>
  );
}
