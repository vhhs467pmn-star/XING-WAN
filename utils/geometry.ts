import * as THREE from 'three';

// Helper to generate random point inside a sphere
export const getRandomSpherePoint = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  
  return new THREE.Vector3(x, y, z);
};

// Helper to generate point on a cone surface (Christmas tree shape)
export const getTreePoint = (height: number, baseRadius: number): THREE.Vector3 => {
  const y = (Math.random() - 0.5) * height; // Height range centered
  // Normalize y to 0..1 (bottom to top) to calculate radius at that height
  const normalizedY = (y + height / 2) / height; 
  
  // Cone radius calculation: decreases as we go up
  const currentRadius = baseRadius * (1 - normalizedY);
  
  const angle = Math.random() * Math.PI * 2;
  // Push points slightly inward randomly for volume, but mostly surface
  const r = currentRadius * Math.sqrt(Math.random()); 
  
  const x = r * Math.cos(angle);
  const z = r * Math.sin(angle);
  
  return new THREE.Vector3(x, y, z);
};

export const generateDualPositions = (count: number, scatterRadius: number, treeHeight: number, treeBase: number) => {
  const scatterPositions = new Float32Array(count * 3);
  const treePositions = new Float32Array(count * 3);
  const randoms = new Float32Array(count); // For phase offsets/animation

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    // Scattered State
    const sPos = getRandomSpherePoint(scatterRadius);
    scatterPositions[i3] = sPos.x;
    scatterPositions[i3 + 1] = sPos.y;
    scatterPositions[i3 + 2] = sPos.z;

    // Tree State
    const tPos = getTreePoint(treeHeight, treeBase);
    treePositions[i3] = tPos.x;
    treePositions[i3 + 1] = tPos.y;
    treePositions[i3 + 2] = tPos.z;

    randoms[i] = Math.random();
  }

  return { scatterPositions, treePositions, randoms };
};
