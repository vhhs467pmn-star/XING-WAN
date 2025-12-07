export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface PositionData {
  scatterPos: Float32Array;
  treePos: Float32Array;
  scales: Float32Array;
  rotations: Float32Array;
}

export interface OrnamentProps {
  count: number;
  type: 'box' | 'sphere';
  color: string;
  scaleRange: [number, number];
  treeState: TreeState;
}
