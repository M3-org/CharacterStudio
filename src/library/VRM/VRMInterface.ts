import * as THREE from "three";

export type Arrays = Array<
  THREE.Object3D | THREE.Group | THREE.SkinnedMesh | THREE.Bone
>;

export interface VRMSkinnedMesh extends THREE.SkinnedMesh {
  geometry: VRMBufferGeometry;
}

interface VRMBufferGeometry extends THREE.BufferGeometry {
  attributes: { [name: string]: THREE.BufferAttribute };
  morphAttributes: { [name: string]: Array<THREE.BufferAttribute> };
  userData: { targetNames: Array<string> };
}

export interface VRMGroup extends THREE.Group {
  children: Array<VRMSkinnedMesh>;
}