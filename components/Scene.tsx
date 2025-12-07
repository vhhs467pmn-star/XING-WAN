import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TreeState } from '../types';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { StarTopper } from './HolidayElements';

interface SceneProps {
  treeState: TreeState;
}

export const Scene: React.FC<SceneProps> = ({ treeState }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
        // Slow continuous rotation of the entire assembly for cinematic feel
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <>
      <color attach="background" args={['#000502']} />
      
      {/* Controls */}
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 3} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={40}
        autoRotate={false}
      />

      {/* Lighting - Cinematic and Dramatic */}
      <ambientLight intensity={0.2} color="#042f2e" />
      <pointLight position={[10, 20, 10]} intensity={2} color="#fbbf24" distance={50} decay={2} />
      <pointLight position={[-10, 5, -10]} intensity={2} color="#10b981" distance={50} decay={2} />
      <spotLight 
        position={[0, 30, 0]} 
        angle={0.5} 
        penumbra={1} 
        intensity={3} 
        color="#fbbf24" 
        castShadow 
      />

      {/* Environment for Reflections */}
      <Environment preset="city" />

      {/* Main Content Group */}
      <group ref={groupRef} position={[0, -5, 0]}>
        
        {/* The Star Topper */}
        <StarTopper visible={treeState === TreeState.TREE_SHAPE} />
        {/* Light emitting from the star */}
        <pointLight position={[0, 6, 0]} intensity={1.5} color="#fbbf24" distance={8} decay={1} />

        {/* The Needles/Foliage */}
        <Foliage count={15000} treeState={treeState} />

        {/* GOLD ORNAMENTS - Boxes (All Boxes as requested) */}
        <Ornaments 
          count={200} 
          type="box" 
          color="#d4af37" // Metallic Gold
          scaleRange={[0.2, 0.4]} 
          treeState={treeState} 
        />
        
        {/* RED ACCENTS - Boxes */}
        <Ornaments 
          count={100} 
          type="box" 
          color="#ef4444" // Deep Red
          scaleRange={[0.2, 0.4]} 
          treeState={treeState} 
        />

        {/* GREEN GIFT BOXES - Boxes */}
        <Ornaments 
          count={50} 
          type="box" 
          color="#10b981" // Vivid Emerald
          scaleRange={[0.4, 0.7]} 
          treeState={treeState} 
        />

      </group>
      
      {/* Background Elements */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ContactShadows opacity={0.5} scale={30} blur={2} far={10} resolution={256} color="#000000" />

      {/* Post Processing for High Fidelity Look */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} // Only very bright things glow
          mipmapBlur 
          intensity={1.5} 
          radius={0.6}
        />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};
