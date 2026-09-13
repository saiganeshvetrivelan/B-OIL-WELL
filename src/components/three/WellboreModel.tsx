import React from 'react';

interface Props {
  depth?: number;
  fluidLevel?: number; // e.g. 20-80 meters normalized
}

export default function WellboreModel({ depth = 35, fluidLevel = 42 }: Props) {
  const casingSteel = { color: '#64748b', metalness: 0.85, roughness: 0.35, transparent: true, opacity: 0.38 };
  const casingCollar = { color: '#94a3b8', metalness: 0.9, roughness: 0.3 };
  const tubingSteel = { color: '#cbd5e1', metalness: 0.8, roughness: 0.35 };
  const perforationGold = { color: '#f59e0b', metalness: 0.9, roughness: 0.2 };
  const fluidColor = { color: '#1e293b', transparent: true, opacity: 0.65, roughness: 0.1 };

  // Generate casing collars every 5 depth units
  const collarPositions = [];
  for (let y = -4; y >= -depth; y -= 5) {
    collarPositions.push(y);
  }

  // Calculate fluid level height inside annulus
  // fluidLevel 40m -> y ~ -14
  const fluidY = -Math.min(depth - 2, Math.max(5, fluidLevel * 0.35));
  const fluidHeight = depth + fluidY;

  return (
    <group position={[-1.5, 0, 0]}>
      {/* 1. Surface Casing (Upper thick conductor string: 0 to -8) */}
      <mesh position={[0, -4, 0]}>
        <cylinderGeometry args={[0.65, 0.65, 8, 24, 1, true]} />
        <meshStandardMaterial {...casingSteel} opacity={0.45} />
      </mesh>
      {/* Surface Casing Shoe */}
      <mesh position={[0, -8, 0]}>
        <cylinderGeometry args={[0.68, 0.62, 0.4, 24]} />
        <meshStandardMaterial {...casingCollar} />
      </mesh>

      {/* 2. Main Production Casing (Cutaway continuous cylinder 0 to -depth) */}
      <mesh position={[0, -depth / 2, 0]}>
        <cylinderGeometry args={[0.5, 0.5, depth, 24, 1, true]} />
        <meshStandardMaterial {...casingSteel} />
      </mesh>

      {/* Casing Collars (Threaded joints) */}
      {collarPositions.map((pos) => (
        <mesh key={pos} position={[0, pos, 0]}>
          <cylinderGeometry args={[0.54, 0.54, 0.28, 20]} />
          <meshStandardMaterial {...casingCollar} />
        </mesh>
      ))}

      {/* 3. Production Tubing String (Interior string: 0 to -32) */}
      <mesh position={[0, -16, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 32, 20]} />
        <meshStandardMaterial {...tubingSteel} />
      </mesh>

      {/* Tubing Centralizers / Anchors */}
      {[-10, -20, -28].map((y) => (
        <mesh key={`cent-${y}`} position={[0, y, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.3, 8]} />
          <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}

      {/* 4. Annular Fluid Column (Dynamic fluid level) */}
      {fluidHeight > 0 && (
        <mesh position={[0, fluidY - fluidHeight / 2, 0]}>
          <cylinderGeometry args={[0.47, 0.47, fluidHeight, 16]} />
          <meshStandardMaterial {...fluidColor} />
        </mesh>
      )}

      {/* 5. Production Perforated Interval (At pay zone: y = -26 to -32) */}
      <group position={[0, -29, 0]}>
        {/* Slotted Liner / Perforated Casing Jacket */}
        <mesh>
          <cylinderGeometry args={[0.52, 0.52, 6, 20, 1, true]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} wireframe={false} opacity={0.6} transparent />
        </mesh>
        {/* Discrete Perforation Tunnels / Injection Ports */}
        {Array.from({ length: 18 }).map((_, i) => {
          const angle = (i * Math.PI) / 4;
          const yOff = (i - 9) * 0.3;
          return (
            <mesh 
              key={`perf-${i}`} 
              position={[Math.cos(angle) * 0.51, yOff, Math.sin(angle) * 0.51]}
              rotation={[0, -angle, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.04, 0.04, 0.18, 8]} />
              <meshStandardMaterial {...perforationGold} />
            </mesh>
          );
        })}
      </group>

      {/* 6. Casing Guide Shoe / Bull Plug (Bottom of well at -depth) */}
      <mesh position={[0, -depth - 0.3, 0]}>
        <cylinderGeometry args={[0.5, 0.3, 0.6, 20]} />
        <meshStandardMaterial {...casingCollar} />
      </mesh>
    </group>
  );
}
