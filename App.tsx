import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { TreeState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);

  const toggleState = () => {
    setTreeState((prev) => 
      prev === TreeState.TREE_SHAPE ? TreeState.SCATTERED : TreeState.TREE_SHAPE
    );
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-serif selection:bg-emerald-500 selection:text-white">
      {/* Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          dpr={[1, 2]} // Optimize for pixel ratio
          camera={{ position: [0, 0, 25], fov: 45 }}
          gl={{ antialias: false, toneMappingExposure: 1.5 }} // Disable default AA for PostProcessing efficiency
        >
          <Suspense fallback={null}>
            <Scene treeState={treeState} />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12">
        {/* Header */}
        <header className="flex justify-between items-start animate-fade-in-down">
          <div>
            <h1 className="text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 font-bold tracking-tighter drop-shadow-lg">
              To My Lover Zoe
            </h1>
            <p className="text-emerald-400/80 text-sm md:text-base tracking-[0.3em] uppercase mt-2">
              Interactive Collection
            </p>
          </div>
        </header>

        {/* Center/Bottom Controls */}
        <div className="flex flex-col items-center pointer-events-auto pb-12">
          <button
            onClick={toggleState}
            className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full transition-all duration-500 cursor-pointer"
          >
            {/* Button Background/Glow */}
            <div className="absolute inset-0 w-full h-full border border-yellow-500/30 rounded-full group-hover:border-yellow-400/80 transition-colors duration-500"></div>
            <div className="absolute inset-0 w-full h-full bg-emerald-900/20 blur-xl group-hover:bg-emerald-800/40 transition-colors duration-500"></div>
            
            {/* Button Text */}
            <span className="relative flex items-center space-x-3">
              <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${treeState === TreeState.TREE_SHAPE ? 'bg-yellow-400 shadow-[0_0_10px_#fbbf24]' : 'bg-emerald-600'}`}></span>
              <span className="text-yellow-100 font-light tracking-widest text-sm uppercase group-hover:text-white transition-colors">
                {treeState === TreeState.TREE_SHAPE ? 'Deconstruct' : 'Assemble'}
              </span>
            </span>
          </button>

          <div className="mt-6 text-emerald-600/40 text-xs tracking-widest">
            DRAG TO ROTATE &bull; SCROLL TO ZOOM
          </div>
        </div>
      </div>
      
      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-emerald-900/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-emerald-900/20 to-transparent pointer-events-none" />
    </div>
  );
};

export default App;