import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

// --- STAR TOPPER ---
export const StarTopper: React.FC<{ visible: boolean }> = ({ visible }) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.8;
    const innerRadius = 0.4;
    
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const a = (i / points) * Math.PI;
      const x = Math.cos(a + Math.PI / 2) * r;
      const y = Math.sin(a + Math.PI / 2) * r;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    s.closePath();
    return s;
  }, []);

  const ref = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    // Rotation
    if (ref.current) {
        ref.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
    // Pulse glow
    if (materialRef.current) {
        materialRef.current.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
    
    // Scale animation based on visibility
    const targetScale = visible ? 1 : 0;
    if (ref.current) {
        // Smooth lerp for appearance/disappearance
        ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group position={[0, 6.2, 0]} ref={ref}>
       <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
        <mesh castShadow>
            <extrudeGeometry args={[shape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.05, bevelSegments: 2 }]} />
            <meshStandardMaterial 
                ref={materialRef}
                color="#fbbf24" 
                emissive="#fbbf24"
                emissiveIntensity={0.8}
                roughness={0.1}
                metalness={1}
            />
        </mesh>
      </Float>
    </group>
  );
};
