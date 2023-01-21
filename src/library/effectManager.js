
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
const pixelTexture = textureLoader.load(`/textures/pixel9.png`);
pixelTexture.wrapS = pixelTexture.wrapT = THREE.RepeatWrapping;

const noiseTexture = textureLoader.load(`/textures/noise3.jpg`);
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
  transitionEffectType: {
    value: transitionEffectTypeNumber.normal
  },
  isFadeOut: {
    value: false
  }
};

const customUniforms = {
  pixelTexture: {
    value: pixelTexture
  },
  noiseTexture: {
    value: noiseTexture
  },
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

      float getRim(vec3 normal, float rimStrength, float glowIntensity) {
        vec3 eyeDirection = normalize(eye - vWorldPosition);
        float EdotN = max(0.0, dot(eyeDirection, normal));
        float bodyRim = pow(1. - EdotN, rimStrength);
        return bodyRim * glowIntensity;
      }

      vec3 getPixelColor() {
        float pixelUvScale = 2.0;
        vec2 pixelUv = vec2(
          vWorldPosition.x * pixelUvScale * -cameraDir.z + vWorldPosition.z * pixelUvScale * cameraDir.x,
          vWorldPosition.y * pixelUvScale
        );
        float pixel = texture2D(
          pixelTexture, 
          pixelUv
        ).r;
        return mix(vec3(0.0396, 0.768, 0.990), vec3(0.0142, 0.478, 0.710), pixel);
      }

      `,
    );

    material.fragmentShader = material.fragmentShader.replace(
      `gl_FragColor = vec4( col, diffuseColor.a );`,
      `
      gl_FragColor = vec4(col, diffuseColor.a);
      `,
    );
    material.fragmentShader = material.fragmentShader.replace(
      `gl_FragColor = vec4( col, diffuseColor.a );`,
      `
      if (transitionEffectType < 0.5) {

      }
      else if (transitionEffectType < 1.5) {
        vec3 pixelColor = getPixelColor();

        float timeProgress = switchItemTime / switchItemDuration;
        float rim = getRim(
          vSurfaceNormal, 
          mix(0.1, 5.0 * switchItemTime, timeProgress), 
          mix(50., 10., timeProgress)
        );
        
        col = mix(pixelColor * rim, col, timeProgress);
      }
      else {
        if (isFadeOut) {
          discard;

        }
        else {
          if (switchAvatarTime < 0.5) {
            float timer = switchAvatarTime * 2.;
            float noiseUvScale = 1.2;
            vec2 noiseUv = vec2(
              vWorldPosition.x * noiseUvScale * -cameraDir.z + vWorldPosition.z * noiseUvScale * cameraDir.x,
              vWorldPosition.y * noiseUvScale
            );
            vec4 noise = texture2D(
              noiseTexture, 
              noiseUv
            );
            float noiseStrength = 0.1;
            float noiseCutout = textureRemap(noise, vec2(0.0, 1.0), vec2(-noiseStrength, noiseStrength)).r;
            
            float border = 0.02;
            float bottomPosition = -0.3 - border;
            float avatarHeight = 2.0 + border;
            float cutoutHeight = timer * avatarHeight + bottomPosition;
            
            float limit = cutoutHeight + noiseCutout;
            
            float upperBound = limit + border;
    
            if (vWorldPosition.y > limit && vWorldPosition.y < upperBound) {

              vec3 pixelColor = getPixelColor();
          
              float rim = getRim(
                vSurfaceNormal, 
                0.1,
                10.
              );
        
              col = pixelColor * rim;
            }
            else if (vWorldPosition.y >= upperBound) {
              discard;
            }
            else {

              vec3 pixelColor = getPixelColor();
              
              float rim = getRim(
                vSurfaceNormal, 
                0.5,
                5.0
              );
              col = pixelColor * rim;
            }
          }
          else {
            float timer = switchAvatarTime * 2. - 1.;
            
            float bottomPosition = -0.3;
            float avatarHeight = 2.0;
            float cutoutHeight = timer * avatarHeight + bottomPosition;
            float limit = cutoutHeight;

            
            float rim = getRim(
              vSurfaceNormal, 
              mix(0.5, 2.0 * timer, timer),
              mix(5.0, 5. * (1. - timer), timer)
            );
            
            float fadeStrength = 10.;
            rim *= pow((vWorldPosition.y - bottomPosition) / (avatarHeight - bottomPosition), timer * fadeStrength);
            
            vec3 pixelColor = getPixelColor();
            col = mix(pixelColor * rim, col, timer);

          }
        }
        
      }

      gl_FragColor = vec4( col, diffuseColor.a );
      `,
    );

    
    // console.log(material.fragmentShader)
    
    
    material.uniforms.pixelTexture = customUniforms.pixelTexture;
    material.uniforms.noiseTexture = customUniforms.noiseTexture;
    

    material.uniforms.cameraDir = globalUniforms.cameraDir;
    material.uniforms.eye = globalUniforms.eye;
    material.uniforms.switchItemTime = globalUniforms.switchItemTime;
    material.uniforms.switchItemDuration = globalUniforms.switchItemDuration;
    material.uniforms.switchAvatarTime = globalUniforms.switchAvatarTime;
    material.uniforms.transitionEffectType = globalUniforms.transitionEffectType;
    material.uniforms.isFadeOut = globalUniforms.isFadeOut;
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
    globalUniforms.transitionEffectType.value = transitionEffectTypeNumber.switchItem;
    this.particleEffect.emitPixel();
    this.transitionTime = 500;
  }

  playSwitchAvatarEffect() {
    globalUniforms.transitionEffectType.value = transitionEffectTypeNumber.switchAvatar;
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
      
      if (globalUniforms.transitionEffectType.value === transitionEffectTypeNumber.switchItem) {
        if (globalUniforms.switchItemTime.value < SWITCH_ITEM_EFFECT_DURATION) {
          globalUniforms.switchItemTime.value += SWITCH_ITEM_EFFECT_SPEED;
        }
        else {
          globalUniforms.switchItemTime.value = SWITCH_ITEM_EFFECT_DURATION;
          globalUniforms.transitionEffectType.value = transitionEffectTypeNumber.normal;
        }
      }
      else if (globalUniforms.transitionEffectType.value === transitionEffectTypeNumber.switchAvatar) {
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
            if (globalUniforms.switchAvatarTime.value < 0.5) {
              this.particleEffect.emitRing();
            }
          }
          else {
            globalUniforms.transitionEffectType.value = transitionEffectTypeNumber.normal;
            globalUniforms.switchAvatarTime.value = SWITCH_AVATAR_EFFECT_FADE_IN_THRESHOLD;
            this.isFadeOut = true;
          }
        }
        globalUniforms.isFadeOut.value = this.isFadeOut;
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