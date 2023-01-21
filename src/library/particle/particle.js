import * as THREE from 'three';
import {
  getBeamMesh,
  getPixelMesh,
  getRingMesh,
} from './mesh.js';

const textureLoader = new THREE.TextureLoader()

const auraTexture = textureLoader.load(`/textures/beam2.png`);
auraTexture.wrapS = THREE.RepeatWrapping;

const auraTexture2 = textureLoader.load(`/textures/beam.png`);
auraTexture2.wrapS = THREE.RepeatWrapping;

const noiseTexture = textureLoader.load(`/textures/Noise28.png`);
noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;

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

    this.ringMesh = null;
    this.initRing();

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

      this.pixelMesh.info.velocity[i] = (0.02 + Math.random() * 0.03);
      
    }
    scalesAttribute.needsUpdate = true;
    positionsAttribute.needsUpdate = true;
    opacityAttribute.needsUpdate = true;
  }

  emitRing() {
    const scalesAttribute = this.ringMesh.geometry.getAttribute('scales');
    const positionsAttribute = this.ringMesh.geometry.getAttribute('positions');
    const opacityAttribute = this.ringMesh.geometry.getAttribute('opacity');

    const particleCount = this.ringMesh.info.particleCount;
    const currentIndex = this.ringMesh.info.currentIndex;
    const previousIndex = currentIndex - 1 < 0 ? particleCount - 1 : currentIndex - 1;
    
      if (
        positionsAttribute.getY(previousIndex) > 0.1 || opacityAttribute.getX(previousIndex) <= 0
      ) {
        positionsAttribute.setXYZ(
          currentIndex,
          0,
          -0.3,
          0
        )
        scalesAttribute.setXY(currentIndex, 1.0, 0.06);
        opacityAttribute.setX(currentIndex, 1.0);
  
        this.ringMesh.info.velocity[currentIndex] = 0.1;

        this.ringMesh.info.currentIndex ++;
        if (this.ringMesh.info.currentIndex >= particleCount) {
          this.ringMesh.info.currentIndex = 0;
        }
        
      }
    
    scalesAttribute.needsUpdate = true;
    positionsAttribute.needsUpdate = true;
    opacityAttribute.needsUpdate = true;
  }

  update() {
    this.beamMesh.update();
    !this.stopUpdatePixelMesh && this.pixelMesh.update(); 
    this.ringMesh.update();
  }

  //########################################################## initialize particle mesh #####################################################
  initBeam() {
    this.beamMesh = getBeamMesh(this.globalUniforms);
    this.beamMesh.material.uniforms.auraTexture.value = auraTexture;
    this.beamMesh.update = () => this.updateBeam();
    this.scene.add(this.beamMesh);
  }

  initPixel() {
    this.pixelMesh = getPixelMesh();
    this.pixelMesh.update = () => this.updatePixel();
    this.scene.add(this.pixelMesh);
  }

  initRing() {
    this.ringMesh = getRingMesh(this.globalUniforms);
    this.ringMesh.update = () => this.updateRing();
    this.scene.add(this.ringMesh);
  }
  
  //########################################################## update function of particle mesh #####################################################

  updateBeam() {
    if (this.beamMesh) {
      if (this.globalUniforms.transitionEffectType.value === 1) {
        if (!this.beamMesh.visible) {
          this.beamMesh.visible = true;
        }
      }
      else {
        if (this.beamMesh.visible) {
          this.beamMesh.visible = false;
        }
      }
    }
  }

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

  updateRing() {
    if (this.ringMesh) {
      const positionsAttribute = this.ringMesh.geometry.getAttribute('positions');
      const opacityAttribute = this.ringMesh.geometry.getAttribute('opacity');
      const particleCount = this.ringMesh.info.particleCount;
      
      for (let i = 0; i < particleCount; i ++) {
        if (opacityAttribute.getX(i) > 0.01) {
          positionsAttribute.setY(
            i,
            positionsAttribute.getY(i) + this.ringMesh.info.velocity[i]
          )
          opacityAttribute.setX(i, opacityAttribute.getX(i) / 1.28);
        }
        else {
          opacityAttribute.setX(i, 0);
        }
      }
      
      positionsAttribute.needsUpdate = true;
      opacityAttribute.needsUpdate = true;
    }
    // if (this.ringMesh) {
      

    //   if (this.globalUniforms.transitionEffectType.value === 2) {
    //     if (!this.ringMesh.visible) {
    //       this.ringMesh.visible = true;
    //     }
    //   }
    //   else {
    //     if (this.ringMesh.visible) {
    //       this.ringMesh.visible = false;
    //     }
    //   }
    // }
  }
}



export default ParticleEffect;