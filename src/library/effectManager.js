
import * as THREE from "three"
import ParticleEffect from "./particle/particle.js";

import {
  TRANSITION_TIME_OF_SWITCH_ITEM,
  TRANSITION_TIME_OF_LOADING_AVATAR,

  SWITCH_ITEM_EFFECT_INITIAL_TIME, 
  SWITCH_ITEM_EFFECT_DURATION, 
  SWITCH_ITEM_EFFECT_SPEED,

  FADE_OUT_AVATAR_INITIAL_TIME,
  FADE_OUT_AVATAR_DURATION,
  FADE_OUT_AVATAR_SPEED,
  FADE_IN_AVATAR_INITIAL_TIME,
  FADE_IN_AVATAR_DURATION,
  FADE_IN_AVATAR_SPEED,

  transitionEffectTypeNumber,
  
} from "./constants.js";
import { MToonMaterial } from "@pixiv/three-vrm";


const textureLoader = new THREE.TextureLoader()
const pixelTexture = textureLoader.load(`./textures/pixel9.png`);
pixelTexture.wrapS = pixelTexture.wrapT = THREE.RepeatWrapping;

const noiseTexture = textureLoader.load(`./textures/noise3.jpg`);
noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;


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
  fadeOutAvatarTime: {
    value: FADE_OUT_AVATAR_INITIAL_TIME
  },
  fadeInAvatarTime: {
    value: FADE_IN_AVATAR_INITIAL_TIME
  },
  transitionEffectType: {
    value: transitionEffectTypeNumber.normal
  },
};

const customUniforms = {
  pixelTexture: {
    value: pixelTexture
  },
  noiseTexture: {
    value: noiseTexture
  },
};


export class EffectManager extends EventTarget{
  constructor () {
    super();
    this.cameraDir = new THREE.Vector3();
    this.frameRate = 1000 / 30;

    this.initParticle = false;

    this.transitionEffectType = null;
    this.transitionTime = TRANSITION_TIME_OF_SWITCH_ITEM;

    this.update();
  }

  setCustomShader(material) {
    if (material.vertexShader){
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

      uniform float fadeInAvatarTime;
      
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

      vec3 getPixelColor(float pixelStrength) {
        float pixelUvScale = 2.0;
        vec2 pixelUv = vec2(
          vWorldPosition.x * pixelUvScale * -cameraDir.z + vWorldPosition.z * pixelUvScale * cameraDir.x,
          vWorldPosition.y * pixelUvScale
        );
        float pixel = texture2D(
          pixelTexture, 
          pixelUv
        ).r;
        return mix(vec3(0.0396, 0.768, 0.990), vec3(0.0142, 0.478, 0.710), pixel * pixelStrength);
      }

      float getDissolveLimit(float noiseUvScale, float noiseStrength, float bottomPosition, float avatarHeight, float time) {
        vec2 noiseUv = vec2(
          vWorldPosition.x * noiseUvScale * -cameraDir.z + vWorldPosition.z * noiseUvScale * cameraDir.x,
          vWorldPosition.y * noiseUvScale
        );
        vec4 noise = texture2D(
          noiseTexture, 
          noiseUv
        );
        
        float noiseCutout = textureRemap(noise, vec2(0.0, 1.0), vec2(-noiseStrength, noiseStrength)).r;
        float cutoutHeight = time * avatarHeight + bottomPosition;
        return cutoutHeight + noiseCutout;
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
      //################################################## normal ###############################################################
      if (transitionEffectType < 0.5) { 

      }
      //################################################## switch item ###############################################################
      else if (transitionEffectType < 1.5) { 
        // vec3 pixelColor = getPixelColor(2.0);

        // float timeProgress = switchItemTime / switchItemDuration;
        // float rim = getRim(
        //   vSurfaceNormal, 
        //   mix(0.1, mix(0.1, 5.0, timeProgress), timeProgress), 
        //   mix(50., 10., timeProgress)
        // );
        
        // col = mix(pixelColor * rim, col, timeProgress);
      }
      //################################################## fade out avatar ###############################################################
      else if (transitionEffectType < 2.5) { 
        discard;
      }
      //################################################## loading avatar ###############################################################
      else if (transitionEffectType < 3.5) { 
        discard;
      }
      //################################################## fade in avatar ###############################################################
      else if (transitionEffectType < 4.5) { 
        if (fadeInAvatarTime < 0.5) { // phase 1
          float timer = fadeInAvatarTime * 2.;
          
          float border = 0.02;
          float limit = getDissolveLimit(
            1.2,
            0.1,
            -0.3 - border,
            2.0 + border,
            timer
          );
          
          float upperBound = limit + border;
  
          if (vWorldPosition.y > limit && vWorldPosition.y < upperBound) {

            vec3 pixelColor = getPixelColor(1.5);
        
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

            vec3 pixelColor = getPixelColor(1.5);
            
            float rim = getRim(
              vSurfaceNormal, 
              0.1,
              3.0
            );
            col = pixelColor * rim;
          }
        }
        else { // phase 2
          float timer = fadeInAvatarTime * 2. - 1.;
          
          float bottomPosition = -0.3;
          float avatarHeight = 2.0;
          
          float rim = getRim(
            vSurfaceNormal, 
            mix(0.1, 2.0 * timer, timer),
            mix(3.0, 20. * (1. - timer), timer)
          );
          
          float fadeStrength = 10.;
          rim *= pow((vWorldPosition.y - bottomPosition) / (avatarHeight - bottomPosition), timer * fadeStrength);
          
          vec3 pixelColor = getPixelColor(1.5);
          col = mix(pixelColor * rim, col, timer);

        }
      }

      gl_FragColor = vec4( col, diffuseColor.a );
      `,
    );

    material.uniforms.pixelTexture = customUniforms.pixelTexture;
    material.uniforms.noiseTexture = customUniforms.noiseTexture;
    
    material.uniforms.cameraDir = globalUniforms.cameraDir;
    material.uniforms.eye = globalUniforms.eye;
    material.uniforms.switchItemTime = globalUniforms.switchItemTime;
    material.uniforms.switchItemDuration = globalUniforms.switchItemDuration;
    material.uniforms.transitionEffectType = globalUniforms.transitionEffectType;
    material.uniforms.fadeInAvatarTime = globalUniforms.fadeInAvatarTime;
    }
  }

  setTransitionEffect = (type) => {
    this.transitionEffectType = type;
  }
  getTransitionEffect = (type) => {
    return this.transitionEffectType === type;
  }

  playFadeOutEffect() {
    globalUniforms.transitionEffectType.value = transitionEffectTypeNumber.fadeOutAvatar;
    this.particleEffect.emitSpotLight();
    this.particleEffect.emitPixel();
    this.particleEffect.emitTeleport();
    this.transitionTime = this.frameRate * ((FADE_OUT_AVATAR_DURATION - FADE_OUT_AVATAR_INITIAL_TIME) / FADE_OUT_AVATAR_SPEED);
    this.initialFadeOutTimer();
  }

  playFadeInEffect() {
    globalUniforms.transitionEffectType.value = transitionEffectTypeNumber.fadeInAvatar;
    this.initialFadeInTimer();
  }

  playSwitchItemEffect() {
    globalUniforms.switchItemTime.value = SWITCH_ITEM_EFFECT_INITIAL_TIME;
    globalUniforms.transitionEffectType.value = transitionEffectTypeNumber.switchItem;
    // this.particleEffect.emitPixel();
    // this.particleEffect.emitBeam();
    this.transitionTime = TRANSITION_TIME_OF_SWITCH_ITEM;
  }

  setParticle(scene, camera) {
    this.particleEffect = new ParticleEffect(scene, camera, globalUniforms);
  }

  initialFadeOutTimer() {
    globalUniforms.fadeOutAvatarTime.value = FADE_OUT_AVATAR_INITIAL_TIME;
  }

  initialFadeInTimer() {
    globalUniforms.fadeInAvatarTime.value = FADE_IN_AVATAR_INITIAL_TIME;
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
          this.setTransitionEffect('normal');
          this.dispatchEvent(new Event('fadeintraitend'));
        }
      }

      else if (globalUniforms.transitionEffectType.value === transitionEffectTypeNumber.fadeOutAvatar) {
        globalUniforms.fadeOutAvatarTime.value += FADE_OUT_AVATAR_SPEED;
        if (globalUniforms.fadeOutAvatarTime.value > FADE_OUT_AVATAR_DURATION) {
          globalUniforms.fadeOutAvatarTime.value = FADE_OUT_AVATAR_INITIAL_TIME;
          globalUniforms.transitionEffectType.value = transitionEffectTypeNumber.loadingAvatar;
        }
      }

      else if (globalUniforms.transitionEffectType.value === transitionEffectTypeNumber.loadingAvatar) {
        // TODO play loading effect?
      }

      else if (globalUniforms.transitionEffectType.value === transitionEffectTypeNumber.fadeInAvatar) {
        if (globalUniforms.fadeInAvatarTime.value > 0.1 && globalUniforms.fadeInAvatarTime.value < 0.5) {
          this.particleEffect.emitRing(0.5 * (1.0 - globalUniforms.fadeInAvatarTime.value));
          this.particleEffect.emitRespawnPixel();
        }
        if (globalUniforms.fadeInAvatarTime.value >= 0.5) {
          this.particleEffect.removeSpotLight();
        }
        globalUniforms.fadeInAvatarTime.value += FADE_IN_AVATAR_SPEED;
        if (globalUniforms.fadeInAvatarTime.value > FADE_IN_AVATAR_DURATION) {
          globalUniforms.fadeInAvatarTime.value = FADE_IN_AVATAR_INITIAL_TIME;
          globalUniforms.transitionEffectType.value = transitionEffectTypeNumber.normal;
          this.setTransitionEffect('normal');
          this.dispatchEvent(new Event('fadeinavatarend'));
        }
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
