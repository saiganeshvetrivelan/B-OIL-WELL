import React from 'react';

interface Props {
  onClick?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}

export default function WellheadModel({ onClick, onPointerOver, onPointerOut }: Props) {
  const castSteel = { color: '#334155', metalness: 0.85, roughness: 0.35 };
  const valveRed = { color: '#dc2626', metalness: 0.6, roughness: 0.4 };
  const flangeSteel = { color: '#475569', metalness: 0.9, roughness: 0.3 };
  const brassFitting = { color: '#d97706', metalness: 0.8, roughness: 0.25 };
  const gaugeWhite = { color: '#f8fafc', metalness: 0.1, roughness: 0.1 };

  return (
    <group 
      position={[-1.5, 0, 0]} 
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); onPointerOver?.(); }}
      onPointerOut={(e) => { e.stopPropagation(); onPointerOut?.(); }}
    >
      {/* 1. Surface Casing Flange (Base at Ground Level) */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.2, 24]} />
        <meshStandardMaterial {...flangeSteel} />
      </mesh>
      {/* Casing Spool Body */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.3, 24]} />
        <meshStandardMaterial {...castSteel} />
      </mesh>

      {/* 2. Tubing Head Spool */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.48, 0.48, 0.12, 24]} />
        <meshStandardMaterial {...flangeSteel} />
      </mesh>
      {/* Tubing Head Side Outlets (Annulus Valves) */}
      <group position={[0, 0.7, 0]}>
        <mesh position={[0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
          <meshStandardMaterial {...castSteel} />
        </mesh>
        <mesh position={[0.65, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.04, 16]} />
          <meshStandardMaterial {...valveRed} />
        </mesh>
        <mesh position={[-0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
          <meshStandardMaterial {...castSteel} />
        </mesh>
      </group>
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.12, 24]} />
        <meshStandardMaterial {...flangeSteel} />
      </mesh>

      {/* 3. Lower Master Gate Valve */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[0.35, 0.28, 0.35]} />
        <meshStandardMaterial {...castSteel} />
      </mesh>
      {/* Master Valve Handwheel */}
      <mesh position={[0.32, 1.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.18, 0.025, 8, 20]} />
        <meshStandardMaterial {...valveRed} />
      </mesh>

      {/* 4. Production Flow Tee / Cross */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.32, 20]} />
        <meshStandardMaterial {...castSteel} />
      </mesh>
      {/* Production Flow Wing Line (Extending left toward flowline manifold) */}
      <group position={[-0.45, 1.35, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.5, 16]} />
          <meshStandardMaterial {...castSteel} />
        </mesh>
        {/* Production Wing Valve */}
        <mesh position={[-0.1, 0, 0]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial {...castSteel} />
        </mesh>
        <mesh position={[-0.1, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.14, 0.02, 8, 16]} />
          <meshStandardMaterial {...valveRed} />
        </mesh>
        {/* Adjustable Choke Body */}
        <mesh position={[-0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.09, 0.2, 16]} />
          <meshStandardMaterial {...brassFitting} />
        </mesh>
      </group>

      {/* 5. Swab Valve (Top Master Valve) */}
      <mesh position={[0, 1.62, 0]} castShadow>
        <boxGeometry args={[0.3, 0.22, 0.3]} />
        <meshStandardMaterial {...castSteel} />
      </mesh>
      <mesh position={[0, 1.62, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.02, 8, 16]} />
        <meshStandardMaterial {...valveRed} />
      </mesh>

      {/* 6. Stuffing Box & Gland Nut (Where polished rod enters wellhead) */}
      <mesh position={[0, 1.85, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.25, 16]} />
        <meshStandardMaterial {...flangeSteel} />
      </mesh>
      <mesh position={[0, 2.02, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.1, 8]} />
        <meshStandardMaterial {...brassFitting} />
      </mesh>

      {/* 7. Wellhead Pressure Gauge atop the tree */}
      <group position={[0.22, 1.9, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
          <meshStandardMaterial {...brassFitting} />
        </mesh>
        <mesh position={[0.08, 0.08, 0]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.04, 20]} />
          <meshStandardMaterial {...castSteel} />
        </mesh>
        <mesh position={[0.1, 0.08, 0]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.085, 20]} />
          <meshBasicMaterial {...gaugeWhite} />
        </mesh>
      </group>
    </group>
  );
}
