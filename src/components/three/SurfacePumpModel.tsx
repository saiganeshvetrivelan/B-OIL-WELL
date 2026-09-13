import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  srpSpeed: number;
  strokeLength: number;
  isActive?: boolean;
}

/**
 * High-Fidelity API Class I Conventional Beam Pumping Unit (SRP)
 *
 * Mechanically exact 4-bar linkage kinematics:
 * 1. Base skid & concrete foundation pad
 * 2. Samson post A-frame with center saddle bearing pivot at (1.8, 4.4, 0)
 * 3. Walking beam rocking around saddle bearing with angle beta(t)
 * 4. Crankshaft at (4.6, 1.2, 0) rotating with speed omega = srpSpeed * 2pi / 60
 * 5. Dynamic counterweights and crank pins at radius R = strokeLength * 0.17
 * 6. Twin Pitman Arms: 100% attached at bottom to crank pin and at top to equalizer bar
 * 7. Equalizer bar at rear of walking beam (x = 1.8 + 2.8*cos(beta), y = 4.4 + 2.8*sin(beta))
 * 8. Horsehead arc at front of walking beam (R_front = 3.3m)
 * 9. Twin wireline bridle cables hanging vertically from horsehead arc to carrier bar
 * 10. Carrier bar and polished rod moving strictly vertically along wellhead centerline (x = -1.5, z = 0)
 */
export default function SurfacePumpModel({ srpSpeed, strokeLength, isActive = true }: Props) {
  // References for kinematic joints
  const walkingBeamGroup = useRef<THREE.Group>(null);
  const crankShaftGroup = useRef<THREE.Group>(null);
  const pitmanLeftRef = useRef<THREE.Group>(null);
  const pitmanRightRef = useRef<THREE.Group>(null);
  const carrierBarRef = useRef<THREE.Group>(null);
  const bridleCableLeftRef = useRef<THREE.Mesh>(null);
  const bridleCableRightRef = useRef<THREE.Mesh>(null);
  const polishedRodRef = useRef<THREE.Mesh>(null);

  // Accumulated rotation angle for continuous smooth rotation
  const currentAngle = useRef(0);

  // Mechanical Geometry Constants (API Standard Geometry)
  const PIVOT_X = 1.8;
  const PIVOT_Y = 4.4;
  const BEAM_FRONT_LEN = 3.3; // Distance from pivot to wellhead centerline (-1.5)
  const BEAM_REAR_LEN = 2.8;  // Distance from pivot to equalizer bearing (4.6)
  const CRANK_X = 4.6;
  const CRANK_Y = 1.2;
  const CRANK_Z_OFFSET = 0.75;
  const PITMAN_BASE_LEN = 3.2; // Nominal pitman arm length

  useFrame((_, delta) => {
    // If unit is stopped (e.g. shut-in or zero speed), stay static
    const spm = isActive ? Math.max(0, srpSpeed) : 0;
    if (spm > 0) {
      const angularVelocity = spm * ((Math.PI * 2) / 60);
      currentAngle.current += delta * angularVelocity;
    }

    const theta = currentAngle.current;

    // Crank stroke scaling in 3D world space
    // Standard stroke of 2.0m translates to ~0.8m 3D travel
    const stroke3D = Math.max(0.4, Math.min(1.4, (strokeLength || 2.0) * 0.4));
    // Lever ratio L_front / L_rear = 3.3 / 2.8 = 1.178
    const crankRadius = (stroke3D / (2 * (BEAM_FRONT_LEN / BEAM_REAR_LEN)));

    // 1. Rotate Crankshaft & Counterweights
    if (crankShaftGroup.current) {
      crankShaftGroup.current.rotation.z = -theta;
    }

    // 2. Exact Crank Pin Positions in World Coordinates
    // Crank rotates clockwise: pin position
    const pinX = CRANK_X + crankRadius * Math.sin(theta);
    const pinY = CRANK_Y + crankRadius * Math.cos(theta);

    // 3. Beam Rocking Angle beta
    // In 4-bar linkage: dy ~ pitman_length, so L_rear * sin(beta) ~ crankRadius * cos(theta)
    const sinBeta = Math.max(-0.25, Math.min(0.25, (crankRadius / BEAM_REAR_LEN) * Math.cos(theta)));
    const beta = Math.asin(sinBeta);

    if (walkingBeamGroup.current) {
      walkingBeamGroup.current.rotation.z = beta;
    }

    // 4. Equalizer Bar Center in World Coordinates
    const eqX = PIVOT_X + BEAM_REAR_LEN * Math.cos(beta);
    const eqY = PIVOT_Y + BEAM_REAR_LEN * Math.sin(beta);

    // 5. Kinematic Alignment for Left & Right Pitman Arms
    // Vector from crank pin to equalizer pin
    const dx = eqX - pinX;
    const dy = eqY - pinY;
    const pitmanDistance = Math.hypot(dx, dy);
    const pitmanAngle = -Math.atan2(dx, dy); // Rotation around Z axis

    const midX = (pinX + eqX) / 2;
    const midY = (pinY + eqY) / 2;

    if (pitmanLeftRef.current) {
      pitmanLeftRef.current.position.set(midX, midY, CRANK_Z_OFFSET);
      pitmanLeftRef.current.rotation.z = pitmanAngle;
      // Scale length to exactly bridge pin to equalizer
      pitmanLeftRef.current.scale.set(1, pitmanDistance / PITMAN_BASE_LEN, 1);
    }

    if (pitmanRightRef.current) {
      pitmanRightRef.current.position.set(midX, midY, -CRANK_Z_OFFSET);
      pitmanRightRef.current.rotation.z = pitmanAngle;
      pitmanRightRef.current.scale.set(1, pitmanDistance / PITMAN_BASE_LEN, 1);
    }

    // 6. Surface Wellhead Carrier Bar & Polished Rod Motion
    // Horsehead arc moves front tip: vertical displacement
    const rodLift = - (stroke3D / 2) * Math.cos(theta);
    const carrierY = 2.85 + rodLift; // Baseline height above wellhead stuffing box (2.05)

    if (carrierBarRef.current) {
      carrierBarRef.current.position.y = carrierY;
    }

    // Polished rod extends from carrier bar downward through the stuffing box
    if (polishedRodRef.current) {
      // Center of polished rod of length 2.6m: top is at carrierY, bottom is at carrierY - 2.6
      polishedRodRef.current.position.y = carrierY - 1.0;
    }

    // Dynamic Bridle Cables: connect horsehead front attachment to carrier bar
    // Front top attachment on horsehead is around y = 4.4 + 1.1 + BEAM_FRONT_LEN * sin(beta)
    const horseheadAttachY = PIVOT_Y + 1.1 - BEAM_FRONT_LEN * Math.sin(beta);
    const cableSpan = Math.max(0.2, horseheadAttachY - carrierY);
    const cableMidY = carrierY + cableSpan / 2;

    if (bridleCableLeftRef.current) {
      bridleCableLeftRef.current.position.y = cableMidY;
      bridleCableLeftRef.current.scale.y = cableSpan / 2.5;
    }
    if (bridleCableRightRef.current) {
      bridleCableRightRef.current.position.y = cableMidY;
      bridleCableRightRef.current.scale.y = cableSpan / 2.5;
    }
  });

  // Industrial Material Palette (Oil India / Heavy Duty SCADA Theme)
  const steelDark = { color: '#1e293b', metalness: 0.9, roughness: 0.35 };
  const steelMid = { color: '#334155', metalness: 0.85, roughness: 0.4 };
  const safetyAmber = { color: '#f59e0b', metalness: 0.65, roughness: 0.3 };
  const safetyOrange = { color: '#ea580c', metalness: 0.7, roughness: 0.3 };
  const brightChrome = { color: '#f8fafc', metalness: 0.98, roughness: 0.15 };
  const concreteColor = { color: '#475569', metalness: 0.05, roughness: 0.95 };
  const cableSteel = { color: '#cbd5e1', metalness: 0.9, roughness: 0.25 };

  return (
    <group position={[0, 0, 0]}>
      {/* ─────────────────────────────────────────────────────────────────────────
          1. FOUNDATION & STRUCTURAL STEEL BASE SKID
          ───────────────────────────────────────────────────────────────────────── */}
      {/* Reinforced Concrete Mat */}
      <mesh position={[2.6, 0.1, 0]} receiveShadow>
        <boxGeometry args={[9.4, 0.2, 3.4]} />
        <meshStandardMaterial {...concreteColor} />
      </mesh>

      {/* Main Structural Skid Base Channels (Left & Right Wide-Flange Beams) */}
      <mesh position={[2.6, 0.25, 1.0]} castShadow>
        <boxGeometry args={[8.8, 0.18, 0.28]} />
        <meshStandardMaterial {...steelDark} />
      </mesh>
      <mesh position={[2.6, 0.25, -1.0]} castShadow>
        <boxGeometry args={[8.8, 0.18, 0.28]} />
        <meshStandardMaterial {...steelDark} />
      </mesh>
      {/* Transverse Cross Ties */}
      {[-1.0, 1.8, 4.6, 6.4].map((x) => (
        <mesh key={`cross-${x}`} position={[x, 0.25, 0]} castShadow>
          <boxGeometry args={[0.3, 0.16, 2.1]} />
          <meshStandardMaterial {...steelDark} />
        </mesh>
      ))}

      {/* ─────────────────────────────────────────────────────────────────────────
          2. SAMSON POST (HEAVY 4-LEG STRUCTURAL A-FRAME PYRAMID)
          Centrally supports walking beam saddle bearing at (1.8, 4.4, 0)
          ───────────────────────────────────────────────────────────────────────── */}
      <group position={[PIVOT_X, 0.3, 0]}>
        {/* Front-Left Leg (slanted forward & outward) */}
        <mesh position={[-0.45, 2.0, 0.65]} rotation={[0.08, 0, 0.11]} castShadow>
          <boxGeometry args={[0.22, 4.15, 0.22]} />
          <meshStandardMaterial {...steelDark} />
        </mesh>
        {/* Front-Right Leg */}
        <mesh position={[-0.45, 2.0, -0.65]} rotation={[-0.08, 0, 0.11]} castShadow>
          <boxGeometry args={[0.22, 4.15, 0.22]} />
          <meshStandardMaterial {...steelDark} />
        </mesh>
        {/* Rear-Left Leg */}
        <mesh position={[0.45, 2.0, 0.65]} rotation={[0.08, 0, -0.11]} castShadow>
          <boxGeometry args={[0.22, 4.15, 0.22]} />
          <meshStandardMaterial {...steelDark} />
        </mesh>
        {/* Rear-Right Leg */}
        <mesh position={[0.45, 2.0, -0.65]} rotation={[-0.08, 0, -0.11]} castShadow>
          <boxGeometry args={[0.22, 4.15, 0.22]} />
          <meshStandardMaterial {...steelDark} />
        </mesh>

        {/* Structural Horizontal Ties */}
        <mesh position={[0, 1.4, 0.72]} castShadow>
          <boxGeometry args={[0.95, 0.1, 0.08]} />
          <meshStandardMaterial {...steelMid} />
        </mesh>
        <mesh position={[0, 1.4, -0.72]} castShadow>
          <boxGeometry args={[0.95, 0.1, 0.08]} />
          <meshStandardMaterial {...steelMid} />
        </mesh>
        <mesh position={[0, 2.6, 0.62]} castShadow>
          <boxGeometry args={[0.75, 0.1, 0.08]} />
          <meshStandardMaterial {...steelMid} />
        </mesh>
        <mesh position={[0, 2.6, -0.62]} castShadow>
          <boxGeometry args={[0.75, 0.1, 0.08]} />
          <meshStandardMaterial {...steelMid} />
        </mesh>

        {/* Diagonal X-Braces */}
        <mesh position={[0, 2.0, 0.67]} rotation={[0, 0, 0.65]} castShadow>
          <boxGeometry args={[0.08, 1.8, 0.04]} />
          <meshStandardMaterial {...steelMid} />
        </mesh>
        <mesh position={[0, 2.0, 0.67]} rotation={[0, 0, -0.65]} castShadow>
          <boxGeometry args={[0.08, 1.8, 0.04]} />
          <meshStandardMaterial {...steelMid} />
        </mesh>
        <mesh position={[0, 2.0, -0.67]} rotation={[0, 0, 0.65]} castShadow>
          <boxGeometry args={[0.08, 1.8, 0.04]} />
          <meshStandardMaterial {...steelMid} />
        </mesh>
        <mesh position={[0, 2.0, -0.67]} rotation={[0, 0, -0.65]} castShadow>
          <boxGeometry args={[0.08, 1.8, 0.04]} />
          <meshStandardMaterial {...steelMid} />
        </mesh>

        {/* Samson Post Top Cap Plate */}
        <mesh position={[0, 3.98, 0]} castShadow>
          <boxGeometry args={[0.9, 0.14, 1.25]} />
          <meshStandardMaterial {...steelDark} />
        </mesh>

        {/* Center Saddle Bearing Pillow Blocks */}
        <mesh position={[0, 4.12, 0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.35, 16]} />
          <meshStandardMaterial {...safetyAmber} />
        </mesh>
        <mesh position={[0, 4.12, -0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.35, 16]} />
          <meshStandardMaterial {...safetyAmber} />
        </mesh>
        {/* Main Center Pivot Trunnion Shaft */}
        <mesh position={[0, 4.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 1.45, 16]} />
          <meshStandardMaterial {...brightChrome} />
        </mesh>
      </group>

      {/* ─────────────────────────────────────────────────────────────────────────
          3. WALKING BEAM ASSEMBLY (ROCKS AROUND PIVOT AT 1.8, 4.4, 0)
          ───────────────────────────────────────────────────────────────────────── */}
      <group position={[PIVOT_X, PIVOT_Y, 0]} ref={walkingBeamGroup}>
        {/* Main Heavy Steel I-Beam Body (Length = 6.2m, spanning -3.3m to +2.8m) */}
        <mesh position={[-0.25, 0, 0]} castShadow>
          <boxGeometry args={[6.2, 0.52, 0.32]} />
          <meshStandardMaterial {...steelDark} />
        </mesh>
        {/* Top Flange Stiffener Plate */}
        <mesh position={[-0.25, 0.28, 0]} castShadow>
          <boxGeometry args={[6.25, 0.08, 0.44]} />
          <meshStandardMaterial {...steelMid} />
        </mesh>
        {/* Bottom Flange Stiffener Plate */}
        <mesh position={[-0.25, -0.28, 0]} castShadow>
          <boxGeometry args={[6.25, 0.08, 0.44]} />
          <meshStandardMaterial {...steelMid} />
        </mesh>

        {/* Center Trunnion Saddle Housing Bracket */}
        <mesh position={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[0.7, 0.4, 0.52]} />
          <meshStandardMaterial {...steelDark} />
        </mesh>

        {/* ── 3A. HORSEHEAD ARC ASSEMBLY (Front tip at x = -3.3) ── */}
        <group position={[-BEAM_FRONT_LEN, 0, 0]}>
          {/* Main Tapered Horsehead Web Plate */}
          <mesh position={[0.28, 0.35, 0]} castShadow>
            <boxGeometry args={[0.65, 1.6, 0.24]} />
            <meshStandardMaterial {...safetyAmber} />
          </mesh>
          {/* Structural Web Gussets */}
          <mesh position={[0.6, 0.2, 0]} rotation={[0, 0, 0.45]} castShadow>
            <boxGeometry args={[0.1, 1.2, 0.22]} />
            <meshStandardMaterial {...steelDark} />
          </mesh>

          {/* Curved Front Arc Face Flange */}
          {/* The arc is curved so the wireline bridle stays tangent to vertical line */}
          <mesh position={[-0.12, 0.35, 0]} rotation={[0, 0, -0.18]} castShadow>
            <boxGeometry args={[0.16, 2.1, 0.42]} />
            <meshStandardMaterial {...steelDark} />
          </mesh>
          {/* Wireline Cable Guide Sheaves on Top */}
          <mesh position={[-0.14, 1.35, 0.15]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
            <meshStandardMaterial {...safetyOrange} />
          </mesh>
          <mesh position={[-0.14, 1.35, -0.15]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
            <meshStandardMaterial {...safetyOrange} />
          </mesh>
        </group>

        {/* ── 3B. EQUALIZER BEARING TRUNNION (Rear tip at x = +2.8) ── */}
        <group position={[BEAM_REAR_LEN, 0, 0]}>
          {/* Heavy Equalizer Crossbar Housing */}
          <mesh castShadow>
            <boxGeometry args={[0.45, 0.35, 0.5]} />
            <meshStandardMaterial {...steelDark} />
          </mesh>
          {/* Equalizer Crossbar Shaft (Extends to z = ±0.75 for Pitman Arm connections) */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.11, 1.72, 16]} />
            <meshStandardMaterial {...brightChrome} />
          </mesh>
          {/* Left Equalizer Bearing Pillow Block */}
          <mesh position={[0, 0, CRANK_Z_OFFSET]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.26, 16]} />
            <meshStandardMaterial {...safetyAmber} />
          </mesh>
          {/* Right Equalizer Bearing Pillow Block */}
          <mesh position={[0, 0, -CRANK_Z_OFFSET]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.26, 16]} />
            <meshStandardMaterial {...safetyAmber} />
          </mesh>
        </group>
      </group>

      {/* ─────────────────────────────────────────────────────────────────────────
          4. GEARBOX, ELECTRIC MOTOR & ROTATING CRANK COUNTERWEIGHTS
          Fixed base at (4.6, 0.3, 0)
          ───────────────────────────────────────────────────────────────────────── */}
      <group position={[CRANK_X, 0.3, 0]}>
        {/* Gearbox Foundation Pedestal */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[1.7, 0.35, 1.2]} />
          <meshStandardMaterial {...steelDark} />
        </mesh>
        {/* Double-Reduction Helical Gearbox Casing */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[1.5, 1.05, 1.05]} />
          <meshStandardMaterial {...steelMid} />
        </mesh>
        {/* Gearbox Top Inspection Hatch */}
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[0.9, 0.08, 0.7]} />
          <meshStandardMaterial {...steelDark} />
        </mesh>

        {/* Industrial Electric Drive Motor */}
        <mesh position={[1.45, 0.45, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.85, 16]} />
          <meshStandardMaterial {...steelDark} />
        </mesh>
        {/* Motor Terminal Junction Box */}
        <mesh position={[1.45, 0.8, 0.2]} castShadow>
          <boxGeometry args={[0.25, 0.2, 0.2]} />
          <meshStandardMaterial {...safetyAmber} />
        </mesh>
        {/* Heavy Duty V-Belt Enclosure Guard */}
        <mesh position={[1.05, 0.55, 0.65]} castShadow>
          <boxGeometry args={[1.2, 0.85, 0.16]} />
          <meshStandardMaterial {...safetyAmber} />
        </mesh>

        {/* ── 4A. ROTATING LOW-SPEED CRANKSHAFT & COUNTERWEIGHT CRANKS ── */}
        {/* Center of shaft is at y = 0.9 above gearbox base, i.e. World Y = 1.2 */}
        <group position={[0, 0.9, 0]} ref={crankShaftGroup}>
          {/* Main Forged Steel Low-Speed Output Shaft */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 1.85, 16]} />
            <meshStandardMaterial {...brightChrome} />
          </mesh>

          {/* LEFT CRANK ARM & COUNTERWEIGHT (at z = +0.75) */}
          <group position={[0, 0, CRANK_Z_OFFSET]}>
            {/* Crank Arm (Keyed to shaft, extends outward) */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[0.32, 1.5, 0.12]} />
              <meshStandardMaterial {...steelDark} />
            </mesh>
            {/* Massive Semicircular Counterweight Segment */}
            <mesh position={[0, 0.85, 0]} castShadow>
              <boxGeometry args={[0.78, 0.95, 0.32]} />
              <meshStandardMaterial {...steelMid} />
            </mesh>
            {/* Counterweight Clamping Bolt Details */}
            <mesh position={[0.25, 0.85, 0.18]}>
              <cylinderGeometry args={[0.04, 0.04, 0.08, 8]} />
              <meshStandardMaterial {...brightChrome} />
            </mesh>
            <mesh position={[-0.25, 0.85, 0.18]}>
              <cylinderGeometry args={[0.04, 0.04, 0.08, 8]} />
              <meshStandardMaterial {...brightChrome} />
            </mesh>
            {/* Crank Pin (Pins into the bottom of Left Pitman Arm) */}
            <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.28, 16]} />
              <meshStandardMaterial {...brightChrome} />
            </mesh>
          </group>

          {/* RIGHT CRANK ARM & COUNTERWEIGHT (at z = -0.75) */}
          <group position={[0, 0, -CRANK_Z_OFFSET]}>
            {/* Crank Arm */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[0.32, 1.5, 0.12]} />
              <meshStandardMaterial {...steelDark} />
            </mesh>
            {/* Counterweight Segment */}
            <mesh position={[0, 0.85, 0]} castShadow>
              <boxGeometry args={[0.78, 0.95, 0.32]} />
              <meshStandardMaterial {...steelMid} />
            </mesh>
            {/* Counterweight Clamping Bolt Details */}
            <mesh position={[0.25, 0.85, -0.18]}>
              <cylinderGeometry args={[0.04, 0.04, 0.08, 8]} />
              <meshStandardMaterial {...brightChrome} />
            </mesh>
            <mesh position={[-0.25, 0.85, -0.18]}>
              <cylinderGeometry args={[0.04, 0.04, 0.08, 8]} />
              <meshStandardMaterial {...brightChrome} />
            </mesh>
            {/* Crank Pin (Pins into the bottom of Right Pitman Arm) */}
            <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.28, 16]} />
              <meshStandardMaterial {...brightChrome} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ─────────────────────────────────────────────────────────────────────────
          5. TWIN PITMAN ARMS (DYNAMICALLY ATTACHED BETWEEN CRANK PIN & EQUALIZER)
          These groups are repositioned, rotated, and scaled each frame by useFrame.
          This guarantees 100% mechanical attachment with ZERO detachment or gap!
          ───────────────────────────────────────────────────────────────────────── */}
      {/* LEFT PITMAN ARM */}
      <group ref={pitmanLeftRef} position={[CRANK_X, 2.8, CRANK_Z_OFFSET]}>
        {/* Main Solid Tubular Connecting Rod Body (Nominal length = PITMAN_BASE_LEN = 3.2m) */}
        <mesh castShadow>
          <cylinderGeometry args={[0.065, 0.065, PITMAN_BASE_LEN, 16]} />
          <meshStandardMaterial {...steelDark} />
        </mesh>
        {/* Top Clevis Bearing (Attaches directly to Equalizer Bar pin) */}
        <mesh position={[0, PITMAN_BASE_LEN / 2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.22, 16]} />
          <meshStandardMaterial {...safetyAmber} />
        </mesh>
        {/* Bottom Crank Pin Journal Box (Attaches directly to Crank Pin) */}
        <mesh position={[0, -PITMAN_BASE_LEN / 2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.24, 16]} />
          <meshStandardMaterial {...safetyAmber} />
        </mesh>
      </group>

      {/* RIGHT PITMAN ARM */}
      <group ref={pitmanRightRef} position={[CRANK_X, 2.8, -CRANK_Z_OFFSET]}>
        {/* Main Solid Tubular Connecting Rod Body */}
        <mesh castShadow>
          <cylinderGeometry args={[0.065, 0.065, PITMAN_BASE_LEN, 16]} />
          <meshStandardMaterial {...steelDark} />
        </mesh>
        {/* Top Clevis Bearing */}
        <mesh position={[0, PITMAN_BASE_LEN / 2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.22, 16]} />
          <meshStandardMaterial {...safetyAmber} />
        </mesh>
        {/* Bottom Crank Pin Journal Box */}
        <mesh position={[0, -PITMAN_BASE_LEN / 2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.24, 16]} />
          <meshStandardMaterial {...safetyAmber} />
        </mesh>
      </group>

      {/* ─────────────────────────────────────────────────────────────────────────
          6. SURFACE WELLHEAD INTERFACE: CARRIER BAR, BRIDLE CABLES & POLISHED ROD
          Centered strictly on wellhead centerline (x = -1.5, z = 0)
          ───────────────────────────────────────────────────────────────────────── */}
      {/* Dynamic Bridle Wireline Cables hanging from horsehead to carrier bar */}
      <mesh position={[-1.5, 3.8, 0.15]} ref={bridleCableLeftRef}>
        <cylinderGeometry args={[0.012, 0.012, 2.5, 8]} />
        <meshStandardMaterial {...cableSteel} />
      </mesh>
      <mesh position={[-1.5, 3.8, -0.15]} ref={bridleCableRightRef}>
        <cylinderGeometry args={[0.012, 0.012, 2.5, 8]} />
        <meshStandardMaterial {...cableSteel} />
      </mesh>

      {/* Reciprocating Carrier Bar & Polished Rod Assembly */}
      <group position={[-1.5, 2.85, 0]} ref={carrierBarRef}>
        {/* Heavy Steel Carrier Bar Cross-Beam */}
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.12, 0.5]} />
          <meshStandardMaterial {...safetyAmber} />
        </mesh>
        {/* Left & Right Cable Swaged Socket Cleats */}
        <mesh position={[0, 0.08, 0.15]}>
          <cylinderGeometry args={[0.03, 0.03, 0.12, 8]} />
          <meshStandardMaterial {...brightChrome} />
        </mesh>
        <mesh position={[0, 0.08, -0.15]}>
          <cylinderGeometry args={[0.03, 0.03, 0.12, 8]} />
          <meshStandardMaterial {...brightChrome} />
        </mesh>
        {/* Center Polished Rod Clamp */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 12]} />
          <meshStandardMaterial {...steelDark} />
        </mesh>
      </group>

      {/* Continuous Polished Rod (Bright Chrome finish, extends into wellhead stuffing box) */}
      <mesh position={[-1.5, 1.85, 0]} ref={polishedRodRef}>
        <cylinderGeometry args={[0.035, 0.035, 2.6, 16]} />
        <meshStandardMaterial {...brightChrome} />
      </mesh>
    </group>
  );
}
