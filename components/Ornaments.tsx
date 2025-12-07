import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { OrnamentProps, TreeState } from '../types';
import { generateDualPositions } from '../utils/geometry';

export const Ornaments: React.FC<OrnamentProps> = ({ 
  count, 
  type, 
  color, 
  scaleRange, 
  treeState 
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);

  // Geometric Data
  const { scatterPositions, treePositions, randoms } = useMemo(() => {
    // Ornaments are slightly tighter than foliage for tree, wider for scatter
    return generateDualPositions(count, 20, 11, 4.5); 
  }, [count]);

  const currentProgress = useRef(0);

  // Initial Setup
  useLayoutEffect(() => {
    if (meshRef.current) {
      for (let i = 0; i < count; i++) {
        tempObject.position.set(scatterPositions[i*3], scatterPositions[i*3+1], scatterPositions[i*3+2]);
        const s = scaleRange[0] + randoms[i] * (scaleRange[1] - scaleRange[0]);
        tempObject.scale.set(s, s, s);
        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(i, tempObject.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [count, scatterPositions, randoms, scaleRange, tempObject]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Smooth Transition State
    const target = treeState === TreeState.TREE_SHAPE ? 1 : 0;
    // Non-linear transition for "heavier" feel than particles
    const lerpSpeed = type === 'box' ? 1.0 : 1.5; // Boxes move slower
    currentProgress.current = THREE.MathUtils.lerp(currentProgress.current, target, delta * lerpSpeed);
    
    const t = currentProgress.current;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Calculate Scatter Position (with float)
      const sx = scatterPositions[i3];
      const sy = scatterPositions[i3+1] + Math.sin(time + randoms[i]*10) * 0.5; // Floating effect
      const sz = scatterPositions[i3+2];
      const vScatter = new THREE.Vector3(sx, sy, sz);

      // Calculate Tree Position (static relative to tree, but maybe rotating slightly around tree axis?)
      // Let's keep tree position static for stability
      const tx = treePositions[i3];
      const ty = treePositions[i3+1];
      const tz = treePositions[i3+2];
      const vTree = new THREE.Vector3(tx, ty, tz);

      // Mix
      const vFinal = new THREE.Vector3().lerpVectors(vScatter, vTree, t); // Linear lerp for position

      tempObject.position.copy(vFinal);

      // Rotation Logic
      // Scatter: Random slow rotation
      // Tree: Aligned or slight wobble
      const rotSpeed = 0.5;
      tempObject.rotation.x = randoms[i] * Math.PI * 2 + time * rotSpeed * (1-t);
      tempObject.rotation.y = randoms[i] * Math.PI * 2 + time * rotSpeed * (1-t);
      tempObject.rotation.z = randoms[i] * Math.PI * 2 + time * rotSpeed * (1-t);

      // Scale
      const s = scaleRange[0] + randoms[i] * (scaleRange[1] - scaleRange[0]);
      tempObject.scale.set(s, s, s);

      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      {type === 'box' ? <boxGeometry /> : <sphereGeometry args={[1, 16, 16]} />}
      <meshStandardMaterial 
        color={color} 
        roughness={0.15} 
        metalness={0.9} 
        envMapIntensity={2}
      />
    </instancedMesh>
  );
};
