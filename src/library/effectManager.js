
import * as THREE from "three"
import ParticleEffect from "./particle/particle.js";

import {
  SWITCH_ITEM_EFFECT_INITIAL_TIME, 
  SWITCH_ITEM_EFFECT_DURATION, 
  SWITCH_ITEM_EFFECT_SPEED,
  SWITCH_AVATAR_EFFECT_FADE_IN_THRESHOLD, 
  SWITCH_AVATAR_EFFECT_FADE_OUT_THRESHOLD, 
  SWITCH_AVATAR_EFFECT_SPEED,
} from "./constants.js";


const textureLoader = new THREE.TextureLoader()
const pixelTexture = textureLoader.load(`/textures/pixel8.png`);
pixelTexture.wrapS = pixelTexture.wrapT = THREE.RepeatWrapping;

const noiseTexture = textureLoader.load(`/textures/noise.png`);
noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;

const transitionEffectTypeNumber = {
  normal: 0,
  switchItem: 1,
  switchAvatar: 2,
}

const globalUniforms = {
  switchItemDuration: {
    value: SWITCH_ITEM_EFFECT_DURATION
  },
  switchItemTime: {
    value: SWITCH_ITEM_EFFECT_DURATION
  },
  eye: {
    value: new THREE.Vector3()
  },
  cameraDir: {
    value: new THREE.Vector3()
  },
  switchAvatarTime: {
    value: SWITCH_AVATAR_EFFECT_FADE_OUT_THRESHOLD
  },
};

const customUniforms = {
  pixelTexture: {
    value: pixelTexture
  },
  noiseTexture: {
    value: noiseTexture
  },
  transitionEffectType: {
    value: transitionEffectTypeNumber.normal
  },
  isFadeOut: {
    value: false
  }
};


export class EffectManager{
  constructor () {
    this.cameraDir = new THREE.Vector3();
    this.frameRate = 1000 / 30;

    this.initParticle = false;

    this.transitionEffectType = null;
    this.transitionTime = 500;

    this.isFadeOut = false;
    
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
      uniform sampler2D noiseTexture;
      uniform float transitionEffectType;

      uniform float switchAvatarTime; 

      uniform bool isFadeOut;
      
      varying vec3 vWorldPosition;
      varying vec3 vSurfaceNormal;

      vec4 textureRemap(vec4 In, vec2 InMinMax, vec2 OutMinMax) {
        return OutMinMax.x + (In - InMinMax.x) * (OutMinMax.y - OutMinMax.x) / (InMinMax.y - InMinMax.x);
      }
      `,
    );
    material.fragmentShader = material.fragmentShader.replace(
      `diffuseColor *= sampledDiffuseColor;`,
      `
      bool isBorder = false;

      diffuseColor *= sampledDiffuseColor;
      if (transitionEffectType < 0.5) {

      }
      else if (transitionEffectType < 1.5) {
        float pixelUvScale = 2.0;
        vec2 pixelUv = vec2(
          vWorldPosition.x * pixelUvScale * -cameraDir.z + vWorldPosition.z * pixelUvScale * cameraDir.x,
          vWorldPosition.y * pixelUvScale
        );
        float pixel = texture2D(
          pixelTexture, 
          pixelUv
        ).r;

        pixel = pow(pixel, 1.0);
        vec3 pixelColor = mix(vec3(0.0142, 0.478, 0.710), vec3(0.0396, 0.768, 0.990), pixel);
        
        vec3 eyeDirection = normalize(eye - vWorldPosition);


        float timeProgress = switchItemTime / switchItemDuration;
        float EdotN = max(0.0, dot(eyeDirection, vSurfaceNormal));
        float rimStrength = mix(0.1, 5.0 * switchItemTime, timeProgress);
        float bodyRim = pow(1. - EdotN, rimStrength);
        float glowIntensity = mix(50., 10., timeProgress);
  
        diffuseColor.rgb = mix(pixelColor * bodyRim * glowIntensity, diffuseColor.rgb, timeProgress);
        diffuseColor.a = 1.0;
      }
      else {

        float pixelUvScale = 2.0;
        vec2 pixelUv = vec2(
          vWorldPosition.x * pixelUvScale * -cameraDir.z + vWorldPosition.z * pixelUvScale * cameraDir.x,
          vWorldPosition.y * pixelUvScale - switchAvatarTime * pixelUvScale
        );
        vec4 pixel = texture2D(
          pixelTexture, 
          pixelUv
        );
        float minStrength = 0.025;
        float noiseStrength = minStrength;
        float noiseCutout = textureRemap(pixel, vec2(0.0, 1.0), vec2(-noiseStrength, noiseStrength)).r;
        float bottomPosition = 1.1;
        float avatarHeight = 4.0;
        float speed = 0.7;
        float cutoutHeight = ((switchAvatarTime * speed)) * avatarHeight - bottomPosition;
        
        float limit = noiseCutout + cutoutHeight;
        float border = 0.1;
        
        float upperBound = limit + border;
        vec3 boderColor = vec3(0.0, 1.0, 0.);
        vec3 boderColor2 = vec3(1.0, 0., 0.);
        isBorder = vWorldPosition.y > limit && vWorldPosition.y < upperBound;
        if (isBorder) {
          diffuseColor.rgb += boderColor;
        }
        else {
          diffuseColor.rgb += boderColor2;
          diffuseColor.a = step(vWorldPosition.y, limit);
          if (diffuseColor.a <= 0.) {
            discard;
          }
        }
      }
      
      `,
    );

    material.fragmentShader = material.fragmentShader.replace(
      `col += totalEmissiveRadiance;`,
      `
      if (transitionEffectType >= 1.5 && isBorder) {
        col = diffuseColor.rgb;
      }
      else {
        col += totalEmissiveRadiance;
      }
      `,
    );
    
    material.uniforms.transitionEffectType = customUniforms.transitionEffectType;
    material.uniforms.pixelTexture = customUniforms.pixelTexture;
    material.uniforms.noiseTexture = customUniforms.noiseTexture;
    material.uniforms.isFadeOut = customUniforms.isFadeOut;

    material.uniforms.cameraDir = globalUniforms.cameraDir;
    material.uniforms.eye = globalUniforms.eye;
    material.uniforms.switchItemTime = globalUniforms.switchItemTime;
    material.uniforms.switchItemDuration = globalUniforms.switchItemDuration;
    material.uniforms.switchAvatarTime = globalUniforms.switchAvatarTime;
    // material.transparent = true;
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
    globalUniforms.switchItemTime.value = SWITCH_ITEM_EFFECT_INITIAL_TIME;
    customUniforms.transitionEffectType.value = transitionEffectTypeNumber.switchItem;
    this.particleEffect.emitPixel();
    this.transitionTime = 500;
  }

  playSwitchAvatarEffect() {
    customUniforms.transitionEffectType.value = transitionEffectTypeNumber.switchAvatar;
    this.transitionTime = this.frameRate * ((SWITCH_AVATAR_EFFECT_FADE_IN_THRESHOLD - SWITCH_AVATAR_EFFECT_FADE_OUT_THRESHOLD) / SWITCH_AVATAR_EFFECT_SPEED);
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
      
      if (customUniforms.transitionEffectType.value === transitionEffectTypeNumber.switchItem) {
        if (globalUniforms.switchItemTime.value < SWITCH_ITEM_EFFECT_DURATION) {
          globalUniforms.switchItemTime.value += SWITCH_ITEM_EFFECT_SPEED;
        }
        else {
          globalUniforms.switchItemTime.value = SWITCH_ITEM_EFFECT_DURATION;
          customUniforms.transitionEffectType.value = transitionEffectTypeNumber.normal;
        }
      }
      else if (customUniforms.transitionEffectType.value === transitionEffectTypeNumber.switchAvatar) {
        if (this.isFadeOut) {
          if (globalUniforms.switchAvatarTime.value > SWITCH_AVATAR_EFFECT_FADE_OUT_THRESHOLD) {
            globalUniforms.switchAvatarTime.value -= SWITCH_AVATAR_EFFECT_SPEED;
          }
          else {
            this.isFadeOut = false;
          }
        }
        else {
          if (globalUniforms.switchAvatarTime.value < SWITCH_AVATAR_EFFECT_FADE_IN_THRESHOLD) {
            globalUniforms.switchAvatarTime.value += SWITCH_AVATAR_EFFECT_SPEED;
          }
          else {
            customUniforms.transitionEffectType.value = transitionEffectTypeNumber.normal;
            globalUniforms.switchAvatarTime.value = SWITCH_AVATAR_EFFECT_FADE_IN_THRESHOLD;
            this.isFadeOut = true;
          }
        }
        customUniforms.isFadeOut.value = this.isFadeOut;
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
