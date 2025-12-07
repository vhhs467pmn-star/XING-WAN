import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { TreeState } from '../types';
import { generateDualPositions } from '../utils/geometry';

// --- Shader Definition ---
const FoliageMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0, // 0 = Scattered, 1 = Tree
    uColorHigh: new THREE.Color('#2eff95'), // Vivid Neon-ish Green
    uColorLow: new THREE.Color('#0f5940'),  // Richer Deep Green (less black)
    uColorGold: new THREE.Color('#fbbf24'), // Gold shimmer
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform float uProgress;
    attribute vec3 aScatterPos;
    attribute vec3 aTreePos;
    attribute float aRandom;
    
    varying vec2 vUv;
    varying float vRandom;
    varying float vDepth;

    // Cubic ease out for smooth snap
    float easeOutCubic(float x) {
      return 1.0 - pow(1.0 - x, 3.0);
    }

    void main() {
      vUv = uv;
      vRandom = aRandom;

      // Interpolation logic
      float t = easeOutCubic(uProgress);
      
      // Add some noise based on time and index for "floating" effect in scatter mode
      vec3 noise = vec3(
        sin(uTime * 0.5 + aRandom * 10.0),
        cos(uTime * 0.3 + aRandom * 20.0),
        sin(uTime * 0.7 + aRandom * 30.0)
      ) * (1.0 - t) * 2.0; // More noise when scattered

      // Mix positions
      vec3 pos = mix(aScatterPos + noise, aTreePos, t);

      // Add subtle breathing to tree shape
      if (t > 0.8) {
        float breath = sin(uTime * 2.0 + pos.y) * 0.05;
        pos += normalize(pos) * breath;
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      vDepth = -mvPosition.z;

      // Size attenuation
      // Prevent divide by zero or extreme sizes
      float dist = max(-mvPosition.z, 0.1);
      gl_PointSize = (40.0 * aRandom + 20.0) * (1.0 / dist);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColorHigh;
    uniform vec3 uColorLow;
    uniform vec3 uColorGold;
    
    varying float vRandom;
    varying float vDepth;

    void main() {
      // Create a soft circular particle
      vec2 xy = gl_PointCoord.xy - vec2(0.5);
      float r = length(xy);
      if (r > 0.5) discard;

      // Soft edge glow
      float glow = 1.0 - (r * 2.0);
      glow = pow(glow, 2.0);

      // Shimmer effect
      float shimmer = sin(uTime * 3.0 + vRandom * 10.0) * 0.5 + 0.5;

      // Gradient color based on depth and randomness
      vec3 baseColor = mix(uColorLow, uColorHigh, vRandom);
      
      // Add gold sparkles occasionally
      if (vRandom > 0.9) {
        baseColor = mix(baseColor, uColorGold, shimmer);
      }

      gl_FragColor = vec4(baseColor, glow * 0.8); // 0.8 opacity max
    }
  `
);

extend({ FoliageMaterial });

// Add types for the custom material via module augmentation for @react-three/fiber
declare module '@react-three/fiber' {
  interface ThreeElements {
    foliageMaterial: any;
  }
}

interface FoliageProps {
  count: number;
  treeState: TreeState;
}

export const Foliage: React.FC<FoliageProps> = ({ count, treeState }) => {
  const materialRef = useRef<any>(null);
  
  // Generate data once
  const { scatterPositions, treePositions, randoms } = useMemo(() => {
    return generateDualPositions(count, 15, 12, 5); // Radius 15 scatter, Height 12 tree
  }, [count]);

  // Animation Loop
  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
      
      // Smoothly interpolate uProgress based on state
      const target = treeState === TreeState.TREE_SHAPE ? 1 : 0;
      materialRef.current.uProgress = THREE.MathUtils.lerp(
        materialRef.current.uProgress,
        target,
        delta * 1.5 // Speed of transition
      );
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position" // Initial usage, shader overrides
          count={scatterPositions.length / 3}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={scatterPositions.length / 3}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={treePositions.length / 3}
          array={treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <foliageMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};