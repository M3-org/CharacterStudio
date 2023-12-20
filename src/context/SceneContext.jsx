import React, { createContext, useEffect, useState } from "react"

import gsap from "gsap"
import { local } from "../library/store"
import { sceneInitializer } from "../library/sceneInitializer"

export const SceneContext = createContext()

export const SceneProvider = (props) => {

  const [characterManager, setCharacterManager] = useState(null)
  const [animationManager, setAnimationManager] = useState(null)
  const [lookAtManager, setLookAtManager] = useState(null)
  const [scene, setScene] = useState(null)
  const [camera, setCamera] = useState(null)
  const [controls, setControls] = useState(null)

  const [manifest, setManifest] = useState(null)
  const [debugMode, setDebugMode] = useState(false);

  let loaded = false
  let [isLoaded, setIsLoaded] = useState(false)
  useEffect(()=>{
    // hacky prevention of double render
    if (loaded || isLoaded) return
    setIsLoaded(true)
    loaded = true;

    const {
      scene,
      camera,
      controls,
      characterManager
    } = sceneInitializer("editor-scene");

    setCamera(camera);
    setScene(scene);
    setCharacterManager(characterManager);
    setAnimationManager(characterManager.animationManager)
    setLookAtManager(characterManager.lookAtManager)
    setControls(controls);
  },[])


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
        characterManager,
        debugMode,
        toggleDebugMode,
        animationManager,
        lookAtManager,
        camera,
        moveCamera,
        controls,
      }}
    >
      {props.children}
    </SceneContext.Provider>
  )
}
