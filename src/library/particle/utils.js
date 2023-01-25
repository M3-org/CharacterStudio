import * as THREE from 'three';

export const _getGeometry = (geometry, attributeSpecs, particleCount) => {
  const geometry2 = new THREE.BufferGeometry();
  ['position', 'normal', 'uv'].forEach(k => {
  geometry2.setAttribute(k, geometry.attributes[k]);
  });
  geometry2.setIndex(geometry.index);

  const positions = new Float32Array(particleCount * 3);
  const positionsAttribute = new THREE.InstancedBufferAttribute(positions, 3);
  geometry2.setAttribute('positions', positionsAttribute);

  for(const attributeSpec of attributeSpecs){
      const {
          name,
          itemSize,
      } = attributeSpec;
      const array = new Float32Array(particleCount * itemSize);
      geometry2.setAttribute(name, new THREE.InstancedBufferAttribute(array, itemSize));
  }

  return geometry2;
};