import * as THREE from 'three';
import {
  beamVertex, beamFragment,
  pixelVertex, pixelFragment,
  ringVertex, ringFragment,
  teleportVertex, teleportFragment,
  spotLightVertex, spotLightFragment,
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
  beamMesh.position.y = cylinderHeight * 0.46;
  return beamMesh;
}

const getPixelMesh = () => {
  const particleCount = 20;
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
  const particleCount = 10;
  const attributeSpecs = [];
  attributeSpecs.push({name: 'opacity', itemSize: 1});
  attributeSpecs.push({name: 'scales', itemSize: 2});
  const radius = 0.43;
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
    // transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  material.uniforms.cameraDir = globalUniforms.cameraDir;
  material.uniforms.eye = globalUniforms.eye;
  material.uniforms.fadeInAvatarTime = globalUniforms.fadeInAvatarTime;

  const ringMesh = new THREE.InstancedMesh(geometry, material, particleCount);
  ringMesh.info = {
    particleCount: particleCount,
    velocity: [particleCount],
    currentIndex: 0
  }
  return ringMesh;
}

const getTeleportMesh = (globalUniforms) => {
  const size = 1.0;
  const geometry = new THREE.PlaneGeometry(size, size);
  const material= new THREE.ShaderMaterial({
    uniforms: {
      cameraBillboardQuaternion: {
        value: new THREE.Quaternion(),
      },
    },
    vertexShader: teleportVertex,
    fragmentShader: teleportFragment,
    // transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const teleportMesh = new THREE.Mesh(geometry, material);
  
  return teleportMesh;
}

const getSpotLightMesh = (globalUniforms) => {
  const particleCount = 2;
  const attributeSpecs = [];
  const cylinderHeight = 2.5;
  const radius = 0.43;
  const geometry2 = new THREE.CylinderGeometry(radius * 1.5, radius, cylinderHeight, 50, 50, true);
  const geometry = _getGeometry(geometry2, attributeSpecs, particleCount);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      opacity: {
        value: 0
      }
    },
    vertexShader: spotLightVertex,
    fragmentShader: spotLightFragment,
    transparent: true,
    blending: THREE.AdditiveBlending
  });
  material.uniforms.cameraDir = globalUniforms.cameraDir;
  material.uniforms.eye = globalUniforms.eye;
  const spotLightMesh = new THREE.InstancedMesh(geometry, material, particleCount);
  spotLightMesh.fadeIn = false;
  spotLightMesh.frustumCulled = false;
  spotLightMesh.position.y = cylinderHeight * 0.46;
  return spotLightMesh;
}

export {
  getBeamMesh,
  getPixelMesh,
  getRingMesh,
  getTeleportMesh,
  getSpotLightMesh
};