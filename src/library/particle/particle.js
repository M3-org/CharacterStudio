import * as THREE from 'three';
import {
  getBeamMesh,
  getPixelMesh,
} from './mesh.js';

const textureLoader = new THREE.TextureLoader()

const auraTexture = textureLoader.load(`/textures/beam2.png`);
auraTexture.wrapS = auraTexture.wrapT = THREE.RepeatWrapping;

class ParticleEffect {
  constructor(scene, camera, globalUniforms) {
    this.scene = scene;
    this.camera = camera;
    this.globalUniforms = globalUniforms;

    this.eye = new THREE.Vector3();
    this.cameraDir = new THREE.Vector3();
    
    this.beamMesh = null;
    this.initBeam();

    this.pixelMesh = null;
    this.initPixel();

  }

  emitPixel() {
    this.stopUpdatePixelMesh = false;
    const scalesAttribute = this.pixelMesh.geometry.getAttribute('scales');
    const positionsAttribute = this.pixelMesh.geometry.getAttribute('positions');
    const opacityAttribute = this.pixelMesh.geometry.getAttribute('opacity');

    const particleCount = this.pixelMesh.info.particleCount;
    const particleRadius = 0.25;
    for (let i = 0; i < particleCount; i ++) {
      if (i < particleCount / 2) {
        scalesAttribute.setXY(i, 0.2, 0.2);
      }
      else {
        scalesAttribute.setXY(i, 0.1, 3 + Math.random());
      }
      positionsAttribute.setXYZ(
        i,
        Math.cos(i) * particleRadius,
        (Math.random() - 0.5) * 2,
        Math.sin(i) * particleRadius
      )
      opacityAttribute.setX(i, 1 + Math.random());

      this.pixelMesh.info.velocity[i] = 0.02 + Math.random() * 0.03;
      
    }
    scalesAttribute.needsUpdate = true;
    positionsAttribute.needsUpdate = true;
    opacityAttribute.needsUpdate = true;
  }

  update() {
    
    !this.stopUpdatePixelMesh && this.updatePixel(); 
  }

  //########################################################## initialize particle mesh #####################################################
  initBeam() {
    this.beamMesh = getBeamMesh(this.globalUniforms);
    this.beamMesh.material.uniforms.auraTexture.value = auraTexture;
    this.scene.add(this.beamMesh);
  }
  initPixel() {
    this.pixelMesh = getPixelMesh();
    this.pixelMesh.update = () => this.updatePixel();
    this.scene.add(this.pixelMesh);
  }
  
  //########################################################## update function of particle mesh #####################################################

  updatePixel() {
    if (this.pixelMesh) {
      let opacityCount = 0;
      const positionsAttribute = this.pixelMesh.geometry.getAttribute('positions');
      const opacityAttribute = this.pixelMesh.geometry.getAttribute('opacity');
      const particleCount = this.pixelMesh.info.particleCount;
      
      for (let i = 0; i < particleCount; i ++) {
        if (opacityAttribute.getX(i) > 0.01) {
          positionsAttribute.setY(
            i,
            positionsAttribute.getY(i) + this.pixelMesh.info.velocity[i]
          )
          opacityAttribute.setX(i, opacityAttribute.getX(i) / 1.3);
        }
        else {
          opacityAttribute.setX(i, 0);
          opacityCount ++;
        }
      }
      if (opacityCount >= particleCount - 1) {
        this.stopUpdatePixelMesh = true;
      }
      positionsAttribute.needsUpdate = true;
      opacityAttribute.needsUpdate = true;
      this.pixelMesh.material.uniforms.cameraBillboardQuaternion.value.copy(this.camera.quaternion);
    }
  }
}

export default ParticleEffect;