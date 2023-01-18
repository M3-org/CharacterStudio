
import * as THREE from "three"
import ParticleEffect from "./particle/particle.js";

import {
  SWITCH_ITEM_EFFECT_INITIAL_TIME, 
  SWITCH_ITEM_EFFECT_DURATION, 
  SWITCH_ITEM_EFFECT_SPEED
} from "./constants.js";


const textureLoader = new THREE.TextureLoader()
const pixelTexture = textureLoader.load(`/textures/pixel8.png`);
pixelTexture.wrapS = pixelTexture.wrapT = THREE.RepeatWrapping;


const globalUniforms = {
  switchItemDuration: {
    value: SWITCH_ITEM_EFFECT_DURATION
  },
  switchItemTime: {
    value: SWITCH_ITEM_EFFECT_INITIAL_TIME
  },
  eye: {
    value: new THREE.Vector3()
  },
  cameraDir: {
    value: new THREE.Vector3()
  },
};

const customUniforms = {
  pixelTexture: {
    value: pixelTexture
  },
};


export class EffectManager{
  constructor () {
    this.cameraDir = new THREE.Vector3();
    this.frameRate = 1000 / 30;

    this.initParticle = false;

    this.transitionEffectType = null;
    this.transitionTime = 500;
    
    this.update();
  }

  setCustomShader(material) {
    
    material.vertexShader = material.vertexShader.replace(
      `varying vec3 vViewPosition;`,
      `
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      varying vec3 vSurfaceNormal;
      `,
    );
    material.vertexShader = material.vertexShader.replace(
      `void main() {`,
      `
      void main() {
        vSurfaceNormal = normalize(normal);
      `,
    );
    material.vertexShader = material.vertexShader.replace(
      `#include <worldpos_vertex>`,
      `
      #include <worldpos_vertex>
      vWorldPosition = (modelMatrix * vec4( transformed, 1.0 )).xyz;
      `,
    );
    
    material.fragmentShader = material.fragmentShader.replace(
      `uniform vec3 litFactor;`,
      `
      uniform vec3 litFactor;
      uniform vec3 cameraDir;
      uniform vec3 eye;
      uniform float switchItemTime;
      uniform float switchItemDuration;
      uniform sampler2D pixelTexture;
      varying vec3 vWorldPosition;
      varying vec3 vSurfaceNormal;
      `,
    );
    material.fragmentShader = material.fragmentShader.replace(
      `diffuseColor *= sampledDiffuseColor;`,
      `
      
      float noiseUvScale = 2.0;
      vec2 noiseUv = vec2(
        vWorldPosition.x * noiseUvScale * -cameraDir.z + vWorldPosition.z * noiseUvScale * cameraDir.x,
        vWorldPosition.y * noiseUvScale
      );
      float grid = texture2D(
        pixelTexture, 
        noiseUv
      ).r;
      grid = pow(grid, 3.0);
      float gridColorIntensity = 1.0;
      vec3 gridColor = mix(vec3(0.0142, 0.478, 0.710), vec3(0.0396, 0.768, 0.990), grid * gridColorIntensity);
      
      diffuseColor *= sampledDiffuseColor;
      vec3 eyeDirection = normalize(eye - vWorldPosition);
      float gridNormalIntensity = 1.0 * (switchItemDuration - switchItemTime);
      vec3 gridSurfaceNormal = normalize(vSurfaceNormal + vec3(grid) * vec3(-cameraDir.z, gridNormalIntensity, cameraDir.x));
      
      float EdotN = max(0.0, dot(eyeDirection, gridSurfaceNormal));
      float rimStrength = 1.0 * switchItemTime;
      float bodyRim = mix(0.0, 1.0, pow(1. - EdotN, rimStrength));
      float glowIntensity = 10. * (switchItemDuration - switchItemTime);

      diffuseColor.rgb += gridColor * bodyRim * glowIntensity;
      diffuseColor.a = 1.0;
      `,
    );
    
    material.uniforms.pixelTexture = customUniforms.pixelTexture;
    material.uniforms.cameraDir = globalUniforms.cameraDir;
    material.uniforms.eye = globalUniforms.eye;
    material.uniforms.uTime = globalUniforms.uTime;
    material.uniforms.switchItemTime = globalUniforms.switchItemTime;
    material.uniforms.switchItemDuration = globalUniforms.switchItemDuration;
  }

  setTransitionEffect = (type) => {
    this.transitionEffectType = type;
  }

  playTransitionEffect() {
    switch (this.transitionEffectType) {
      case 'switch_avatar': {
        this.playSwitchAvatarEffect();
        break;
      }
      case 'switch_item': {
        this.playSwitchItemEffect();
        break;
      }
      default: {
        break;
      }
    }
  }

  playSwitchItemEffect() {
    this.transitionTime = 500;
    globalUniforms.switchItemTime.value = SWITCH_ITEM_EFFECT_INITIAL_TIME;
    this.particleEffect.emitPixel();
  }

  playSwitchAvatarEffect() {
    console.log('effect manager: switch avatar!!!!');
    this.transitionTime = 1700;
  }

  setParticle(scene, camera) {
    this.particleEffect = new ParticleEffect(scene, camera, globalUniforms);
  }

  update() {
    setInterval(() => {

      if (this.scene && this.camera && !this.initParticle) {
        this.setParticle(this.scene, this.camera);
        this.initParticle = true;
      }
      if (this.initParticle) {
        this.particleEffect.update();
      }
      
      if (globalUniforms.switchItemTime.value < SWITCH_ITEM_EFFECT_DURATION) {
        globalUniforms.switchItemTime.value += SWITCH_ITEM_EFFECT_SPEED;
      }
      else {
        globalUniforms.switchItemTime.value = SWITCH_ITEM_EFFECT_DURATION;
      }
      
      if (this.camera) {
        this.cameraDir.set(0, 0, -1);
        this.cameraDir.applyQuaternion(this.camera.quaternion);
        this.cameraDir.normalize();
        globalUniforms.cameraDir.value.copy(this.cameraDir);
        globalUniforms.eye.value.copy(this.camera.position);
      }
      
    
    }, this.frameRate);
  }
}
