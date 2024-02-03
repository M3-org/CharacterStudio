import * as THREE from 'three';
import {
  getBeamMesh,
  getPixelMesh,
  getRingMesh,
  getTeleportMesh,
  getSpotLightMesh,
} from './mesh.js';

import {transitionEffectTypeNumber} from '../constants.js';

const textureLoader = new THREE.TextureLoader()

const auraTexture = textureLoader.load(`./textures/beam2.png`);
auraTexture.wrapS = THREE.RepeatWrapping;


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

    this.teleportMesh = null;
    this.initTeleport();

    this.spotLight = null;
    this.initSpotLight();

  }

  emitBeam() {
    this.beamMesh.visible = true;
  }

  emitPixel() {
    this.stopUpdatePixelMesh = false;
    const scalesAttribute = this.pixelMesh.geometry.getAttribute('scales');
    const positionsAttribute = this.pixelMesh.geometry.getAttribute('positions');
    const opacityAttribute = this.pixelMesh.geometry.getAttribute('opacity');

    const particleCount = this.pixelMesh.info.particleCount;
    
    const particleRadius = 0.25;
    for (let i = 0; i < particleCount; i ++) {
      
      if (i % 2 === 0) {
        scalesAttribute.setXY(i, 0.2, 0.2);
      }
      else {
        scalesAttribute.setXY(i, 0.1, 3 + Math.random());
      }

      const theta = (i / particleCount) * Math.PI * 2;
      positionsAttribute.setXYZ(
        i,
        Math.cos(theta) * particleRadius,
        (Math.random() - 0.5) * 2,
        Math.sin(theta) * particleRadius
      )
      opacityAttribute.setX(i, 1 + Math.random());

      this.pixelMesh.info.velocity[i] = (0.02 + Math.random() * 0.03);
      
    }
    scalesAttribute.needsUpdate = true;
    positionsAttribute.needsUpdate = true;
    opacityAttribute.needsUpdate = true;
  }

  emitRespawnPixel() {
    this.stopUpdatePixelMesh = false;
    const scalesAttribute = this.pixelMesh.geometry.getAttribute('scales');
    const positionsAttribute = this.pixelMesh.geometry.getAttribute('positions');
    const opacityAttribute = this.pixelMesh.geometry.getAttribute('opacity');

    const particleCount = this.pixelMesh.info.particleCount;
    const particleRadius = 0.25;

    for (let i = 0; i < particleCount; i ++) {
      if (opacityAttribute.getX(i) < 0.01) {
        if (i % 2 === 0) {
          scalesAttribute.setXY(i, 0.2, 0.2);
        }
        else {
          scalesAttribute.setXY(i, 0.1, 3 + Math.random());
        }
        const theta = (i / particleCount) * Math.PI * 2;
        positionsAttribute.setXYZ(
          i,
          Math.cos(theta) * particleRadius,
          Math.random() * - 1,
          Math.sin(theta) * particleRadius
        )
        opacityAttribute.setX(i, 1 + Math.random());
  
        this.pixelMesh.info.velocity[i] = (0.05 + Math.random() * 0.05);
        break;
      }
    }
    scalesAttribute.needsUpdate = true;
    positionsAttribute.needsUpdate = true;
    opacityAttribute.needsUpdate = true;
  }

  emitRing(offset) {
    this.ringMesh.visible = true;
    const scalesAttribute = this.ringMesh.geometry.getAttribute('scales');
    const positionsAttribute = this.ringMesh.geometry.getAttribute('positions');
    const opacityAttribute = this.ringMesh.geometry.getAttribute('opacity');

    const particleCount = this.ringMesh.info.particleCount;
    const currentIndex = this.ringMesh.info.currentIndex;
    const previousIndex = currentIndex - 1 < 0 ? particleCount - 1 : currentIndex - 1;

    const startPosition = 0.1;
    
    if (
      positionsAttribute.getY(previousIndex) > startPosition + offset || opacityAttribute.getX(previousIndex) <= 0
    ) {
      positionsAttribute.setXYZ(
        currentIndex,
        0,
        startPosition,
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

  emitTeleport() {
    this.teleportMesh.visible = true;
  }

  emitSpotLight() {
    this.spotLight.visible = true;
    this.spotLight.fadeIn = true;
  }
  removeSpotLight() {
    this.spotLight.fadeIn = false;
  }

  update() {
    
    this.beamMesh.visible && this.beamMesh.update();
    !this.stopUpdatePixelMesh && this.pixelMesh.update(); 
    this.ringMesh.visible && this.ringMesh.update();
    this.teleportMesh.visible && this.teleportMesh.update();
    this.spotLight.visible && this.spotLight.update();
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

  initTeleport() {
    this.teleportMesh = getTeleportMesh(this.globalUniforms);
    this.teleportMesh.update = () => this.updateTeleport();
    this.teleportMesh.visible = false;
    this.scene.add(this.teleportMesh);
  }

  initSpotLight() {
    this.spotLight = getSpotLightMesh(this.globalUniforms);
    this.spotLight.update = () => this.updateSpotLight();
    this.spotLight.visible = false;
    this.scene.add(this.spotLight);
  }
  
  //########################################################## update function of particle mesh #####################################################

  updateBeam() {
    if (this.beamMesh) {
      if (this.globalUniforms.transitionEffectType.value !== transitionEffectTypeNumber.switchItem) {
        this.beamMesh.visible = false;
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
      if (opacityCount >= particleCount) {
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
          opacityAttribute.setX(i, opacityAttribute.getX(i) / 1.27);
        }
        else {
          opacityAttribute.setX(i, 0);
        }
      }
      
      positionsAttribute.needsUpdate = true;
      opacityAttribute.needsUpdate = true;

      if (this.globalUniforms.transitionEffectType.value !== transitionEffectTypeNumber.fadeInAvatar) {
        this.ringMesh.visible = false;
      }
    }
  }

  updateTeleport() {
    if (this.teleportMesh) {
      if (this.globalUniforms.transitionEffectType.value === transitionEffectTypeNumber.fadeOutAvatar) {
        const timer = this.globalUniforms.fadeOutAvatarTime.value;
        const growLimit = 0.2; 
        if (timer < growLimit) {
          const growTimer = timer * (1 / growLimit);
          const width = 0.6;
          const height = 5;
          this.teleportMesh.scale.set(
            width,
            growTimer * height,
            width
          )
          this.teleportMesh.position.y = growTimer * height * 0.35;
        }
        else {
          if (this.teleportMesh.scale.x > 0) {
            const shrinkSpeed = 0.2;
            this.teleportMesh.scale.x = this.teleportMesh.scale.x - shrinkSpeed;
            this.teleportMesh.scale.z = this.teleportMesh.scale.z - shrinkSpeed;
          }
          else {
            this.teleportMesh.visible = false;
          }
          
        }
      }
      else {
        this.teleportMesh.visible = false;
      }
      this.teleportMesh.material.uniforms.cameraBillboardQuaternion.value.copy(this.camera.quaternion);
    }

  }
  
  updateSpotLight() {
    if (this.spotLight) {
      if (this.spotLight.fadeIn) {
        if (this.spotLight.material.uniforms.opacity.value < 1) {
          this.spotLight.material.uniforms.opacity.value = 1;
        }
      }
      else {
        if (this.spotLight.material.uniforms.opacity.value > 0) {
          this.spotLight.material.uniforms.opacity.value -= 0.025;
        }
        else {
          this.spotLight.material.uniforms.opacity.value = 0;
          this.spotLight.visible = false;
        }
      }
      
    }
  }
}



export default ParticleEffect;
