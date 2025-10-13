import React, { createContext, useEffect, useState } from "react"

import gsap from "gsap"
import { sceneInitializer } from "../library/sceneInitializer"
import { LoraDataGenerator } from "../library/loraDataGenerator"
import { SpriteAtlasGenerator } from "../library/spriteAtlasGenerator"
import { ThumbnailGenerator } from "../library/thumbnailsGenerator"

export const SceneContext = createContext({
    /**
 * @typedef {import('../library/characterManager').CharacterManager} CharacterManager
 * @type {CharacterManager}
 */
  characterManager: null,
  /**
   * @typedef {Object} MoveCameraParam
   * @property {number} targetX
   * @property {number} targetY
   * @property {number} targetZ
   * @property {number} distance
   * @param {MoveCameraParam} _value
   */
  // eslint-disable-next-line no-unused-vars
  moveCamera: (_value) => {},
})

export const SceneProvider = (props) => {
  const [characterManager, setCharacterManager] = useState(null)
  const [loraDataGenerator, setLoraDataGenerator] = useState(null)
  const [spriteAtlasGenerator, setSpriteAtlasGenerator] = useState(null)
  const [decalManager, setDecalManager] = useState(null)
  const [thumbnailsGenerator, setThumbnailsGenerator] = useState(null)
  const [sceneElements, setSceneElements] = useState(null)
  const [animationManager, setAnimationManager] = useState(null)
  const [lookAtManager, setLookAtManager] = useState(null)
  const [scene, setScene] = useState(null)
  const [camera, setCamera] = useState(null)
  const [controls, setControls] = useState(null)
  const [bonePicker, setBonePicker] = useState(null)
  const [transformControlsObj, setTransformControlsObj] = useState(null)
  const [transformMode, setTransformMode] = useState('translate')
  const [transformSnap, setTransformSnap] = useState({ t: 0.05, r: 5, s: 0.05 })
  const [transformTarget, setTransformTarget] = useState(null)

  const [manifest, setManifest] = useState(null)
  const [debugMode, setDebugMode] = useState(false);

  let loaded = false
  let [isLoaded, setIsLoaded] = useState(false)
  useEffect(()=>{
    // hacky prevention of double render
    if (loaded || isLoaded) return
    setIsLoaded(true)
    loaded = true;

    const init = sceneInitializer("editor-scene");
    const { scene, camera, controls, characterManager, sceneElements, transformControls } = init;
    setTransformControlsObj(transformControls);
    setCamera(camera);
    setScene(scene);
    setCharacterManager(characterManager);
    setSceneElements(sceneElements);
    setBonePicker(characterManager.bonePicker);
    setAnimationManager(characterManager.animationManager)
    setLookAtManager(characterManager.lookAtManager)
    setDecalManager(characterManager.overlayedTextureManager)
    setControls(controls);
    setLoraDataGenerator(new LoraDataGenerator(characterManager))
    setSpriteAtlasGenerator(new SpriteAtlasGenerator(characterManager))
    setThumbnailsGenerator(new ThumbnailGenerator(characterManager))
  },[])
  
  useEffect(()=>{
    if (!transformControlsObj) return
    // apply mode
    transformControlsObj.transform.setMode(transformMode)
    // apply snaps
    transformControlsObj.transform.setTranslationSnap(transformSnap.t || null)
    transformControlsObj.transform.setRotationSnap(transformSnap.r ? (transformSnap.r * Math.PI / 180) : null)
    transformControlsObj.transform.setScaleSnap(transformSnap.s || null)
  },[transformControlsObj, transformMode, transformSnap])

  // Keyboard shortcuts W/E/R like Blender
  useEffect(()=>{
    const onKey = (e) => {
      if (!transformControlsObj?.transform) return
      if (e.key === 'w' || e.key === 'W') setTransformMode('translate')
      if (e.key === 'e' || e.key === 'E') setTransformMode('rotate')
      if (e.key === 'r' || e.key === 'R') setTransformMode('scale')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [transformControlsObj])

  const attachTransformTarget = (obj) => {
    setTransformTarget(obj)
    if (characterManager?.setClickCullingEnabled) characterManager.setClickCullingEnabled(false)
    if (transformControlsObj.attachToTransformControlsFn) transformControlsObj.attachToTransformControlsFn(obj)
  }
  const detachTransformTarget = () => {
    setTransformTarget(null)
    if (characterManager?.setClickCullingEnabled) characterManager.setClickCullingEnabled(true)
    if (transformControlsObj.detachTransformControlsFn) transformControlsObj.detachTransformControlsFn()
  }

  // Direct manipulation helpers (used by bottom panel toolbar)
  const applyTranslateDelta = (dx, dy, dz) => {
    if (!transformTarget) return
    transformTarget.position.x += dx || 0
    transformTarget.position.y += dy || 0
    transformTarget.position.z += dz || 0
    transformTarget.updateMatrixWorld(true)
  }
  const applyRotateDelta = (rxDeg, ryDeg, rzDeg) => {
    if (!transformTarget) return
    const rx = (rxDeg || 0) * Math.PI / 180
    const ry = (ryDeg || 0) * Math.PI / 180
    const rz = (rzDeg || 0) * Math.PI / 180
    transformTarget.rotation.x += rx
    transformTarget.rotation.y += ry
    transformTarget.rotation.z += rz
    transformTarget.updateMatrixWorld(true)
  }
  const applyScaleDelta = (sx, sy, sz) => {
    if (!transformTarget) return
    const clamp = (v) => Math.max(0.001, v)
    transformTarget.scale.x = clamp(transformTarget.scale.x + (sx || 0))
    transformTarget.scale.y = clamp(transformTarget.scale.y + (sy || 0))
    transformTarget.scale.z = clamp(transformTarget.scale.z + (sz || 0))
    transformTarget.updateMatrixWorld(true)
  }



  const toggleDebugMode = (isDebug) => {
    if (isDebug == null)
      isDebug = !debugMode;

    setDebugMode(isDebug);
    scene.traverse((child) => {
      if (child.isMesh) {
        if (child.setDebugMode){
          child.setDebugMode(isDebug);
        }
      }
    });
  }
  useEffect(() => {
    if (manifest != null){
      if (manifest.defaultAnimations){
        const locationArray = manifest.defaultAnimations.map(animation => animation.location);
        animationManager.storeDefaultAnimationPaths(locationArray, "");
      }
    }
  }, [manifest])

  const showEnvironmentModels = (display) => {

    if (display){
        scene.add(sceneElements);
    }
    else{
        scene.remove(sceneElements);
    }

  }

  const moveCamera = (value) => {
    if (!controls) return
    gsap.to(controls.target, {
      x: value.targetX ?? 0,
      y: value.targetY ?? 0,
      z: value.targetZ ?? 0,
      duration: 1,
    })

    gsap
      .fromTo(
        controls,
        {
          maxDistance: controls.getDistance(),
          minDistance: controls.getDistance(),
          minPolarAngle: controls.getPolarAngle(),
          maxPolarAngle: controls.getPolarAngle(),
          minAzimuthAngle: controls.getAzimuthalAngle(),
          maxAzimuthAngle: controls.getAzimuthalAngle(),
        },
        {
          maxDistance: value.distance,
          minDistance: value.distance,
          minPolarAngle: Math.PI / 2 - 0.11,
          maxPolarAngle: Math.PI / 2 - 0.11,
          minAzimuthAngle: -0.78,
          maxAzimuthAngle: -0.78,
          duration: 1,
        },
      )
      .then(() => {
        controls.minPolarAngle = 0
        controls.maxPolarAngle = 3.1415
        controls.minDistance = 0.5
        controls.maxDistance = 10
        controls.minAzimuthAngle = Infinity
        controls.maxAzimuthAngle = Infinity
      })
  }

  return (
    <SceneContext.Provider
      value={{
        manifest,
        setManifest,
        scene,
        decalManager,
        characterManager,
        loraDataGenerator,
        spriteAtlasGenerator,
        thumbnailsGenerator,
        showEnvironmentModels,
        debugMode,
        toggleDebugMode,
        animationManager,
        lookAtManager,
        camera,
        moveCamera,
        controls,
        sceneElements,
        bonePicker,
        transformControls: transformControlsObj,
        transformMode,
        setTransformMode,
        transformSnap,
        setTransformSnap,
        transformTarget,
        attachTransformTarget,
        detachTransformTarget,
        applyTranslateDelta,
        applyRotateDelta,
        applyScaleDelta,
        getBoneNames: () => characterManager?.getHumanoidBoneNames?.() || [],
        reparentToBone: (name) => characterManager?.reparentLastAttachedToBone?.(name),
        getAttachedBoneName: () => characterManager?.getLastAttachedBoneName?.() || null,
        copyTransform: () => {
          const o = transformTarget; if (!o) return null;
          return { p: o.position.toArray(), q: o.quaternion.toArray(), s: o.scale.toArray() }
        },
        pasteTransform: (t) => {
          if (!transformTarget || !t) return;
          const THREE_ = window.THREE || null;
          if (t.p) transformTarget.position.set(t.p[0],t.p[1],t.p[2]);
          if (t.q && THREE_) transformTarget.quaternion.set(t.q[0],t.q[1],t.q[2],t.q[3]);
          if (t.s) transformTarget.scale.set(t.s[0],t.s[1],t.s[2]);
          transformTarget.updateMatrixWorld(true);
        },
        resetToBoneOrigin: () => {
          const handle = transformTarget; if (!handle) return;
          handle.position.set(0,0,0);
          handle.quaternion.set(0,0,0,1);
          handle.updateMatrixWorld(true);
        }
      }}
    >
      {props.children}
    </SceneContext.Provider>
  )
}
