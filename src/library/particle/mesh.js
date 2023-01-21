import * as THREE from 'three';
import {
  beamVertex, beamFragment,
  pixelVertex, pixelFragment,
  ringVertex, ringFragment,
} from './shader.js';

import { _getGeometry } from './utils.js';

const getBeamMesh = (globalUniforms) => {
  const cylinderHeight = 5.0;
  const radius = 0.45;
  const geometry = new THREE.CylinderGeometry(radius, radius, cylinderHeight, 50, 50, true);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      auraTexture: {
        value: null
      }
    },
    vertexShader: beamVertex,
    fragmentShader: beamFragment,
    transparent: true,
    blending: THREE.AdditiveBlending
  });
  material.uniforms.cameraDir = globalUniforms.cameraDir;
  material.uniforms.eye = globalUniforms.eye;
  material.uniforms.switchItemTime = globalUniforms.switchItemTime;
  material.uniforms.switchItemDuration = globalUniforms.switchItemDuration;
  const beamMesh = new THREE.Mesh(geometry, material);
  beamMesh.frustumCulled = false;
  beamMesh.position.y = cylinderHeight * 0.4;
  return beamMesh;
}

const getPixelMesh = () => {
  const particleCount = 14;
  const attributeSpecs = [];
  attributeSpecs.push({name: 'opacity', itemSize: 1});
  attributeSpecs.push({name: 'scales', itemSize: 2});
  const size = 0.3;
  const geometry2 = new THREE.PlaneGeometry(size, size);
  const geometry = _getGeometry(geometry2, attributeSpecs, particleCount);
  const material= new THREE.ShaderMaterial({
    uniforms: {
      cameraBillboardQuaternion: {
        value: new THREE.Quaternion(),
      },
    },
    vertexShader: pixelVertex,
    fragmentShader: pixelFragment,
    // transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const pixelMesh = new THREE.InstancedMesh(geometry, material, particleCount);
  pixelMesh.info = {
    particleCount: particleCount,
    velocity: [particleCount],
  }
  return pixelMesh;
}

const getRingMesh = (globalUniforms) => {
  const particleCount = 14;
  const attributeSpecs = [];
  attributeSpecs.push({name: 'opacity', itemSize: 1});
  attributeSpecs.push({name: 'scales', itemSize: 2});
  const radius = 0.45;
  const geometry2 = new THREE.SphereGeometry( radius, 32, 32 );
  const geometry = _getGeometry(geometry2, attributeSpecs, particleCount);
  const material= new THREE.ShaderMaterial({
    uniforms: {
      radius: {
        value: radius
      }
    },
    vertexShader: ringVertex,
    fragmentShader: ringFragment,
    transparent: true,
    // depthWrite: false,
    // blending: THREE.AdditiveBlending,
  });
  material.uniforms.cameraDir = globalUniforms.cameraDir;
  material.uniforms.eye = globalUniforms.eye;
  material.uniforms.switchAvatarTime = globalUniforms.switchAvatarTime;

  const ringMesh = new THREE.InstancedMesh(geometry, material, particleCount);
  ringMesh.info = {
    particleCount: particleCount,
    velocity: [particleCount],
    currentIndex: 0
  }
  return ringMesh;
}

export {
  getBeamMesh,
  getPixelMesh,
  getRingMesh,
};